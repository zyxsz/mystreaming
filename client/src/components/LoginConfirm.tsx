import styles from '../styles/components/LoginConfirm.module.css';

import { FiCalendar, FiAward } from 'react-icons/fi';

interface LoginConfirmProps {
  user: {
    id: string;
    username: string;
    discriminator: string;
    avatar_url: string;
  };
  onConfirm: () => any;
}

export default function LoginConfirm({ user, onConfirm }: LoginConfirmProps) {
  return (
    <div className={styles.confirmContainer}>
      <header>
        <div className={styles.confirmUser}>
          <img src={user.avatar_url} alt="User Avatar" />
          <span>
            <p>{user.username}</p>
            <p>#{user.discriminator}</p>
          </span>
        </div>
        <div className={styles.userSpecs}>
          <span className={styles.userSpec}>
            <p>
              <FiAward />
              Cargo:
            </p>
            <strong>Administrador</strong>
          </span>
          <span className={styles.userSpec}>
            <p>
              <FiCalendar />
              Conta criada há:
            </p>
            <strong>2 dias</strong>
          </span>
        </div>
      </header>
      <p className={styles.policyText}>
        Ao clicar em <strong>Entrar</strong> você concorda com os nossos{' '}
        <a href="/terms">Termos de serviço</a> e{' '}
        <a href="/policy">Politicas de uso</a>.
      </p>
      <div className={styles.buttonList}>
        <button>
          <p>Cancelar</p>
        </button>
        <button onClick={onConfirm}>
          <p>Entrar</p>
        </button>
      </div>
    </div>
  );
}
