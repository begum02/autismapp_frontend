import BottomQuarterCircle from '@/components/BottomQuarterCircle';
import Card from '@/components/Card';
import CustomWeekCalendar from '@/components/CustomWeekCalendar';
import EditModal from '@/components/EditModal';
import PlusButton from '@/components/PlusButton';
import TaskFormForSupportRequired2 from '@/app/parent/TaskFormForSupportRequired2';
import TopQuarterCircle from '@/components/TopQuarterCircle';
import authService from '@/services/authService';
import taskService from '@/services/taskService';
import AsyncStorage from '@react-native-async-storage/async-storage'; // ✅ Import ekle
import dayjs from 'dayjs';
import 'dayjs/locale/tr';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, FlatList, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Avatar } from 'react-native-paper';
import * as Notifications from 'expo-notifications';

const { height } = Dimensions.get('window');

dayjs.locale('tr');

interface Task {
  id: number;
  title: string;
  description?: string;
  scheduled_date: string;
  start_time: string;
  end_time?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  lottie_animation?: string;
}

export default function ResponsiblePersonFollowUp() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const supportRequiredUserId = params.supportRequiredUserId 
    ? parseInt(params.supportRequiredUserId as string) 
    : null;

  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [headerDate, setHeaderDate] = useState(() => dayjs(selectedDate));
  const [taskFormVisible, setTaskFormVisible] = useState(false);
  const [editFormVisible, setEditFormVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [responsiblePerson, setResponsiblePerson] = useState<any>(null);
  const [supportRequiredIndividual, setSupportRequiredIndividual] = useState<any>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editTaskInitialValues, setEditTaskInitialValues] = useState<any>(null);
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, [supportRequiredUserId, selectedDate]);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadUserData(),
        loadTasks(),
      ]);
    } catch (error) {
      console.error('❌ Data yükleme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserData = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      
      if (currentUser && currentUser.role === 'responsible_person') {
        setResponsiblePerson({
          id: currentUser.id,
          full_name: currentUser.full_name,
          email: currentUser.email,
          profile_picture: currentUser.profile_picture,
        });
      }

      if (supportRequiredUserId) {
        const supportUser = await authService.getUserById(supportRequiredUserId);
        
        setSupportRequiredIndividual({
          id: supportUser.id,
          full_name: supportUser.full_name,
          email: supportUser.email,
          profile_picture: supportUser.profile_picture,
        });
      }
    } catch (error) {
      console.error('❌ User data yükleme hatası:', error);
    }
  };

  const loadTasks = async (isRefreshing = false) => {
    try {
      if (isRefreshing) {
        setRefreshing(true);
      }

      console.log('📅 Görevler yükleniyor, tarih:', selectedDate);
      
      const filters: any = { scheduled_date: selectedDate };
      
      if (supportRequiredUserId) {
        filters.assigned_to = supportRequiredUserId;
      }

      const response = await taskService.getTasks(filters);
      
      console.log(`✅ ${response.results?.length || 0} görev yüklendi`);
      setTasks(response.results || []);
    } catch (error) {
      console.error('❌ Task yükleme hatası:', error);
      Alert.alert('Hata', 'Görevler yüklenemedi');
    } finally {
      if (isRefreshing) {
        setRefreshing(false);
      }
    }
  };

  const openTaskForm = () => {
    if (!supportRequiredUserId) {
      Alert.alert('Hata', 'Kullanıcı seçilmedi');
      return;
    }
    // Yeni görev için initialValues ayarla
    setEditTaskInitialValues({
      date: dayjs(selectedDate).toDate()
    });
    setEditingTaskId(null);
    setSelectedTask(null);
    setTaskFormVisible(true);
  };

  const closeTaskForm = () => setTaskFormVisible(false);

  const handleTaskSubmit = async (data: {
    title: string;
    details: string;
    date: Date;
    timeStart?: { hours: number; minutes: number } | null;
    timeEnd?: { hours: number; minutes: number } | null;
    lottieAnimation?: string | null;
  }) => {
    try {
      if (!supportRequiredUserId) {
        Alert.alert('Hata', 'Kullanıcı ID bulunamadı');
        return;
      }

      const formatTime = (time: { hours: number; minutes: number } | null | undefined) => {
        if (!time) return null;
        return `${time.hours.toString().padStart(2, '0')}:${time.minutes.toString().padStart(2, '0')}:00`;
      };

      const userStr = await AsyncStorage.getItem('user');
      if (!userStr) {
        Alert.alert('Hata', 'Kullanıcı bilgisi bulunamadı');
        return;
      }
      const user = JSON.parse(userStr);
      const parentId = user.id;

      if (editingTaskId) {
        // Sadece değişen alanları gönder
        const payload: any = {};
        if (data.title !== selectedTask?.title) payload.title = data.title;
        if (data.details !== (selectedTask?.description || '')) payload.description = data.details;
        if (dayjs(data.date).format('YYYY-MM-DD') !== selectedTask?.scheduled_date)
          payload.scheduled_date = dayjs(data.date).format('YYYY-MM-DD');
        if (
          data.timeStart &&
          `${String(data.timeStart.hours).padStart(2, '0')}:${String(data.timeStart.minutes).padStart(2, '0')}:00` !== selectedTask?.start_time
        )
          payload.start_time = formatTime(data.timeStart);
        if (
          data.timeEnd &&
          `${String(data.timeEnd.hours).padStart(2, '0')}:${String(data.timeEnd.minutes).padStart(2, '0')}:00` !== selectedTask?.end_time
        )
          payload.end_time = formatTime(data.timeEnd);
        if (data.lottieAnimation !== selectedTask?.lottie_animation)
          payload.lottie_animation = data.lottieAnimation;

        if (Object.keys(payload).length === 0) {
          Alert.alert('Uyarı', 'Herhangi bir değişiklik yapılmadı.');
          return;
        }

        await taskService.updateTask(editingTaskId, payload, 'patch');
        setEditingTaskId(null);
        setSelectedTask(null);
        setEditTaskInitialValues(null);
        setTaskFormVisible(false);
        await loadTasks();
        Alert.alert('Başarılı', 'Görev başarıyla güncellendi');
      } else {
        // Yeni görev oluştur
        await taskService.createTask({
          title: data.title,
          description: data.details,
          scheduled_date: dayjs(data.date).format('YYYY-MM-DD'),
          start_time: formatTime(data.timeStart) || undefined,
          end_time: formatTime(data.timeEnd) || undefined,
          assigned_to: supportRequiredUserId,
          created_by: parentId,
          lottie_animation: data.lottieAnimation || undefined,
        });
        setTaskFormVisible(false);
        await loadTasks();
        Alert.alert('Başarılı', 'Görev başarıyla oluşturuldu');
      }
    } catch (error: any) {
      console.error('❌ Task oluşturma/güncelleme hatası:', error);
      Alert.alert('Hata', error.message || 'Görev oluşturulamadı/güncellenemedi');
    }
  };

  const handleTaskComplete = async (taskId: number) => {
    try {
      await taskService.completeTask(taskId);
      await loadTasks();
      Alert.alert('✅ Başarılı', 'Görev tamamlandı');
    } catch (error: any) {
      console.error('❌ Görev tamamlama hatası:', error);
      Alert.alert('❌ Hata', error.message || 'Görev tamamlanamadı');
    }
  };

  const handleTaskStart = async (taskId: number) => {
    try {
      await taskService.startTask(taskId);
      await loadTasks();
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
              await loadTasks();
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
    console.log('Avatar tıklandı', responsiblePerson);
    if (responsiblePerson?.id) {
      router.push('/ResponsibleProfile');
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadTasks(true);
  };

  const openEditModal = (task: Task) => {
    setSelectedTask(task);
    setEditFormVisible(true);
  };

  const closeEditModal = () => {
    setEditFormVisible(false);
    setSelectedTask(null);
  };

  const handleEdit = () => {
    if (!selectedTask) return;
    setEditFormVisible(false);

    // TaskFormForSupportRequired2 için initial values hazırla
    setEditTaskInitialValues({
      title: selectedTask.title,
      details: selectedTask.description || '',
      date: dayjs(selectedTask.scheduled_date).toDate(),
      timeStart: selectedTask.start_time
        ? {
            hours: parseInt(selectedTask.start_time.split(':')[0]),
            minutes: parseInt(selectedTask.start_time.split(':')[1]),
          }
        : null,
      timeEnd: selectedTask.end_time
        ? {
            hours: parseInt(selectedTask.end_time.split(':')[0]),
            minutes: parseInt(selectedTask.end_time.split(':')[1]),
          }
        : null,
      lottieAnimation: selectedTask.lottie_animation || null,
    });
    setEditingTaskId(selectedTask.id);
    setTaskFormVisible(true);
  };

  const getInitials = (name: string) => {
    if (!name) return '?';
    const names = name.trim().split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return name[0].toUpperCase();
  };

  function toTRDateString(date: Date) {
    // Europe/Istanbul saat diliminde YYYY-MM-DD formatı
    const tzDate = new Date(date.toLocaleString('en-US', { timeZone: 'Europe/Istanbul' }));
    return tzDate.toISOString().split('T')[0];
  }

  return (
    <View style={styles.container}>
      <TopQuarterCircle style={styles.TopQuarterCircle} />

      {/* Sadece bir avatar bloğu */}
      <View style={styles.avatarsContainer}>
        {/* Destek Gereksinimli Birey (Büyük, altta) */}
        <TouchableOpacity
          onPress={() => {
            if (supportRequiredIndividual?.id) {
              router.push(`/parent/SupportRequiredStatistics?userId=${supportRequiredIndividual.id}`);
            }
          }}
          activeOpacity={0.7}
          style={styles.avatarBackWrap}
        >
          {supportRequiredIndividual?.profile_picture ? (
            <Avatar.Image
              size={56}
              source={{ uri: supportRequiredIndividual.profile_picture }}
              style={styles.avatarBack}
            />
          ) : (
            <View style={styles.avatarBack}>
              <Text style={styles.avatarInitials}>{getInitials(supportRequiredIndividual?.full_name || '?')}</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Sorumlu Kişi (Küçük, sağ üstte) */}
        <TouchableOpacity onPress={openProfile} activeOpacity={0.7} style={styles.avatarFrontWrap}>
          {responsiblePerson?.profile_picture ? (
            <Avatar.Image
              size={36}
              source={{ uri: responsiblePerson.profile_picture }}
              style={styles.avatarFront}
            />
          ) : (
            <View style={styles.avatarFront}>
              <Text style={styles.avatarInitials}>{getInitials(responsiblePerson?.full_name || '?')}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* headerWrap artık avatar içermiyor */}
      <View style={styles.headerWrap}>
        {/* Month & Year */}
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
      <View style={{ height: 24 }} />
      
      <View style={{height: height - 250, marginTop:100}}>
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
            ListEmptyComponent={
              <Text style={styles.empty}>Seçili günde görev yok</Text>
            }
            renderItem={({ item }) => (
              <Card 
                startTime={item.start_time}
                endTime={item.end_time || ''}
                title={item.title}
                status={item.status}
                onPress={() => openEditModal(item)}
                onDelete={() => handleTaskDelete(item.id)}
              />
            )}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            ListFooterComponent={<View style={{ height: 20 }} />}
          />
        )}
      </View>

      <View style={styles.PlusButton}>
        <PlusButton onPress={openTaskForm} />
      </View>

      {/* Task Form Modal */}
      <TaskFormForSupportRequired2
        visible={taskFormVisible}
        onClose={() => {
          setTaskFormVisible(false);
          setEditTaskInitialValues(null);
          setEditingTaskId(null);
          setSelectedTask(null);
        }}
        supportRequiredUserId={supportRequiredUserId!}
        onSubmit={handleTaskSubmit}
        initialValues={editTaskInitialValues}
      />

      {/* Edit Modal */}
      <EditModal
        visible={editFormVisible}
        onClose={closeEditModal}
        task={selectedTask}
        onEdit={handleEdit}
        onDelete={() => selectedTask && handleTaskDelete(selectedTask.id)}
      />

      <BottomQuarterCircle style={styles.BottomQuarterCircle} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff', 
    opacity: 1,
    position: 'relative' ,
    zIndex: 10
  },
  avatarsContainer: {
   // position: 'absolute',
    //right: -60,
    //top: 5,
    //zIndex: 20,
   // flexDirection: 'row',
   // alignItems: 'flex-end',

      position: 'absolute',
  right: 20,
  top: 35,
  zIndex: 999,
  elevation: 999, // ANDROID
  },
  avatarBackWrap: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarBack: {
    borderWidth: 3,
    borderColor: '#BFC3DB',
    position: 'relative',
    bottom: -30,
    right:10,
    
    zIndex: 1,
    marginTop:20,
    marginRight:10, // ✅ Overlap için
    backgroundColor: '#BFC3DB',
    borderRadius: 23,
    width: 46,
    height: 46,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarFrontWrap: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',

  },
  avatarFront: {
  //  borderWidth: 3,
  //  borderColor: '#fff',
   // marginLeft: -20, // ✅ Overlap için
   // marginTop: -25,  // ✅ Sol alt köşe pozisyonu
   // zIndex: 1000,
   // elevation:1000, // ANDROID
   

 borderWidth:3,
  borderColor: '#fff',
  marginLeft: 20, //- Overlap için;
  marginTop:-40,  // Sol alt köşe pozisyonu  
  zIndex: 1000,
  elevation: 1000, // ANDROID
  borderRadius: 28,
  width: 56,
  height: 56,
  overflow: 'hidden',
  backgroundColor: '#BFC3DB',
  cursor: 'pointer',
  
    
  },
  avatarPlaceholder: {
    backgroundColor: '#BFC3DB',
  },
  avatarInitials: {
    color: '#2F3C7E',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    textAlignVertical: 'center', // Android için,
     
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
    paddingBottom: 60
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
    pointerEvents: 'none',
  },
  BottomQuarterCircle: {
    position: 'absolute',
    right: -40,
    bottom: 0,
    pointerEvents: 'box-none',
  },
  PlusButton: {
    zIndex: 10,
    position: 'absolute',
    bottom: 20,
    right: 10,
  },
});