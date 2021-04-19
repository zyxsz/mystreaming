import App from 'next/app';
import Navbar from '../components/Navbar';
import { AuthContextProvider } from '../contexts/AuthContext';
import '../styles/global.css';
import dynamic from 'next/dynamic';

import 'nprogress/nprogress.css';

import NavLinks from '../components/NavLinks';
import api from '../services/api';
import 'react-rangeslider/lib/index.css';

const TopProgressBar = dynamic(
  () => {
    return import('../components/TopProgressBar');
  },
  { ssr: false }
);

function MyApp({ Component, pageProps, user }) {
  return (
    <>
      <TopProgressBar />
      <AuthContextProvider user={user}>
        {/* <Navbar /> */}
        {/* <NavLinks /> */}
        <Component {...pageProps} />
      </AuthContextProvider>
    </>
  );
}

MyApp.getInitialProps = async (appContext) => {
  const token = appContext.ctx.req
    ? appContext.ctx.req.cookies.token || ''
    : undefined;

  const appProps = await App.getInitialProps(appContext);

  let user;

  if (appContext.ctx.res) {
    user = token
      ? await api
          .get('api/v1/auth/@me', {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then((res) => res.data)
          .catch(() => false)
      : undefined;

    if (appContext.router.pathname.startsWith('/login') && user) {
      appContext.ctx.res?.writeHead(302, {
        Location: '/dashboard',
      });
      appContext.ctx.res?.end();
      return {};
    }
    if (!appContext.router.pathname.startsWith('/login') && !user) {
      appContext.ctx.res?.writeHead(302, {
        Location: '/login',
      });
      appContext.ctx.res?.end();
      return {};
    }
  } else if (token) {
  }

  return { ...appProps, user };
};

export default MyApp;
