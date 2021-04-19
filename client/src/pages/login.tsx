import { useContext, useEffect, useState } from 'react';
import Back from '../components/Back';
import FloatButton from '../components/FloatButton';
import LoginButton from '../components/LoginButton';
import styles from '../styles/pages/Login.module.css';

import { useRouter } from 'next/router';

import { SiDiscord } from 'react-icons/si';

import api from '../services/api';
import LoginConfirm from '../components/LoginConfirm';
import { AuthContext } from '../contexts/AuthContext';

interface Server {
  id: string;
  name: string;
  icon: string;
  owner: boolean;
  permissions: [];
}

interface User {
  id: string;
  discord_id: string;
  username: string;
  discriminator: string;
  email: string;
  avatar?: string;
  avatar_url: string;
  updated_at: string;
  created_at: string;
  token?: {
    token: string;
  };
  servers: Server[];
}

function Login() {
  const { signIn } = useContext(AuthContext);
  const router = useRouter();
  const [screen, setScreen] = useState('initial');
  const [user, setUser] = useState<User>();

  const screens = {
    initial: (
      <LoginButton href="http://localhost:3333/api/v1/auth/redirect">
        <p>Entrar com o Discord</p>
      </LoginButton>
    ),
    loading: (
      <FloatButton>
        <SiDiscord />
        <h1>Carregando informações...</h1>
      </FloatButton>
    ),
    confirm: user && (
      <LoginConfirm
        user={user}
        onConfirm={() => {
          signIn(user);
          router.replace('/dashboard');
        }}
      />
    ),
    error: <></>,
  };

  useEffect(() => {
    if (screen !== 'initial') return;
    const { code } = router.query;
    if (!code) return;
    setScreen('loading');
    api
      .post(`api/v1/auth/callback`, { code: code })
      .then((res) => {
        setScreen('confirm');
        setUser({ ...res.data.user, token: res.data.token });
      })
      .catch(() => {
        setScreen('error');
      });
  }, [router, screen]);

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginContentWrapper}>{screens[screen]}</div>
      {/* {screen !== 'loading' && <Back>Voltar para a página inicial</Back>} */}
    </div>
  );
}

export default Login;
