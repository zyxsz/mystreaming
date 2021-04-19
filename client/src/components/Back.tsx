import styles from '../styles/components/Back.module.css';

import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';

export default function Back({ children }) {
  return (
    <Link href="/">
      <a className={styles.backButton}>
        <FiArrowLeft />
        <p>{children}</p>
      </a>
    </Link>
  );
}
