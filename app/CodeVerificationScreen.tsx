import React, { useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, KeyboardAvoidingView, Platform, ScrollView, Pressable } from 'react-native';
import TopQuarterCircle from '@/components/TopQuarterCircle';
import BottomQuarterCircle from '@/components/BottomQuarterCircle';
import { useRouter } from 'expo-router';
import authService from '../services/authService';

export default function CodeVerificationScreen() {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(120); // 2 dakika
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const inputs = useRef<Array<TextInput | null>>([]);
  const email = "kullanici@email.com"; // Kullanıcının emailini uygun şekilde al

  // Timer için useEffect ekleyebilirsin (isteğe bağlı)

  const handleChange = (text: string, index: number) => {
    if (/^\d*$/.test(text)) {
      const newCode = [...code];
      newCode[index] = text;
      setCode(newCode);

      if (text && index < 5) {
        inputs.current[index + 1]?.focus();
      }
      if (!text && index > 0) {
        inputs.current[index - 1]?.focus();
      }
    }
  };

  const handleResend = () => {
    setTimer(120);
    // Burada kodu yeniden gönderme işlemini başlatabilirsin
  };

  const handleVerifyCode = async () => {
    const codeStr = code.join('');
    if (codeStr.length !== 6) {
      setError('6 haneli kod giriniz');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await authService.verifyCode(email, codeStr);
      // Başarılıysa yönlendirme yapabilirsin
      router.push('/NewPasswordScreen');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Timer formatı
  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  React.useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer(t => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  return (
    <View
      style={{ flex: 1 }}
    >
      <View style={styles.container}>
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
        <Text style={styles.title}>Kod Doğrulama</Text>
        <Text style={styles.subtitle}>
          Email adresinize gönderilen tek kullanımlık doğrulama kodunu girin.
        </Text>
        <View style={styles.codeInputRow}>
          {code.map((digit, idx) => (
            <TextInput
              key={idx}
              ref={ref => (inputs.current[idx] = ref)}
              style={styles.codeInput}
              keyboardType="number-pad"
              maxLength={1}
              value={digit}
              onChangeText={text => handleChange(text, idx)}
              autoFocus={idx === 0}
              textAlign="center"
              returnKeyType="next"
            />
          ))}
        </View>
        <Text style={styles.timerText}>{formatTime(timer)} dk</Text>
        {error ? <Text style={{ color: 'red', marginBottom: 8 }}>{error}</Text> : null}
        <TouchableOpacity style={styles.verifyButton} onPress={handleVerifyCode} disabled={loading}>
          <Text style={styles.verifyButtonText}>{loading ? 'Yükleniyor...' : 'Kodu Doğrula'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.resendButton} onPress={handleResend} disabled={timer > 0}>
          <Text style={styles.resendButtonText}>Kodu Yeniden Gönder</Text>
        </TouchableOpacity>

        <BottomQuarterCircle style={styles.bottomCircle} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, // <--- flexGrow yerine flex
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    // paddingBottom: 40, // <--- kaldır veya azalt
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
    marginTop: 120,
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
  codeInputRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 8,
    marginTop: 8,
  },
  codeInput: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#ECECEF',
    fontSize: 24,
    color: '#2F3C7E',
    textAlign: 'center',
    marginHorizontal: 4,
  },
  timerText: {
    alignSelf: 'flex-end',
    color: '#2F3C7E',
    fontSize: 15,
    marginBottom: 16,
    marginRight: 10,
  },
  verifyButton: {
    width: 337,
    height: 45,
    justifyContent: 'center',
    alignSelf: 'center',
    borderRadius: 10,
    backgroundColor: '#BFC2D9',
    alignItems: 'center',
    marginBottom: 12,
  },
  verifyButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  resendButton: {
    width: 337,
    height: 45,
    justifyContent: 'center',
    alignSelf: 'center',
    borderRadius: 10,
    backgroundColor: '#353C7A',
    alignItems: 'center',
    marginBottom: 24,
  },
  resendButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  backLink: {
    color: '#353C7A',
    textDecorationLine: 'underline',
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
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
});