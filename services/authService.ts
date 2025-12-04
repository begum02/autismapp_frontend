import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';

// ============= INTERFACES =============
interface LoginCredentials {
  email_or_username: string; // Email veya username ile giriş
  password: string;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  full_name: string;
  role: 'individual' | 'support_required_individual' | 'responsible_person';
}

interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: 'individual' | 'support_required_individual' | 'responsible_person';
  profile_picture?: string;
  date_joined: string;
  last_login: string;
  is_active: boolean;
}

interface AuthResponse {
  message: string;
  user: User;
  tokens: {
    access: string;
    refresh: string;
  };
}

// ============= AUTH SERVICE =============
class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      console.log('🔐 Login attempt:', credentials.email_or_username);
      const response = await api.post<AuthResponse>('/users/login/', credentials);
      console.log('✅ Login success:', response.data.user.username);
      
      // Token'ları kaydet
      await AsyncStorage.setItem('access_token', response.data.tokens.access);
      await AsyncStorage.setItem('refresh_token', response.data.tokens.refresh);
      
      // Kullanıcı bilgilerini kaydet
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Login error:', error.response?.data || error.message);
      const errorMessage = 
        error.response?.data?.non_field_errors?.[0] || 
        error.response?.data?.error || 
        'E-posta/kullanıcı adı veya şifre hatalı';
      throw new Error(errorMessage);
    }
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      console.log('📝 Register attempt:', data.username);
      const response = await api.post<AuthResponse>('/users/register/', data);
      console.log('✅ Register success:', response.data.user.username);
      
      // Token'ları kaydet
      await AsyncStorage.setItem('access_token', response.data.tokens.access);
      await AsyncStorage.setItem('refresh_token', response.data.tokens.refresh);
      
      // Kullanıcı bilgilerini kaydet
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Register error:', error.response?.data || error.message);
      
      // Hata mesajlarını çıkar
      if (error.response?.data?.username) {
        throw new Error(error.response.data.username[0]);
      }
      if (error.response?.data?.email) {
        throw new Error(error.response.data.email[0]);
      }
      if (error.response?.data?.password) {
        throw new Error(error.response.data.password[0]);
      }
      
      throw new Error('Kayıt başarısız. Lütfen bilgilerinizi kontrol edin.');
    }
  }

  async logout(): Promise<void> {
    try {
      console.log('👋 Logout attempt');
      const refreshToken = await AsyncStorage.getItem('refresh_token');
      
      if (refreshToken) {
        await api.post('/users/logout/', { refresh: refreshToken });
      }
      console.log('✅ Logout success');
    } catch (error) {
      console.error('❌ Logout error:', error);
    } finally {
      // Token'ları temizle
      await AsyncStorage.removeItem('access_token');
      await AsyncStorage.removeItem('refresh_token');
      await AsyncStorage.removeItem('user');
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const userString = await AsyncStorage.getItem('user');
      if (userString) {
        const user = JSON.parse(userString);
        console.log('👤 Current user:', user.username);
        return user;
      }
      return null;
    } catch (error) {
      console.error('❌ Get current user error:', error);
      return null;
    }
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await AsyncStorage.getItem('access_token');
    const isAuth = !!token;
    console.log('🔑 Is authenticated:', isAuth);
    return isAuth;
  }

  async getAccessToken(): Promise<string | null> {
    return await AsyncStorage.getItem('access_token');
  }

  async getRefreshToken(): Promise<string | null> {
    return await AsyncStorage.getItem('refresh_token');
  }

  async updateTokens(access: string, refresh: string): Promise<void> {
    await AsyncStorage.setItem('access_token', access);
    await AsyncStorage.setItem('refresh_token', refresh);
  }
}

export default new AuthService();

// Export types for use in other files
export type { LoginCredentials, RegisterData, User, AuthResponse };