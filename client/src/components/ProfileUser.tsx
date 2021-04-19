import useAuth from '../contexts/AuthContext';
import styles from '../styles/components/ProfileUser.module.css';

export default function ProfileUser({}) {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className={styles.profileUserContainer}>
      <figure className={styles.profileUserAvatar}>
        <img src={user.avatar_url} alt="User image" />
      </figure>
      <h2>{user.username}</h2>
      <h3>#{user.discriminator}</h3>
    </div>
  );
}
