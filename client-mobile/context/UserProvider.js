import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import React, { createContext, useContext, useEffect, useState } from 'react';

const UserContext = createContext();
export const useUserContext = () => useContext(UserContext);

const UserProvider = ({ children }) => {
  const [isLogged, setIsLogged] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const storedIsLogged = await AsyncStorage.getItem('isLogged');
        const storedUser = await AsyncStorage.getItem('user');

        if (storedIsLogged === 'true' && storedUser) {
          setIsLogged(true);
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await axios.post('http://192.168.137.1:3000/login', { email, password });

      if (response.status === 200) {
        const { token } = response.data;
        setToken(token);
        const userData = jwtDecode(token);
        setIsLogged(true);
        setUser(userData);
        await AsyncStorage.setItem('isLogged', 'true');
        await AsyncStorage.setItem('token', token);
        await AsyncStorage.setItem('user', JSON.stringify(userData));
      } else {
        throw new Error('Login failed');
      }
    } catch (error) {
      console.error('Login failed:', error.message);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setIsLogged(false);
    setUser(null);
    setToken(null);
    await AsyncStorage.removeItem('isLogged');
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
  };

  return (
    <UserContext.Provider value={{ isLogged, user, token, loading, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;
