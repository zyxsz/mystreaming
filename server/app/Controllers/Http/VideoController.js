const Video = use('App/Models/Video');
const Season = use('App/Models/Season');
const Progress = use('App/Models/Progress');

const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

const { processVideo } = require('../../Queues/VideoProcess');
const { getVideoDurationInSeconds } = require('get-video-duration');
const ThumbnailGenerator = require('video-thumbnail-generator').default;
const { parseSync } = require('subtitle');
const languageEncoding = require('detect-file-encoding-and-language');

class VideoController {
  async index({}) {
    const videos = await Video.query()
      .with('season')
      .with('season.title')
      .orderBy('created_at', 'desc')
      .fetch();

    return videos;
  }

  /**
   * Create/save a new video.
   * POST videos
   */
  async store({ request, response }) {
    const data = request.only(['season_id', 'episode_number']);

    if (
      await Video.query()
        .where('season_id', data.season_id)
        .where('episode_number', data.episode_number || 1)
        .first()
    )
      return response
        .status(400)
        .send({ message: 'Um episódio com este número já existe' });

    const season = (
      await Season.query()
        .where('id', data.season_id)
        .with('title')
        .firstOrFail()
    ).toJSON();

    const video = request.file('video', {
      types: ['video'],
      size: '5gb',
    });

    const videoId = crypto.randomBytes(16).toString('hex');
    const videoName = `${data.episode_number || 1}-${videoId}.${video.extname}`;
    const videoDir = path.resolve(
      `D:/mystreaming/${slugify(season.title.name)}/${slugify(season.name)}/${
        data.episode_number || 1
      }-${videoId}`
    );
    const videoPath = path.resolve(
      `D:/mystreaming/${slugify(season.title.name)}/${slugify(season.name)}/${
        data.episode_number || 1
      }-${videoId}/${videoName}`
    );

    const thumbanilName = `${crypto.randomBytes(16).toString('hex')}.png`;
    const thumbnailPath = path.resolve(
      `D:/mystreaming/${slugify(season.title.name)}/${slugify(season.name)}/${
        data.episode_number || 1
      }-${videoId}/thumbnail`
    );

    await video.move(videoDir, {
      name: videoName,
      overwrite: true,
    });

    if (!video.moved()) {
      return video.error();
    }

    const tg = new ThumbnailGenerator({
      sourcePath: videoPath,
      thumbnailPath: thumbnailPath,
    });

    const duration = await getVideoDurationInSeconds(videoPath);
    const thumbnail = await tg.generateOneByPercent(
      Math.floor(Math.random() * (30 - 5 + 1) + 5),
      { size: '1280x720', filename: thumbanilName }
    );

    const videoDb = await Video.create({
      ...data,
      duration,
      thumbnail,
      path: videoDir,
      status: 'inqueue',
    });

    processVideo({
      videoDir,
      videoPath,
      videoId: videoDb.id,
    });

    return videoDb;
  }

  /**
   * Display a single video.
   * GET videos/:id
   */
  async show({ params, request, response, auth }) {
    const video = await Video.query()
      .where('id', params.id)
      .with('season')
      .firstOrFail();
    const progress = await Progress.query()
      .where('user_id', auth.user.id)
      .where('video_id', params.id)
      .first();

    return { video, progress };
  }

  /**
   * Update video details.
   * PUT or PATCH videos/:id
   */
  async update({ params, request, response }) {}

  /**
   * Delete a video with id.
   * DELETE videos/:id
   */
  async destroy({ params, request, response }) {}

  async watch({ response, params }) {
    const video = await Video.query()
      .where('id', params.id)
      .setVisible(['path'])
      .firstOrFail();

    if (!video)
      return response.status(404).send({ error: 'Video not avaliable' });

    if (params.file === 'watch') {
      return response.download(path.join(video.path, `${video.id}.m3u8`));
    } else if (params.file) {
      return response.download(path.join(video.path, params.file));
    }
  }

  async thumbnail({ response, params }) {
    const video = await Video.query().where('id', params.id).firstOrFail();

    if (!video)
      return response.status(404).send({ error: 'Video not avaliable' });

    return response.download(
      path.join(video.path, 'thumbnail', video.thumbnail)
    );
  }

  async thumbnailPreview({ response, params }) {
    const video = await Video.query().where('id', params.id).firstOrFail();

    if (!video)
      return response.status(404).send({ error: 'Video not avaliable' });

    return response.download(
      path.join(
        video.path,
        'thumbnail',
        'preview',
        `${params.id}-${String(params.part).padStart(3, '0')}.jpg`
      )
    );
  }

  async subtitle({ params }) {
    const video = await Video.find(params.video_id);

    const subtitle = video.subtitles.find(
      (subtitle) => subtitle.id == params.id
    );

    const charsetMatch = await languageEncoding(
      path.join(video.path, subtitle.file)
    );
    const content = fs.readFileSync(
      path.join(video.path, subtitle.file),
      charsetMatch
        ? charsetMatch.encoding == 'UTF-8'
          ? 'utf-8'
          : 'latin1'
        : 'utf8'
    );
    const captions = parseSync(content);

    return captions;
  }

  async storeSubtitle({ params, request }) {
    const data = request.only(['language']);
    const video = await Video.find(params.video_id);

    const lastSubtitle = video.subtitles[video.subtitles.length - 1];

    const newId = lastSubtitle ? lastSubtitle.id + 1 : 1;

    const subtitle = request.file('subtitle', {
      size: '10mb',
    });

    const subtitleName = `${video.id}-subtitle-${data.language}.${subtitle.extname}`;

    await subtitle.move(video.path, {
      name: subtitleName,
      overwrite: true,
    });

    video.subtitles = JSON.stringify([
      ...video.subtitles,
      {
        id: newId,
        lang: data.language,
        file: subtitleName,
      },
    ]);

    await video.save();

    return video;
  }
}

module.exports = VideoController;

const slugify = (text) =>
  text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
