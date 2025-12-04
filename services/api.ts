import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Platform'a göre doğru backend URL'i
const getApiBaseUrl = () => {
  if (__DEV__) {
    // Development modunda
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:8000/api'; // Android emulator
    } else if (Platform.OS === 'ios') {
      return 'http://localhost:8000/api'; // iOS simulator
    }
    return 'http://localhost:8000/api'; // Web
  }
  // Production URL'i buraya ekleyin
  return 'https://yourapi.com/api';
};

const API_BASE_URL = getApiBaseUrl();

console.log('API Base URL:', API_BASE_URL); // Debug için

// Axios instance oluştur
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor - Token ekle
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('Request:', config.method?.toUpperCase(), config.url); // Debug için
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Token yenileme
api.interceptors.response.use(
  (response) => {
    console.log('Response:', response.status, response.config.url); // Debug için
    return response;
  },
  async (error) => {
    console.error('Response Error:', error.response?.data || error.message); // Debug için
    
    const originalRequest = error.config;

    // Token expired ise refresh token kullan
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await AsyncStorage.getItem('refresh_token');
        
        if (!refreshToken) {
          throw new Error('Refresh token bulunamadı');
        }

        const response = await axios.post(`${API_BASE_URL}/users/token/refresh/`, {
          refresh: refreshToken,
        });

        const { access } = response.data;
        await AsyncStorage.setItem('access_token', access);

        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh token da geçersizse logout yap
        await AsyncStorage.removeItem('access_token');
        await AsyncStorage.removeItem('refresh_token');
        await AsyncStorage.removeItem('user');
        
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;