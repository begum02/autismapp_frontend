import api from './api';

export interface Task {
  id: number;
  title: string;
  description?: string;
  scheduled_date: string;
  start_time?: string;
  end_time?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  lottie_animation?: string;
  created_by?: number;
  assigned_to?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  scheduled_date: string;
  start_time?: string | null;
  end_time?: string | null;
  lottie_animation?: string | null;
  assigned_to: number;
  created_by: number; // ✅ Zorunlu alan eklendi
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  scheduled_date?: string;
  start_time?: string | null;
  end_time?: string | null;
  lottie_animation?: string | null;
  status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  assigned_to?: number;   // <-- EKLE
  created_by?: number;    // <-- EKLE
  category?: string;
  task_type?: string;
  priority?: string;
  difficulty_level?: string;
}

export interface TaskFilters {
  scheduled_date?: string;
  status?: string;
  assigned_to?: number;
  created_by?: number;
}

class TaskService {
  private pollingInterval: number | null = null; // ✅ NodeJS.Timeout yerine number

  // Görevleri listele
  async getTasks(filters?: TaskFilters) {
    try {
      const params = new URLSearchParams();

      // scheduled_date varsa, API'ye 'date' olarak gönder
      if (filters?.scheduled_date) params.append('date', filters.scheduled_date);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.assigned_to) params.append('assigned_to', filters.assigned_to.toString());
      if (filters?.created_by) params.append('created_by', filters.created_by.toString());

      const response = await api.get(`/tasks/?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Görevler yüklenemedi:', error);
      throw error;
    }
  }

  // Yeni görev oluştur
  async createTask(data: CreateTaskData) {
    try {
      const cleanData = {
        ...data,
        start_time: data.start_time ?? undefined,
        end_time: data.end_time ?? undefined,
        lottie_animation: data.lottie_animation ?? undefined,
        // created_by burada otomatik olarak kalacak
      };

      console.log('📤 Backend\'e gönderiliyor:', cleanData);
      
      const response = await api.post('/tasks/create/', cleanData);
      return response.data;
    } catch (error: any) {
      console.error('❌ Görev oluşturma hatası:', error.response?.data || error);
      throw error;
    }
  }

  // Görevi güncelle
  async updateTask(taskId: number, data: UpdateTaskData, method: 'put' | 'patch' = 'put') {
    try {
      const cleanData = {
        ...data,
        start_time: data.start_time ?? undefined,
        end_time: data.end_time ?? undefined,
        lottie_animation: data.lottie_animation ?? undefined,
      };
      const url = `/tasks/${taskId}/update/`;
      const response = method === 'patch'
        ? await api.patch(url, cleanData)
        : await api.put(url, cleanData);
      return response.data;
    } catch (error: any) {
      console.error('❌ Görev güncelleme hatası:', error);
      throw error;
    }
  }

  // Görevi başlat
  async startTask(taskId: number) {
    try {
      const response = await api.post(`/tasks/${taskId}/start/`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Görev başlatma hatası:', error);
      throw error;
    }
  }

  // Görevi tamamla
  async completeTask(taskId: number) {
    try {
      const response = await api.post(`/tasks/${taskId}/complete/`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Görev tamamlama hatası:', error);
      throw error;
    }
  }

  // Görevi iptal et
  async cancelTask(taskId: number) {
    try {
      const response = await api.post(`/tasks/${taskId}/cancel/`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Görev iptal hatası:', error);
      throw error;
    }
  }

  // Görevi sil
  async deleteTask(taskId: number) {
    try {
      const response = await api.delete(`/tasks/${taskId}/delete/`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Görev silme hatası:', error);
      throw error;
    }
  }

  // Yeni task bildirimleri (Redis polling)
  async checkNewTaskNotifications() {
    try {
      const response = await api.get('/tasks/notifications/');
      return response.data;
    } catch (error: any) {
      console.error('❌ Bildirim kontrolü hatası:', error);
      return { has_new_task: false, task: null };
    }
  }

  // Polling başlat (her 5 saniyede bir kontrol et)
  startPolling(callback: (task: any) => void) {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }

    console.log('🔄 Real-time polling başlatıldı');

    this.pollingInterval = setInterval(async () => {
      const result = await this.checkNewTaskNotifications();
      if (result.has_new_task && result.task) {
        console.log('🔔 Yeni görev bildirimi:', result.task);
        callback(result.task);
      }
    }, 5000) as unknown as number; // ✅ Type assertion
  }

  // Polling durdur
  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
      console.log('⏹️ Real-time polling durduruldu');
    }
  }

  // ✅ Bugün tamamlanan görev sayısı
  async getTodayCompletedCount() {
    try {
      const response = await api.get('/tasks/today-completed-count/');
      return response.data;
    } catch (error: any) {
      console.error('❌ Bugün tamamlanan görev sayısı alınamadı:', error);
      throw error;
    }
  }

  // ✅ Kullanıcı istatistikleri
  async getUserStatistics(userId: number) {
    try {
      const response = await api.get(`/tasks/statistics/${userId}/`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Kullanıcı istatistikleri alınamadı:', error);
      throw error;
    }
  }

  // ✅ Kullanıcı zaman istatistikleri
  async getUserTimeStatistics(userId: number) {
    try {
      const response = await api.get(`/tasks/time-statistics/${userId}/`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Kullanıcı zaman istatistikleri alınamadı:', error);
      throw error;
    }
  }

  // ✅ Atanabilir kullanıcılar listesi
  async getAssignableUsers() {
    try {
      const response = await api.get('/tasks/assignable-users/');
      return response.data;
    } catch (error: any) {
      console.error('❌ Atanabilir kullanıcılar alınamadı:', error);
      throw error;
    }
  }
}

export default new TaskService();