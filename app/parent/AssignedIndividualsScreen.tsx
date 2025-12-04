import BottomQuarterCircle from '@/components/BottomQuarterCircle';
import TopQuarterCircle from '@/components/TopQuarterCircle';
import taskService from '@/services/taskService';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Avatar, ProgressBar } from 'react-native-paper';

interface AssignedUser {
  id: number;
  email: string;
  full_name?: string;
  avatar?: string;
  completionRate?: number;
}

export default function AssignedIndividualsScreen() {
  const [users, setUsers] = useState<AssignedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [responsiblePersonName, setResponsiblePersonName] = useState('Sarah');
  const [todayCompletedCount, setTodayCompletedCount] = useState(0);

  useEffect(() => {
    loadAssignedUsers();
    loadTodayStats();
  }, []);

  const loadTodayStats = async () => {
    try {
      const count = await taskService.getTodayCompletedCount();
      setTodayCompletedCount(count);
    } catch (error) {
      console.error('Error loading today stats:', error);
    }
  };

  const loadAssignedUsers = async (isRefreshing = false) => {
    try {
      if (isRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await taskService.getAssignableUsers();
      
      // Her kullanıcı için tamamlanma oranını hesapla
      const usersWithStats = await Promise.all(
        (response.results || response).map(async (user: any) => {
          try {
            const stats = await taskService.getUserStatistics(user.id);
            return {
              ...user,
              completionRate: stats.completion_rate || 0,
            };
          } catch {
            return {
              ...user,
              completionRate: 0,
            };
          }
        })
      );

      setUsers(usersWithStats);
    } catch (error: any) {
      console.error('Error loading users:', error);
      Alert.alert('Hata', 'Kullanıcılar yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleUserPress = (user: AssignedUser) => {
    router.push({
      pathname: '/parent/ResponsiblePersonFollowUp',
      params: { 
        userId: user.id, 
        userName: user.full_name || user.email,
        userAvatar: user.avatar || '',
      },
    });
  };

  const handleAddPerson = () => {
    // Yeni kişi ekleme ekranına git
    router.push('/parent/AddPersonScreen');
  };

  const renderUserCard = ({ item }: { item: AssignedUser }) => (
    <Pressable 
      style={styles.userCard}
      onPress={() => handleUserPress(item)}
    >
      <Avatar.Image 
        size={60} 
        source={
          item.avatar 
            ? { uri: item.avatar } 
            : require('../../assets/images/icon.png')
        }
      />
      <View style={styles.userInfo}>
        <Text style={styles.userNameText}>{item.full_name || item.email}</Text>
        <Text style={styles.completionText}>
          {Math.round(item.completionRate || 0)}% completed
        </Text>
        <ProgressBar 
          progress={(item.completionRate || 0) / 100} 
          color="#4B297E"
          style={styles.progressBar}
        />
      </View>
    </Pressable>
  );

  if (loading && users.length === 0) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#4B297E" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TopQuarterCircle style={styles.topCircle} />
      
      <View style={styles.header}>
        <Text style={styles.greeting}>
          Merhaba <Text style={styles.userName}>{responsiblePersonName}</Text>
        </Text>
        <Text style={styles.subtitle}>
          Bugün <Text style={styles.taskCount}>{todayCompletedCount}</Text> Görev Tamamlandı
        </Text>
      </View>

      <FlatList
        data={users}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderUserCard}
        contentContainerStyle={styles.listContent}
        refreshing={refreshing}
        onRefresh={() => loadAssignedUsers(true)}
        ListEmptyComponent={() => (
          <Text style={styles.emptyText}>Henüz atanmış birey yok</Text>
        )}
      />

      <Pressable style={styles.addButton} onPress={handleAddPerson}>
        <Text style={styles.addButtonText}>Add Person</Text>
      </Pressable>

      <BottomQuarterCircle style={styles.bottomCircle} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  topCircle: {
    position: 'absolute',
    left: -40,
    top: 0,
  },
  bottomCircle: {
    position: 'absolute',
    right: -40,
    bottom: 0,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  userName: {
    color: '#E8B86D',
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
  },
  taskCount: {
    color: '#4B297E',
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  userInfo: {
    flex: 1,
    marginLeft: 16,
  },
  userNameText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  completionText: {
    fontSize: 14,
    color: '#999',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#f0f0f0',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 16,
    marginTop: 40,
  },
  addButton: {
    position: 'absolute',
    bottom: 40,
    right: 24,
    backgroundColor: '#9B9AB8',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});