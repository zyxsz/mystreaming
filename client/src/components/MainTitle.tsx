import { FiCheck, FiPlay } from 'react-icons/fi';
import styles from '../styles/components/MainTitle.module.css';

import moment from 'moment';
import { useRouter } from 'next/router';

export default function MainTitle({ title }) {
  const router = useRouter();

  function handleWatch() {
    if (title?.seasons[0]?.episodes[0]) {
      router.push(`/watch/${title.id}`);
    }
  }
  return (
    <div className={styles.mainTitleContainer}>
      <img
        src={
          title.banners[Math.floor(Math.random() * title.banners.length)]
            ?.url || title.banner_url
        }
        alt="Banner"
      />
      <div className={styles.mainTitleContent}>
        <h1>{title.name}</h1>
        <span>
          {title.genres.map((genre, idx) => (
            <p key={idx}>{genre}</p>
          ))}
          <p>{moment(title.first_air_date).format('YYYY')}</p>
        </span>

        {title.progress && (
          <div className={styles.mainTitleCurrentProgress}>
            <span>
              <h1>
                T{title.progress.episode.season.season_number}:E
                {title.progress.episode.episode_number}
              </h1>
              <p>"{title.progress.episode.name}"</p>
            </span>
            <div className={styles.mainTitleCurrentProgressBarContainer}>
              <div className={styles.mainTitleCurrentProgressBar}>
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
        )}

        <p>{title.description}</p>
        <div className={styles.mainTitleButtons}>
          <button onClick={handleWatch}>
            <FiPlay />
            <p>Assistir</p>
          </button>
          <button>
            <FiCheck />
            <p>Minha lista</p>
          </button>
        </div>
      </div>
    </div>
  );
}
