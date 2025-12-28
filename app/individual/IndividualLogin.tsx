import BottomQuarterCircle from "@/components/BottomQuarterCircle";
import TopQuarterCircle from "@/components/TopQuarterCircle";
import authService from "@/services/authService";
import { useRouter } from 'expo-router';
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

export default function IndividualLogin() {
  const router = useRouter();
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    // Validasyon
    if (!emailOrUsername.trim()) {
      Alert.alert('Hata', 'Lütfen kullanıcı adı veya e-posta girin.');
      return;
    }

    if (!password) {
      Alert.alert('Hata', 'Lütfen şifre girin.');
      return;
    }

    setLoading(true);

    try {
      console.log('🔐 Login başlatılıyor...', emailOrUsername.trim());
      
      const response = await authService.login({
        email_or_username: emailOrUsername.trim(),
        password: password,
      });

      console.log('✅ Login başarılı:', response.user);

      // Kullanıcı tipini kontrol et - individual olmalı
      if (response.user.role !== 'individual') {
        Alert.alert(
          'Hata', 
          'Bu hesap bireysel kullanıcı hesabı değil. Lütfen doğru giriş sayfasını kullanın.'
        );
        await authService.logout();
        setLoading(false);
        return;
      }

      Alert.alert(
        'Başarılı',
        `Hoş geldiniz ${response.user.full_name}!`,
        [
          {
            text: 'Tamam',
            onPress: () => {
              console.log('🏠 Ana sayfaya yönlendiriliyor...');
              router.replace('/individual/IndividualFollowUp');
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('❌ Login hatası:', error);
      Alert.alert(
        'Giriş Hatası', 
        error.message || 'Kullanıcı adı/e-posta veya şifre hatalı.'
      );
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
      <ScrollView 
        contentContainerStyle={styles.container} 
        keyboardShouldPersistTaps="handled"
      >
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

        <Image 
          source={require('../../assets/images/logoindividual.png')} 
          style={styles.LogoStyle} 
        />

        <Text style={styles.IndividualText}>Bireysel Giriş Yap</Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Kullanıcı adı veya E-posta"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            value={emailOrUsername}
            onChangeText={setEmailOrUsername}
            placeholderTextColor="#999"
            editable={!loading}
            returnKeyType="next"
          />

          <TextInput
            style={styles.input}
            placeholder="Şifre"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            placeholderTextColor="#999"
            textContentType="password"
            editable={!loading}
            returnKeyType="done"
            onSubmitEditing={handleLogin}
          />

          <Pressable
            style={[styles.Register, loading && styles.RegisterDisabled]}
            onPress={handleLogin}
            accessibilityRole="button"
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.RegisterText}>Giriş Yap</Text>
            )}
          </Pressable>

          <Pressable
            style={styles.forgotPassword}
            onPress={() => router.push('/ForgotPassword')}
            disabled={loading}
          >
            <Text style={styles.forgotPasswordText}>Şifremi Unuttum</Text>
          </Pressable>

          <View style={styles.registerLink}>
            <Text style={styles.registerLinkText}>Hesabınız yok mu? </Text>
            <Pressable
              onPress={() => router.push('/individual/IndividualRegister')}
              disabled={loading}
            >
              <Text style={styles.registerLinkButton}>Kayıt Ol</Text>
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
  forgotPassword: {
    marginTop: 15,
  },
  forgotPasswordText: {
    color: '#2F3C7E',
    fontSize: 14,
    fontFamily: 'Poppins',
  },
  registerLink: {
    flexDirection: 'row',
    marginTop: 20,
  },
  registerLinkText: {
    color: '#666',
    fontSize: 14,
    fontFamily: 'Poppins',
  },
  registerLinkButton: {
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


