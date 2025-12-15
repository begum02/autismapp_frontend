import BottomQuarterCircle from "@/components/BottomQuarterCircle";
import TopQuarterCircle from "@/components/TopQuarterCircle";
import { router } from "expo-router";
import React, { useState } from 'react';
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
    ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import authService from '@/services/authService';

export default function ResponsiblePersonRegister() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'parent' | 'teacher' | 'caregiver'>('parent');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    // Validations
    if (!username.trim() || !email.trim() || !fullName.trim() || !password || !confirmPassword) {
      Alert.alert('Hata', 'Lütfen tüm zorunlu alanları doldurun.');
      return;
    }

    // Email format kontrolü
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert('Hata', 'Lütfen geçerli bir email adresi girin.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Hata', 'Şifreler eşleşmiyor.');
      return;
    }
    
    if (password.length < 8) {
      Alert.alert('Hata', 'Şifre en az 8 karakter olmalıdır.');
      return;
    }

    setLoading(true);

    try {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📝 SORUMLU KİŞİ KAYDI BAŞLATILIYOR');
      console.log('👤 Username:', username.trim());
      console.log('📧 Email:', email.trim());
      console.log('👤 Full Name:', fullName.trim());
      console.log('🎭 Role:', role);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      // ✅ authService kullan
      const registerData = {
        email: email.trim().toLowerCase(),
        username: username.trim(),
        full_name: fullName.trim(),
        role: 'responsible_person',
        password: password,
        password_confirm: confirmPassword,
      };

      console.log('📦 Register data:', JSON.stringify(registerData, null, 2));

      const response = await authService.register(registerData);

      console.log('✅ Kayıt başarılı!');
      console.log('👤 User:', response.user);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      Alert.alert(
        'Başarılı', 
        'Kayıt işlemi başarılı! Ana sayfaya yönlendiriliyorsunuz.',
        [
          { 
            text: 'Tamam', 
            onPress: () => {
              router.replace('/parent/ResponsiblePersonFollowUp');
            }
          },
        ]
      );

    } catch (error: any) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('❌ KAYIT HATASI');
      console.error('❌ Error:', error);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      const errorMessage = error.message || 'Kayıt başarısız. Lütfen tekrar deneyin.';
      Alert.alert('Hata', errorMessage);

    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <TopQuarterCircle style={styles.TopQuarterCircle} />
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
          accessibilityLabel="Geri Dön"
          accessibilityRole="button"
        >
          <Image
            source={require('../../assets/images/chevron_backward.png')}
            style={styles.backIcon}
            resizeMode="contain"
          />
        </Pressable>
        <Image source={require('../../assets/images/logoindividual.png')} style={styles.LogoStyle} />

        <Text style={styles.IndividualText}>Sorumlu Kişi Kaydı</Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Kullanıcı adı *"
            autoCapitalize="none"
            value={username}
            onChangeText={setUsername}
            placeholderTextColor="#999"
            editable={!loading}
          />

          <TextInput
            style={styles.input}
            placeholder="E-posta *"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            value={email}
            onChangeText={setEmail}
            placeholderTextColor="#999"
            textContentType="emailAddress"
            editable={!loading}
          />

          <TextInput
            style={styles.input}
            placeholder="Ad Soyad *"
            autoCapitalize="words"
            value={fullName}
            onChangeText={setFullName}
            placeholderTextColor="#999"
            editable={!loading}
          />

          <TextInput
            style={styles.input}
            placeholder="Şifre (min 8 karakter) *"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            placeholderTextColor="#999"
            textContentType="password"
            editable={!loading}
          />

          <TextInput
            style={styles.input}
            placeholder="Şifreyi tekrar girin *"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholderTextColor="#999"
            textContentType="password"
            editable={!loading}
          />

          {/* Role Dropdown */}
          <View style={styles.pickerWrapper}>
            <Text style={styles.pickerLabel}>Rolünüz *</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={role}
                onValueChange={(itemValue) => setRole(itemValue)}
                style={styles.picker}
                dropdownIconColor="#2F3C7E"
                enabled={!loading}
              >
                <Picker.Item label="Ebeveyn" value="parent" />
                <Picker.Item label="Öğretmen" value="teacher" />
                <Picker.Item label="Bakıcı" value="caregiver" />
              </Picker>
            </View>
          </View>

          <Pressable
            style={[styles.Register, loading && styles.RegisterDisabled]}
            onPress={handleRegister}
            accessibilityRole="button"
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.RegisterText}>Kaydol</Text>
            )}
          </Pressable>
        </View>

        <BottomQuarterCircle style={styles.BottomQuarterCircle} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  TopQuarterCircle: {
    position: 'absolute',
    left: -40,
    top: 0,
  },
  LogoStyle: {
    position: 'relative',
    top: 160,
    width: 200,
    height: 48,
  },
  IndividualText: {
    fontFamily: 'Poppins',
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2F3C7E',
    marginTop: 200,
    marginBottom: 8,
  },
  form: {
    width: '100%',
    marginTop: 20,
    alignItems: 'center',
    gap: 10,
  },
  input: {
    width: 320,
    height: 42,
    backgroundColor: '#E6E6E6',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginTop: 12,
    borderColor: '#DDD',
  },
  pickerWrapper: {
    width: 320,
    marginTop: 12,
  },
  pickerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2F3C7E',
    marginBottom: 6,
  },
  pickerContainer: {
    backgroundColor: '#E6E6E6',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDD',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
    color: '#333',
  },
  Register: {
    marginTop: 40,
    width: '80%',
    height: 44,
    backgroundColor: '#AAAFCA',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  RegisterDisabled: {
    backgroundColor: '#CCC',
  },
  RegisterText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Poppins',
  },
  BottomQuarterCircle: {
    position: 'absolute',
    right: -40,
    bottom: 0,
  },
  backButton: {
    zIndex: 10,
    width: 60,
    height: 60,
    position: 'absolute',
    left: 20,
    top: 40,
  },
  backIcon: {
    width: '100%',
    height: '100%',
  },
});


