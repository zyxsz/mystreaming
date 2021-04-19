import { GetServerSideProps } from 'next';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import Select from '../../components/Fields/Select';
import { FiX } from 'react-icons/fi';
import Container from '../../components/Container';
import Player from '../../components/Player';
import { useFetch } from '../../hooks/useFetch';
import api from '../../services/api';
import styles from '../../styles/pages/Titles.module.css';
import FieldSet from '../../components/Fields/FieldSet';
import Input from '../../components/Fields/Input';
import { useForm } from 'react-hook-form';
import FileInput from '../../components/Fields/FileInput';
import Cookie from 'js-cookie';
import createConnection from '../../services/ws';
import AnimatedNumber from 'react-animated-number';

let ws;
let isConnected = false;

export default function Titles({ titles }) {
  const [modal, setModal] = useState();
  const { data, mutate } = useFetch(`api/v1/titles`, titles);

  useEffect(() => {
    async function connect() {
      ws = await createConnection();

      ws.withJwtToken(Cookie.get()['token']).connect();

      const videos = ws.getSubscription(`videos`) || ws.subscribe(`videos`);

      videos.on('mutate', onVideoMutate);

      ws.on('open', () => {
        if (!isConnected) return (isConnected = true);
        ws.subscribe(`videos`);
      });

      ws.on('close', () => {
        isConnected = false;
      });

      videos.on('ready', () => {
        console.log('Subscribed');
      });
    }
    connect();

    return () => {
      if (!isConnected) return;
      ws.close();
    };
  }, []);

  function onVideoMutate() {
    mutate();
  }

  if (!data) return null;

  return (
    <>
      <Container
        title="Títulos"
        description="Veja abaixo todos os títulos disponiveis até o momento"
      >
        <div className={styles.titlesList}>
          {data.map((title, idx) => (
            <div
              key={idx}
              className={styles.titleContainer}
              onClick={() => setModal(title.id)}
            >
              <img src={title.banners[2]?.url || title.banner_url} />
            </div>
          ))}
        </div>
      </Container>
      <Modal modal={modal} titles={data} setModal={setModal} />
    </>
  );
}

function Modal({ modal, setModal, titles }) {
  const router = useRouter();
  const [title, setTitle] = useState(null);
  const [controls, setControls] = useState(true);
  const barRef = useRef(null);
  const [lastWidth, setLastWidth] = useState(0);
  const [width, setWidth] = useState(0);
  const [selected, setSelected] = useState(1);
  const [season, setSeason] = useState(null);
  const [processingVideos, setProcessingVideos] = useState(null);

  useEffect(() => {
    if (!title) return;
    const episodes = title.seasons.map((season) =>
      season?.episodes.filter((ep) => ep.status != 'avaliable')
    );
    let finalEpisodes = [];

    for (var i = 0; i < episodes.length; i++) {
      finalEpisodes = finalEpisodes.concat(episodes[i]);
    }

    setProcessingVideos(finalEpisodes);
  }, [title]);

  useEffect(() => {
    const title = titles.find((title) => title.id === modal);
    if (!title) return;
    setTitle(title);
    const sessonWithEpisodes = title.seasons.find(
      (season) => season.episodes.length > 0
    );
    setSeason(sessonWithEpisodes);
  }, [modal, titles]);

  useEffect(() => {
    const selectedDiv = document.getElementById(`tab-${selected}`);
    if (!selectedDiv) return;
    if (selected !== 1) {
      const lastDiv = document.getElementById(`tab-${selected - 1}`);
      if (lastDiv.offsetWidth !== width) {
        setLastWidth(lastDiv.offsetWidth);
      }
      if (selected > 2) {
        let width = 0;
        for (let i = 1; i < selected; i++) {
          const lastDiv = document.getElementById(`tab-${i}`);
          width += lastDiv.offsetWidth;
        }
        setLastWidth(width);
      }
    } else {
      setLastWidth(0);
    }
    setWidth(selectedDiv.offsetWidth);
  }, [barRef, selected, setLastWidth, setWidth, width, title]);

  function handleSelected(id) {
    if (!barRef) return console.log('barRef not found');
    setSelected(id);
  }

  function handleSelectEpisode(id) {
    router.push(`/watch/${title.id}?videoId=${id}`);
  }

  if (!modal || !title) return null;

  return (
    <div className={styles.modalContainer}>
      <div className={styles.modalContent}>
        <button className={styles.closeButton} onClick={() => setModal()}>
          <FiX />
        </button>
        <header>
          <div>
            <span>
              <h1>{title.name}</h1>
              <p>{title.description}</p>
            </span>
          </div>
          <span>
            <Player
              src={`http://localhost:3333/api/v1/titles/trailer/${title.id}/watch`}
              showHeader={false}
              showProgresse={false}
              show={true}
              showControls={controls}
              saveProgress
              controlsClassName={styles.controls}
              playerContainerClassName={styles.playerContainer}
              small
              hiddeControls={false}
              autoPlay={false}
            />
          </span>
        </header>
        <div className={styles.modalTabs}>
          <button id="tab-1" onClick={() => handleSelected(1)}>
            <p>Episódios</p>
          </button>
          <button id="tab-2" onClick={() => handleSelected(2)}>
            <p>Temporadas</p>
          </button>
          <button id="tab-3" onClick={() => handleSelected(3)}>
            <p>Informações</p>
          </button>
          <span
            ref={barRef}
            style={{
              width: `${width}px`,
              transform: `translateX(${lastWidth || 0}px)`,
            }}
          />
        </div>
        {selected === 1 && processingVideos && processingVideos.length > 0 && (
          <div
            className={`${styles.modalTabContent} ${styles.episodesContainer}`}
          >
            <header>
              <h1>Episódio(s) em processamento</h1>
            </header>
            <div className={styles.episodeList}>
              {processingVideos
                .sort((a, b) => a.episode_number - b.episode_number)
                .map((episode) => (
                  <div
                    className={styles.episodeContainer}
                    onClick={() => handleSelectEpisode(episode.id)}
                  >
                    <figure>
                      <Image
                        src={`http://localhost:3333/api/v1/thumbnails/${episode.id}`}
                        width={186}
                        height={100}
                        alt="Thumbnail"
                      />
                      {episode.progress && (
                        <div className={styles.episodeProgress}>
                          <div
                            style={{
                              width: `${episode.progress.percentage}%`,
                            }}
                          />
                        </div>
                      )}
                      <div className={styles.episodePlay}>
                        <svg viewBox="0 0 28 28">
                          <polygon points="8 22 8 6 22.0043763 14" />
                        </svg>
                      </div>
                    </figure>
                    <div className={styles.episodeInfos}>
                      <h3>{episode.name}</h3>
                      <h4>
                        Duração:{' '}
                        {String(Math.floor(episode.duration / 60)).padStart(
                          2,
                          '0'
                        ) || '00'}
                        :
                        {String(
                          Math.floor(
                            episode.duration -
                              Math.floor(episode.duration / 60) * 60
                          )
                        ).padStart(2, '0') || '00'}
                      </h4>
                    </div>
                    <div className={styles.episodeProcessing}>
                      <span>
                        <p>Status:</p>
                        <p>{getStatus(episode.status)}</p>
                      </span>
                      <span className={styles.episodeProcessingRow}>
                        <p>Progresso:</p>

                        <p>{episode.work_progress}%</p>
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
        {selected === 1 &&
          title.seasons &&
          title.seasons
            .sort((a, b) => a.season_number - b.season_number)
            .filter((season) => season.episodes.length > 0)
            .map((season) => (
              <div
                className={`${styles.modalTabContent} ${styles.episodesContainer}`}
              >
                <header>
                  <h1>{season.name}</h1>
                </header>
                <div className={styles.episodeList}>
                  {season.episodes
                    .sort((a, b) => a.episode_number - b.episode_number)
                    .map((episode) => (
                      <div
                        className={styles.episodeContainer}
                        onClick={() => handleSelectEpisode(episode.id)}
                      >
                        <figure>
                          <Image
                            src={`http://localhost:3333/api/v1/thumbnails/${episode.id}`}
                            width={186}
                            height={100}
                            alt="Thumbnail"
                          />
                          {episode.progress && (
                            <div className={styles.episodeProgress}>
                              <div
                                style={{
                                  width: `${episode.progress.percentage}%`,
                                }}
                              />
                            </div>
                          )}
                          <div className={styles.episodePlay}>
                            <svg viewBox="0 0 28 28">
                              <polygon points="8 22 8 6 22.0043763 14" />
                            </svg>
                          </div>
                        </figure>
                        <div className={styles.episodeInfos}>
                          <h3>{episode.name}</h3>
                          <h4>
                            Duração:{' '}
                            {String(Math.floor(episode.duration / 60)).padStart(
                              2,
                              '0'
                            ) || '00'}
                            :
                            {String(
                              Math.floor(
                                episode.duration -
                                  Math.floor(episode.duration / 60) * 60
                              )
                            ).padStart(2, '0') || '00'}
                          </h4>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
        {selected === 3 && <AddVideo titles={titles} title={title} />}
      </div>
    </div>
  );
}

function AddVideo({ titles, title }) {
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [video, setVideo] = useState(null);
  const [page, setPage] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { register, handleSubmit, setValue } = useForm();

  function handleSelectSeason(value) {
    if (!value[0]) return setSelectedSeason(null);
    const season = title.seasons.find((season) => season.id === value[0].id);
    setSelectedSeason(season);
    setValue(
      'episode_number',
      season.episodes.sort((a, b) => a.episode_number - b.episode_number)[
        season.episodes.length - 1
      ]?.episode_number + 1 || 1
    );
  }

  function onSubmit(data) {
    if (!video) return;
    const formData = new FormData();
    formData.append('season_id', selectedSeason.id);
    formData.append('video', video);
    formData.append('episode_number', data.episode_number);

    setUploadProgress(0);
    setPage('progress');
    api
      .post(`api/v1/videos`, formData, {
        onUploadProgress: (event) => {
          const progress: number = Math.round(
            (event.loaded * 100) / event.total
          );

          setUploadProgress(progress);
        },
        headers: { Authorization: `Bearer ${Cookie.get()['token']}` },
      })
      .then(() => {
        setTimeout(() => {
          setPage('success');
          setTimeout(() => {
            setPage(null);
          }, 500);
        }, 200);
      })
      .catch(() => {
        setTimeout(() => {
          setPage('error');
          setTimeout(() => {
            setPage(null);
          }, 500);
        }, 200);
      });
  }

  return (
    <>
      <form className={styles.addVideoForm} onSubmit={handleSubmit(onSubmit)}>
        <h1>Adicionar episódio</h1>
        {title && (
          <Select
            options={title.seasons
              .sort((a, b) => a.season_number - b.season_number)
              .map((season) => ({
                id: season.id,
                label: season.name,
              }))}
            onChange={handleSelectSeason}
            placeholder="Selecione uma Temporada"
            noDataLabel="Nenhuma temporada encontrada"
          />
        )}
        {title && selectedSeason && (
          <>
            <FieldSet>
              <Input
                name="episode_number"
                placeholder="Digite o número do episódio"
                type="number"
                inputRef={register}
                defaultValue={
                  selectedSeason.episodes.sort(
                    (a, b) => a.episode_number - b.episode_number
                  )[selectedSeason.episodes.length - 1]?.episode_number + 1 || 1
                }
              />
              <FileInput file={video} handleChange={(file) => setVideo(file)}>
                Selecionar Video
              </FileInput>
            </FieldSet>
            <button className={styles.formButton}>
              <p>Adicionar episódio</p>
            </button>
          </>
        )}
      </form>
      {page === 'progress' && (
        <div className={styles.addModalContainer}>
          <div className={styles.progressContainer}>
            <div style={{ width: `${uploadProgress}%` }} />
          </div>
          <h1>Enviando arquivo...</h1>
          <p>{uploadProgress}%</p>
        </div>
      )}
      {page === 'error' && (
        <div className={styles.addModalContainer}>
          <h1>Ops!</h1>
          <p>Ocorreu um erro ao tentar enviar o episódio!</p>
        </div>
      )}
      {page === 'success' && (
        <div className={styles.addModalContainer}>
          <h1>Ebaa!</h1>
          <p>O episódio foi enviado com sucesso!</p>
        </div>
      )}
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { token } = ctx.req.cookies;

  const titles = token
    ? await api
        .get('api/v1/titles', {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => res.data)
        .catch(() => [])
    : [];

  return {
    props: {
      titles,
    },
  };
};

function getStatus(status) {
  if (status === 'avaliable') return 'Disponível';
  if (status === 'inqueue') return 'Na fila';
  if (status === 'previews_rendering') return 'Gerando imagens';
  if (status === 'error_previews_rendering')
    return 'Erro ao tentar renderizar as visalizações';
  if (status === 'awaiting_video_render')
    return 'Aguardando renderização do video';
  if (status === 'video_rendering') return 'Renderizando';
  if (status === 'error_video_rendering')
    return 'Erro ao tentar renderizar o video';
  return 'Não encontrado';
}

function getStatusColor(status) {
  if (status === 'avaliable') return '#2ecc71';
  if (status === 'inqueue') return '#f1c40f';
  if (status === 'previews_rendering') return '#f1c40f';
  if (status === 'error_previews_rendering') return '#ff0f05';
  if (status === 'awaiting_video_render') return '#f1c40f';
  if (status === 'video_rendering') return '#f1c40f';
  if (status === 'error_video_rendering') return '#ff0f05';
  return '#ff0f05';
}
