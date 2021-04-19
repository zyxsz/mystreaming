const Title = use('App/Models/Title');
const Season = use('App/Models/Season');
const Helpers = use('Helpers');

const Video = use('App/Models/Video');
const ProgressTitle = use('App/Models/ProgressTitle');
const Progress = use('App/Models/Progress');

const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const ytdl = require('ytdl-core');

const {
  getTvShowInfos,
  getTvShowTrailers,
  getTvShowImages,
} = require('../../../services/tmdb');
const { processTrailer } = require('../../Queues/TrailerProcess');

class TitleController {
  /**
   * Show a list of all titles.
   * GET titles
   */
  async index({ auth }) {
    const titles = (
      await Title.query()
        .with('seasons')
        .with('seasons.episodes')
        .with('seasons.episodes.progresses')
        .fetch()
    ).toJSON();

    return titles.map((title) => ({
      ...title,
      seasons: title.seasons.map((season) => ({
        ...season,
        episodes: season.episodes.map((episode) => ({
          ...episode,
          progresses: undefined,
          work_progress: episode.progress,
          progress: episode.progresses.find(
            (progress) => progress.user_id === auth.user.id
          ),
        })),
      })),
    }));
  }

  /**
   *
   * episodes: await Promise.all(
            season.episodes.map(async (episode) => {
              console.log('aa');
              const epProgress = await Progress.query()
                .where('user_id', auth.user.id)
                .where('video_id', episode.id)
                .first();

              return {
                ...episode,
                progress: epProgress ? epProgress.toJSON() : undefined,
              };
            })
          ),
   * Create/save a new title.
   * POST titles
   */
  async store({ request, auth }) {
    const { id } = request.only(['id']);
    const data = await getTvShowInfos(id);
    const trailerData = await getTvShowTrailers(id);

    const original_name =
      data.original_language === 'ja' ? data.name : data.original_name;
    let trailerId = crypto.randomBytes(16).toString('hex');
    const trailerName = `${trailerId}.mp4`;
    const trailerPath = path.resolve(
      `D:/mystreaming/${slugify(original_name)}/trailer/${trailerName}`
    );

    if (trailerData && trailerData.key) {
      if (
        !fs.existsSync(
          path.resolve(`D:/mystreaming/${slugify(original_name)}/trailer`)
        )
      ) {
        fs.mkdirSync(path.resolve(`D:/mystreaming/${slugify(original_name)}`));
        fs.mkdirSync(
          path.resolve(`D:/mystreaming/${slugify(original_name)}/trailer`)
        );
      }

      ytdl(`http://www.youtube.com/watch?v=${trailerData.key}`).pipe(
        fs.createWriteStream(trailerPath).on('finish', () => {
          processTrailer({
            videoPath: trailerPath,
            videoId: trailerId,
            videoDir: path.resolve(
              `D:/mystreaming/${slugify(original_name)}/trailer`
            ),
          });
        })
      );
    } else {
      trailerId = undefined;
    }

    const imagesData = await getTvShowImages(id);

    const banners =
      imagesData.backdrops.map((backdrop) => ({
        key: backdrop.file_path,
        url: `https://image.tmdb.org/t/p/original/${backdrop.file_path}`,
        vote_average: backdrop.vote_average,
      })) || [];

    const posters =
      imagesData.posters.map((poster) => ({
        key: poster.file_path,
        url: `https://image.tmdb.org/t/p/original/${poster.file_path}`,
        vote_average: poster.vote_average,
      })) || [];

    const title = await Title.create({
      name: original_name,
      description: data.overview,
      tagline: data.tagline,
      banner: data.backdrop_path,
      poster: data.poster_path,
      vote_average: data.vote_average,
      popularity: data.popularity,
      first_air_date: data.first_air_date,
      genres: JSON.stringify(data.genres.map((genre) => genre.name)),
      number_of_seasons: data.number_of_seasons,
      number_of_episodes: data.number_of_episodes,
      author_id: auth.user.id,
      trailer: trailerId,
      banners: JSON.stringify(banners),
      posters: JSON.stringify(posters),
    });

    data.seasons
      .filter((season) => season.season_number > 0)
      .map((season) => {
        Season.create({
          title_id: title.id,
          name: season.name,
          description: season.overview,
          season_number: season.season_number,
          episode_count: season.episode_count,
          poster: season.poster_path,
          air_date: season.air_date,
        });
      });

    return title;
  }

  /**
   * Display a single title.
   * GET titles/:id
   */
  async show({ params, request, response, view }) {
    const title = await Title.query()
      .where('id', params.id)
      .with('seasons')
      .firstOrFail();

    return title;
  }

  /**
   * Update title details.
   * PUT or PATCH titles/:id
   */
  async update({ params, request, response }) {}

  /**
   * Delete a title with id.
   * DELETE titles/:id
   */
  async destroy({ params, request, response }) {
    const title = await Title.query().where('id', params.id).firstOrFail();

    await title.delete();

    return;
  }

  async watch({ auth, params, response }) {
    const title = (
      await Title.query()
        .where('id', params.id)
        .with('seasons')
        .with('seasons.episodes')
        .with('seasons.episodes.progresses')
        .firstOrFail()
    ).toJSON();

    const progress = await ProgressTitle.query()
      .where('user_id', auth.user.id)
      .where('title_id', title.id)
      .with('episode')
      .with('episode.season')
      .first();

    const sessonWithEpisodes = title.seasons.find(
      (season) => season.episodes.length > 0
    );
    const firstEpisode = sessonWithEpisodes
      ? sessonWithEpisodes.episodes[0]
      : false;

    if (!firstEpisode)
      return response
        .status(400)
        .send({ message: 'Está serie não possui nenhum episódio' });

    const video = await Video.query()
      .where('id', progress ? progress.current_video_id : firstEpisode.id)
      .with('season')
      .first();

    return {
      title: {
        ...title,
        seasons: title.seasons.map((season) => ({
          ...season,
          episodes: season.episodes.map((episode) => ({
            ...episode,
            progresses: undefined,
            progress: episode.progresses.find(
              (progress) => progress.user_id === auth.user.id
            ),
          })),
        })),
      },
      current_episode: video,
      current_progress: progress,
    };
  }

  async watchTrailer({ response, params }) {
    const title = await Title.query()
      .where('id', params.id)
      .setVisible(['trailer'])
      .firstOrFail();

    if (!title)
      return response.status(404).send({ error: 'Trailer not avaliable' });

    if (params.file === 'watch') {
      return response.download(
        path.join(
          `D:/mystreaming/${slugify(title.name)}/trailer`,
          `${title.trailer}-720p.m3u8`
        )
      );
    } else if (params.file) {
      return response.download(
        path.join(`D:/mystreaming/${slugify(title.name)}/trailer`, params.file)
      );
    }
  }

  async home({ auth }) {
    const titles = (
      await Title.query().with('seasons').with('seasons.episodes').fetch()
    ).toJSON();

    const progresses = (
      await ProgressTitle.query()
        .where('user_id', auth.user.id)
        .with('episode')
        .with('episode.season')
        .fetch()
    ).toJSON();

    const mainTitle = titles[Math.floor(Math.random() * titles.length)];

    return {
      main: {
        ...mainTitle,
        progress: progresses.find(
          (progress) => progress.title_id == mainTitle.id
        ),
      },
      rows: [
        titles.filter((title) =>
          progresses.find((progress) => progress.title_id == title.id)
        ).length > 0 && {
          title: 'Continue assistindo',
          titles: titles
            .filter((title) =>
              progresses.find((progress) => progress.title_id == title.id)
            )
            .sort((a, b) => {
              const aProgress = progresses.find(
                (progress) => progress.title_id == a.id
              );
              const bProgress = progresses.find(
                (progress) => progress.title_id == b.id
              );

              return (
                new Date(bProgress.updated_at).getTime() -
                new Date(aProgress.updated_at).getTime()
              );
            })
            .map((title) => ({
              ...title,
              progress: progresses.find(
                (progress) => progress.title_id == title.id
              ),
            })),
        },
        ...convertChunks(
          titles.map((title) => ({
            ...title,
            progress: progresses.find(
              (progress) => progress.title_id == title.id
            ),
          })),
          5
        ).map((chunk, idx) =>
          idx === 0
            ? { title: 'Mais populares', titles: chunk }
            : { titles: chunk }
        ),
      ],
    };
  }
}

module.exports = TitleController;

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

function convertChunks(array, chunkSize) {
  return [].concat.apply(
    [],
    array.map(function (elem, i) {
      return i % chunkSize ? [] : [array.slice(i, i + chunkSize)];
    })
  );
}
