import Link from 'next/link';
import MainTitle from '../components/MainTitle';
import TitlesRow from '../components/TitlesRow';
import { useFetch } from '../hooks/useFetch';
import styles from '../styles/pages/Home.module.css';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import api from '../services/api';
import { useState } from 'react';

export default function Home({ home }) {
  const [data, setData] = useState(home);

  if (!data) return null;

  return (
    <div className={styles.container}>
      <Head>
        <title>Início | MyStreaming</title>
      </Head>
      {data.main && <MainTitle title={data.main} />}
      <div className={styles.content}>
        {data.rows &&
          data.rows.length > 0 &&
          data.rows
            .filter((row) => row)
            .map((row, idx) => (
              <TitlesRow titles={row.titles} title={row.title} key={idx} />
            ))}
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { token } = ctx.req.cookies;

  const home = token
    ? await api
        .get('api/v1/home', {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => res.data)
        .catch(() => [])
    : [];

  return {
    props: {
      home,
    },
  };
};
