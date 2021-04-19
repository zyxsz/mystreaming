import { useEffect, useState } from 'react';
import { GetServerSideProps } from 'next';
import api from '../../services/api';
import Cookie from 'js-cookie';
import Head from 'next/head';
import Player from '../../components/Player';
import { useRouter } from 'next/router';

export default function Watch({ watch }) {
  const [data, setData] = useState(watch);
  const router = useRouter();

  function handleChangeVideo(video_id) {
    api
      .get(`api/v1/videos/${video_id}`, {
        headers: {
          Authorization: `Bearer ${Cookie.get()['token']}`,
        },
      })
      .then((res) => {
        const { data } = res;
        setData((old) => ({
          ...old,
          current_episode: data.video,
          current_progress: data.progress,
        }));
      });
  }

  useEffect(() => {
    if (!data) return;
    function check() {
      const { videoId } = router.query;
      if (!videoId) return;
      if (videoId && data.current_episode.id == videoId)
        return router.replace(`/watch/${data.title.id}`);
      if (data.current_episode.id == videoId) return;
      -handleChangeVideo(videoId);
      router.replace(`/watch/${data.title.id}`);
    }
    check();
  }, [router, data]);

  function handleNextEpisode() {
    const currentSeason = data.title.seasons
      .sort((a, b) => a.season_number - b.season_number)
      .find((season) => season.id === data.current_episode.season_id);
    const nextSeason = data.title.seasons
      .sort((a, b) => a.season_number - b.season_number)
      .find(
        (season) => season.season_number === currentSeason.season_number + 1
      );
    const nextEpisode =
      data.current_episode.episode_number >= currentSeason.episodes.length
        ? nextSeason.episodes[0]
        : currentSeason.episodes.find(
            (ep) =>
              ep.episode_number === data.current_episode.episode_number + 1
          );

    if (!nextEpisode) return;
    handleChangeVideo(nextEpisode.id);
  }

  if (!data) return null;

  return (
    <div>
      <Head>
        <title>{data?.title?.name} | MyStreaming</title>
      </Head>
      <Player
        episode={data.current_episode}
        progress={data.current_progress}
        title={data.title}
        handleChangeVideo={handleChangeVideo}
        handleNextEpisode={handleNextEpisode}
        src={`http://localhost:3333/api/v1/videos/${data.current_episode.id}/watch`}
      />
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { token } = ctx.req.cookies;
  const { titleId } = ctx.query;

  const watch = await api
    .get(`api/v1/titles/${titleId}/watch`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((res) => res.data)
    .catch(() => false);

  return {
    props: {
      watch,
    },
  };
};
