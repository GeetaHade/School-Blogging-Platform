// src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';

import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext); // ✅ Exported

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:5001/login', {
        email,
        password,
      });

      const { token, username, role } = response.data;

      const userData = { username, role };
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error('Login failed', error);
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
