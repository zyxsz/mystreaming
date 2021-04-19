import Image from 'next/image';

import styles from '../styles/components/ServerList.module.css';

interface Server {
  id: string;
  name: string;
  icon: string;
  icon_url: string;
  owner: boolean;
  permissions: [];
}

interface Props {
  servers: Server[];
}

export default function ServerList({ servers }: Props) {
  return (
    <div className={styles.serverListContainer}>
      {servers
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((server) => (
          <a
            key={server.id}
            className={styles.serverCard}
            href={`https://discord.com/channels/${server.id}`}
            target="_blank"
          >
            {server.icon ? (
              <Image
                className={styles.serverCardIcon}
                src={server.icon_url}
                alt="Server icon"
                width={80}
                height={80}
              />
            ) : (
              <figure>{getFirstCharOfString(server.name)}</figure>
            )}
            <span>
              <p>{server.name}</p>
              {/* {server.owner ? (
              <p>
                Cargo: <strong>Dono</strong>
              </p>
            ) : server.permissions['ADMINISTRATOR'] ? (
              <p>
                Cargo: <strong>Administrador</strong>
              </p>
            ) : (
              <p>
                Cargo: <strong>Membro</strong>
              </p>
            )} */}
            </span>
          </a>
        ))}
    </div>
  );
}

function getFirstCharOfString(text: string) {
  return text
    .split(' ')
    .map((text) => text.substring(0, 1).toUpperCase())
    .reduce((a, b) => a + b);
}
