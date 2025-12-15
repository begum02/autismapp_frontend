import BottomQuarterCircle from '@/components/BottomQuarterCircle';
import TopQuarterCircle from '@/components/TopQuarterCircle';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

const PRIMARY = '#2F3C7E';
const ACCENT = '#BFC3DB';

export default function AddPersonForm() {
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [smsCode, setSmsCode] = useState(['', '', '', '', '', '']);
  
  // Beceriler
  const [selfCare, setSelfCare] = useState(false);
  const [communication, setCommunication] = useState(false);
  const [cognition, setCognition] = useState(false);
  const [dailyLiving, setDailyLiving] = useState(false);
  const [socialInteraction, setSocialInteraction] = useState(false);
  const [motor, setMotor] = useState(false);
  const [other, setOther] = useState(false);

  const handleBack = () => {
    router.back();
  };

  const handleSmsCodeChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newCode = [...smsCode];
      newCode[index] = value;
      setSmsCode(newCode);
    }
  };

  const handleSave = () => {
    if (!username.trim()) {
      Alert.alert('Hata', 'Kullanıcı adı zorunludur');
      return;
    }

    const fullCode = smsCode.join('');
    if (fullCode.length !== 6) {
      Alert.alert('Hata', 'SMS kodunu tam giriniz');
      return;
    }

    // TODO: Backend'e kaydet
    console.log('Kişi ekleniyor:', {
      username,
      smsCode: fullCode,
      skills: {
        selfCare,
        communication,
        cognition,
        dailyLiving,
        socialInteraction,
        motor,
        other,
      },
    });

    Alert.alert('Başarılı', 'Kişi eklendi', [
      { text: 'Tamam', onPress: () => router.back() }
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <TopQuarterCircle style={styles.topCircle} />
      
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={handleBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color={PRIMARY} />
          </Pressable>
        </View>

        <View 
          style={styles.content} >
        
          <Text style={styles.title}>Kişi Ekle</Text>



          {/* Kullanıcı Adı */}
          <TextInput
            style={styles.input}
            placeholder="Kullanıcı Adı"
            placeholderTextColor="#999"
            value={username}
            onChangeText={setUsername}
          />

          {/* SMS Kodu */}
          <Text style={styles.smsLabel}>SMS KODU</Text>
          <View style={styles.smsContainer}>
            {smsCode.map((digit, index) => (
              <TextInput
                key={index}
                style={styles.smsInput}
                value={digit}
                onChangeText={(value) => handleSmsCodeChange(index, value)}
                keyboardType="number-pad"
                maxLength={1}
              />
            ))}
          </View>

          {/* Beceriler */}
          <Text style={styles.skillsLabel}>Beceriler</Text>
          <View style={styles.skillsContainer}>
            {/* Sol Kolon */}
            <View style={styles.skillColumn}>
              <Pressable 
                style={styles.skillRow}
                onPress={() => setSelfCare(!selfCare)}
              >
                <View style={[styles.checkbox, selfCare && styles.checkboxChecked]}>
                  {selfCare && <Ionicons name="checkmark" size={18} color="#fff" />}
                </View>
                <Text style={styles.skillText}>Öz bakım becerileri</Text>
              </Pressable>

              <Pressable 
                style={styles.skillRow}
                onPress={() => setCommunication(!communication)}
              >
                <View style={[styles.checkbox, communication && styles.checkboxChecked]}>
                  {communication && <Ionicons name="checkmark" size={18} color="#fff" />}
                </View>
                <Text style={styles.skillText}>İletişim becerileri</Text>
              </Pressable>

              <Pressable 
                style={styles.skillRow}
                onPress={() => setCognition(!cognition)}
              >
                <View style={[styles.checkbox, cognition && styles.checkboxChecked]}>
                  {cognition && <Ionicons name="checkmark" size={18} color="#fff" />}
                </View>
                <Text style={styles.skillText}>Bilişsel beceriler</Text>
              </Pressable>

              <Pressable 
                style={styles.skillRow}
                onPress={() => setOther(!other)}
              >
                <View style={[styles.checkbox, other && styles.checkboxChecked]}>
                  {other && <Ionicons name="checkmark" size={18} color="#fff" />}
                </View>
                <Text style={styles.skillText}>Diğer</Text>
              </Pressable>
            </View>

            {/* Sağ Kolon */}
            <View style={styles.skillColumn}>
              <Pressable 
                style={styles.skillRow}
                onPress={() => setDailyLiving(!dailyLiving)}
              >
                <View style={[styles.checkbox, dailyLiving && styles.checkboxChecked]}>
                  {dailyLiving && <Ionicons name="checkmark" size={18} color="#fff" />}
                </View>
                <Text style={styles.skillText}>Günlük Yaşam Becerileri</Text>
              </Pressable>

              <Pressable 
                style={styles.skillRow}
                onPress={() => setSocialInteraction(!socialInteraction)}
              >
                <View style={[styles.checkbox, socialInteraction && styles.checkboxChecked]}>
                  {socialInteraction && <Ionicons name="checkmark" size={18} color="#fff" />}
                </View>
                <Text style={styles.skillText}>Sosyal etkileşim</Text>
              </Pressable>

              <Pressable 
                style={styles.skillRow}
                onPress={() => setMotor(!motor)}
              >
                <View style={[styles.checkbox, motor && styles.checkboxChecked]}>
                  {motor && <Ionicons name="checkmark" size={18} color="#fff" />}
                </View>
                <Text style={styles.skillText}>Motor beceriler</Text>
              </Pressable>
            </View>
          </View>

          {/* Kaydet Button */}
          <Pressable style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Kaydet</Text>
          </Pressable>
        </View>
      </View>

      <BottomQuarterCircle style={styles.bottomCircle} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    position: 'relative',
  },

  topCircle: {
    position: 'absolute',
    left: -40,
    top: 0,

  },
  bottomCircle: {
    position: 'absolute',
    right: -40,
    bottom: 0,

  },

  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
    marginTop:20,
    zIndex: 10,
  },
  backButton: {
    padding: 8,
    width: 44,
  },

  content: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },

  title: {
    fontSize: 28,
    fontWeight: '700',
    color: PRIMARY,
    marginTop:24,
    marginBottom: 24,
    alignSelf: 'center',
  },

  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },

  input: {
    width: '100%',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#333',
    marginBottom: 24,
    marginTop:12,
  },

  smsLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: PRIMARY,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  smsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  smsInput: {
    width: 50,
    height: 50,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '600',
    color: PRIMARY,
  },

  skillsLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: PRIMARY,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  skillsContainer: {
    width: '100%',
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  skillColumn: {
    flex: 1,
  },
  skillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: PRIMARY,
    borderColor: PRIMARY,
  },
  skillText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },

  saveButton: {
    width: '100%',
    backgroundColor: ACCENT,
    borderRadius:12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: PRIMARY,
  },
});