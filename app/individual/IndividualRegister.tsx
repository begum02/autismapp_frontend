import BottomQuarterCircle from "@/components/BottomQuarterCircle";
import TopQuarterCircle from "@/components/TopQuarterCircle";
import authService from "@/services/authService";
import { router } from "expo-router";
import React, { useState } from 'react';
import {
  ActivityIndicator,
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
} from 'react-native';

export default function IndividualRegister() {
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    // Validasyon
    if (!username.trim() || !fullName.trim() || !email.trim() || !password || !confirmPassword) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
      return;
    }

    // Kullanıcı adı validasyonu (sadece harf, rakam ve alt çizgi)
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(username)) {
      Alert.alert('Hata', 'Kullanıcı adı 3-20 karakter olmalı ve sadece harf, rakam ve alt çizgi içerebilir.');
      return;
    }

    // Email validasyonu
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Hata', 'Geçerli bir e-posta adresi girin.');
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
      await authService.register({
        username: username.trim().toLowerCase(),
        email: email.trim().toLowerCase(),
        password: password,
        password_confirm: confirmPassword,
        full_name: fullName.trim(),
        role: 'support_required_individual',
      });

      Alert.alert(
        'Başarılı',
        'Kayıt işlemi başarılı! Giriş yapabilirsiniz.',
        [
          {
            text: 'Tamam',
            onPress: () => router.push('/individual/IndividualLogin'),
          },
        ]
      );
    } catch (error: any) {
      console.error('Kayıt hatası:', error);
      Alert.alert('Kayıt Hatası', error.message || 'Bir hata oluştu. Lütfen tekrar deneyin.');
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

        <Text style={styles.IndividualText}>Bireysel Kayıt Oluştur</Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Kullanıcı Adı"
            autoCapitalize="none"
            autoComplete="username"
            value={username}
            onChangeText={setUsername}
            placeholderTextColor="#999"
            editable={!loading}
            maxLength={20}
          />

          <TextInput
            style={styles.input}
            placeholder="Ad Soyad"
            autoCapitalize="words"
            autoComplete="name"
            value={fullName}
            onChangeText={setFullName}
            placeholderTextColor="#999"
            editable={!loading}
          />

          <TextInput
            style={styles.input}
            placeholder="E-posta"
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
            placeholder="Şifre (min. 8 karakter)"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            placeholderTextColor="#999"
            textContentType="newPassword"
            editable={!loading}
          />

          <TextInput
            style={styles.input}
            placeholder="Şifreyi tekrar girin"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholderTextColor="#999"
            textContentType="newPassword"
            editable={!loading}
          />

          <Pressable
            style={[styles.Register, loading && styles.RegisterDisabled]}
            onPress={handleRegister}
            accessibilityRole="button"
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.RegisterText}>Kaydol</Text>
            )}
          </Pressable>

          <View style={styles.loginLink}>
            <Text style={styles.loginLinkText}>Zaten hesabınız var mı? </Text>
            <Pressable
              onPress={() => router.push('/individual/IndividualLogin')}
              disabled={loading}
            >
              <Text style={styles.loginLinkButton}>Giriş Yap</Text>
            </Pressable>
          </View>
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
    top: 120,
    width: 200,
    height: 48,
  },
  IndividualText: {
    fontFamily: 'Poppins',
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2F3C7E',
    marginTop: 160,
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
  Register: {
    marginTop: 30,
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
  loginLink: {
    flexDirection: 'row',
    marginTop: 15,
  },
  loginLinkText: {
    color: '#666',
    fontSize: 14,
    fontFamily: 'Poppins',
  },
  loginLinkButton: {
    color: '#2F3C7E',
    fontSize: 14,
    fontWeight: 'bold',
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


