import BottomQuarterCircle from '@/components/BottomQuarterCircle';
import TopQuarterCircle from '@/components/TopQuarterCircle';
import authService from '@/services/authService';
import { Ionicons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import { useLocalSearchParams, useRouter } from 'expo-router';
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

const PRIMARY = '#2F3C7E';
const ACCENT = '#BFC3DB';

export default function ViewOnlyProfile() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const userId = params.userId ? parseInt(params.userId as string) : null;

  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [dateJoined, setDateJoined] = useState('');

  useEffect(() => {
    loadUserData();
  }, [userId]);

  const loadUserData = async () => {
    try {
      console.log('📥 Kullanıcı profili yükleniyor (SADECE GÖRÜNTÜLEME - LOGOUT YOK)... User ID:', userId);
      
      if (!userId) {
        Alert.alert('Hata', 'Kullanıcı ID bulunamadı');
        router.back();
        return;
      }

      // ✅ Backend'den user bilgilerini çek
      const user = await authService.getUserById(userId);
      
      if (!user) {
        Alert.alert('Hata', 'Kullanıcı bulunamadı');
        router.back();
        return;
      }

      console.log('✅ User data yüklendi (BAŞKASININ PROFİLİ - LOGOUT YOK):', user);

      setUsername(user.username);
      setEmail(user.email);
      setFullName(user.full_name);
      setProfilePicture(user.profile_picture);
      setDateJoined(user.date_joined);

    } catch (error) {
      console.error('❌ User data yükleme hatası:', error);
      Alert.alert('Hata', 'Kullanıcı bilgileri yüklenemedi.');
      router.back();
    } finally {
      setLoading(false);
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
      return (
        <View style={styles.avatarWrap}>
          <Image source={{ uri: profilePicture }} style={styles.avatar} />
        </View>
      );
    } else {
      return (
        <View style={[styles.avatarWrap, styles.initialsWrap]}>
          <Text style={styles.initialsText}>{getInitials(fullName)}</Text>
        </View>
      );
    }
  };

  const goBack = () => {
    router.back();
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
        {/* Back Button */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={goBack}>
            <Ionicons name="chevron-back" size={28} color={PRIMARY} />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Profil Görüntüle</Text>

          {/* Avatar */}
          {renderAvatar()}

          {/* Personal Info */}
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

              {/* ❌ LOGOUT BUTONU YOK (Başkasının profili) */}
            </View>
          </View>
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
    zIndex: 1,
  },
  bottomRightCircle: {
    position: 'absolute',
    right: -40,
    bottom: 0,
    zIndex: 1,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
    zIndex: 10,
  },
  backButton: {
    padding: 8,
  },

  content: {
    paddingTop: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    paddingBottom: 40,
  },

  title: {
    fontSize: 24,
    fontWeight: '700',
    color: PRIMARY,
    alignSelf: 'flex-start',
    marginBottom: 24,
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
    marginBottom: 32,
  },
  avatar: { 
    width: 104, 
    height: 104, 
    borderRadius: 52 
  },
  initialsWrap: {
    backgroundColor: ACCENT,
  },
  initialsText: {
    fontSize: 42,
    fontWeight: '700',
    color: PRIMARY,
  },

  section: {
    width: '100%',
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
});