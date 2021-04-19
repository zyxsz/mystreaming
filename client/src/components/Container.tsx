import Head from 'next/head';
import { FiArrowLeft } from 'react-icons/fi';
import styles from '../styles/components/Container.module.css';
import Link from 'next/link';

interface Props {
  title?: string;
  description?: string;
  children: any;
  back?: string;
  backMessage?: string;
}

export default function Container({
  title,
  description,
  children,
  back,
  backMessage,
}: Props) {
  return (
    <>
      <Head>{title && <title>{title} | MyBots</title>}</Head>
      <div className={styles.container}>
        <div>
          <header>
            {back && backMessage && (
              <Link href={back}>
                <a className={styles.containerBackButton}>
                  <FiArrowLeft />
                  <p>{backMessage}</p>
                </a>
              </Link>
            )}
            {title && <h1>{title}</h1>}
            {description && <p>{description}</p>}
          </header>
        </div>
        {children}
      </div>
    </>
  );
}
