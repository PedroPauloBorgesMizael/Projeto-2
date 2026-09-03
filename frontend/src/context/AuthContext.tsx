/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState } from 'react';
import type { User } from '../interface/auth';

interface AuthContextType {
  user: User | null;
  token: string | null;
  signIn: (token: string, user: User, refreshToken?: string) => void;
  signOut: () => void;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('token');
  });

  const signIn = (newToken: string, newUser: User, refreshToken?: string) => {
    localStorage.setItem('token', newToken);
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const signOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
