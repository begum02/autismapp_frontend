import BottomQuarterCircle from '@/components/BottomQuarterCircle';
import Card from '@/components/Card';
import CustomWeekCalendar from '@/components/CustomWeekCalendar';
import EditModal from '@/components/EditModal';
import PlusButton from '@/components/PlusButton';
import TaskForm from '@/components/TaskForm';
import TopQuarterCircle from '@/components/TopQuarterCircle';
import authService from '@/services/authService';
import taskService from '@/services/taskService';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View, ActivityIndicator, Alert } from 'react-native';
import { Avatar } from 'react-native-paper';

dayjs.locale('tr');

interface Task {
  id: number;
  title: string;
  description?: string;
  scheduled_date: string;
  start_time: string;
  end_time?: string;
  status: string;
  lottie_animation?: string;
  assigned_to?: number;
}

export default function IndividualFollowUp() {
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [headerDate, setHeaderDate] = useState(() => dayjs(selectedDate));
  const [taskFormVisible, setTaskFormVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedAnim, setSelectedAnim] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Kullanıcı bilgilerini yükle
  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await authService.getCurrentUser();
      if (!currentUser) {
        Alert.alert('Oturum Sonlandı', 'Lütfen tekrar giriş yapın', [
          { text: 'Tamam', onPress: () => router.replace('/individual/IndividualLogin') }
        ]);
        return;
      }
      setUser(currentUser);
      console.log('👤 Kullanıcı yüklendi:', currentUser.username, 'ID:', currentUser.id);
    };
    loadUser();
  }, []);

  // Görevleri yükle
  const loadTasks = async (date: string) => {
    try {
      setLoading(true);
      console.log('📅 Görevler yükleniyor, tarih:', date);
      const response = await taskService.getTasks({ date });
      const taskList = response.results || [];
      console.log(`📋 ${taskList.length} görev yüklendi`);
      setTasks(taskList);
    } catch (error: any) {
      console.error('❌ Görevler yüklenirken hata:', error);
      
      // Token expire olduysa login'e yönlendir
      if (error.message?.includes('401') || error.message?.includes('authentication')) {
        Alert.alert('Oturum Sonlandı', 'Lütfen tekrar giriş yapın', [
          { text: 'Tamam', onPress: () => router.replace('/individual/IndividualLogin') }
        ]);
      } else {
        Alert.alert('Hata', 'Görevler yüklenemedi');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // İlk yükleme ve tarih değişikliğinde görevleri yükle
  useEffect(() => {
    if (user) {
      loadTasks(selectedDate);
    }
  }, [selectedDate, user]);

  const openTaskForm = () => setTaskFormVisible(true);
  const closeTaskForm = () => setTaskFormVisible(false);

  const handleTaskSubmit = async (data: {
    title: string;
    details: string;
    date: Date;
    timeStart?: { hours: number; minutes: number } | null;
    timeEnd?: { hours: number; minutes: number } | null;
  }) => {
    try {
      console.log('📝 Görev oluşturuluyor...');

      if (!user) {
        Alert.alert('Hata', 'Kullanıcı bilgisi bulunamadı');
        return;
      }

      // Zaman formatını düzelt
      const startTime = data.timeStart 
        ? `${String(data.timeStart.hours).padStart(2, '0')}:${String(data.timeStart.minutes).padStart(2, '0')}:00`
        : '09:00:00';
      
      const endTime = data.timeEnd
        ? `${String(data.timeEnd.hours).padStart(2, '0')}:${String(data.timeEnd.minutes).padStart(2, '0')}:00`
        : undefined;

      const taskData = {
        title: data.title,
        description: data.details,
        scheduled_date: dayjs(data.date).format('YYYY-MM-DD'),
        start_time: startTime,
        end_time: endTime,
        assigned_to: user.id, // Bireysel kullanıcı için kendine atama
        created_by: user.id,  // Oluşturan da kendisi
      };

      console.log('📤 Görev verisi:', taskData);
      await taskService.createTask(taskData);
      
      // Modal'ı kapat
      closeTaskForm();
      
      // Görevleri yeniden yükle
      if (selectedDate === taskData.scheduled_date) {
        await loadTasks(selectedDate);
      }
      
      Alert.alert('✅ Başarılı', 'Görev oluşturuldu');
    } catch (error: any) {
      console.error('❌ Görev oluşturma hatası:', error);
      Alert.alert('❌ Hata', error.message || 'Görev oluşturulamadı');
    }
  };

  const handleTaskComplete = async (taskId: number) => {
    try {
      await taskService.completeTask(taskId);
      await loadTasks(selectedDate);
      Alert.alert('✅ Başarılı', 'Görev tamamlandı');
    } catch (error: any) {
      console.error('❌ Görev tamamlama hatası:', error);
      Alert.alert('❌ Hata', error.message || 'Görev tamamlanamadı');
    }
  };

  const handleTaskStart = async (taskId: number) => {
    try {
      await taskService.startTask(taskId);
      await loadTasks(selectedDate);
      Alert.alert('✅ Başarılı', 'Görev başlatıldı');
    } catch (error: any) {
      console.error('❌ Görev başlatma hatası:', error);
      Alert.alert('❌ Hata', error.message || 'Görev başlatılamadı');
    }
  };

  const handleTaskDelete = async (taskId: number) => {
    Alert.alert(
      'Görev Sil',
      'Bu görevi silmek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              await taskService.deleteTask(taskId);
              await loadTasks(selectedDate);
              Alert.alert('✅ Başarılı', 'Görev silindi');
            } catch (error: any) {
              console.error('❌ Görev silme hatası:', error);
              Alert.alert('❌ Hata', error.message || 'Görev silinemedi');
            }
          },
        },
      ]
    );
  };

  const handleDayPress = useCallback((d: { dateString: string }) => {
    setSelectedDate(d.dateString);
    setHeaderDate(dayjs(d.dateString));
  }, []);

  const handleVisibleMonthsChange = useCallback((months: any[]) => {
    if (!months || months.length === 0) return;
    const m = months[0];
    const monthDate = m?.dateString
      ? dayjs(m.dateString)
      : dayjs(new Date(m.year, (m.month ?? m.monthNumber) - 1, 1));
    setHeaderDate(monthDate);
  }, []);

  const openProfile = () => {
    router.push('/Profile');
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadTasks(selectedDate);
  };

  const openEditModal = (task: Task) => {
    setSelectedTask(task);
    setEditModalVisible(true);
  };

  const closeEditModal = () => {
    setEditModalVisible(false);
    setSelectedTask(null);
  };

  const handleEdit = () => {
    if (!selectedTask) return;
    // TODO: Edit modal açılacak
    console.log('Edit task:', selectedTask.id);
    Alert.alert('Bilgi', 'Düzenleme özelliği yakında eklenecek');
  };

  return (
    <View style={styles.container}>
      <TopQuarterCircle style={styles.TopQuarterCircle} />
      
      <View style={styles.headerWrap}>
        <Pressable onPress={openProfile} style={styles.profileBtn}>
          <Avatar.Image 
            size={50} 
            source={
              user?.profile_picture 
                ? { uri: user.profile_picture } 
                : require('../../assets/images/icon.png')
            } 
          />
        </Pressable>
        <Text style={styles.title}>
          <Text style={styles.monthText}>{headerDate.format('MMMM').toUpperCase()} </Text>
          <Text style={styles.yearText}>{headerDate.format('YYYY')}</Text>
        </Text>
      </View>

      <CustomWeekCalendar
        date={selectedDate}
        onDayPress={handleDayPress}
        onVisibleMonthsChange={handleVisibleMonthsChange}
      />

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4B297E" />
          <Text style={styles.loadingText}>Görevler yükleniyor...</Text>
        </View>
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          ListEmptyComponent={() => (
            <Text style={styles.empty}>Seçili günde görev yok</Text>
          )}
          renderItem={({ item }) => (
            <Card 
              startTime={item.start_time}
              endTime={item.end_time || ''}
              title={item.title}
              status={item.status}
              onPress={() => openEditModal(item)} // Karta tıklayınca modal açılsın
              onComplete={() => handleTaskComplete(item.id)}
              onStart={() => handleTaskStart(item.id)}
              onDelete={() => handleTaskDelete(item.id)}
            />
          )}
        />
      )}

      <View style={styles.PlusButton}>
        <PlusButton onPress={openTaskForm} />
      </View>

      {/* Task Form Modal */}
      <TaskForm
        visible={taskFormVisible}
        onClose={closeTaskForm}
        onSubmit={handleTaskSubmit}
      />

      {/* Edit Modal */}
      <EditModal
        visible={editModalVisible}
        onClose={closeEditModal}
        task={selectedTask}
        onEdit={handleEdit}
        onDelete={() => selectedTask && handleTaskDelete(selectedTask.id)}
        onComplete={() => selectedTask && handleTaskComplete(selectedTask.id)}
        onStart={() => selectedTask && handleTaskStart(selectedTask.id)}
      />

      <BottomQuarterCircle style={styles.BottomQuarterCircle} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff', 
    position: 'relative' 
  },
  profileBtn: {
    position: 'absolute',
    right: -60,
    top: 5,
    zIndex: 20,
  },
  headerWrap: { 
    paddingTop: 12, 
    paddingHorizontal: 16, 
    alignItems: 'center', 
    marginTop: 24, 
    position: 'relative', 
    left: -80, 
    bottom: -50 
  },
  title: { 
    fontFamily: 'Roboto', 
    fontSize: 35, 
    fontWeight: '700', 
    textTransform: 'uppercase' 
  },
  monthText: { color: '#4B297E' },
  yearText: { color: '#474463' },
  listContent: { 
    paddingHorizontal: 16, 
    paddingTop: 12, 
    paddingBottom: 60, 
    marginTop: 150 
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 150,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 14,
  },
  empty: { 
    textAlign: 'center', 
    color: '#888', 
    marginTop: 20,
    fontSize: 16,
  },
  TopQuarterCircle: {
    position: 'absolute',
    left: -40,
    top: 0,
  },
  BottomQuarterCircle: {
    position: 'absolute',
    right: -40,
    bottom: 0,
  },
  PlusButton: {
    zIndex: 10,
    position: 'absolute',
    bottom: 20,
    right: 10,
  },
});