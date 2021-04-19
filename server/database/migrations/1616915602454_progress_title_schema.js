/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class ProgressTitleSchema extends Schema {
  up() {
    this.create('progress_titles', (table) => {
      table.increments();
      table
        .uuid('user_id')
        .unsigned()
        .references('id')
        .inTable('users')
        .onUpdate('CASCADE')
        .onDelete('CASCADE');
      table
        .uuid('current_video_id')
        .unsigned()
        .references('id')
        .inTable('videos')
        .onUpdate('CASCADE')
        .onDelete('CASCADE');
      table
        .uuid('title_id')
        .unsigned()
        .references('id')
        .inTable('titles')
        .onUpdate('CASCADE')
        .onDelete('CASCADE');
      table.decimal('current_time').defaultTo(0);
      table.decimal('percentage').defaultTo(0);
      table.boolean('completed').defaultTo(false);
      table.timestamps();
    });
  }

  down() {
    this.drop('progress_titles');
  }
}

module.exports = ProgressTitleSchema;
