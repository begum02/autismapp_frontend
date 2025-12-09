import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';

// ============= INTERFACES =============
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  full_name: string;
  role: string;  // ✅ user_type yerine role
  password: string;
  password_confirm: string;
}

export interface User {
  id: number;
  email: string;
  username: string;
  full_name: string;
  role: string;
  profile_picture: string | null;
  date_joined: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  tokens: {
    access: string;
    refresh: string;
  };
}

// ============= AUTH SERVICE =============
class AuthService {
  // Token kaydet
  async saveTokens(access: string, refresh: string): Promise<void> {
    try {
      await AsyncStorage.setItem('access_token', access);
      await AsyncStorage.setItem('refresh_token', refresh);
      console.log('✅ Token kaydedildi');
    } catch (error) {
      console.error('❌ Token kaydetme hatası:', error);
      throw error;
    }
  }

  // User kaydet
  async saveUser(user: User): Promise<void> {
    try {
      await AsyncStorage.setItem('user', JSON.stringify(user));
      console.log('✅ User kaydedildi:', user.email);
    } catch (error) {
      console.error('❌ User kaydetme hatası:', error);
      throw error;
    }
  }

  // Access token al
  async getAccessToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('access_token');
    } catch (error) {
      console.error('❌ Token okuma hatası:', error);
      return null;
    }
  }

  // Refresh token al
  async getRefreshToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('refresh_token');
    } catch (error) {
      console.error('❌ Refresh token okuma hatası:', error);
      return null;
    }
  }

  // Current user al
  async getCurrentUser(): Promise<User | null> {
    try {
      const userJson = await AsyncStorage.getItem('user');
      return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
      console.error('❌ User okuma hatası:', error);
      return null;
    }
  }

  // Login
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      console.log('🔐 Login isteği:', credentials.email);
      
      const response = await api.post<AuthResponse>('/users/login/', credentials);
      
      // Token ve user'ı kaydet
      await this.saveTokens(response.data.tokens.access, response.data.tokens.refresh);
      await this.saveUser(response.data.user);
      
      console.log('✅ Login başarılı');
      return response.data;
    } catch (error: any) {
      console.error('❌ Login hatası:', error.response?.data || error.message);
      
      if (error.response?.data?.detail) {
        throw new Error(error.response.data.detail);
      }
      
      throw new Error('Giriş başarısız');
    }
  }

  // Register
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      console.log('📤 Register isteği gönderiliyor:', data.email);
      
      const response = await api.post('/users/register/', data);
      
      if (response.data.tokens) {
        await this.saveTokens(response.data.tokens.access, response.data.tokens.refresh);
        await this.saveUser(response.data.user);
      }
      
      console.log('✅ Register başarılı:', response.data.user.email);
      return response.data;
    } catch (error: any) {
      console.error('❌ Register hatası:', error.response?.data || error.message);
      
      // Hata mesajlarını parse et
      const errorData = error.response?.data;
      let message = 'Kayıt başarısız';
      
      if (errorData) {
        if (errorData.email) {
          message = Array.isArray(errorData.email) ? errorData.email[0] : errorData.email;
        } else if (errorData.username) {
          message = Array.isArray(errorData.username) ? errorData.username[0] : errorData.username;
        } else if (errorData.password) {
          message = Array.isArray(errorData.password) ? errorData.password[0] : errorData.password;
        } else if (errorData.detail) {
          message = errorData.detail;
        }
      }
      
      throw new Error(message);
    }
  }

  // Logout
  async logout(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(['access_token', 'refresh_token', 'user']);
      console.log('✅ Logout başarılı');
    } catch (error) {
      console.error('❌ Logout hatası:', error);
      throw error;
    }
  }

  // Login durumu kontrol
  async isAuthenticated(): Promise<boolean> {
    const token = await this.getAccessToken();
    return !!token;
  }
}

export default new AuthService();