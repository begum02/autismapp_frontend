import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';

const API_URL = 'http://localhost:8000/api';

// ============= INTERFACES =============
interface Task {
  id: number;
  title: string;
  description?: string;
  scheduled_date: string;
  start_time: string;
  end_time?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  lottie_animation?: string;
  assigned_to?: number;
  created_by?: number;
  created_at?: string;
  updated_at?: string;
}

interface CreateTaskData {
  title: string;
  description?: string;
  scheduled_date: string;
  start_time?: string;
  end_time?: string;
  lottie_animation?: string;
  assigned_to?: number;
}

interface TaskListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Task[];
}

// ============= TASK SERVICE =============
class TaskService {
  async getTasks(filters?: {
    date?: string;
    status?: string;
    assigned_to?: number;
  }): Promise<TaskListResponse> {
    try {
      console.log('📋 Görevler yükleniyor...', filters);
      
      const response = await api.get<TaskListResponse>('/tasks/', { params: filters });
      
      console.log(`✅ ${response.data.results?.length || 0} görev yüklendi`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Görev yükleme hatası:', error.response?.data || error.message);
      throw new Error(error.response?.data?.detail || 'Görevler yüklenemedi');
    }
  }

  async createTask(taskData: CreateTaskData): Promise<Task> {
    try {
      console.log('➕ Yeni görev oluşturuluyor:', taskData.title);
      
      const response = await api.post<Task>('/tasks/create/', taskData);
      
      console.log('✅ Görev oluşturuldu:', response.data.id);
      return response.data;
    } catch (error: any) {
      console.error('❌ Görev oluşturma hatası:', error.response?.data || error.message);
      
      if (error.response?.data?.title) {
        throw new Error(error.response.data.title[0]);
      }
      if (error.response?.data?.scheduled_date) {
        throw new Error(error.response.data.scheduled_date[0]);
      }
      
      throw new Error(error.response?.data?.detail || 'Görev oluşturulamadı');
    }
  }

  async updateTask(taskId: number, taskData: Partial<CreateTaskData>): Promise<Task> {
    try {
      console.log('✏️ Görev güncelleniyor:', taskId);
      
      const response = await api.patch<Task>(`/tasks/${taskId}/update/`, taskData);
      
      console.log('✅ Görev güncellendi');
      return response.data;
    } catch (error: any) {
      console.error('❌ Görev güncelleme hatası:', error.response?.data || error.message);
      throw new Error(error.response?.data?.detail || 'Görev güncellenemedi');
    }
  }

  async deleteTask(taskId: number): Promise<void> {
    try {
      console.log('🗑️ Görev siliniyor:', taskId);
      
      await api.delete(`/tasks/${taskId}/delete/`);
      
      console.log('✅ Görev silindi');
    } catch (error: any) {
      console.error('❌ Görev silme hatası:', error.response?.data || error.message);
      throw new Error(error.response?.data?.detail || 'Görev silinemedi');
    }
  }

  async startTask(taskId: number): Promise<Task> {
    try {
      console.log('▶️ Görev başlatılıyor:', taskId);
      
      const response = await api.post<Task>(`/tasks/${taskId}/start/`);
      
      console.log('✅ Görev başlatıldı');
      return response.data;
    } catch (error: any) {
      console.error('❌ Görev başlatma hatası:', error.response?.data || error.message);
      throw new Error(error.response?.data?.detail || 'Görev başlatılamadı');
    }
  }

  async completeTask(taskId: number): Promise<Task> {
    try {
      console.log('✅ Görev tamamlanıyor:', taskId);
      
      const response = await api.post<Task>(`/tasks/${taskId}/complete/`);
      
      console.log('✅ Görev tamamlandı');
      return response.data;
    } catch (error: any) {
      console.error('❌ Görev tamamlama hatası:', error.response?.data || error.message);
      throw new Error(error.response?.data?.detail || 'Görev tamamlanamadı');
    }
  }

  async cancelTask(taskId: number): Promise<Task> {
    try {
      console.log('❌ Görev iptal ediliyor:', taskId);
      
      const response = await api.post<Task>(`/tasks/${taskId}/cancel/`);
      
      console.log('✅ Görev iptal edildi');
      return response.data;
    } catch (error: any) {
      console.error('❌ Görev iptal hatası:', error.response?.data || error.message);
      throw new Error(error.response?.data?.detail || 'Görev iptal edilemedi');
    }
  }

  async getStatistics() {
    try {
      const response = await api.get('/tasks/statistics/');
      return response.data;
    } catch (error: any) {
      console.error('❌ İstatistik hatası:', error);
      throw new Error('İstatistikler yüklenemedi');
    }
  }

  async getTodayCompletedCount(): Promise<number> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await this.getTasks({ date: today, status: 'completed' });
      return response.results?.length || 0;
    } catch (error) {
      console.error('getTodayCompletedCount error:', error);
      return 0;
    }
  }
}

export default new TaskService();

export type { Task, CreateTaskData, TaskListResponse };