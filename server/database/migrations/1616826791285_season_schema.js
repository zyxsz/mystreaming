/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class SeasonSchema extends Schema {
  up() {
    this.create('seasons', (table) => {
      table.uuid('id').primary();
      table
        .uuid('title_id')
        .unsigned()
        .references('id')
        .inTable('titles')
        .onUpdate('CASCADE')
        .onDelete('CASCADE');
      table.string('name').notNullable();
      table.text('description').defaultTo('Opss! Não há nada por aqui');
      table.integer('season_number').defaultTo(1);
      table.integer('episode_count').defaultTo(0);
      table.string('air_date');
      table.string('poster');
      table.timestamps();
    });
  }

  down() {
    this.drop('seasons');
  }
}

module.exports = SeasonSchema;
