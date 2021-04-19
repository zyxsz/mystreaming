/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class AddProgressFieldInVideosSchema extends Schema {
  up() {
    this.table('videos', (table) => {
      table.decimal('progress').defaultTo(0.0);
    });
  }

  down() {
    this.table('videos', (table) => {
      table.dropColumn('progress');
    });
  }
}

module.exports = AddProgressFieldInVideosSchema;
