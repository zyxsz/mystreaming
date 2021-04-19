import styles from '../styles/components/Controls.module.css';
import { FiArrowLeft, FiArrowRight, FiCheck } from 'react-icons/fi';
import { useEffect, useRef, useState } from 'react';

import {
  ImVolumeHigh,
  ImVolumeLow,
  ImVolumeMedium,
  ImVolumeMute,
  ImVolumeMute2,
} from 'react-icons/im';
import Slider from 'react-rangeslider';
import ProgressBar from './ProgressBar';

let firstJoinMouseEpisodes;

export default function Controls({
  duration = null,
  currentTime = null,
  buffer = null,
  handleChangeTime,
  paused,
  playVideo,
  pauseVideo,
  seek,
  handleNextEpisode = null,
  handleChangeVideo = null,
  episode = null,
  title = null,
  toggleFullscreen,
  activeFullscreen,
  volume,
  handleVolume,
  muted,
  handleMute,
  controls,
  small = false,
  controlsClassName = null,
  audioTracks = null,
  audioTrack = null,
  handleAudioTrack = null,
  subTitles = null,
  subTitle = null,
  handleSubtitleTrack = null,
}) {
  const minutes =
    currentTime !== null ? Math.floor((duration - currentTime) / 60) : 0;
  const seconds =
    currentTime !== null
      ? Math.floor(duration - currentTime - minutes * 60)
      : 0;

  function handleButtonClick(e, action, ...args) {
    e.preventDefault();
    e.stopPropagation();
    if (action) action(...args);
  }

  return (
    <div
      className={
        !small
          ? `${styles.playerControls} ${
              controlsClassName ? controlsClassName : ''
            } ${activeFullscreen ? 'fullscreen' : ''} ${
              !controls ? styles.hiddeControls : ''
            }`
          : `${styles.playerControls} ${styles.playerControlsSmall}  ${
              controlsClassName ? controlsClassName : ''
            } ${activeFullscreen ? 'fullscreen' : ''} ${
              !controls ? styles.hiddeControls : ''
            }`
      }
    >
      <>
        {currentTime !== null && (
          <ProgressBar
            min={0}
            max={Number(duration)}
            value={Number(currentTime)}
            onChange={handleChangeTime}
            minutes={minutes}
            seconds={seconds}
            buffer={buffer}
            episode_id={episode?.id || null}
          />
        )}

        <div className={styles.playerButtons}>
          <div className={styles.playerButtonsLeft}>
            <button
              onClick={(e) =>
                handleButtonClick(e, paused ? playVideo : pauseVideo)
              }
            >
              {paused ? (
                <svg id="nfplayerPlay" viewBox="0 0 28 28">
                  <polygon points="8 22 8 6 22.0043763 14" />
                </svg>
              ) : (
                <svg viewBox="0 0 28 28">
                  <rect x={9} y={6} width={4} height={16} />
                  <rect x={15} y={6} width={4} height={16} />
                </svg>
              )}
            </button>
            <button onClick={(e) => handleButtonClick(e, seek, -10)}>
              <svg viewBox="0 0 28 28">
                <g stroke="none" strokeWidth={1} fill="none">
                  <path
                    d="M21.9992616,8.99804242 C23.2555293,10.6696987 24,12.7479091 24,15 C24,20.5228475 19.5228475,25 14,25 C8.4771525,25 4,20.5228475 4,15 C4,9.4771525 8.4771525,5 14,5 L16,5"
                    stroke="white"
                    strokeWidth={2}
                    transform="translate(14.000000, 15.000000) scale(-1, 1) translate(-14.000000, -15.000000) "
                  />
                  <polyline
                    stroke="white"
                    strokeWidth={2}
                    points="15.5 1.5 12 4.92749023 15.5 8.5"
                  />
                  <polyline
                    stroke="white"
                    strokeWidth={2}
                    points="11 1.5 7.5 5 11 8.5"
                  />
                  <text
                    fontSize={10}
                    fontWeight={400}
                    letterSpacing="-0.3"
                    fill="white"
                    style={{ transform: 'translateX(3px)' }}
                  >
                    <tspan x={7} y={19} style={{ userSelect: 'none' }}>
                      10
                    </tspan>
                  </text>
                </g>
              </svg>
            </button>
            <button onClick={(e) => handleButtonClick(e, seek, 10)}>
              <svg viewBox="0 0 28 28">
                <g stroke="none" strokeWidth={1} fill="none">
                  <g transform="translate(14.000000, 13.000000) scale(-1, 1) translate(-14.000000, -13.000000) translate(4.000000, 1.000000)">
                    <path
                      d="M17.9992616,7.99804242 C19.2555293,9.66969874 20,11.7479091 20,14 C20,19.5228475 15.5228475,24 10,24 C4.4771525,24 0,19.5228475 0,14 C0,8.4771525 4.4771525,4 10,4 L12,4"
                      stroke="white"
                      strokeWidth={2}
                      transform="translate(10.000000, 14.000000) scale(-1, 1) translate(-10.000000, -14.000000) "
                    />
                    <polyline
                      stroke="white"
                      strokeWidth={2}
                      points="11.5 0.5 8 3.92749023 11.5 7.5"
                    />
                    <polyline
                      stroke="white"
                      strokeWidth={2}
                      points="7 0.5 3.5 4 7 7.5"
                    />
                  </g>
                  <text
                    fontSize={10}
                    fontWeight={400}
                    letterSpacing="-0.3"
                    fill="white"
                    style={{ transform: 'translateX(3px)' }}
                  >
                    <tspan x={7} y={19} style={{ userSelect: 'none' }}>
                      10
                    </tspan>
                  </text>
                </g>
              </svg>
            </button>
            <button
              className={styles.playerVolumeButton}
              onClick={(e) => handleButtonClick(e, () => {}, '')}
            >
              <div className={styles.playerVolumeContainer}>
                <div>
                  <Slider
                    min={0}
                    max={100}
                    value={volume}
                    orientation="vertical"
                    onChange={handleVolume}
                    className="volume"
                  />
                </div>
              </div>
              {!muted && volume >= 75 && (
                <ImVolumeHigh
                  onClick={(e) => handleButtonClick(e, handleMute)}
                />
              )}
              {!muted && volume < 75 && volume >= 50 && (
                <ImVolumeMedium
                  onClick={(e) => handleButtonClick(e, handleMute)}
                />
              )}
              {!muted && volume < 50 && volume > 0 && (
                <ImVolumeLow
                  onClick={(e) => handleButtonClick(e, handleMute)}
                />
              )}
              {!muted && volume <= 0 && (
                <ImVolumeMute
                  onClick={(e) => handleButtonClick(e, handleMute)}
                />
              )}
              {muted && (
                <ImVolumeMute2
                  onClick={(e) => handleButtonClick(e, handleMute)}
                />
              )}
            </button>
            {episode && (
              <span>
                <h1>
                  T{episode.season.season_number}:E{episode.episode_number}
                </h1>
                <p>"{episode.name}"</p>
              </span>
            )}
          </div>
          <div className={styles.playerButtonsRight}>
            {handleNextEpisode && (
              <button onClick={(e) => handleButtonClick(e, handleNextEpisode)}>
                <svg id="nfplayerNextEpisode" viewBox="0 0 28 28">
                  <g transform="translate(6, 6)">
                    <path d="M0,16 L0,0 L14,8 L0,16 Z M14,16 L14,0 L16,0 L16,16 L14,16 Z"></path>
                  </g>
                </svg>
              </button>
            )}
            {episode && (
              <button className={styles.playerEpisodes}>
                <EpisodesModal
                  episode={episode}
                  title={title}
                  handleChangeVideo={handleChangeVideo}
                />

                <svg viewBox="0 0 28 28">
                  <path d="M27,7.25 L27,14 L24.7142857,14 L24.7142857,7.25 L11,7.25 L11,5 L27,5 L27,7.25 Z M23,11.2222222 L23,19 L20.7333333,19 L20.7333333,11.2222222 L6,11.2222222 L6,9 L23,9 L23,11.2222222 Z M1,13 L19,13 L19,24 L1,24 L1,13 Z" />
                </svg>
              </button>
            )}
            {audioTracks && (
              <button className={styles.playerLanguage}>
                <div className={styles.playerLanguageContainer}>
                  <div className={styles.playerLanguageColumn}>
                    <h1>Idioma</h1>
                    <div className={styles.playerLanguageRows}>
                      {audioTracks.map((track, idx) => (
                        <div
                          key={idx}
                          className={
                            audioTrack?.id === track.id
                              ? `${styles.playerLanguageRow} ${styles.playerLanguageRowSelected}`
                              : styles.playerLanguageRow
                          }
                          onClick={() => handleAudioTrack(track.id)}
                        >
                          <FiCheck />
                          <p>{track.language}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className={styles.playerLanguageColumn}>
                    <h1>Legenda</h1>
                    <div className={styles.playerLanguageRows}>
                      {subTitles?.map((track, idx) => (
                        <div
                          key={idx}
                          className={
                            subTitle?.id === track.id
                              ? `${styles.playerLanguageRow} ${styles.playerLanguageRowSelected}`
                              : styles.playerLanguageRow
                          }
                          onClick={() => handleSubtitleTrack(track.id)}
                        >
                          <FiCheck />
                          <p>{track.language}</p>
                        </div>
                      ))}
                      <div
                        className={
                          !subTitle
                            ? `${styles.playerLanguageRow} ${styles.playerLanguageRowSelected}`
                            : styles.playerLanguageRow
                        }
                        onClick={() => handleSubtitleTrack(null)}
                      >
                        <FiCheck />
                        <p>Desligadas</p>
                      </div>
                    </div>
                  </div>
                </div>

                <svg viewBox="0 0 28 28">
                  <g transform="translate(1, 6)">
                    <path d="M24,14 L24,19 L19,14 L0,14 L0,0 L26,0 L26,14 L24,14 Z M2,6 L2,8 L7,8 L7,6 L2,6 Z M9,6 L9,8 L17,8 L17,6 L9,6 Z M19,6 L19,8 L24,8 L24,6 L19,6 Z M2,10 L2,12 L10,12 L10,10 L2,10 Z M12,10 L12,12 L17,12 L17,10 L12,10 Z" />
                  </g>
                </svg>
              </button>
            )}
            <button onClick={(e) => handleButtonClick(e, toggleFullscreen)}>
              {activeFullscreen ? (
                <svg viewBox="0 0 28 28">
                  <g transform="translate(3, 6)">
                    <polygon
                      transform="translate(19.000000, 3.000000) scale(-1, 1) translate(-19.000000, -3.000000) "
                      points="22 0 20 0 20 4 16 4 16 6 22 6"
                    />
                    <polygon
                      transform="translate(19.000000, 13.000000) scale(-1, -1) translate(-19.000000, -13.000000) "
                      points="22 10 20 10 20 14 16 14 16 16 22 16"
                    />
                    <polygon points="6 0 4 0 4 4 0 4 0 6 6 6" />
                    <polygon
                      transform="translate(3.000000, 13.000000) scale(1, -1) translate(-3.000000, -13.000000) "
                      points="6 10 4 10 4 14 0 14 0 16 6 16"
                    />
                  </g>
                </svg>
              ) : (
                <svg viewBox="0 0 28 28">
                  <g transform="translate(2, 6)">
                    <polygon points="8 0 6 0 5.04614258 0 0 0 0 5 2 5 2 2 8 2" />
                    <polygon
                      transform="translate(4, 13.5) scale(1, -1) translate(-4, -13.5) "
                      points="8 11 6 11 5.04614258 11 0 11 0 16 2 16 2 13 8 13"
                    />
                    <polygon
                      transform="translate(20, 2.5) scale(-1, 1) translate(-20, -2.5) "
                      points="24 0 22 0 21.0461426 0 16 0 16 5 18 5 18 2 24 2"
                    />
                    <polygon
                      transform="translate(20, 13.5) scale(-1, -1) translate(-20, -13.5) "
                      points="24 11 22 11 21.0461426 11 16 11 16 16 18 16 18 13 24 13"
                    />
                  </g>
                </svg>
              )}
            </button>
          </div>
        </div>
      </>
    </div>
  );
}
function EpisodesModal({ title, episode, handleChangeVideo }) {
  const episodesRef = useRef(null);
  const [page, setPage] = useState('view');
  const [season, setSeason] = useState(
    title.seasons.find((season) => season.id === episode.season_id)
  );

  useEffect(() => {
    if (!episodesRef.current) return;
    if (!episode) return;

    function onMouseMove() {
      if (season.id !== episode.season_id) return;
      if (firstJoinMouseEpisodes) return;
      firstJoinMouseEpisodes = true;
      const episodesList = document.querySelector('div#episodesList');
      const firstChild = episodesList.firstChild;
      if (!firstChild) return;
      const firstChildPositions = (firstChild as any).getBoundingClientRect();

      episodesRef.current.scrollTo({
        top:
          firstChildPositions.height * episode.episode_number -
          firstChildPositions.height,
        behavior: 'smooth',
      });
    }

    episodesRef.current.addEventListener('mousemove', onMouseMove);
    return () => {
      if (!episodesRef || !episodesRef.current) return;
      episodesRef.current.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  function handleSelectSeason(season_id) {
    setSeason(title.seasons.find((season) => season.id === season_id));
    setPage('view');
    firstJoinMouseEpisodes = false;
  }

  return (
    <div className={styles.playerEpisodesContainer} ref={episodesRef}>
      <div>
        {page === 'view' && season && (
          <>
            <header onClick={() => setPage('seasons')}>
              <FiArrowLeft />
              <h1>{season.name}</h1>
            </header>
            <div className={styles.playerEpisodesContent}>
              <div
                className={styles.playerEpisodesVideosContainer}
                id="episodesList"
              >
                {season.episodes
                  .sort((a, b) => a.episode_number - b.episode_number)
                  .map((ep, idx) => (
                    <div
                      className={
                        ep.id === episode.id
                          ? `${styles.playerEpisode} ${styles.playerEpisodeActive}`
                          : styles.playerEpisode
                      }
                      key={idx}
                      onClick={() => handleChangeVideo(ep.id)}
                    >
                      <figure>
                        <img
                          src={`http://localhost:3333/api/v1/thumbnails/${ep.id}`}
                        />
                        <div className={styles.playerEpisodePlay}>
                          <svg viewBox="0 0 28 28">
                            <polygon points="8 22 8 6 22.0043763 14" />
                          </svg>
                        </div>
                        {ep.progress && (
                          <div className={styles.playerEpisodeProgress}>
                            <div
                              style={{
                                width: `${ep.progress.percentage}%`,
                              }}
                            />
                          </div>
                        )}
                      </figure>
                      <div className={styles.playerEpisodeInfos}>
                        <h3>{ep.name}</h3>
                        <h4>
                          Duração:{' '}
                          {String(Math.floor(ep.duration / 60)).padStart(
                            2,
                            '0'
                          ) || '00'}
                          :
                          {String(
                            Math.floor(
                              ep.duration - Math.floor(ep.duration / 60) * 60
                            )
                          ).padStart(2, '0') || '00'}
                        </h4>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </>
        )}
        {page === 'seasons' && (
          <div className={styles.playerSeasons}>
            {title.seasons
              .sort((a, b) => a.season_number - b.season_number)
              .map((season, key) => (
                <div key={key} onClick={() => handleSelectSeason(season.id)}>
                  <h1>{season.name}</h1>
                  <FiArrowRight />
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
