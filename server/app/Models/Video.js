/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model');

class Video extends Model {
  static boot() {
    super.boot();

    this.addHook('beforeCreate', 'CustomerHook.uuid');
  }

  static get hidden() {
    return ['path'];
  }

  static get computed() {
    return ['name'];
  }

  getName({ episode_number }) {
    return `Episódio ${episode_number || '#'}`;
  }
  season() {
    return this.belongsTo('App/Models/Season');
  }
  progresses() {
    return this.hasMany('App/Models/Progress');
  }
}

module.exports = Video;
