import Link from 'next/link';
import useAuth from '../contexts/AuthContext';
import styles from '../styles/components/Navbar.module.css';
import User from './User';

export default function Navbar({}) {
  const { user } = useAuth();

  return user ? (
    <nav className={styles.navbarContainer}>
      <div className={styles.navbarContentWrapper}>
        <Link href="/">
          <a className={styles.navbarLogo}>
            <img src="logo.svg" alt="Logo" />
          </a>
        </Link>
        <User user={user} reverse />
      </div>
    </nav>
  ) : null;
}
