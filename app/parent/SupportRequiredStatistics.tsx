import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import TopQuarterCircle from '@/components/TopQuarterCircle';
import BottomQuarterCircle from '@/components/BottomQuarterCircle';
import taskService from '@/services/taskService';

const PRIMARY = '#2F3C7E';
const ACCENT = '#BFC3DB';

export default function SupportRequiredStatistics() {
  const params = useLocalSearchParams();
  const userId = Number(params.userId);

  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('params.userId:', params.userId, 'userId:', userId);
    if (!params.userId || isNaN(userId)) {
      // userId yoksa API çağrısı yapma!
      setLoading(false); // loading'i false yap ki spinner sonsuz dönmesin
      return;
    }

    const fetchStats = async () => {
      try {
        const result = await taskService.getUserTimeStatistics(userId);
        setStats(result);
      } catch (error) {
        setStats(null);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [params.userId]);

  function getTotal(period: 'today' | 'week' | 'month') {
    return (
      (stats?.[`${period}_completed`] ?? 0) +
      (stats?.[`${period}_in_progress`] ?? 0) +
      (stats?.[`${period}_cancelled`] ?? 0)
    );
  }

  function getPercent(value: number, total: number) {
    return total > 0 ? (value / total) * 100 : 0;
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={PRIMARY} />
          <Text style={styles.loadingText}>İstatistikler yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!stats) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          <Text style={styles.error}>İstatistikler yüklenemedi.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <TopQuarterCircle style={styles.topLeftCircle} />
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Bugün */}
          <Text style={styles.sectionTitle}>Bugün</Text>
          <View style={styles.card}>
            <View style={styles.cardLeft}>
              <Text style={styles.taskText}>{stats.today_completed ?? 0} Görev tamamlandı</Text>
              <Text style={styles.taskText}>{stats.today_cancelled ?? 0} Görev yarıda bırakıldı</Text>
              <Text style={styles.taskText}>{stats.today_in_progress ?? 0} Görev devam etmekte</Text>
            </View>
            <View style={styles.cardRight}>
              <AnimatedCircularProgress
                size={64}
                width={8}
                fill={getPercent(stats.today_completed ?? 0, getTotal('today'))}
                tintColor="#2F3C7E"
                backgroundColor="#eee"
                rotation={0}
              >
                {() => (
                  <Text style={styles.percentLabel}>
                    {Math.round(getPercent(stats.today_completed ?? 0, getTotal('today')))}%
                  </Text>
                )}
              </AnimatedCircularProgress>
            </View>
          </View>

          {/* Bu Hafta */}
          <Text style={styles.sectionTitle}>Bu Hafta</Text>
          <View style={styles.card}>
            <View style={styles.cardLeft}>
              <Text style={styles.taskText}>{stats.week_completed ?? 0} Görev tamamlandı</Text>
              <Text style={styles.taskText}>{stats.week_cancelled ?? 0} Görev yarıda bırakıldı</Text>
              <Text style={styles.taskText}>{stats.week_in_progress ?? 0} Görev devam etmekte</Text>
            </View>
            <View style={styles.cardRight}>
              <AnimatedCircularProgress
                size={64}
                width={8}
                fill={getPercent(stats.week_completed ?? 0, getTotal('week'))}
                tintColor="#2F3C7E"
                backgroundColor="#eee"
                rotation={0}
              >
                {() => (
                  <Text style={styles.percentLabel}>
                    {Math.round(getPercent(stats.week_completed ?? 0, getTotal('week')))}%
                  </Text>
                )}
              </AnimatedCircularProgress>
            </View>
          </View>

          {/* Bu Ay */}
          <Text style={styles.sectionTitle}>Bu Ay</Text>
          <View style={styles.card}>
            <View style={styles.cardLeft}>
              <Text style={styles.taskText}>{stats.month_completed ?? 0} Görev tamamlandı</Text>
              <Text style={styles.taskText}>{stats.month_cancelled ?? 0} Görev yarıda bırakıldı</Text>
              <Text style={styles.taskText}>{stats.month_in_progress ?? 0} Görev devam etmekte</Text>
            </View>
            <View style={styles.cardRight}>
              <AnimatedCircularProgress
                size={64}
                width={8}
                fill={getPercent(stats.month_completed ?? 0, getTotal('month'))}
                tintColor="#2F3C7E"
                backgroundColor="#eee"
                rotation={0}
              >
                {() => (
                  <Text style={styles.percentLabel}>
                    {Math.round(getPercent(stats.month_completed ?? 0, getTotal('month')))}%
                  </Text>
                )}
              </AnimatedCircularProgress>
            </View>
          </View>
        </ScrollView>
        <BottomQuarterCircle style={styles.bottomRightCircle} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, position: 'relative' },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: PRIMARY,
  },
  topLeftCircle: {
    position: 'absolute',
    left: -40,
    top: 0,
    opacity: 0.95,
    zIndex: 1,
  },
  bottomRightCircle: {
    position: 'absolute',
    right: -40,
    bottom: 0,
  },
  content: {
    paddingTop: 12,
    marginTop: 150,
    paddingHorizontal: 24,
    alignItems: 'center',
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: PRIMARY,
    marginBottom: 12,
    marginTop: 8,
    alignSelf: 'flex-start',
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
    width: '100%',
  },
  cardLeft: {
    flex: 1,
  },
  cardRight: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentLabel: {
    fontSize: 16,
    color: '#2F3C7E',
    fontWeight: 'bold',
  },
  taskText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  error: { color: 'red', textAlign: 'center', marginTop: 16 },
});