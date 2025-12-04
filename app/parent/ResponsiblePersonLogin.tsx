import BottomQuarterCircle from "@/components/BottomQuarterCircle";
import TopQuarterCircle from "@/components/TopQuarterCircle";
import { useRouter } from 'expo-router';
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
} from 'react-native';

export default function IndividualLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleLogin = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/users/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        // Login başarılı
        console.log('User:', data.user);
        console.log('Access Token:', data.tokens.access);
        console.log('Refresh Token:', data.tokens.refresh);
        
        // AsyncStorage'a token kaydet (react-native-async-storage kullanarak)
        // await AsyncStorage.setItem('access_token', data.tokens.access);
        // await AsyncStorage.setItem('refresh_token', data.tokens.refresh);
        
        // Navigate to home
        router.push('/parent/ResponsiblePersonFollowUp');
      } else {
        Alert.alert('Hata', data.detail || 'Giriş başarısız');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Hata', 'Bağlantı hatası');
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

        <Text style={styles.IndividualText}>Bireysel Giriş Yap</Text>

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
          />

          <TextInput
            style={styles.input}
            placeholder="Şifre"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            placeholderTextColor="#999"
            textContentType="password"
          />

       

          <Pressable style={styles.Register} onPress={handleLogin} accessibilityRole="button">
            <Text style={styles.RegisterText}>Giriş Yap</Text>
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
     position:'relative',
    top:160,
    width: 200,
    height:48
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
    gap:10,
  },
  input: {
    width:320,
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
     backButton:{
    zIndex:10,
    width:60,
    height:60,
    position: "absolute",
    left:20,
    top:40
  },
  backIcon:{
    width:'100%',
    height:'100%'
  }
});


