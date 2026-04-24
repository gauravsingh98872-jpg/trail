import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [adminName, setAdminName] = useState(localStorage.getItem('adminName'));

  const login = (tok, name) => {
    localStorage.setItem('token', tok);
    localStorage.setItem('adminName', name);
    setToken(tok);
    setAdminName(name);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('adminName');
    setToken(null);
    setAdminName(null);
  };

  return (
    <AuthContext.Provider value={{ token, adminName, login, logout, isLoggedIn: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
