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
import authService from '@/services/authService';  // ✅ Sadece bunu import et

export default function SupportRequiredRegister() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    console.log('🚀 handleRegister başladı');
    
    // Validations
    if (!email.trim() || !username.trim() || !fullName.trim() || !password || !confirmPassword) {
      Alert.alert('Hata', 'Lütfen tüm zorunlu alanları doldurun.');
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
      // ✅ Backend'deki ROLE_CHOICES ile eşleşmeli: 'support_required_individual'
      const response = await authService.register({
        email: email.trim().toLowerCase(),
        username: username.trim(),
        full_name: fullName.trim(),
        role: 'support_required_individual',  // ✅ Model'deki choice değeri
        password: password,
        password_confirm: confirmPassword,
      });

      console.log('✅ Kayıt başarılı!');
      console.log('👤 User:', response.user);

      Alert.alert(
        'Başarılı', 
        response.message || 'Kayıt işlemi başarılı!', 
        [
          { 
            text: 'Tamam', 
            onPress: () => router.push('/SupportRequiredIndividuals/SupportRequiredLogin') 
          },
        ]
      );

    } catch (error: any) {
      console.error('❌ Register hatası:', error);
      Alert.alert('Hata', error.message || 'Kayıt başarısız.');
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

        <Text style={styles.IndividualText}>Desteğe İhtiyacı Olan Birey Kaydı</Text>

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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2F3C7E',
    marginTop: 200,
    marginBottom: 8,
    textAlign: 'center',
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


