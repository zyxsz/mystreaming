const Video = use('App/Models/Video');
const Progress = use('App/Models/Progress');
const ProgressTitle = use('App/Models/ProgressTitle');

class ProgressController {
  /**
   * Show a list of all progresses.
   * GET progresses
   */
  async index({ request, response, view }) {}

  /**
   * Create/save a new progress.
   * POST progresses
   */
  async store({ request, auth }) {
    const { current_time, percentage, video_id, completed } = request.only([
      'current_time',
      'percentage',
      'video_id',
      'completed',
    ]);

    const video = (
      await Video.query()
        .where('id', video_id)
        .with('season')
        .with('season.title')
        .firstOrFail()
    ).toJSON();

    const progress = await Progress.query()
      .where('video_id', video_id)
      .where('user_id', auth.user.id)
      .first();

    if (progress) {
      progress.current_time = current_time;
      progress.percentage = percentage;
      progress.completed = completed;
      await progress.save();
    } else {
      await Progress.create({
        current_time,
        percentage,
        completed,
        user_id: auth.user.id,
        video_id,
      });
    }

    const progressTitle = await ProgressTitle.query()
      .where('title_id', video.season.title.id)
      .where('user_id', auth.user.id)
      .first();

    if (progressTitle) {
      progressTitle.current_time = current_time;
      progressTitle.percentage = percentage;
      progressTitle.completed = completed;
      progressTitle.current_video_id = video_id;
      await progressTitle.save();
    } else {
      await ProgressTitle.create({
        current_time,
        percentage,
        completed,
        current_video_id: video_id,
        user_id: auth.user.id,
        title_id: video.season.title.id,
      });
    }

    return;
  }

  /**
   * Display a single progress.
   * GET progresses/:id
   */
  async show({ params, request, response, view }) {}

  /**
   * Update progress details.
   * PUT or PATCH progresses/:id
   */
  async update({ params, request, response }) {}

  /**
   * Delete a progress with id.
   * DELETE progresses/:id
   */
  async destroy({ params, request, response }) {}
}

module.exports = ProgressController;
