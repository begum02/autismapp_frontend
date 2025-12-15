import BottomQuarterCircle from '@/components/BottomQuarterCircle';
import TopQuarterCircle from '@/components/TopQuarterCircle';
import authService from '@/services/authService';
import { Ionicons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { 
  ActivityIndicator, 
  Alert, 
  Image, 
  SafeAreaView, 
  ScrollView, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View 
} from 'react-native';
import * as Progress from 'react-native-progress';


dayjs.extend(relativeTime);
dayjs.locale('tr');

const PRIMARY = '#2F3C7E';
const ACCENT = '#BFC3DB';

export default function Profile() {
  const [tab, setTab] = useState<'personal' | 'stats'>('personal');
  const [loading, setLoading] = useState(true);
  
  // User data
  const [userId, setUserId] = useState<number | null>(null);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [dateJoined, setDateJoined] = useState('');

  // ✅ Load user data on mount
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      console.log('📥 User data yükleniyor...');
      
      const user = await authService.getCurrentUser();
      
      if (!user) {
        await authService.logout();
        Alert.alert('Hata', 'Kullanıcı bilgisi bulunamadı. Lütfen tekrar giriş yapın.');
        router.replace('/RoleSelection');
        return;
      }

      console.log('✅ User data yüklendi:', user);

      setUserId(user.id);
      setUsername(user.username);
      setEmail(user.email);
      setFullName(user.full_name);
      setProfilePicture(user.profile_picture);
      setDateJoined(user.date_joined);

    } catch (error) {
      console.error('❌ User data yükleme hatası:', error);
      Alert.alert('Hata', 'Kullanıcı bilgileri yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Çıkış Yap',
      'Çıkış yapmak istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Çıkış',
          style: 'destructive',
          onPress: async () => {
            try {
              const user = await authService.getCurrentUser();
              await authService.logout();
              
              if (user) {
                switch (user.role) {
                  case 'responsible_person':
                    router.replace('/parent/ResponsiblePersonLogin');
                    break;
                  case 'individual':
                  case 'support_required_individual':
                    router.replace('/individual/IndividualLogin');
                    break;
                  default:
                    router.replace('/RoleSelection');
                }
              } else {
                router.replace('/RoleSelection');
              }
            } catch (error) {
              console.error('❌ Logout hatası:', error);
              router.replace('/RoleSelection');
            }
          },
        },
      ]
    );
  };

  const openSettings = () => {
    console.log('⚙️ Settings iconuna tıklandı!');
    console.log('📍 Navigating to: /Settings');
    
    try {
      router.push('/Settings');
      console.log('✅ Navigation başarılı');
    } catch (error) {
      console.error('❌ Navigation hatası:', error);
      Alert.alert('Hata', 'Settings sayfası açılamadı');
    }
  };

  // ✅ Profil resmi veya baş harf
  const getInitials = (name: string) => {
    if (!name) return '?';
    const names = name.trim().split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return name[0].toUpperCase();
  };

  const renderAvatar = () => {
    if (profilePicture) {
      // ✅ Profil resmi varsa göster
      return (
        <View style={styles.avatarWrap}>
          <Image source={{ uri: profilePicture }} style={styles.avatar} />
        </View>
      );
    } else {
      // ✅ Profil resmi yoksa baş harfleri göster
      return (
        <View style={[styles.avatarWrap, styles.initialsWrap]}>
          <Text style={styles.initialsText}>{getInitials(fullName)}</Text>
        </View>
      );
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={PRIMARY} />
          <Text style={styles.loadingText}>Yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <TopQuarterCircle style={styles.topLeftCircle} />
      
      <View style={styles.container}>
        {/* Header with settings icon */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.settingsIcon} 
            onPress={openSettings}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="settings-outline" size={28} color={PRIMARY} />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Avatar */}
          {renderAvatar()}

          {/* Tab Buttons */}
          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tabButton, tab === 'personal' && styles.tabActive]}
              onPress={() => setTab('personal')}
            >
              <Text style={[styles.tabText, tab === 'personal' && styles.tabTextActive]}>
                Kişisel Bilgiler
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabButton, tab === 'stats' && styles.tabActive]}
              onPress={() => setTab('stats')}
            >
              <Text style={[styles.tabText, tab === 'stats' && styles.tabTextActive]}>
                Görev İstatistikleri
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tab Content */}
          {tab === 'stats' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Bugün</Text>
              <View style={styles.card}>
                <View style={styles.cardContent}>
                  <Text style={styles.taskText}>2 Görev tamamlandı</Text>
                  <Text style={styles.taskText}>1 Görev yarıda bırakıldı</Text>
                  <Text style={styles.taskText}>1 Görev devam etmekte</Text>
                </View>
                <View style={styles.progressWrapper}>
                  <Progress.Circle 
                    size={70} 
                    progress={0.45} 
                    color={PRIMARY}
                    showsText={false}
                    thickness={6}
                    unfilledColor="#E8E8E8"
                    borderWidth={0}
                  />
                  <Text style={styles.progressTextOverlay}>45%</Text>
                </View>
              </View>

              <Text style={styles.sectionTitle}>Bu Hafta</Text>
              <View style={styles.card}>
                <View style={styles.cardContent}>
                  <Text style={styles.taskText}>2 Görev tamamlandı</Text>
                  <Text style={styles.taskText}>1 Görev yarıda bırakıldı</Text>
                  <Text style={styles.taskText}>1 Görev devam etmekte</Text>
                </View>
                <View style={styles.progressWrapper}>
                  <Progress.Circle 
                    size={70} 
                    progress={0.45} 
                    showsText={false}
                    color={PRIMARY}
                    thickness={6}
                    unfilledColor="#E8E8E8"
                    borderWidth={0}
                  />
                  <Text style={styles.progressTextOverlay}>45%</Text>
                </View>
              </View>

              <Text style={styles.sectionTitle}>Bu Ay</Text>
              <View style={styles.card}>
                <View style={styles.cardContent}>
                  <Text style={styles.taskText}>2 Görev tamamlandı</Text>
                  <Text style={styles.taskText}>1 Görev yarıda bırakıldı</Text>
                  <Text style={styles.taskText}>1 Görev devam etmekte</Text>
                </View>
                <View style={styles.progressWrapper}>
                  <Progress.Circle 
                    size={70} 
                    progress={0.45} 
                    showsText={false}
                    color={PRIMARY}
                    thickness={6}
                    unfilledColor="#E8E8E8"
                    borderWidth={0}
                  />
                  <Text style={styles.progressTextOverlay}>45%</Text>
                </View>
              </View>
            </View>
          )}

          {tab === 'personal' && (
            <View style={styles.section}>
              <View style={styles.personalInfo}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoTitle}>Kullanıcı Adı:</Text>
                  <Text style={styles.infoText}>{username}</Text>
                </View>

                <View style={styles.infoItem}>
                  <Text style={styles.infoTitle}>Ad Soyad:</Text>
                  <Text style={styles.infoText}>{fullName}</Text>
                </View>
                 
                <View style={styles.infoItem}>
                  <Text style={styles.infoTitle}>Email:</Text>
                  <Text style={styles.infoText}>{email}</Text>
                </View>
          
                <View style={styles.infoItem}>
                  <Text style={styles.infoTitle}>Kayıt Tarihi:</Text>
                  <Text style={styles.infoText}>
                    {dateJoined ? dayjs(dateJoined).format('DD/MM/YYYY') : '-'}
                  </Text>
                </View>

                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                  <Text style={styles.logoutText}>Çıkış Yap</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>

        <BottomQuarterCircle style={styles.bottomRightCircle} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, position: 'relative' },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: PRIMARY,
  },

  topLeftCircle: {
    position: 'absolute',
    left: -40,
    top: 0,
    opacity: 0.95,
    zIndex: 1, // ✅ Icon'un altında kalsın
  },
  bottomRightCircle: {
    position: 'absolute',
    right: -40,
    bottom: 0,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    paddingTop: 16,
    zIndex: 10, // ✅ Üstte olsun
  },
  settingsIcon: {
    padding: 12, // ✅ 8'den 12'ye çıkar
    zIndex: 10, // ✅ Tıklanabilir olsun
  },

  content: {
    paddingTop: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    paddingBottom: 40,
  },

  avatarWrap: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    marginBottom: 24,
  },
  avatar: { 
    width: 104, 
    height: 104, 
    borderRadius: 52 
  },
  
  // ✅ Baş harf için stil
  initialsWrap: {
    backgroundColor: ACCENT,
  },
  initialsText: {
    fontSize: 42,
    fontWeight: '700',
    color: PRIMARY,
  },

  tabs: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 24,
    gap: 12,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  tabActive: {
    backgroundColor: 'transparent',
    borderBottomWidth: 3,
    borderBottomColor: PRIMARY,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  tabTextActive: {
    color: PRIMARY,
    fontWeight: '700',
  },

  section: {
    width: '100%',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: PRIMARY,
    marginBottom: 12,
    marginTop: 8,
  },

  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  cardContent: {
    flex: 1,
  },
  taskText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  progressWrapper: {
    marginLeft: 16,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    width: 70,
    height: 70,
  },
  progressTextOverlay: {
    position: 'absolute',
    fontSize: 14,
    fontWeight: '700',
    color: PRIMARY,
  },

  personalInfo: {
    width: '100%',
    paddingVertical: 12,
  },
  infoItem: {
    marginBottom: 24,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 8,
  },
  infoTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: PRIMARY,
  },
  infoText: {
    fontSize: 17,
    fontWeight: '500',
    color: '#333',
  },
  logoutButton: {
    backgroundColor: ACCENT,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 32,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
    color: PRIMARY,
  },
});