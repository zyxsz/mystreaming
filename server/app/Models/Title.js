/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model');

class Title extends Model {
  static boot() {
    super.boot();

    this.addHook('beforeCreate', 'CustomerHook.uuid');
  }

  static get hidden() {
    return ['trailer'];
  }

  static get computed() {
    return ['banner_url', 'poster_url'];
  }

  getBannerUrl({ banner }) {
    return `https://image.tmdb.org/t/p/original/${banner}`;
  }
  getPosterUrl({ poster }) {
    return `https://image.tmdb.org/t/p/original/${poster}`;
  }

  seasons() {
    return this.hasMany('App/Models/Season');
  }
}

module.exports = Title;
