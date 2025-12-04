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

export default function SupportRequiredLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    // Validations
    if (!email.trim() || !password) {
      Alert.alert('Hata', 'Lütfen e-posta ve şifrenizi girin.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/users/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Login başarılı
        console.log('Login başarılı:', data.user);
        console.log('Access Token:', data.tokens.access);
        console.log('Refresh Token:', data.tokens.refresh);

        // Kullanıcı tipini kontrol et (support_required olmalı)
        if (data.user.user_type !== 'support_required') {
          Alert.alert('Hata', 'Bu giriş sadece desteğe ihtiyacı olan bireyler içindir.');
          setLoading(false);
          return;
        }

        // TODO: AsyncStorage'a token ve user bilgisi kaydet
        // await AsyncStorage.setItem('access_token', data.tokens.access);
        // await AsyncStorage.setItem('refresh_token', data.tokens.refresh);
        // await AsyncStorage.setItem('user', JSON.stringify(data.user));

        // Ana sayfaya yönlendir (support required için uygun sayfa)
        router.replace('/SupportRequiredIndividuals/SupportRequiredTasks'); // veya uygun sayfa
      } else {
        // Hata mesajlarını göster
        let errorMessage = 'Giriş başarısız.';
        if (data.detail) {
          errorMessage = data.detail;
        } else if (data.email) {
          errorMessage = data.email[0];
        } else if (data.password) {
          errorMessage = data.password[0];
        }
        Alert.alert('Hata', errorMessage);
      }
    } catch (error) {
      console.error('Login hatası:', error);
      Alert.alert('Hata', 'Bağlantı hatası. Lütfen internet bağlantınızı kontrol edin.');
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

        <Text style={styles.IndividualText}>Giriş Yap</Text>
        <Text style={styles.SubText}>Desteğe İhtiyacı Olan Birey</Text>

        <View style={styles.form}>
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
            placeholder="Şifre"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            placeholderTextColor="#999"
            textContentType="password"
            editable={!loading}
          />

          <Pressable
            style={[styles.Login, loading && styles.LoginDisabled]}
            onPress={handleLogin}
            accessibilityRole="button"
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.LoginText}>Giriş Yap</Text>
            )}
          </Pressable>

          <Pressable
            style={styles.RegisterLink}
            onPress={() => router.push('/SupportRequiredIndividuals/SupportRequiredRegister')}
            disabled={loading}
          >
            <Text style={styles.RegisterLinkText}>Hesabınız yok mu? <Text style={styles.RegisterLinkBold}>Kaydolun</Text></Text>
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
    top: 180,
    width: 200,
    height: 48,
  },
  IndividualText: {
    fontFamily: 'Poppins',
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2F3C7E',
    marginTop: 220,
    marginBottom: 4,
  },
  SubText: {
    fontFamily: 'Poppins',
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  form: {
    width: '100%',
    marginTop: 20,
    alignItems: 'center',
    gap: 10,
  },
  input: {
    width: 320,
    height: 48,
    backgroundColor: '#E6E6E6',
    borderRadius: 8,
    paddingHorizontal: 14,
    marginTop: 12,
    borderColor: '#DDD',
    fontSize: 15,
  },
  Login: {
    marginTop: 30,
    width: '80%',
    height: 48,
    backgroundColor: '#AAAFCA',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  LoginDisabled: {
    backgroundColor: '#CCC',
  },
  LoginText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Poppins',
  },
  RegisterLink: {
    marginTop: 20,
  },
  RegisterLinkText: {
    color: '#666',
    fontSize: 14,
  },
  RegisterLinkBold: {
    color: '#2F3C7E',
    fontWeight: '700',
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