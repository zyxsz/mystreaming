/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model');

/** @type {import('@adonisjs/framework/src/Hash')} */
const Hash = use('Hash');

class User extends Model {
  static boot() {
    super.boot();

    this.addHook('beforeSave', async (userInstance) => {
      if (userInstance.dirty.password) {
        userInstance.password = await Hash.make(userInstance.password);
      }
    });

    this.addHook('beforeCreate', 'CustomerHook.uuid');
  }

  static get hidden() {
    return ['servers'];
  }

  static get computed() {
    return ['avatar_url'];
  }

  getAvatarUrl({ discord_id, avatar, discriminator }) {
    if (!avatar) {
      return `https://cdn.discordapp.com/embed/avatars/${parseInt(
        parseInt(discriminator) % 5
      )}.png`;
    }
    if (avatar.startsWith('a_')) {
      return `https://cdn.discordapp.com/avatars/${discord_id}/${avatar}.gif?size=256`;
    }
    return `https://cdn.discordapp.com/avatars/${discord_id}/${avatar}.webp?size=256`;
  }

  tokens() {
    return this.hasMany('App/Models/Token');
  }
}

module.exports = User;
