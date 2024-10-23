import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

const UserContext = createContext();
export const useUserContext = () => useContext(UserContext);

const UserProvider = ({ children }) => {
  const [isLogged, setIsLogged] = useState(false);
  const [user, setUser] = useState(null);
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

  const login = async (userData) => {
    setIsLogged(true);
    setUser(userData);
    await AsyncStorage.setItem('isLogged', 'true');
    await AsyncStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = async () => {
    setIsLogged(false);
    setUser(null);
    await AsyncStorage.removeItem('isLogged');
    await AsyncStorage.removeItem('user');
  };

  return (
    <UserContext.Provider
      value={{
        isLogged,
        user,
        loading,
        login,
        logout,
      }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;
