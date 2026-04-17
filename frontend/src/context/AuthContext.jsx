import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userInfoString = localStorage.getItem('userInfo');
    if (userInfoString) {
      try {
        const parsed = JSON.parse(userInfoString);
        if (parsed?.token) {
          // Decode JWT payload to check expiration
          const payload = JSON.parse(atob(parsed.token.split('.')[1]));
          if (payload.exp * 1000 > Date.now()) {
            setUser(parsed);
          } else {
            // Token is expired
            localStorage.removeItem('userInfo');
            setUser(null);
          }
        }
      } catch (error) {
        // Token is invalid/malformed
        localStorage.removeItem('userInfo');
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await axios.post('/api/auth/login', { email, password });
    localStorage.setItem('userInfo', JSON.stringify(data));
    setUser(data);
    return data;
  };

  const signup = async (name, email, password) => {
    const { data } = await axios.post('/api/auth/signup', { name, email, password });
    localStorage.setItem('userInfo', JSON.stringify(data));
    setUser(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('userInfo');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
