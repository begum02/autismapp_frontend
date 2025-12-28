import BottomQuarterCircle from '@/components/BottomQuarterCircle';
import TopQuarterCircle from '@/components/TopQuarterCircle';
import authService from '@/services/authService';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { 
  ActivityIndicator, 
  Alert, 
  Image, 
  SafeAreaView, 
  ScrollView, 
  StyleSheet, 
  Switch, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  View 
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const PRIMARY = '#2F3C7E';
const ACCENT = '#BFC3DB';

export default function Settings() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // User data
  const [userId, setUserId] = useState<number | null>(null);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  
  // Settings
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const avatar = profilePicture 
    ? { uri: profilePicture } 
    : require('../assets/images/icon.png');

  // ✅ Load user data on mount
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      console.log('📥 User data yükleniyor...');
      
      const user = await authService.getCurrentUser();
      
      if (!user) {
        await authService.logout(); // ✅ Token'ları temizle
        Alert.alert('Hata', 'Kullanıcı bilgisi bulunamadı. Lütfen tekrar giriş yapın.');
        router.replace('/RoleSelection'); // ✅ Role seçim ekranına yönlendir
        return;
      }

      console.log('✅ User data yüklendi:', user);

      setUserId(user.id);
      setUsername(user.username);
      setEmail(user.email);
      setFullName(user.full_name);
      setProfilePicture(user.profile_picture);

    } catch (error) {
      console.error('❌ User data yükleme hatası:', error);
      Alert.alert('Hata', 'Kullanıcı bilgileri yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!userId) {
      Alert.alert('Hata', 'Kullanıcı ID bulunamadı.');
      return;
    }

    // Validation
    if (!username.trim() || !email.trim()) { // fullName kontrolü kaldırıldı
      Alert.alert('Hata', 'Kullanıcı adı ve email zorunludur.');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert('Hata', 'Geçerli bir email adresi girin.');
      return;
    }

    setSaving(true);

    try {
      console.log('💾 Profil güncelleniyor...');
      
      // ✅ Profile update API call
      const response = await authService.updateProfile(userId, {
        username: username.trim(),
        email: email.trim().toLowerCase(),
        // full_name: fullName.trim(), // fullName gönderilmesin
      });

      console.log('✅ Profil güncellendi:', response);

      // Update local storage
      await authService.saveUser(response);

      Alert.alert('Başarılı', 'Profil bilgileri güncellendi.');

    } catch (error: any) {
      console.error('❌ Profil güncelleme hatası:', error);
      Alert.alert('Hata', error.message || 'Profil güncellenemedi.');
    } finally {
      setSaving(false);
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
              // ✅ Önce user'ı al (logout'tan önce)
              const user = await authService.getCurrentUser();
              
              await authService.logout();
              
              // ✅ Role göre yönlendirme
              if (user) {
                console.log('🚪 Logout - User role:', user.role);
                
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

  // Profil fotoğrafı seçme fonksiyonu
  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('İzin Gerekli', 'Galeriye erişim izni vermelisiniz.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selectedAsset = result.assets[0];
      if (userId) {
        try {
          const updatedUser = await authService.uploadProfilePicture(userId, selectedAsset.uri);
          setProfilePicture(updatedUser.profile_picture);
          Alert.alert('Başarılı', 'Profil fotoğrafı güncellendi.');
        } catch (e) {
          Alert.alert('Hata', 'Profil fotoğrafı yüklenemedi.');
        }
      }
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
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Title */}
          <Text style={styles.title}>Ayarlar</Text>

          {/* Avatar */}
          <TouchableOpacity onPress={pickImage} activeOpacity={0.7}>
            <View style={styles.avatarWrap}>
              <Image source={avatar} style={styles.avatar} />
            </View>
          </TouchableOpacity>

          {/* Kullanıcı Adı */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Kullanıcı Adı</Text>
            <TextInput
              style={styles.input}
              placeholder="Kullanıcı Adı"
              placeholderTextColor="#C0C0C0"
              value={username}
              onChangeText={setUsername}
              editable={!saving}
              autoCapitalize="none"
            />
          </View>

          {/* Email */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#C0C0C0"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!saving}
            />
          </View>

          {/* Bildirimler */}
          <View style={styles.switchGroup}>
            <Text style={styles.label}>Bildirimler</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#D1D1D6', true: ACCENT }}
              thumbColor={notificationsEnabled ? PRIMARY : '#F4F3F4'}
              disabled={saving}
            />
          </View>

          {/* Kaydet Button */}
          <TouchableOpacity 
            style={[styles.saveButton, saving && styles.buttonDisabled]} 
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color={PRIMARY} />
            ) : (
              <Text style={styles.saveText}>Profili Kaydet</Text>
            )}
          </TouchableOpacity>

          {/* Logout Button */}
          <TouchableOpacity 
            style={styles.logoutButton} 
            onPress={handleLogout}
            disabled={saving}
          >
            <Text style={styles.logoutText}>Çıkış Yap</Text>
          </TouchableOpacity>
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
  },
  bottomRightCircle: {
    position: 'absolute',
    right: -40,
    bottom: 0,
  },

  content: {
    paddingTop: 40,
    paddingHorizontal: 24,
    alignItems: 'center',
    paddingBottom: 60,
  },

  title: {
    fontSize: 32,
    fontWeight: '700',
    color: PRIMARY,
    marginTop: 40,
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
    marginTop: 20,
    marginBottom: 20,
  },
  avatar: { width: 104, height: 104, borderRadius: 52 },

  fieldGroup: {
    width: '100%',
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: PRIMARY,
    marginBottom: 8,
  },
  labelLink: {
    fontSize: 16,
    fontWeight: '600',
    color: PRIMARY,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: PRIMARY,
  },

  passwordToggle: {
    width: '100%',
    paddingVertical: 12,
    marginBottom: 12,
  },

  passwordButton: {
    backgroundColor: PRIMARY,
    borderRadius: 8,
    paddingVertical: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },
  passwordButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },

  switchGroup: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },

  saveButton: {
    backgroundColor: ACCENT,
    borderRadius: 12,
    paddingVertical: 14,
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },
  saveText: {
    fontSize: 16,
    fontWeight: '700',
    color: PRIMARY,
  },

  logoutButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    paddingVertical: 14,
    width: '100%',
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },

  buttonDisabled: {
    opacity: 0.5,
  },
});