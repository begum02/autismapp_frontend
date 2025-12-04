import BottomQuarterCircle from '@/components/BottomQuarterCircle';
import TopQuarterCircle from '@/components/TopQuarterCircle';
import React, { useState } from 'react';
import { Image, SafeAreaView, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';

const PRIMARY = '#2F3C7E';
const ACCENT = '#BFC3DB';

export default function Settings() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const avatar = require('../assets/images/icon.png');

  const handleSave = () => {
    console.log('Kaydet:', { username, email, password, notificationsEnabled });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <TopQuarterCircle style={styles.topLeftCircle} />
      
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Title */}
          <Text style={styles.title}>Ayarlar</Text>

          {/* Avatar */}
          <View style={styles.avatarWrap}>
            <Image source={avatar} style={styles.avatar} />
          </View>

          {/* Kullanıcı Adı */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Kullanıcı Adı</Text>
            <TextInput
              style={styles.input}
              placeholder="Kullanıcı Adı"
              placeholderTextColor="#C0C0C0"
              value={username}
              onChangeText={setUsername}
            />
          </View>

          {/* Email */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#C0C0C0"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Şifre Değiştir */}
          <View style={styles.fieldGroup}>
            <Text style={styles.labelLink}>Şifre Değiştir</Text>
            <TextInput
              style={styles.input}
              placeholder="Şifre"
              placeholderTextColor="#C0C0C0"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          {/* Bildirimler */}
          <View style={styles.switchGroup}>
            <Text style={styles.label}>Bildirimler</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#D1D1D6', true: ACCENT }}
              thumbColor={notificationsEnabled ? PRIMARY : '#F4F3F4'}
            />
          </View>

          {/* Kaydet Button */}
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveText}>Kaydet</Text>
          </TouchableOpacity>
        </ScrollView>

        <BottomQuarterCircle style={styles.bottomRightCircle} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, position: 'relative' },

  topLeftCircle: {
    position: 'absolute',
    left: -40,
    top: 0,
    opacity: 0.95,
  },
  bottomRightCircle: {
    position: 'absolute',
    right: -40,
    bottom: 0,
  },

  content: {
    paddingTop: 40,
    paddingHorizontal: 24,
    alignItems: 'center',
    paddingBottom: 60,
  },

  title: {
    fontSize: 32,
    fontWeight: '700',
    color: PRIMARY,
    marginTop:40

  },

  avatarWrap: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    marginTop: 20,
  },
  avatar: { width: 104, height: 104, borderRadius: 52 },

  fieldGroup: {
    width: '100%',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: PRIMARY,
    marginBottom: 8,
  },
  labelLink: {
    fontSize: 16,
    fontWeight: '600',
    color: PRIMARY,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: PRIMARY,
  },

  switchGroup: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop:20,
  },

  saveButton: {
    backgroundColor: ACCENT,
    borderRadius: 12,
    paddingVertical: 14,
    width: '100%',
    alignItems: 'center',
    marginTop: 30,

  },
  saveText: {
    fontSize: 16,
    fontWeight: '700',
    color: PRIMARY,
  },
});