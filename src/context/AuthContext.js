import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  useEffect(() => {
    const storedUser = localStorage.getItem('authUser');
    if (storedUser) {
      console.log('User loaded from localStorage:', storedUser); // Debugging statement
      setUser(JSON.parse(storedUser));
    }
  }, []);
  
  const login = (username, role) => {
    const user = { username, role };
    setUser(user);
    localStorage.setItem('authUser', JSON.stringify(user));
    console.log('User logged in:', user); // Debugging statement
  };
  

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
