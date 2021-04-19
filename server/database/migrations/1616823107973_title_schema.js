/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class TitleSchema extends Schema {
  up() {
    this.create('titles', (table) => {
      table.uuid('id').primary();
      table
        .uuid('author_id')
        .unsigned()
        .references('id')
        .inTable('users')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
        .nullable();
      table.string('name').unique().notNullable();
      table
        .text('description')
        .defaultTo('Opss! Parece que não há nada por aqui');
      table.string('tagline').defaultTo('Hummm, nada por aqui :(');
      table.string('banner');
      table.string('poster');
      table.decimal('vote_average').defaultTo(0.0);
      table.decimal('popularity').defaultTo(0.0);
      table.string('first_air_date');
      table.json('genres').defaultTo('[]');
      table.integer('number_of_seasons').defaultTo(0);
      table.integer('number_of_episodes').defaultTo(0);
      table.string('trailer');
      table.timestamps();
    });
  }

  down() {
    this.drop('titles');
  }
}

module.exports = TitleSchema;
