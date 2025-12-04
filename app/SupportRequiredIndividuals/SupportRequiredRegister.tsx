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

export default function SupportRequiredRegister() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState(''); // YYYY-MM-DD format
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    // Validations
    if (!email.trim() || !username.trim() || !firstName.trim() || !lastName.trim() || !password || !confirmPassword) {
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

    // Doğum tarihi formatı kontrolü (YYYY-MM-DD)
    if (dateOfBirth && !/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth)) {
      Alert.alert('Hata', 'Doğum tarihi formatı: YYYY-MM-DD (örn: 2010-05-15)');
      return;
    }

    setLoading(true);

    // Backend'e gönderilecek data
    const registerData = {
      email: email.trim(),
      username: username.trim(),
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      date_of_birth: dateOfBirth.trim() || null,
      user_type: 'support_required', // Desteğe ihtiyacı olan birey
      password: password,
      password_confirm: confirmPassword,
    };

    try {
      const response = await fetch('http://localhost:8000/api/users/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerData),
      });

      const data = await response.json();

      if (response.ok) {
        // Kayıt başarılı
        console.log('Kayıt başarılı:', data.user);
        console.log('Access Token:', data.tokens.access);
        console.log('Refresh Token:', data.tokens.refresh);

        // TODO: AsyncStorage'a token kaydet
        // await AsyncStorage.setItem('access_token', data.tokens.access);
        // await AsyncStorage.setItem('refresh_token', data.tokens.refresh);
        // await AsyncStorage.setItem('user', JSON.stringify(data.user));

        Alert.alert('Başarılı', 'Kayıt işlemi başarılı! Giriş yapabilirsiniz.', [
          { text: 'Tamam', onPress: () => router.push('/SupportRequiredIndividuals/SupportRequiredLogin') },
        ]);
      } else {
        // Hata mesajlarını göster
        let errorMessage = 'Kayıt başarısız.';
        if (data.email) {
          errorMessage = data.email[0];
        } else if (data.username) {
          errorMessage = data.username[0];
        } else if (data.password) {
          errorMessage = data.password[0];
        } else if (data.date_of_birth) {
          errorMessage = data.date_of_birth[0];
        } else if (data.detail) {
          errorMessage = data.detail;
        }
        Alert.alert('Hata', errorMessage);
      }
    } catch (error) {
      console.error('Kayıt hatası:', error);
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
            placeholder="Ad *"
            autoCapitalize="words"
            value={firstName}
            onChangeText={setFirstName}
            placeholderTextColor="#999"
            editable={!loading}
          />

          <TextInput
            style={styles.input}
            placeholder="Soyad *"
            autoCapitalize="words"
            value={lastName}
            onChangeText={setLastName}
            placeholderTextColor="#999"
            editable={!loading}
          />

          <TextInput
            style={styles.input}
            placeholder="Doğum Tarihi (YYYY-MM-DD, opsiyonel)"
            value={dateOfBirth}
            onChangeText={setDateOfBirth}
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


