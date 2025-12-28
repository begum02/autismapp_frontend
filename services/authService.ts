import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';

// ============= INTERFACES =============
export interface LoginCredentials {
  email_or_username: string;  // ✅ Email veya Username
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  full_name: string;
  role: string;
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
      console.log('🔐 Login isteği:', credentials.email_or_username);
      
      // ✅ Backend'e email_or_username olarak gönder
      const response = await api.post<AuthResponse>('/users/login/', {
        email: credentials.email_or_username,  // Backend 'email' field'ını bekliyor
        password: credentials.password,
      });
      
      // Token ve user'ı kaydet
      await this.saveTokens(response.data.tokens.access, response.data.tokens.refresh);
      await this.saveUser(response.data.user);
      
      console.log('✅ Login başarılı:', response.data.user.email);
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

  // ✅ Update Profile
  async updateProfile(userId: number, data: { username?: string; email?: string; full_name?: string }): Promise<User> {
    try {
      console.log(`📝 Profile güncelleniyor - User ID: ${userId}`);
      // Doğru endpoint ve PATCH metodu ile gönder
      const response = await api.patch(`/users/profile/update/`, data);
      console.log('✅ Profile güncellendi:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Profile güncelleme hatası:', error.response?.data || error.message);
      
      const errorData = error.response?.data;
      let message = 'Profil güncellenemedi';
      
      if (errorData) {
        if (errorData.email) {
          message = Array.isArray(errorData.email) ? errorData.email[0] : errorData.email;
        } else if (errorData.username) {
          message = Array.isArray(errorData.username) ? errorData.username[0] : errorData.username;
        } else if (errorData.detail) {
          message = errorData.detail;
        }
      }
      
      throw new Error(message);
    }
  }

  // ✅ Change Password
  async changePassword(data: { old_password: string; new_password: string; new_password_confirm: string }): Promise<void> {
    try {
      console.log('🔐 Şifre değiştiriliyor...');
      
      await api.post('/users/change-password/', data);
      
      console.log('✅ Şifre değiştirildi');
    } catch (error: any) {
      console.error('❌ Şifre değiştirme hatası:', error.response?.data || error.message);
      
      const errorData = error.response?.data;
      let message = 'Şifre değiştirilemedi';
      
      if (errorData) {
        if (errorData.old_password) {
          message = 'Eski şifre hatalı';
        } else if (errorData.new_password) {
          message = Array.isArray(errorData.new_password) ? errorData.new_password[0] : errorData.new_password;
        } else if (errorData.detail) {
          message = errorData.detail;
        }
      }
      
      throw new Error(message);
    }
  }

  // ✅ Get User By ID (başka kullanıcının profilini görüntülemek için)
  async getUserById(userId: number): Promise<User> {
    try {
      console.log(`📥 User bilgisi çekiliyor - User ID: ${userId}`);
      
      const response = await api.get<User>(`/users/${userId}/`);
      
      console.log('✅ User bilgisi alındı:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ User bilgisi çekme hatası:', error.response?.data || error.message);
      throw new Error('Kullanıcı bilgisi alınamadı');
    }
  }

  // KOD DOĞRULAMA
  async verifyCode(email: string, code: string): Promise<void> {
    try {
      await api.post('/users/verify-code/', { email, code });
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Kod doğrulama başarısız');
    }
  }

  // Profil fotoğrafı yükle
  async uploadProfilePicture(userId: number, uri: string): Promise<User> {
    const formData = new FormData();
    formData.append('profile_picture', {
      uri,
      name: 'profile.jpg',
      type: 'image/jpeg',
    } as any);

    const response = await api.patch('/users/profile/update/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    // Kullanıcıyı local'e kaydet
    await this.saveUser(response.data);
    return response.data;
  }
}

export default new AuthService();