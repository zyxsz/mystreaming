import styles from '../../styles/components/Player.module.css';
import dynamic from 'next/dynamic';
import React, { useEffect, useRef, useState } from 'react';
import { FiArrowLeft } from 'react-icons/fi';
import { useRouter } from 'next/router';
import Cookie from 'js-cookie';
import { throttle } from 'lodash';
import api from '../../services/api';
import Controls from '../Controls';
const ReactHlsPlayer = dynamic(() => import('./HlsPlayer'), {
  ssr: false,
});

let timeout;
let mouseMoveTimeout;

export default function Player({
  episode = null,
  progress = null,
  title = null,
  handleChangeVideo = null,
  handleNextEpisode = null,
  showProgresse = true,
  showHeader = true,
  showControls = true,
  small = false,
  show = true,
  autoPlay = true,
  saveProgress = false,
  controlsClassName = null,
  playerContainerClassName = null,
  hiddeControls = true,
  src,
}) {
  const route = useRouter();
  const playerRef = useRef(null);
  const containerRef = useRef(null);
  const [hls, setHls] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [buffer, setBuffer] = useState(0);
  const [paused, setPaused] = useState(true);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(100);
  const [activeFullscreen, setActiveFullscreen] = useState(false);
  const [controls, setControls] = useState(true);
  const [savedProgress, setSavedProgress] = useState(0);
  const [audioTracks, setAudioTracks] = useState(null);
  const [audioTrack, setAudioTrack] = useState(null);
  const [subTitles, setSubTitles] = useState(null);
  const [subTitle, setSubtitle] = useState(null);
  const [subtitleContent, setSubtitleContent] = useState(null);
  const [currentSubtitleContent, setCurrentSubtitleContent] = useState(null);

  // Load progress
  useEffect(() => {
    if (!progress) return;
    setTimeout(() => {
      playerRef.current.currentTime = progress.current_time;
      setCurrentTime(progress.current_time);
    }, 100);
  }, [progress]);

  // Load subtitles
  useEffect(() => {
    if (!episode) return;
    if (!episode.subtitles) return;
    if (episode.subtitles.length <= 0) return;
    const languageNames = new (Intl as any).DisplayNames(['pt'], {
      type: 'language',
    });
    const subtitles = episode.subtitles.map((subtitle) => ({
      ...subtitle,
      file: undefined,
      language: capitalize(languageNames.of(subtitle.lang)),
    }));
    setSubTitles(subtitles);
    const defaultSubtitle = Cookie.get('subtitle-language');
    const currentSubtitle = subtitles.find(
      (subtitle) => subtitle.lang == defaultSubtitle
    );
    setSubtitle(currentSubtitle);
  }, [episode]);

  // Get subtitle data
  useEffect(() => {
    if (!subTitle) {
      setSubtitleContent(null);
      setCurrentSubtitleContent(null);
      return;
    }

    api.get(`api/v1/subtitles/${episode.id}/${subTitle.id}`).then((res) => {
      setSubtitleContent(res.data);
    });
  }, [subTitle]);

  // KeyMap
  useEffect(() => {
    if (!containerRef.current) return;
    function onKeyDown(e) {
      if (
        e.code === 'Space' ||
        e.code === 'NumpadEnter' ||
        e.code === 'Enter'
      ) {
        e.preventDefault();
        if (!playerRef.current) return;
        if (playerRef.current.paused) {
          playVideo();
        } else {
          pauseVideo();
        }
      }
      if (e.code === 'KeyM') {
        e.preventDefault();
        handleMute();
      }
      if (e.code === 'ArrowDown') {
        e.preventDefault();
        setMuted(false);
        setVolume((old) => (old > 0 ? old - 10 : 0));
      }
      if (e.code === 'ArrowUp') {
        e.preventDefault();
        setMuted(false);
        setVolume((old) => (old <= 90 ? old + 10 : 100));
      }
      if (e.code === 'ArrowLeft') {
        e.preventDefault();
        seekTo(-10);
      }
      if (e.code === 'ArrowRight') {
        e.preventDefault();
        seekTo(10);
      }
      if (e.code === 'KeyF') {
        e.preventDefault();
        toggleFullscreen();
      }
    }

    containerRef.current.addEventListener('keydown', onKeyDown);
    return () => {
      if (!containerRef || !containerRef.current) return;
      containerRef.current.removeEventListener('keydown', onKeyDown);
    };
  }, [containerRef]);

  // Buffer
  useEffect(() => {
    if (!playerRef.current) return;
    const { buffered, duration } = playerRef.current;

    if (buffered.length) {
      setBuffer((buffered.end(buffered.length - 1) / duration) * 100);
    }
  });

  // Volume
  useEffect(() => {
    if (!playerRef.current) return;
    playerRef.current.muted = muted;
    playerRef.current.volume = volume / 100;
  }, [muted, volume]);

  // Next episode / Progress
  useEffect(() => {
    if (!episode) return;
    handleProgress.current(currentTime, episode.id);
    const restaming = playerRef.current?.duration - currentTime;
    if (restaming < 30 && restaming > 20) {
      handleNextEpisode();
    }
  }, [currentTime, episode]);

  // Check fullscreen
  useEffect(() => {
    if (!containerRef.current) return;

    function onFullScreenChange() {
      if (document.fullscreenElement) {
        setActiveFullscreen(true);
      } else {
        setActiveFullscreen(false);
      }
    }

    containerRef.current.addEventListener(
      'fullscreenchange',
      onFullScreenChange
    );

    return () => {
      if (!containerRef || !containerRef.current) return;
      containerRef.current.removeEventListener(
        'fullscreenchange',
        onFullScreenChange
      );
    };
  }, []);

  // Hide controls
  useEffect(() => {
    if (!hiddeControls) return;
    if (!containerRef.current) return;
    function onMouseMove(e) {
      if (mouseMoveTimeout) clearTimeout(mouseMoveTimeout);
      setControls(true);
      mouseMoveTimeout = setTimeout(() => {
        setControls(false);
      }, 2500);
    }
    function onMouseLeave() {
      if (mouseMoveTimeout) clearTimeout(mouseMoveTimeout);
      setControls(false);
    }

    containerRef.current.addEventListener('mousemove', onMouseMove);
    containerRef.current.addEventListener('mouseleave', onMouseLeave);
    return () => {
      if (!containerRef || !containerRef.current) return;
      containerRef.current.removeEventListener('mousemove', onMouseMove);
      containerRef.current.removeEventListener('mouseleave', onMouseLeave);
    };
  }, []);

  // Load saved progress (Mini player)
  useEffect(() => {
    if (!playerRef.current) return;
    if (!saveProgress) return;
    if (show) playerRef.current.currentTime = savedProgress;
  }, [show, playerRef]);

  // Change audio-track
  useEffect(() => {
    if (!hls || !audioTrack) return;

    hls.audioTrack = audioTrack.id;
    Cookie.set('language', audioTrack.lang);
  }, [hls, audioTrack]);

  function playVideo() {
    playerRef.current.play();
  }

  function pauseVideo() {
    playerRef.current.pause();
  }

  function handlePause() {
    setPaused(true);
  }

  function handlePlay() {
    setPaused(false);
  }

  function handleMute() {
    setMuted((old) => !old);
  }

  function handleVolume(volume) {
    setVolume(volume);
  }

  function seekTo(time) {
    if (!playerRef.current) return;
    if (timeout) clearTimeout(timeout);
    playerRef.current.currentTime = playerRef.current.currentTime + time;
  }

  function handleChangeTime(time) {
    if (timeout) clearTimeout(timeout);
    setCurrentTime(time);
    timeout = setTimeout(() => {
      playerRef.current.currentTime = time;
    }, 100);
  }

  function toggleFullscreen() {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current.requestFullscreen();
    }
  }

  const handleProgress = useRef(
    throttle((time, video_id) => {
      const percentage = (time / playerRef.current?.duration) * 100 || 0;
      api.post(
        `api/v1/progress`,
        {
          current_time: parseFloat(time),
          percentage,
          completed: percentage > 98,
          video_id,
        },
        {
          headers: {
            Authorization: `Bearer ${Cookie.get()['token']}`,
          },
        }
      );
    }, 2000)
  );

  function handleTimeUpdate() {
    if (!playerRef.current) return;
    const { currentTime } = playerRef.current;
    setCurrentTime(currentTime);
    if (saveProgress) setSavedProgress(currentTime);
    if (!subTitle || !subtitleContent) return;
    const subtitlePart = subtitleContent.find((subtitle) =>
      between(currentTime * 1000, subtitle.data.start, subtitle.data.end)
    );
    setCurrentSubtitleContent(subtitlePart?.data?.text || null);
  }

  function handleLoadPlayerVariables(newHls, audioTracks) {
    const defaultLang = Cookie.get('language');

    setHls(newHls);
    if (!audioTracks || audioTracks.length <= 0) return;
    const defaultTrack =
      audioTracks.find((track) => track.lang === defaultLang) ||
      audioTracks.find((track) => track.default) ||
      audioTracks[0];
    setAudioTracks(audioTracks);
    setAudioTrack(defaultTrack);
  }

  function handleAudioTrack(id) {
    setAudioTrack(audioTracks.find((track) => track.id == id));
  }

  function handleSubtitleTrack(id) {
    if (!id) {
      Cookie.remove('subtitle-language');
      setSubtitle(null);
      return;
    }
    const subtitle = subTitles.find((track) => track.id == id);
    setSubtitle(subtitle);
    Cookie.set('subtitle-language', subtitle.lang);
  }

  if (!show) return null;

  return (
    <div
      className={
        !controls
          ? `${styles.playerContainer} ${styles.playerContainerHiddenCursor} ${
              small ? styles.playerContainerSmall : ''
            } ${playerContainerClassName ? playerContainerClassName : ''}`
          : `${styles.playerContainer} ${
              small ? styles.playerContainerSmall : ''
            } ${playerContainerClassName ? playerContainerClassName : ''}`
      }
      ref={containerRef}
      tabIndex={1}
    >
      {showHeader && controls && (
        <header className={styles.playerHeader}>
          <button className={styles.backButton} onClick={() => route.push('/')}>
            <FiArrowLeft />
            <p>Voltar para a página inicial</p>
          </button>
        </header>
      )}
      {currentSubtitleContent && (
        <div
          className={
            !controls
              ? `${styles.playerSubtitleContainerHiddeControls} ${styles.playerSubtitleContainer}`
              : styles.playerSubtitleContainer
          }
        >
          <p
            dangerouslySetInnerHTML={{
              __html: currentSubtitleContent
                .replace('{\\an8}', '')
                .replace('\n', '<br/>'),
            }}
          />
        </div>
      )}

      <ReactHlsPlayer
        playerRef={playerRef}
        src={src}
        autoPlay={autoPlay}
        controls={false}
        onTimeUpdate={handleTimeUpdate}
        onPause={handlePause}
        onPlay={handlePlay}
        onLoadPlayerVariables={handleLoadPlayerVariables}
      />

      {showControls && (
        <Controls
          currentTime={showProgresse ? currentTime : null}
          duration={playerRef.current?.duration || episode?.duration || 100}
          buffer={buffer}
          activeFullscreen={activeFullscreen}
          toggleFullscreen={toggleFullscreen}
          handleChangeTime={handleChangeTime}
          handleChangeVideo={handleChangeVideo}
          handleNextEpisode={handleNextEpisode}
          pauseVideo={pauseVideo}
          playVideo={playVideo}
          paused={paused}
          seek={seekTo}
          title={title}
          episode={episode}
          handleMute={handleMute}
          muted={muted}
          handleVolume={handleVolume}
          volume={volume}
          controls={controls}
          small={small}
          controlsClassName={controlsClassName}
          audioTracks={audioTracks}
          audioTrack={audioTrack}
          handleAudioTrack={handleAudioTrack}
          subTitles={subTitles}
          subTitle={subTitle}
          handleSubtitleTrack={handleSubtitleTrack}
        />
      )}
    </div>
  );
}

const capitalize = (s) => {
  if (typeof s !== 'string') return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
};

const between = function (value, a, b) {
  var min = Math.min.apply(Math, [a, b]),
    max = Math.max.apply(Math, [a, b]);
  return value > min && value < max;
};

/**
 * 
 * const minutes = Math.floor((playerRef.current?.duration - currentTime) / 60);
  const seconds = Math.floor(
    playerRef.current?.duration - currentTime - minutes * 60
  );
 */
