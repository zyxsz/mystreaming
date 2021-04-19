import styles from '../styles/components/User.module.css';

export default function User({ user, reverse = false }) {
  return (
    <div
      className={`${styles.userContainer} ${
        reverse && styles.userContainerReverse
      }`}
    >
      <figure className={styles.userAvatar}>
        <img src={user.avatar_url} alt="User avatar" />
      </figure>
      <span className={styles.userNames}>
        <p>{user.username}</p>
        <p>#{user.discriminator}</p>
      </span>
    </div>
  );
}
