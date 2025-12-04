import BottomQuarterCircle from '@/components/BottomQuarterCircle';
import Card from '@/components/Card';
import CustomWeekCalendar from '@/components/CustomWeekCalendar';
import PlusButton from '@/components/PlusButton';
import TaskForm from '@/components/TaskForm';
import TopQuarterCircle from '@/components/TopQuarterCircle';
import taskService from '@/services/taskService';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Avatar } from 'react-native-paper';

dayjs.locale('tr');

interface Task {
  id: number;
  title: string;
  description?: string;
  scheduled_date: string;
  start_time?: string;
  end_time?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  animation_url?: string;
}

export default function ResponsiblePersonFollowUp() {
  const params = useLocalSearchParams();
  const userId = params.userId ? parseInt(params.userId as string) : undefined;
  const userName = params.userName as string;
  const userAvatar = params.userAvatar as string;

  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [headerDate, setHeaderDate] = useState(() => dayjs(selectedDate));
  const [taskFormVisible, setTaskFormVisible] = useState(false);
  const [selectedAnim, setSelectedAnim] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const responsiblePerson = {
    avatar: require('../../assets/images/icon.png'),
  };

  const supportRequiredIndividual = {
    avatar: userAvatar 
      ? { uri: userAvatar } 
      : require('../../assets/images/icon.png'),
  };

  useEffect(() => {
    loadTasks();
  }, [selectedDate, userId]);

  const loadTasks = async (isRefreshing = false) => {
    try {
      if (isRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const filters: any = {
        date: selectedDate,
      };

      if (userId) {
        filters.assigned_to = userId;
      }

      const response = await taskService.getTasks(filters);

      setTasks(response.results || response);
    } catch (error: any) {
      console.error('Error loading tasks:', error);
      Alert.alert('Hata', 'Görevler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const openTaskForm = () => setTaskFormVisible(true);
  const closeTaskForm = () => setTaskFormVisible(false);

  const handleTaskSubmit = async (data: {
    title: string;
    details: string;
    date: Date;
    timeStart?: { hours: number; minutes: number } | null;
    timeEnd?: { hours: number; minutes: number } | null;
    assignedUserId?: number; // Responsible person başkasına atayabilir
  }) => {
    try {
      const startTime = data.timeStart 
        ? `${data.timeStart.hours.toString().padStart(2, '0')}:${data.timeStart.minutes.toString().padStart(2, '0')}`
        : undefined;
      const endTime = data.timeEnd
        ? `${data.timeEnd.hours.toString().padStart(2, '0')}:${data.timeEnd.minutes.toString().padStart(2, '0')}`
        : undefined;

      const taskData = {
        title: data.title,
        description: data.details,
        scheduled_date: dayjs(data.date).format('YYYY-MM-DD'),
        start_time: startTime,
        end_time: endTime,
        assigned_to: data.assignedUserId || userId, // Seçili kullanıcı veya kendisi
        created_by: userId, // Her zaman oluşturan
      };

      await taskService.createTask(taskData);
      
      Alert.alert('Başarılı', 'Görev başarıyla oluşturuldu');
      closeTaskForm();
      
      await loadTasks();
    } catch (error: any) {
      console.error('Error creating task:', error);
      Alert.alert('Hata', error.message || 'Görev oluşturulurken bir hata oluştu');
    }
  };

  const selectedEvents = tasks.map(task => ({
    id: task.id.toString(),
    date: task.scheduled_date,
    start: task.start_time || '00:00',
    end: task.end_time || '23:59',
    title: task.title,
    status: task.status,
  }));

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
    loadTasks(true);
  };

  const goBack = () => {
    router.back();
  };

  if (loading && tasks.length === 0) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#4B297E" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TopQuarterCircle style={styles.TopQuarterCircle} />
      <View style={styles.headerWrap}>
        {userId && (
          <Pressable onPress={goBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </Pressable>
        )}

        <Pressable onPress={openProfile} style={styles.avatarsContainer}>
          <View style={[styles.avatarWrap, styles.avatarLeft]}>
            <Avatar.Image size={50} source={supportRequiredIndividual.avatar} />
          </View>

          <View style={[styles.avatarWrap, styles.avatarRight]}>
            <Avatar.Image size={50} source={responsiblePerson.avatar} />
          </View>
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

      <FlatList
        data={selectedEvents}
        keyExtractor={(i) => i.id}
        contentContainerStyle={styles.listContent}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={() => (
          <Text style={styles.empty}>
            {loading ? 'Yükleniyor...' : 'Seçili günde görev yok'}
          </Text>
        )}
        renderItem={({ item }) => (
          <Card 
            startTime={item.start}
            endTime={item.end}
            title={item.title}
          />
        )}
      />
      <View style={styles.PlusButton}>
        <PlusButton style={styles.PlusButton} onPress={openTaskForm} />
      </View>
      <TaskForm
        visible={taskFormVisible}
        onClose={closeTaskForm}
        onSubmit={handleTaskSubmit}
        selectedAnim={selectedAnim}
        showUserSelection={false}
      />
      <BottomQuarterCircle style={styles.BottomQuarterCircle} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', position: 'relative' },
  centerContent: { justifyContent: 'center', alignItems: 'center' },
  backButton: {
    position: 'absolute',
    left: -60,
    top: 5,
    zIndex: 21,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 32,
    color: '#4B297E',
  },
  avatarsContainer: {
    position: 'absolute',
    right: -50,
    top: -20,
    zIndex: 20,
    flexDirection: 'row',
    alignItems: 'center',
    height: 70,
  },
  avatarWrap: {
    backgroundColor: '#fff',
    borderRadius: 30,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    borderWidth: 2,
    borderColor: '#fff',
  },
  avatarLeft: {
    zIndex: 2,
    marginRight: -10,
    marginTop: 20,
  },
  avatarRight: {
    zIndex: 3,
    marginTop: -20,
    marginLeft: -10,
  },
  headerWrap: { paddingTop: 12, paddingHorizontal: 16, alignItems: 'center', marginTop: 24, position: 'relative', left: -80, bottom: -50 },
  title: { fontFamily: 'Roboto', fontSize: 35, fontWeight: '700', textTransform: 'uppercase' },
  monthText: { color: '#4B297E' },
  yearText: { color: '#474463' },
  listContent: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 60, marginTop: 150 },
  empty: { textAlign: 'center', color: '#888', marginTop: 20 },
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