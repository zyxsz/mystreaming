/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class ProgressSchema extends Schema {
  up() {
    this.create('progresses', (table) => {
      table.increments();
      table
        .uuid('user_id')
        .unsigned()
        .references('id')
        .inTable('users')
        .onUpdate('CASCADE')
        .onDelete('CASCADE');
      table
        .uuid('video_id')
        .unsigned()
        .references('id')
        .inTable('videos')
        .onUpdate('CASCADE')
        .onDelete('CASCADE');
      table.decimal('current_time').defaultTo(0);
      table.decimal('percentage').defaultTo(0);
      table.boolean('completed').defaultTo(false);
      table.timestamps();
    });
  }

  down() {
    this.drop('progresses');
  }
}

module.exports = ProgressSchema;
