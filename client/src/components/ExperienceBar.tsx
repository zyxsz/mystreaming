import styles from '../styles/components/ExperienceBar.module.css';

export default function ExperienceBar({}) {
  return (
    <div className={styles.experienceBarContainer}>
      <p>0 xp</p>
      <div className={styles.experienceBar}>
        <div className={styles.experienceBarProgress}>
          <div style={{ width: '50%' }} />
          <span style={{ left: '50%' }}>150 xp</span>
        </div>
      </div>
      <p>300 xp</p>
    </div>
  );
}
