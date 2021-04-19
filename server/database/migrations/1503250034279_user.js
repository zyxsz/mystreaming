/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class UserSchema extends Schema {
  up() {
    this.create('users', (table) => {
      table.uuid('id').primary();
      table.string('discord_id').unique();
      table.string('username').notNullable().unique();
      table.string('discriminator').notNullable();
      table.string('email').notNullable().unique();
      table.string('avatar').nullable();
      table.json('servers').defaultTo('[]');
      table.timestamps();
    });
  }

  down() {
    this.drop('users');
  }
}

module.exports = UserSchema;
