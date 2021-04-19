import styles from '../styles/components/ProgressBar.module.css';
import Slider from 'react-rangeslider';
import { throttle } from 'lodash';
import { useEffect, useRef, useState } from 'react';

export default function ProgressBar({
  max,
  min,
  value,
  onChange,
  minutes,
  seconds,
  buffer,
  episode_id = null,
  small = false,
}) {
  const [previewTime, setPreviewTime] = useState('00:00');
  const [previewImage, setPreviewImage] = useState({
    episode_id: episode_id,
    src: '',
  });
  const barRef = useRef(null);
  const previewRef = useRef(null);

  useEffect(() => {
    setPreviewImage((old) => ({ ...old, episode_id }));
  }, [episode_id]);

  useEffect(() => {
    if (!episode_id) return;
    if (!barRef.current) return;
    function onMouseMove(e) {
      if (!previewRef.current) return;
      const { left, right, width } = barRef.current.getBoundingClientRect();

      const mouseRight = Math.abs(left - e.clientX);
      const mouseLeft = Math.abs(right - e.clientX);

      const center = width / 2;

      // Time
      const percentage = (mouseRight / width) * 100;
      const time = (percentage / 100) * max;

      const minutes = Math.floor(time / 60);
      const seconds = Math.floor(time - minutes * 60);

      const minutesText = String(minutes).padStart(2, '0') || '00';
      const secondsText = String(seconds).padStart(2, '0') || '00';

      const timeText = `${minutesText}:${secondsText}`;

      setPreviewTime(timeText);

      // Get image

      const thumbnailNumber = (Math.ceil((time + 1) / 10) * 10) / 10;

      setPreviewImage((old) => ({
        episode_id: old.episode_id,
        src: `http://localhost:3333/api/v1/preview/${thumbnailNumber}/${old.episode_id}`,
      }));

      // Position

      if (mouseRight <= center) {
        if (mouseRight <= 106.5) {
          previewRef.current.style.right = 'auto';
          previewRef.current.style.left = `106.5px`;
          previewRef.current.style.transform = `translateX(-50%)`;
          return;
        }
        previewRef.current.style.right = 'auto';
        previewRef.current.style.left = `${mouseRight}px`;
        previewRef.current.style.transform = `translateX(-50%)`;
      } else if (mouseLeft <= center) {
        if (mouseLeft <= 106.5) {
          previewRef.current.style.left = 'auto';
          previewRef.current.style.right = `-106.5px`;
          previewRef.current.style.transform = `translateX(-50%)`;
          return;
        }
        previewRef.current.style.left = 'auto';
        previewRef.current.style.right = `${mouseLeft}px`;
        previewRef.current.style.transform = `translateX(50%)`;
      }
    }
    barRef.current.addEventListener('mousemove', onMouseMove);
    return () => {
      if (!barRef || !barRef.current) return;
      barRef.current.removeEventListener('mousemove', onMouseMove);
    };
  }, [max]);

  return (
    <div
      className={`${styles.progressContainer} ${
        small && styles.progressContainerSmall
      }`}
    >
      <div className={styles.progress} ref={barRef}>
        <div className={styles.progressPreview} ref={previewRef}>
          <figure>
            <img src={previewImage.src} />
          </figure>
          <div>
            <p>{previewTime}</p>
          </div>
        </div>
        <div
          className={styles.progressBuffer}
          style={{ width: `${buffer}%` }}
        />
        <Slider
          min={Number(min)}
          max={Number(max)}
          value={value}
          onChange={throttle(onChange, 100)}
          className={`progressBar ${small && 'small'}`}
          step={0.1}
        />
      </div>
      <p>
        {String(minutes).padStart(2, '0') || '00'}:
        {String(seconds).padStart(2, '0') || '00'}
      </p>
    </div>
  );
}
