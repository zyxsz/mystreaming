import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  FiLogOut,
  FiPieChart,
  FiServer,
  FiUserCheck,
  FiHome,
} from 'react-icons/fi';
import useAuth from '../contexts/AuthContext';
import styles from '../styles/components/NavLinks.module.css';

export default function NavLinks() {
  const { user, logout } = useAuth();
  const router = useRouter();

  return user ? (
    <div className={styles.navLinksContainer}>
      <div className={styles.navLinksContentWrapper}>
        <ul>
          <Link href="/">
            <a
              className={
                router.pathname === '/' ? styles.navLinksLinkActive : undefined
              }
            >
              <FiHome />
              <p>Início</p>
            </a>
          </Link>
          <Link href="/servers">
            <a
              className={
                router.pathname === '/servers'
                  ? styles.navLinksLinkActive
                  : undefined
              }
            >
              <FiServer />
              <p>Meus servidores</p>
            </a>
          </Link>
          <Link href="/chars">
            <a
              className={
                router.pathname === '/chars'
                  ? styles.navLinksLinkActive
                  : undefined
              }
            >
              <FiPieChart />
              <p>Estatísticas</p>
            </a>
          </Link>
        </ul>
        <ul>
          <Link href="/dashboard">
            <a
              className={
                router.pathname === '/dashboard'
                  ? styles.navLinksLinkActive
                  : undefined
              }
            >
              <FiUserCheck />
              <p>Minha conta</p>
            </a>
          </Link>
          <button
            className={`${
              router.pathname === '/logout'
                ? styles.navLinksLinkActive
                : undefined
            } ${styles.navLinksLinkLogout}`}
            onClick={logout}
          >
            <p>Sair</p>
            <FiLogOut />
          </button>
        </ul>
      </div>
    </div>
  ) : null;
}
