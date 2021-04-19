import Title from './Title';

import styles from '../styles/components/TitlesRow.module.css';

export default function TitlesRow({ titles, title }) {
  return (
    <div className={styles.titlesRowContainer}>
      {title && <h1>{title}</h1>}
      <div className={styles.titlesRowSlider}>
        {titles.map((title, key) => (
          <Title
            title={title}
            key={key}
            style={
              (titles.length === 1 && { transformOrigin: 'top left' }) ||
              (key === 0 && { transformOrigin: 'top left' }) ||
              (key + 1 >= titles.length && {
                transformOrigin: 'top right',
              }) ||
              {}
            }
          />
        ))}
      </div>
    </div>
  );
}
