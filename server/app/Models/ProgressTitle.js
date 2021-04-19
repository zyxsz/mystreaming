'use strict';

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model');

class ProgressTitle extends Model {
  episode() {
    return this.belongsTo('App/Models/Video', 'current_video_id');
  }
}

module.exports = ProgressTitle;
