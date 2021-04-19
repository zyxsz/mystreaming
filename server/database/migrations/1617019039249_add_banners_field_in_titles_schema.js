/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class AddBannersFieldInTitlesSchema extends Schema {
  up() {
    this.table('titles', (table) => {
      table.json('banners').defaultTo('[]');
      table.json('posters').defaultTo('[]');
    });
  }

  down() {
    this.table('titles', (table) => {
      table.dropColumn('banners');
      table.dropColumn('posters');
    });
  }
}

module.exports = AddBannersFieldInTitlesSchema;
