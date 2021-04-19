'use strict';

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model');

class Season extends Model {
  static boot() {
    super.boot();

    this.addHook('beforeCreate', 'CustomerHook.uuid');
  }

  static get computed() {
    return ['poster_url'];
  }

  getPosterUrl({ poster }) {
    return `https://image.tmdb.org/t/p/original/${poster}`;
  }

  episodes() {
    return this.hasMany('App/Models/Video');
  }

  title() {
    return this.belongsTo('App/Models/Title');
  }
}

module.exports = Season;
