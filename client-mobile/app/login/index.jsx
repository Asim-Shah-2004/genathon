import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Redirect, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from 'react-native-reanimated';

import { useUserContext } from '~/context/UserProvider';

const { width } = Dimensions.get('window');

const LoginPage = () => {
  const { login } = useUserContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  // Animation values
  const buttonScale = useSharedValue(1);

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const handlePressIn = () => {
    buttonScale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    buttonScale.value = withSpring(1);
  };

  const handleLogin = async () => {
    setLoading(true);
    try {
      await login(email, password);
      router.push('/');
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 items-center justify-center bg-[#121212] px-6">
      <Animated.View entering={FadeInDown.duration(1000).springify()} className="w-full max-w-sm">
        <Text className="mb-8 text-center font-['Inter-Bold'] text-5xl text-white">
          Welcome
          <Text className="text-cyan-400">.</Text>
        </Text>

        <Animated.View
          entering={FadeInUp.delay(200).duration(1000).springify()}
          className="space-y-4">
          {/* Email Input */}
          <View className="mt-2 overflow-hidden rounded-2xl bg-white/10 backdrop-blur-lg">
            <TextInput
              className="w-full px-4 py-4 font-['Inter-Regular'] text-lg text-white"
              placeholder="Email"
              placeholderTextColor="#94a3b8"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Password Input */}
          <View className="relative mt-2 overflow-hidden rounded-2xl bg-white/10 backdrop-blur-lg">
            <TextInput
              className="w-full px-4 py-4 pr-12 font-['Inter-Regular'] text-lg text-white"
              placeholder="Password"
              placeholderTextColor="#94a3b8"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              onPress={() => setShowPassword((prev) => !prev)}
              className="absolute right-4 top-4">
              <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={24} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          {/* Login Button */}
          <Animated.View style={buttonAnimatedStyle}>
            <TouchableOpacity
              onPress={handleLogin}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              disabled={loading}
              className="mt-4 overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-400 to-cyan-500">
              <LinearGradient
                colors={['#22d3ee', '#06b6d4']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="px-6 py-4">
                {loading ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text className="text-center font-['Inter-SemiBold'] text-lg text-white">
                    Sign In
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </Animated.View>
    </View>
  );
};

export default LoginPage;
