import BottomQuarterCircle from '@/components/BottomQuarterCircle';
import TopQuarterCircle from '@/components/TopQuarterCircle';
import authService from '@/services/authService';
import taskService from '@/services/taskService';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Avatar, ProgressBar } from 'react-native-paper';

const PRIMARY = '#2F3C7E';
const ACCENT = '#BFC3DB';
const GOLD = '#E8B86D';

interface AssignedUser {
  id: number;
  email: string;
  username: string;
  full_name: string;
  profile_picture: string | null;
  role: string;
  completionRate?: number;
}

export default function AssignedIndividualsScreen() {
  const [users, setUsers] = useState<AssignedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [responsiblePerson, setResponsiblePerson] = useState<any>(null);
  const [todayCompletedCount, setTodayCompletedCount] = useState(0);

  useEffect(() => {
    loadCurrentUser();
    loadAssignedUsers();
    loadTodayStats();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const user = await authService.getCurrentUser();
      setResponsiblePerson(user);
    } catch (error) {
      console.error('❌ Current user yükleme hatası:', error);
    }
  };

  const loadTodayStats = async () => {
    try {
      const count = await taskService.getTodayCompletedCount();
      setTodayCompletedCount(count);
    } catch (error) {
      console.error('❌ Today stats yükleme hatası:', error);
    }
  };

  const loadAssignedUsers = async (isRefreshing = false) => {
    try {
      if (isRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      console.log('📥 Assigned users yükleniyor...');

      const response = await taskService.getAssignableUsers();
      
      console.log('✅ Assignable users:', response);

      const usersWithStats = await Promise.all(
        (response.results || []).map(async (user: any) => {
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
      console.error('❌ Users yükleme hatası:', error);
      Alert.alert('Hata', 'Kullanıcılar yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleUserPress = (user: AssignedUser) => {
    console.log('👤 Kullanıcıya tıklandı:', user);
    router.push({
      pathname: '/parent/ResponsiblePersonFollowUp',
      params: { 
        supportRequiredUserId: user.id,
        supportRequiredUserName: user.full_name,
        supportRequiredUserAvatar: user.profile_picture || '',
        supportRequiredUserEmail: user.email,
      },
    });
  };

  const handleAddPerson = () => {
    console.log('➕ Kişi ekleme sayfasına gidiliyor...');
    router.push('/parent/AddPersonForm');
  };

  const getInitials = (name: string) => {
    if (!name) return '?';
    const names = name.trim().split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return name[0].toUpperCase();
  };

  const renderUserCard = ({ item }: { item: AssignedUser }) => (
    <Pressable 
      style={styles.userCard}
      onPress={() => handleUserPress(item)}
    >
      {/* Avatar */}
      <View style={styles.avatarContainer}>
        {item.profile_picture ? (
          <Image 
            source={{ uri: item.profile_picture }} 
            style={styles.avatar}
          />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarInitials}>
              {getInitials(item.full_name)}
            </Text>
          </View>
        )}
      </View>

      {/* User Info */}
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.full_name}</Text>
        <Text style={styles.completionText}>
          {Math.round(item.completionRate || 0)}% completed
        </Text>
        <ProgressBar 
          progress={(item.completionRate || 0) / 100} 
          color={PRIMARY}
          style={styles.progressBar}
        />
      </View>
    </Pressable>
  );

  if (loading && users.length === 0) {
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

      {/* Header with Profile Picture */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>
            Merhaba <Text style={styles.responsibleName}>
              {responsiblePerson?.full_name?.split(' ')[0] || 'Sarah'}
            </Text>
          </Text>
          <Text style={styles.subtitle}>
            Bugün <Text style={styles.taskCount}>{todayCompletedCount}</Text> Görev Tamamlandı
          </Text>
        </View>

        {/* Responsible Person Avatar (Sağ Üst) */}
        <Pressable style={styles.responsibleAvatarContainer}>
          {responsiblePerson?.profile_picture ? (
            <Image 
              source={{ uri: responsiblePerson.profile_picture }} 
              style={styles.responsibleImage}
            />
          ) : (
            <View style={styles.responsiblePlaceholder}>
              <Text style={styles.responsibleInitials}>
                {getInitials(responsiblePerson?.full_name || 'U')}
              </Text>
            </View>
          )}
        </Pressable>
      </View>

      {/* User Cards List */}
      <FlatList
        data={users}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderUserCard}
        contentContainerStyle={styles.listContent}
        refreshing={refreshing}
        onRefresh={() => loadAssignedUsers(true)}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={80} color="#DDD" />
            <Text style={styles.emptyText}>Henüz atanmış birey yok</Text>
            <Text style={styles.emptySubtext}>
              "Add Person" butonuna tıklayarak yeni birey ekleyin
            </Text>
          </View>
        )}
      />

      {/* Add Person Button */}
      <Pressable style={styles.addButton} onPress={handleAddPerson}>
        <Ionicons name="person-add" size={20} color="#fff" />
        <Text style={styles.addButtonText}>Add Person</Text>
      </Pressable>

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
    left: -40,
    top: 0,
    zIndex: 0,
  },
  bottomCircle: {
    position: 'absolute',
    right: -40,
    bottom: 0,
    zIndex: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 32,
    marginTop:30,
    zIndex: 10,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: PRIMARY,
    marginBottom: 8,
  },
  responsibleName: {
    color: GOLD,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  taskCount: {
    color: PRIMARY,
    fontWeight: '700',
    fontSize: 18,
  },
  responsibleAvatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  responsibleImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  responsiblePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  responsibleInitials: {
    fontSize: 20,
    fontWeight: '700',
    color: PRIMARY,
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 120,
  },
  userCard: {
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
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: 22,
    fontWeight: '700',
    color: PRIMARY,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: PRIMARY,
    marginBottom: 6,
  },
  completionText: {
    fontSize: 14,
    color: '#999',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E8E8E8',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
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
    paddingHorizontal: 40,
  },
  addButton: {
    position: 'absolute',
    bottom: 32,
    right: 24,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor:ACCENT,
    borderRadius: 30,
    paddingVertical: 14,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 100,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});