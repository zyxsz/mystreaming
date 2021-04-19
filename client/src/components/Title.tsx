import { useEffect, useRef, useState } from 'react';
import styles from '../styles/components/Title.module.css';
import { useRouter } from 'next/router';
import Player from './Player';

export default function Title({ title, ...rest }) {
  const playerWrapperRef = useRef(null);
  const containerRef = useRef(null);
  const [hover, setHover] = useState(false);
  const [controls, setControls] = useState(false);
  const [banner] = useState(
    title.banners[Math.floor(Math.random() * title.banners.length)]?.url ||
      title.banner_url
  );
  const router = useRouter();
  let timeout;

  // Check hover
  useEffect(() => {
    if (!containerRef) return;

    function onMouseEnter() {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        setHover(true);
        setControls(true);
      }, 500);
    }
    function onMouseLeave() {
      if (timeout) clearTimeout(timeout);
      setControls(false);
      timeout = setTimeout(() => {
        setHover(false);
      }, 800);
    }

    containerRef.current.addEventListener('mouseenter', onMouseEnter);
    containerRef.current.addEventListener('mouseleave', onMouseLeave);

    return () => {
      if (!containerRef || !containerRef.current) return;
      containerRef.current.removeEventListener('mouseenter', onMouseEnter);
      containerRef.current.removeEventListener('mouseleave', onMouseLeave);
    };
  }, [containerRef, setHover]);

  function handleWatch() {
    const sessonWithEpisodes = title?.seasons.find(
      (season) => season.episodes.length > 0
    );
    const hasFirstEpisode = sessonWithEpisodes
      ? sessonWithEpisodes.episodes[0]
      : false;

    if (hasFirstEpisode) {
      router.push(`/watch/${title.id}`);
    }
  }

  return (
    <div
      className={styles.titleContainer}
      {...rest}
      ref={containerRef}
      tabIndex={0}
      onClick={handleWatch}
    >
      <header className={styles.titleHeader}>
        <p>{title.name}</p>
      </header>
      <div className={styles.titlePreviewWrapper} ref={playerWrapperRef}>
        <img src={banner} alt="Banner url" />

        <div
          className={`${styles.titleTrailer} ${
            hover && styles.titleTrailerHover
          }`}
        >
          <Player
            src={`http://localhost:3333/api/v1/titles/trailer/${title.id}/watch`}
            showHeader={false}
            showProgresse={false}
            show={hover}
            showControls={controls}
            saveProgress
            small
          />
        </div>
      </div>
      <div className={styles.titleContent}>
        {title.progress ? (
          <div className={styles.titleContentCurrentProgress}>
            <span>
              <h1>
                T{title.progress.episode.season.season_number}:E
                {title.progress.episode.episode_number}
              </h1>
              <p>"{title.progress.episode.name}"</p>
            </span>
            <div className={styles.titleContentCurrentProgressBarContainer}>
              <div className={styles.titleContentCurrentProgressBar}>
                <div style={{ width: `${title.progress.percentage}%` }} />
              </div>
              <p>
                {String(
                  Math.floor(
                    (title.progress.episode.duration -
                      title.progress.current_time) /
                      60
                  )
                ).padStart(2, '0') || '00'}
                :
                {String(
                  Math.floor(
                    title.progress.episode.duration -
                      title.progress.current_time -
                      Math.floor(
                        (title.progress.episode.duration -
                          title.progress.current_time) /
                          60
                      ) *
                        60
                  )
                ).padStart(2, '0') || '00'}
              </p>
            </div>
          </div>
        ) : (
          <div className={styles.titleContentCurrentProgress}>
            <span>
              <h1>
                T{title.seasons[0].season_number}:E
                {title.seasons[0].episodes[0]?.episode_number || 1}
              </h1>
              <p>"{title.seasons[0].episodes[0]?.name || 'Episódio 1'}"</p>
            </span>
            <div className={styles.titleContentCurrentProgressBarContainer}>
              <div className={styles.titleContentCurrentProgressBar}>
                <div style={{ width: `0%` }} />
              </div>
              <p>34:54</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
