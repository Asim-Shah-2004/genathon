import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';

import { useUserContext } from '~/context/UserProvider';

const LoginPage = () => {
  const { login } = useUserContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await login(email, password);
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 items-center justify-center bg-[#121212] p-4">
      <Text className="mb-6 text-4xl font-semibold text-white">Login</Text>
      <TextInput
        className="mb-4 w-full rounded bg-gray-800 p-3 text-white"
        placeholder="Email"
        placeholderTextColor="#888"
        value={email}
        onChangeText={setEmail}
      />
      <View className="relative mb-4 w-full">
        <TextInput
          className="w-full rounded bg-gray-800 p-3 text-white"
          placeholder="Password"
          placeholderTextColor="#888"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity
          onPress={() => setShowPassword((prev) => !prev)}
          className="absolute right-3 top-3">
          <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={24} color="white" />
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        onPress={handleLogin}
        className="flex w-full items-center justify-center rounded bg-cyan-500 py-3"
        disabled={loading}>
        {loading ? (
          <ActivityIndicator size="small" color="#121212" />
        ) : (
          <Text className="text-lg text-white">Login</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default LoginPage;
