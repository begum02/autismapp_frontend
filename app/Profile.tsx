import BottomQuarterCircle from '@/components/BottomQuarterCircle';
import TopQuarterCircle from '@/components/TopQuarterCircle';
import { Ionicons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Progress from 'react-native-progress';


dayjs.extend(relativeTime);
dayjs.locale('tr');

const PRIMARY = '#2F3C7E';
const ACCENT = '#BFC3DB';

export default function Profile() {
  const [tab, setTab] = useState<'personal' | 'stats'>('personal');
  const avatar = require('../assets/images/icon.png');

  const openSettings = () => {
    router.push('/Settings');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <TopQuarterCircle style={styles.topLeftCircle} />
      
      <View style={styles.container}>
        {/* Header with settings icon */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.settingsIcon} onPress={openSettings}>
            <Ionicons name="settings-outline" size={28} color="#2F3C7E" />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Avatar */}
          <View style={styles.avatarWrap} >
            <Image source={avatar} style={styles.avatar} />
          </View>

          {/* Tab Buttons */}
          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tabButton, tab === 'personal' && styles.tabActive]}
              onPress={() => setTab('personal')}
            >
              <Text style={[styles.tabText, tab === 'personal' && styles.tabTextActive]}>
                Kişisel Bilgiler
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabButton, tab === 'stats' && styles.tabActive]}
              onPress={() => setTab('stats')}
            >
              <Text style={[styles.tabText, tab === 'stats' && styles.tabTextActive]}>
                Görev İstatistikleri
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tab Content */}
          {tab === 'stats' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Bugün</Text>
              <View style={styles.card}>
                <View style={styles.cardContent}>
                  <Text style={styles.taskText}>2 Görev tamamlandı</Text>
                  <Text style={styles.taskText}>1 Görev yarıda bırakıldı</Text>
                  <Text style={styles.taskText}>1 Görev devam etmekte</Text>
                </View>
                <View style={styles.progressWrapper}>
                  <Progress.Circle 
                    size={70} 
                    progress={0.45} 
                    color={PRIMARY}
                    showsText={false}
                    thickness={6}
                    unfilledColor="#E8E8E8"
                    borderWidth={0}
                  />
                  <Text style={styles.progressTextOverlay}>45%</Text>
                </View>
              </View>

              <Text style={styles.sectionTitle}>Bu Hafta</Text>
              <View style={styles.card}>
                <View style={styles.cardContent}>
                  <Text style={styles.taskText}>2 Görev tamamlandı</Text>
                  <Text style={styles.taskText}>1 Görev yarıda bırakıldı</Text>
                  <Text style={styles.taskText}>1 Görev devam etmekte</Text>
                </View>
                <View style={styles.progressWrapper}>
                  <Progress.Circle 
                    size={70} 
                    progress={0.45} 
                    showsText={false}
                    color={PRIMARY}
                    thickness={6}
                    unfilledColor="#E8E8E8"
                    borderWidth={0}
                  />
                  <Text style={styles.progressTextOverlay}>45%</Text>
                </View>
              </View>

              <Text style={styles.sectionTitle}>Bu Ay</Text>
              <View style={styles.card}>
                <View style={styles.cardContent}>
                  <Text style={styles.taskText}>2 Görev tamamlandı</Text>
                  <Text style={styles.taskText}>1 Görev yarıda bırakıldı</Text>
                  <Text style={styles.taskText}>1 Görev devam etmekte</Text>
                </View>
                <View style={styles.progressWrapper}>
                  <Progress.Circle 
                    size={70} 
                    progress={0.45} 
                    showsText={false}
                    color={PRIMARY}
                    thickness={6}
                    unfilledColor="#E8E8E8"
                    borderWidth={0}
                  />
                  <Text style={styles.progressTextOverlay}>45%</Text>
                </View>
              </View>
            </View>
          )}

          {tab === 'personal' && (
            <View style={styles.section}>
              <View style={styles.personalInfo}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoTitle}>Kullanıcı Adı:</Text>
                  <Text style={styles.infoText}>ayse02</Text>
                </View>
                   <View style={styles.infoItem}>
                  <Text style={styles.infoTitle}>Ad:</Text>
                  <Text style={styles.infoText}>Ayse</Text>
                </View>
                          <View style={styles.infoItem}>
                  <Text style={styles.infoTitle}>Soyad:</Text>
                  <Text style={styles.infoText}>Yılmaz</Text>
                </View>
                 
                                 <View style={styles.infoItem}>
                  <Text style={styles.infoTitle}>Email:</Text>
                  <Text style={styles.infoText}>ayseyilmaz@gmail.com</Text>
                </View>
          
                                                    <View style={styles.infoItem}>
                  <Text style={styles.infoTitle}>Kayıt Tarihi:</Text>
                  <Text style={styles.infoText}>01/01/2023</Text>
                </View>
                
                
                

                <TouchableOpacity style={styles.logoutButton}>
                  <Text style={styles.logoutText}>Çıkış Yap</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
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

  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  settingsIcon: {
    padding: 8,
  },

  content: {
    paddingTop: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    paddingBottom: 40,
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
    marginBottom: 24,
  },
  avatar: { width: 104, height: 104, borderRadius: 52 },

  tabs: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 24,
    gap: 12,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  tabActive: {
    backgroundColor: 'transparent',
    borderBottomWidth: 3,
    borderBottomColor: PRIMARY,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  tabTextActive: {
    color: PRIMARY,
    fontWeight: '700',
  },

  section: {
    width: '100%',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: PRIMARY,
    marginBottom: 12,
    marginTop: 8,
  },

  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  cardContent: {
    flex: 1,
  },
  taskText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  progressWrapper: {
    marginLeft: 16,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    width: 70,
    height: 70,
  },
  progressTextOverlay: {
    position: 'absolute',
    fontSize: 14,
    fontWeight: '700',
    color: PRIMARY,
  },

  personalInfo: {
    width: '100%',
    paddingVertical: 12,
  },
  infoItem: {
    marginBottom: 24,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 2,
  },
  infoTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: PRIMARY,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 17,
    fontWeight: '500',
    color:'#00000000',
    marginBottom: 8,
  },
  logoutButton: {
    backgroundColor: ACCENT,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 32,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
    color: PRIMARY,
  },
});