import BottomQuarterCircle from '@/components/BottomQuarterCircle';
import TopQuarterCircle from '@/components/TopQuarterCircle';
import authService from '@/services/authService';
import taskService, { Task } from '@/services/taskService'; // ✅ Task import
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const PRIMARY = '#2F3C7E';
const ACCENT = '#BFC3DB';

export default function SupportRequiredTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [playingTaskId, setPlayingTaskId] = useState<number | null>(null);

  useEffect(() => {
    loadCurrentUser();
    loadTasks();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const user = await authService.getCurrentUser();
      setCurrentUser(user);
    } catch (error) {
      console.error('❌ Current user yükleme hatası:', error);
    }
  };

  const loadTasks = async () => {
    try {
      setLoading(true);
      console.log('📥 Görevler yükleniyor...');

      const today = new Date().toISOString().split('T')[0];
      const response = await taskService.getTasks({ date: today });

      console.log('✅ Görevler yüklendi:', response);
      setTasks(response.results || []);
    } catch (error) {
      console.error('❌ Görev yükleme hatası:', error);
      Alert.alert('Hata', 'Görevler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleTaskPress = (task: Task) => {
    console.log('📋 Görev detayına gidiliyor:', task.title);
    router.push({
      pathname: '/SupportRequiredIndividuals/SupportedRequiredTaskDetail',
      params: { taskId: task.id },
    });
  };

  const playTaskTitle = async (taskTitle: string, taskId: number) => {
    try {
      if (playingTaskId === taskId) {
        Speech.stop();
        setPlayingTaskId(null);
        return;
      }

      Speech.stop();
      console.log('🔊 Text-to-Speech başlatılıyor:', taskTitle);
      setPlayingTaskId(taskId);

      Speech.speak(taskTitle, {
        language: 'tr-TR',
        pitch: 1.0,
        rate: 0.9,
        onDone: () => {
          setPlayingTaskId(null);
        },
        onError: (error: any) => {
          console.error('❌ TTS hatası:', error);
          setPlayingTaskId(null);
        },
      });

    } catch (error) {
      console.error('❌ Ses çalma hatası:', error);
      Alert.alert('Hata', 'Ses oynatılamadı');
      setPlayingTaskId(null);
    }
  };

  const getTaskIcon = (task: Task) => {
    const title = task.title.toLowerCase();
    
    if (title.includes('diş') || title.includes('fırça')) {
      return { name: 'tooth', color: '#4ECDC4' };
    } else if (title.includes('kitap') || title.includes('oku')) {
      return { name: 'book-open-page-variant', color: '#FF6B6B' };
    } else if (title.includes('ders') || title.includes('çalış')) {
      return { name: 'school', color: '#95E1D3' };
    } else if (title.includes('yemek') || title.includes('ye')) {
      return { name: 'food-apple', color: '#F38181' };
    } else if (title.includes('uyku') || title.includes('uyu')) {
      return { name: 'sleep', color: '#A8E6CF' };
    } else if (title.includes('spor') || title.includes('egzersiz')) {
      return { name: 'run', color: '#FFD93D' };
    } else if (title.includes('temiz') || title.includes('banyo')) {
      return { name: 'shower', color: '#6BCB77' };
    }
    
    return { name: 'checkbox-marked-circle-outline', color: PRIMARY };
  };

  const getInitials = (name: string) => {
    if (!name) return '?';
    const names = name.trim().split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return name[0].toUpperCase();
  };

  const renderTaskCard = (task: Task) => {
    const isPlaying = playingTaskId === task.id;
    const iconData = getTaskIcon(task);

    return (
      <Pressable 
        key={task.id}
        style={styles.taskCard}
        onPress={() => handleTaskPress(task)}
      >
        <View style={[styles.taskIconContainer, { backgroundColor: iconData.color + '20' }]}>
          {task.lottie_animation ? (
            <Image 
              source={{ uri: task.lottie_animation }} 
              style={styles.taskIcon}
              resizeMode="contain"
            />
          ) : (
            <MaterialCommunityIcons 
              name={iconData.name as any} 
              size={40} 
              color={iconData.color} 
            />
          )}
        </View>

        <View style={styles.taskInfo}>
          <Text style={styles.taskTitle}>{task.title}</Text>
        </View>

        <Pressable 
          style={styles.audioButton}
          onPress={() => playTaskTitle(task.title, task.id)}
        >
          <Ionicons 
            name={isPlaying ? "stop-circle" : "volume-high"} 
            size={28} 
            color={PRIMARY} 
          />
        </Pressable>
      </Pressable>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={PRIMARY} />
        <Text style={styles.loadingText}>Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Top Circle */}
      <TopQuarterCircle style={styles.topCircle} />

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* User Profile Header */}
        <View style={styles.profileHeader}>
          {currentUser?.profile_picture ? (
            <Image 
              source={{ uri: currentUser.profile_picture }} 
              style={styles.profileImage}
            />
          ) : (
            <View style={styles.profilePlaceholder}>
              <Text style={styles.profileInitials}>
                {getInitials(currentUser?.full_name || 'U')}
              </Text>
            </View>
          )}
          <Text style={styles.userName}>
            {currentUser?.full_name?.split(' ')[0] || 'Zehra'}
          </Text>
        </View>

        {/* Tasks List */}
        <View style={styles.tasksContainer}>
          {tasks.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="clipboard-text-outline" size={80} color="#DDD" />
              <Text style={styles.emptyText}>Bugün için görev yok</Text>
              <Text style={styles.emptySubtext}>
                Görevleriniz burada görünecek
              </Text>
            </View>
          ) : (
            tasks.map((task) => renderTaskCard(task))
          )}
        </View>
      </ScrollView>

      {/* Bottom Circle */}
      <BottomQuarterCircle style={styles.bottomCircle} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: PRIMARY,
  },
  topCircle: {
    position: 'absolute',
    left: -80,
    top: -80,
    zIndex: 0,
  },
  bottomCircle: {
    position: 'absolute',
    right: -80,
    bottom: -80,
    zIndex: 0,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  profileHeader: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 32,
    zIndex: 10,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
    borderWidth: 3,
    borderColor: '#fff',
  },
  profilePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 3,
    borderColor: '#fff',
  },
  profileInitials: {
    fontSize: 36,
    fontWeight: '700',
    color: PRIMARY,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: PRIMARY,
  },
  tasksContainer: {
    paddingHorizontal: 24,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  taskIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  taskIcon: {
    width: 60,
    height: 60,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: PRIMARY,
  },
  audioButton: {
    padding: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 80,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    textAlign: 'center',
    color: '#ccc',
    fontSize: 14,
  },
});