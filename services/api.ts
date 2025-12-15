import axios from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Backend URL
const API_BASE_URL = Platform.OS === 'android'
  ? 'http://10.0.2.2:8000/api'
  : 'http://localhost:8000/api';

console.log('🌐 API Base URL:', API_BASE_URL);

// Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor - Token ekle
api.interceptors.request.use(
  async (config) => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📤 API REQUEST`);
    console.log(`📍 URL: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    console.log(`📦 Data:`, JSON.stringify(config.data, null, 2));
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    try {
      const token = await AsyncStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log(`🔑 Token: ${token.substring(0, 20)}...`);
      }
    } catch (error) {
      console.error('❌ Token okuma hatası:', error);
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor hatası:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Hata yönetimi
api.interceptors.response.use(
  (response) => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📥 API RESPONSE`);
    console.log(`✅ Status: ${response.status}`);
    console.log(`📦 Data:`, JSON.stringify(response.data, null, 2));
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    return response;
  },
  async (error) => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📥 API ERROR`);
    console.log(`❌ Status: ${error.response?.status}`);
    console.log(`❌ Error data:`, JSON.stringify(error.response?.data, null, 2));
    console.log(`❌ Error config:`, JSON.stringify({
      url: error.config?.url,
      method: error.config?.method,
      data: error.config?.data
    }, null, 2));
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    if (error.response?.status === 401) {
      await AsyncStorage.multiRemove(['access_token', 'refresh_token', 'user']);
    }
    
    return Promise.reject(error);
  }
);

export default api;