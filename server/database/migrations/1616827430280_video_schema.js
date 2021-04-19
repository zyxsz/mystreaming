/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class VideoSchema extends Schema {
  up() {
    this.create('videos', (table) => {
      table.uuid('id').primary();
      table
        .uuid('season_id')
        .unsigned()
        .references('id')
        .inTable('seasons')
        .onUpdate('CASCADE')
        .onDelete('CASCADE');
      table.integer('episode_number').defaultTo(1);
      table.decimal('duration').defaultTo(0.0);
      table.string('thumbnail');
      table.text('path').notNullable();
      table.string('status').defaultTo('processing');
      table.timestamps();
    });
  }

  down() {
    this.drop('videos');
  }
}

module.exports = VideoSchema;
