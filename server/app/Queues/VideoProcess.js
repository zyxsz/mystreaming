const Video = use('App/Models/Video');
const Ws = use('Ws');

const ffmpeg = require('fluent-ffmpeg');
const exec = require('child_process').exec;
const queue = require('queue').default;
const fs = require('fs');
const path = require('path');
const { throttle } = require('lodash');

const videoProcessQueue = queue({
  results: [],
  concurrency: 1,
  autostart: true,
});

const start = () => videoProcessQueue.start();
const stop = () => videoProcessQueue.stop();
const end = () => videoProcessQueue.end();

//-vf scale=w=1280:h=720:force_original_aspect_ratio=decrease
//-vf "pad=ceil(iw/2)*2:ceil(ih/2)*2"

const processVideo = async ({ videoDir, videoPath, videoId }) => {
  const videosChannel = await Ws.getChannel('videos').topic('videos');
  if (videosChannel) {
    videosChannel.broadcastToAll('mutate');
  }

  if (!fs.existsSync(path.resolve(videoDir, 'thumbnail'))) {
    fs.mkdirSync(path.resolve(videoDir, 'thumbnail'));
    fs.mkdirSync(path.resolve(videoDir, 'thumbnail', 'preview'));
  } else if (
    fs.existsSync(path.resolve(videoDir, 'thumbnail')) &&
    !fs.existsSync(path.resolve(videoDir, 'thumbnail', 'preview'))
  ) {
    fs.mkdirSync(path.resolve(videoDir, 'thumbnail', 'preview'));
  }

  videoProcessQueue.push((cb) => {
    ffmpeg.ffprobe(videoPath, async function (err, metadata) {
      const subtitleStreams = metadata.streams
        .filter((stream) => stream.codec_type === 'subtitle')
        .map((stream) => ({
          id: stream.index,
          lang: stream.tags ? stream.tags.language || 'eng' : 'eng',
          file: `${videoId}-subtitle-${
            stream.tags ? stream.tags.language || 'eng' : 'eng'
          }.srt`,
        }));

      const streams = metadata.streams
        .filter((stream) => stream.codec_type === 'audio')
        .map((stream) => ({
          id: stream.index,
          lang: stream.tags ? stream.tags.language || 'eng' : 'eng',
          file: `${videoId}-aud-${
            stream.tags ? stream.tags.language || 'eng' : 'eng'
          }.aac`,
        }));

      await renderPreviews({ videoPath, videoDir, videoId });

      await Promise.all(
        subtitleStreams.map(async (stream) => {
          await renderSubtitle({ videoPath, videoDir, videoId, stream });
          return;
        })
      );

      const video = await Video.find(videoId);
      video.subtitles =
        JSON.stringify([...video.subtitles, ...(subtitleStreams || [])]) ||
        '[]';
      await video.save();

      await Promise.all(
        streams.map(async (stream) => {
          await renderAudio({ videoPath, videoDir, videoId, stream });
          return;
        })
      );

      if (
        !(await renderVideo({
          videoPath,
          videoDir,
          videoId,
          streams,
          subtitleStreams,
        }).catch(() => {
          fs.unlinkSync(videoPath);
          streams.map(async (stream) => {
            fs.unlinkSync(`${videoDir}/${stream.file}`);
            return;
          });

          cb();
          return false;
        }))
      )
        return;

      fs.unlinkSync(videoPath);
      streams.map(async (stream) => {
        fs.unlinkSync(`${videoDir}/${stream.file}`);
        return;
      });

      return cb();
    });
  });
};
// ffmpeg -i Movie.mkv -map 0:s:0 subs.srt

async function renderPreviews({ videoPath, videoDir, videoId }) {
  return new Promise(async (resolve, reject) => {
    const video = await Video.find(videoId);
    const previewRender = new ffmpeg();
    //ffmpeg -i .\Legacies.S01E15.1080p.WEB-DL.x264.DUAL-WWW.BLUDV.TV.mkv
    //-vf "fps=1/10,scale=426:240" -q:v 10 preview/96076a15-b18f-418e-8a5f-3e1cf67a8031-%03d.jpg
    previewRender
      .addInput(videoPath)
      .outputOptions(['-vf', 'fps=1/10,scale=426:240', '-q:v 10'])
      .output(`${videoDir}/thumbnail/preview/${videoId}-%03d.jpg`)
      .on('start', async () => {
        video.status = 'previews_rendering';
        await video.save();

        const videosChannel = await Ws.getChannel('videos').topic('videos');
        if (videosChannel) {
          videosChannel.broadcastToAll('mutate', true);
        }
      })
      .on('error', async (err, stdout, stderr) => {
        console.log(err, stdout, stderr);
        video.status = 'error_previews_rendering';
        await video.save();

        const videosChannel = await Ws.getChannel('videos').topic('videos');
        if (videosChannel) {
          videosChannel.broadcastToAll('mutate');
        }

        return reject(false);
      })
      .on(
        'progress',
        throttle(async (progress) => {
          video.progress = progress.percent;
          await video.save();

          const videosChannel = await Ws.getChannel('videos').topic('videos');
          if (videosChannel) {
            videosChannel.broadcastToAll('mutate');
          }
        }, 500)
      )
      .on('end', async () => {
        video.status = 'awaiting_video_render';
        await video.save();

        const videosChannel = await Ws.getChannel('videos').topic('videos');
        if (videosChannel) {
          videosChannel.broadcastToAll('mutate');
        }

        resolve(true);
      })
      .run();
  });
}

async function renderAudio({ videoPath, videoDir, videoId, stream }) {
  return new Promise(async (resolve, reject) => {
    const video = await Video.find(videoId);
    const videoRender = new ffmpeg();

    videoRender
      .addInput(videoPath)
      .outputOptions([
        `-map 0:${stream.id}`,
        '-codec:a aac',
        '-b:a 128k',
        '-ac 2',
      ])
      .output(`${videoDir}/${videoId}-aud-${stream.lang}.aac`)
      .on('start', async () => {
        video.status = 'audio_rendering';
        await video.save();

        const videosChannel = await Ws.getChannel('videos').topic('videos');
        if (videosChannel) {
          videosChannel.broadcastToAll('mutate');
        }
      })
      .on('error', async (err, stdout, stderr) => {
        console.log(err, stdout, stderr);
        video.status = 'error_video_rendering';
        await video.save();

        const videosChannel = await Ws.getChannel('videos').topic('videos');
        if (videosChannel) {
          videosChannel.broadcastToAll('mutate');
        }

        return reject({ err, stdout, stderr });
      })
      .on(
        'progress',
        throttle(async (progress) => {
          video.progress = progress.percent;
          await video.save();

          const videosChannel = await Ws.getChannel('videos').topic('videos');
          if (videosChannel) {
            videosChannel.broadcastToAll('mutate');
          }
        }, 500)
      )
      .on('end', async () => {
        video.status = 'audio_rendering_finished';
        video.progress = 100;
        await video.save();

        const videosChannel = await Ws.getChannel('videos').topic('videos');
        if (videosChannel) {
          videosChannel.broadcastToAll('mutate');
        }

        resolve(true);
      })
      .run();
  });
}

async function renderVideo({ videoPath, videoDir, videoId, streams }) {
  return new Promise(async (resolve, reject) => {
    const video = await Video.find(videoId);
    const videoRender = new ffmpeg();

    videoRender.addInput(videoPath);
    // .inputOptions(['-fix_sub_duration']);

    streams.map((stream) => {
      videoRender.addInput(`${videoDir}/${stream.file}`);
    });

    videoRender
      .outputOptions([
        '-c:a copy',
        '-c:v h264',
        `-vf scale=w=1280:h=720:force_original_aspect_ratio=decrease,pad='iw+mod(iw\,2)':'ih+mod(ih\,2)'`,
        '-b:v:0 1100k',
        '-g 48',
        '-keyint_min 48',
        '-vsync 2',
        '-sc_threshold 0',
        ...streams.map((stream, idx) => `-map ${idx + 1}:a`),
        '-map 0:v',
        `-master_pl_name ${videoId}.m3u8`,
        '-f hls',
        '-hls_time 4',
        '-hls_list_size 0',
        '-hls_segment_filename',
        `${videoDir}/${videoId}_%v_%03d.ts`,
      ])
      .outputOption(
        '-var_stream_map',
        `${streams
          .map(
            (stream, idx) =>
              `a:${idx},agroup:audio,name:${stream.lang}${
                idx === 0 ? ',default:yes' : ''
              },language:${stream.lang.toUpperCase()}`
          )
          .join(' ')} v:0,agroup:audio`
      )

      .output(`${videoDir}/${videoId}_%v.m3u8`)
      .on('start', async (cmd) => {
        console.log(cmd);
        video.status = 'video_rendering';
        await video.save();

        const videosChannel = await Ws.getChannel('videos').topic('videos');
        if (videosChannel) {
          videosChannel.broadcastToAll('mutate');
        }
      })
      .on('error', async (err, stdout, stderr) => {
        console.log(err, stdout, stderr, video.progress);
        if (parseInt(video.progress) >= 98) {
          video.status = 'avaliable';
          await video.save();
        } else {
          video.status = 'error_video_rendering';
          await video.save();
        }

        const videosChannel = await Ws.getChannel('videos').topic('videos');
        if (videosChannel) {
          videosChannel.broadcastToAll('mutate');
        }

        return reject({ err, stdout, stderr });
      })
      .on(
        'progress',
        throttle(async (progress) => {
          video.progress = progress.percent;
          await video.save();

          const videosChannel = await Ws.getChannel('videos').topic('videos');
          if (videosChannel) {
            videosChannel.broadcastToAll('mutate');
          }
        }, 500)
      )
      .on('end', async () => {
        video.status = 'avaliable';
        video.progress = 100;
        await video.save();

        const videosChannel = await Ws.getChannel('videos').topic('videos');
        if (videosChannel) {
          videosChannel.broadcastToAll('mutate');
        }

        resolve(true);
      })
      .run();
  });
}

async function renderSubtitle({ videoPath, videoDir, videoId, stream }) {
  return new Promise(async (resolve, reject) => {
    const videoRender = new ffmpeg();

    videoRender
      .addInput(videoPath)
      .outputOptions([`-map 0:${stream.id}`])

      .output(`${videoDir}/${stream.file}`)
      .on('error', async (err, stdout, stderr) => {
        return reject({ err, stdout, stderr });
      })
      .on('end', async () => {
        resolve(true);
      })
      .run();
  });
}

// async function renderVideo({ videoPath, videoDir, videoId, streams }) {
//   return new Promise(async (resolve, reject) => {
//     const video = await Video.find(videoId);
//     const videoRender = new ffmpeg();

//     videoRender
//       .addInput(videoPath)
//       .inputOptions(['-fix_sub_duration'])
//       .outputOptions([
//         '-vf scale=w=1280:h=720:force_original_aspect_ratio=decrease',
//         '-map 0:0',
//         `-map 0:${
//           streams.find((stream) => stream.lang == 'por')?.id ||
//           streams.find((stream) => stream.lang == 'end')?.id ||
//           1
//         }`,
//         '-c:a aac',
//         '-ar 48000',
//         '-b:a 128k',
//         '-c:v h264',
//         '-crf 20',
//         '-g 54',
//         '-keyint_min 54',
//         '-sc_threshold 0',
//         '-b:v 2500k',
//         '-maxrate 2675k',
//         '-bufsize 3750k',
//         '-f hls',
//         '-hls_time 4',
//         '-hls_playlist_type vod',
//         `-hls_segment_filename`,
//         `${videoDir}/${videoId}-720p_%03d.ts`,
//       ])

//       .output(`${videoDir}/${videoId}-720p.m3u8`)
//       .on('start', async () => {
//         video.status = 'video_rendering';
//         await video.save();

//         const videosChannel = await Ws.getChannel('videos').topic('videos');
//         if (videosChannel) {
//           videosChannel.broadcastToAll('mutate');
//         }
//       })
//       .on('error', async (err, stdout, stderr) => {
//         video.status = 'error_video_rendering';
//         await video.save();

//         const videosChannel = await Ws.getChannel('videos').topic('videos');
//         if (videosChannel) {
//           videosChannel.broadcastToAll('mutate');
//         }

//         return reject({ err, stdout, stderr });
//       })
//       .on(
//         'progress',
//         throttle(async (progress) => {
//           video.progress = progress.percent;
//           await video.save();

//           const videosChannel = await Ws.getChannel('videos').topic('videos');
//           if (videosChannel) {
//             videosChannel.broadcastToAll('mutate');
//           }
//         }, 500)
//       )
//       .on('end', async () => {
//         video.status = 'avaliable';
//         video.progress = 100;
//         await video.save();

//         const videosChannel = await Ws.getChannel('videos').topic('videos');
//         if (videosChannel) {
//           videosChannel.broadcastToAll('mutate');
//         }

//         resolve(true);
//       })
//       .run();
//   });
// }

// const video = await Video.find(videoId);
// if (!err) {
//   console.log('finish');
//   fs.unlinkSync(videoPath);
//   video.status = 'avaliable';
// } else {
//   video.status = 'error';
// }
// await video.save();

module.exports = {
  processVideo,
  start,
  stop,
  end,
};
