import { createContext, useContext, useState } from 'react';

import Cookie from 'js-cookie';

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

interface AuthContext {
  user: User;
  signIn: (user: User) => void;
  setUser: (user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

export const AuthContext = createContext({} as AuthContext);
const useAuth = () => useContext(AuthContext);

export const AuthContextProvider = ({
  children,
  user: defaultUser = undefined,
}) => {
  const [user, setUser] = useState<User>(defaultUser);

  function signIn(user) {
    setUser(user);
    Cookie.set('token', user.token.token);
  }

  function logout() {
    Cookie.remove('token');
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!user,
        user,
        signIn,
        setUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default useAuth;
