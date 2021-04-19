import { useEffect } from 'react';
import createConnection from '../services/ws';
import Cookie from 'js-cookie';
import { useFetch } from '../hooks/useFetch';
import Container from '../components/Container';
import Table from '../components/Table';

import { MdLens } from 'react-icons/md';

let ws;
let isConnected = false;

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

export default function Videos({}) {
  const { data, mutate } = useFetch(`api/v1/videos`);

  useEffect(() => {
    async function connect() {
      ws = await createConnection();

      ws.withJwtToken(Cookie.get()['token']).connect();

      const videos = ws.getSubscription(`videos`) || ws.subscribe(`videos`);

      videos.on('mutate', onVideoMutate);

      ws.on('open', () => {
        isConnected = true;
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

  return (
    <Container back="/dashboard" backMessage="Voltar para o Painel de controle">
      {data && data.length > 0 && (
        <Table
          columns={[
            'Título',
            'Temporada',
            'Episódio',
            'Status',
            'Progresso',
            'Duração',
          ]}
          data={data.map((video) => [
            { value: video.season.title.name, type: 'text' },
            { value: `Temporada ${video.season.season_number}`, type: 'text' },
            { value: video.name, type: 'text' },
            {
              value: getStatus(video.status),
              Icon: MdLens,
              iconColor: getStatusColor(video.status),
              type: 'text',
              flex: true,
            },
            { value: video.progress, type: 'animatedNumber' },
            {
              value: `${String(Math.floor(video.duration / 60)).padStart(
                2,
                '0'
              )}:${String(
                Math.floor(
                  video.duration - Math.floor(video.duration / 60) * 60
                )
              ).padStart(2, '0')}`,
              type: 'text',
            },
          ])}
        />
      )}
    </Container>
  );
}

//            { value: 'Editar', type: 'button' },
