/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class AddSubtitlesColumnInVideosSchema extends Schema {
  up() {
    this.table('videos', (table) => {
      table.json('subtitles').defaultTo('[]');
    });
  }

  down() {
    this.table('videos', (table) => {
      table.dropColumn('subtitles');
    });
  }
}

module.exports = AddSubtitlesColumnInVideosSchema;
