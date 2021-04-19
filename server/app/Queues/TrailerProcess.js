const Video = use('App/Models/Video');

const ffmpeg = require('fluent-ffmpeg');
const exec = require('child_process').exec;
const queue = require('queue').default;
const fs = require('fs');

const videoProcessQueue = queue({
  results: [],
  concurrency: 1,
  autostart: true,
});

const start = () => videoProcessQueue.start();
const stop = () => videoProcessQueue.stop();
const end = () => videoProcessQueue.end();

const processTrailer = async ({ videoDir, videoPath, videoId }) => {
  videoProcessQueue.push((cb) => {
    exec(
      `cd "${videoDir}" && ffmpeg -i "${videoPath}" -vf scale=w=1280:h=720:force_original_aspect_ratio=decrease -c:a aac -ar 48000 -b:a 128k -c:v h264 -profile:v main -crf 20 -g 54 -keyint_min 54 -sc_threshold 0 -b:v 2500k -maxrate 2675k -bufsize 3750k -hls_time 4 -hls_playlist_type vod -hls_segment_filename "${videoDir}/${videoId}-720p_%03d.ts" "${videoDir}/${videoId}-720p.m3u8"`,
      async (err, stdout, stderr) => {
        if (!err) {
          console.log('finish');
          fs.unlinkSync(videoPath);
        }
        cb();
      }
    );
  });
};

module.exports = {
  processTrailer,
  start,
  stop,
  end,
};
