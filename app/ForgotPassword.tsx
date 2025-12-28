import BottomQuarterCircle from '@/components/BottomQuarterCircle';
import TopQuarterCircle from '@/components/TopQuarterCircle';
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { useRouter } from 'expo-router';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const router = useRouter();

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
        <TopQuarterCircle style={styles.topCircle} />

        {/* Chevron Back Butonu */}
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
          accessibilityLabel="Geri Dön"
          accessibilityRole="button"
        >
          <Image
            source={require('../assets/images/chevron_backward.png')}
            style={styles.backIcon}
            resizeMode="contain"
          />
        </Pressable>

        <Image source={require('../assets/images/logoindividual.png')} style={styles.LogoStyle} />

        <Text style={styles.title}>Şifre Sıfırlama</Text>
        <Text style={styles.subtitle}>
          Şifrenizi sıfırlamak için hesabınıza bağlı email adresini girin.
        </Text>

        <View style={styles.form}>
          <TextInput
            placeholder="Email adresi"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#999"
          />
          <Text style={styles.inputHint}>Lütfen kayıtlı e-posta adresinizi girin</Text>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Şifre sıfırlama bağlantısını gönder</Text>
          </TouchableOpacity>
        </View>
         <Pressable
          onPress={() => router.push('/CodeVerificationScreen')}
          style={styles.codeButton}
        >
          <Text style={styles.codeButtonText}>
            Kod Doğrulama Ekranına git
          </Text>
        </Pressable>
        <BottomQuarterCircle style={styles.bottomCircle} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  topCircle: {
    position: 'absolute',
    top: 0,
    left: -40,
  },
  bottomCircle: {
    position: 'absolute',
    bottom: 0,
    right: -40,
  },
  LogoStyle: {
    width: 200,
    height: 48,
    marginTop: 130,
    marginBottom: 24,
    resizeMode: 'contain',
  },
  title: {
    fontFamily: 'Poppins',
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2F3C7E',
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Poppins',
    fontSize: 14,
    color: '#AEADAD',
    marginBottom: 20,
    maxWidth: 337,
    textAlign: 'center',
  },
  form: {
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
    gap: 10,
  },
  input: {
    width: 337,
    height: 45,
    backgroundColor: '#E6E6E6',
    borderRadius: 8,

    marginBottom: 4,
    borderColor: '#DDD',
    fontSize: 15,
  },
  inputHint: {
    color: '#B3B3B3',
    fontSize: 14,
    marginBottom: 18,
    zIndex: 1,
  },
  button: {
    width: 337,
    height: 45,
    justifyContent: 'center',
    alignSelf: 'center',
    borderRadius: 8,
    backgroundColor: '#BFC2D9',
    alignItems: 'center',
    marginBottom: 32,
    zIndex: 1,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  backButton: {
    zIndex: 10,
    width: 50,
    height: 50,
    position: 'absolute',
    left: 20,
    top: 40,
  },
  backIcon: {
    width: '100%',
    height: '100%',
  },
  codeButton: {
    marginTop: 10,
    backgroundColor: '#2F3C7E',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    alignSelf: 'center',
  },
  codeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});