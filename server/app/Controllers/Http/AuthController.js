const User = use('App/Models/User');
const Env = use('Env');

const DiscordOauth2 = require('discord-oauth2');
const crypto = require('crypto');

const { convertPerms } = require('../../../utils/permissions');

const oauth = new DiscordOauth2({
  clientId: Env.get('DISCORD_CLIENT_ID'),
  clientSecret: Env.get('DISCORD_CLIENT_SECRET'),
  redirectUri: Env.get('DISCORD_REDIRECT_URI'),
});

class AuthController {
  async redirect({ response }) {
    const url = oauth.generateAuthUrl({
      scope: ['identify', 'email', 'guilds', 'guilds.join'],
      state: crypto.randomBytes(16).toString('hex'),
    });

    return response.redirect(url);
  }

  async callback({ response, request, auth }) {
    const { code } = request.only(['code']);

    const { access_token } = await oauth
      .tokenRequest({
        clientId: Env.get('DISCORD_CLIENT_ID'),
        clientSecret: Env.get('DISCORD_CLIENT_SECRET'),
        redirectUri: Env.get('DISCORD_REDIRECT_URI'),

        scope: 'identify email guilds guilds.join',
        grantType: 'authorization_code',
        code,
      })
      .catch(() => ({}));

    if (!access_token)
      return response.status(400).send({ error: 'Invalid code' });

    const discordUser = await oauth.getUser(access_token);

    let user = await User.query().where('discord_id', discordUser.id).first();

    if (!user) {
      let servers = (await oauth.getUserGuilds(access_token)).map((guild) => ({
        ...guild,
        icon_url: getIconUrl({ guild_id: guild.id, icon: guild.icon || '' }),
        permissions: convertPerms(guild.permissions || 0),
      }));
      user = await User.create({
        discord_id: discordUser.id,
        username: discordUser.username,
        discriminator: discordUser.discriminator,
        avatar: discordUser.avatar,
        email: discordUser.email,
        servers: JSON.stringify(servers || []),
      });
    }

    const token = await auth.generate(user);

    return { user, token };
  }

  async me({ auth }) {
    const user = await User.query().where('id', auth.user.id).first();
    return user;
  }

  async meServers({ auth }) {
    const { servers } = (
      await User.query()
        .where('id', auth.user.id)
        .select(['servers'])
        .setVisible(['servers'])
        .firstOrFail()
    ).toJSON();

    return servers;
  }
}

module.exports = AuthController;

function getIconUrl({ guild_id, icon }) {
  if (icon && icon.startsWith('a_')) {
    return `https://cdn.discordapp.com/icons/${guild_id}/${icon}.gif?size=256`;
  }
  return `https://cdn.discordapp.com/icons/${guild_id}/${icon}.webp?size=256`;
}
