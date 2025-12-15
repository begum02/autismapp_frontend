import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import TopQuarterCircle from '@/components/TopQuarterCircle';
import BottomQuarterCircle from '@/components/BottomQuarterCircle';
import taskService from '@/services/taskService';
import { Audio } from 'expo-av';
import LottieView from 'lottie-react-native';
import { Animated } from 'react-native';

const PRIMARY = '#2F3C7E';
const LIGHT_BG = '#F5F7FA';

interface Task {
  id: number;
  title: string;
  description?: string;
  scheduled_date: string;
  start_time: string;
  end_time?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  lottie_animation?: string;
}

// ✅ Lottie dosyalarını import et
const LOTTIE_ANIMATIONS: Record<string, any> = {
  'brushing-teeth': require('@/assets/animations/brushing-teeth.json'),
  'washing-hands': require('@/assets/animations/washing-hands.json'),
  'preparing-bag': require('@/assets/animations/preparing-bag.json'),
  'drinking-water': require('@/assets/animations/drinking-water.json'),
  'plug-device': require('@/assets/animations/plug-device.json'),
  'shower': require('@/assets/animations/shower.json'),
  'toilet': require('@/assets/animations/toilet.json'),
  

};

export default function SupportedRequiredTaskDetail() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const taskId = params.taskId ? parseInt(params.taskId as string) : null;

  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [rating, setRating] = useState(0);
  
  const pulseAnim = useState(new Animated.Value(1))[0];
  const timerInterval = useRef<ReturnType<typeof setInterval> | null>(null); // ✅ Tip düzeltildi
  const lottieRef = useRef<LottieView>(null);

  const startPulseAnimation = useCallback(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  const calculateTaskDuration = (task: Task) => {
    if (!task.start_time || !task.end_time) {
      return 0;
    }

    const [startHour, startMinute] = task.start_time.split(':').map(Number);
    const [endHour, endMinute] = task.end_time.split(':').map(Number);

    const startTotalMinutes = startHour * 60 + startMinute;
    const endTotalMinutes = endHour * 60 + endMinute;
    
    const durationSeconds = (endTotalMinutes - startTotalMinutes) * 60;
    
    return durationSeconds > 0 ? durationSeconds : 0;
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      if (taskId) {
        const filters = { date: new Date().toISOString().split('T')[0] };
        const response = await taskService.getTasks(filters);
        const foundTask = response.results?.find((t: Task) => t.id === taskId); // ✅ Tip eklendi
        
        if (foundTask) {
          setTask(foundTask);
          
          // ✅ Lottie animasyon debug
          console.log('🎬 Lottie animation:', foundTask.lottie_animation);
          console.log('🎬 Lottie source:', getLottieSource(foundTask.lottie_animation));
          
          const duration = calculateTaskDuration(foundTask);
          setTotalSeconds(duration);
          setRemainingSeconds(duration);
          
          console.log('⏱️ Görev süresi:', duration, 'saniye');
        } else {
          Alert.alert('Hata', 'Görev bulunamadı');
          router.back();
        }
      }
    } catch (error) {
      console.error('❌ Data yükleme hatası:', error);
      Alert.alert('Hata', 'Veriler yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, [taskId, router]);

  useEffect(() => {
    loadData();
    startPulseAnimation();
    
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
    };
  }, [loadData, startPulseAnimation, sound]);

  const toggleTimer = async () => {
    if (isTimerRunning) {
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
        timerInterval.current = null;
      }
      setIsTimerRunning(false);
      
      lottieRef.current?.pause();
      
      if (task) {
        try {
          await taskService.completeTask(task.id);
          Alert.alert('✅ Başarılı', 'Görev tamamlandı!', [
            { 
              text: 'Tamam', 
              onPress: () => {}
            }
          ]);
        } catch (error: any) {
          console.error('❌ Görev tamamlama hatası:', error);
          Alert.alert('Hata', error.message || 'Görev tamamlanamadı');
        }
      }
    } else {
      if (totalSeconds === 0) {
        Alert.alert('Uyarı', 'Bu görev için süre tanımlanmamış');
        return;
      }

      setIsTimerRunning(true);
      setRemainingSeconds(totalSeconds);
      
      lottieRef.current?.play();
      
      if (task) {
        try {
          await taskService.startTask(task.id);
        } catch (error: any) {
          console.error('❌ Görev başlatma hatası:', error);
        }
      }
      
      timerInterval.current = setInterval(() => {
        setRemainingSeconds(prev => {
          if (prev <= 1) {
            if (timerInterval.current) {
              clearInterval(timerInterval.current);
              timerInterval.current = null;
            }
            setIsTimerRunning(false);
            lottieRef.current?.pause();
            
            Alert.alert('⏰ Süre Doldu!', 'Görev süresi tamamlandı', [
              {
                text: 'Tamam',
                onPress: async () => {
                  if (task) {
                    try {
                      await taskService.completeTask(task.id);
                    } catch (error: any) {
                      console.error('❌ Görev tamamlama hatası:', error);
                    }
                  }
                }
              }
            ]);
            
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRating = async (stars: number) => {
    setRating(stars);
    
    Alert.alert('⭐ Teşekkürler!', `${stars} yıldız verdiniz!`, [
      {
        text: 'Tamam',
        onPress: () => router.back()
      }
    ]);
  };

  const getLottieSource = (animationName?: string) => {
    if (!animationName) return null;
    
    if (animationName.startsWith('http')) {
      return { uri: animationName };
    }
    
    return LOTTIE_ANIMATIONS[animationName] || null;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <TopQuarterCircle style={styles.topQuarterCircle} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={PRIMARY} />
          <Text style={styles.loadingText}>Yükleniyor...</Text>
        </View>
        <BottomQuarterCircle style={styles.bottomQuarterCircle} />
      </View>
    );
  }

  if (!task) {
    return (
      <View style={styles.container}>
        <TopQuarterCircle style={styles.topQuarterCircle} />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#999" />
          <Text style={styles.errorText}>Görev bulunamadı</Text>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Geri Dön</Text>
          </Pressable>
        </View>
        <BottomQuarterCircle />
      </View>
    );
  }

  const AnimatedLottieView = Animated.createAnimatedComponent(LottieView);

  return (
    <View style={styles.container}>
      <TopQuarterCircle style={styles.topQuarterCircle}/>

      <View style={styles.content}>
        <Text style={styles.taskTitle}>{task.title}</Text>

        {task.start_time && task.end_time && (
          <Text style={styles.timeInfo}>
            {task.start_time} - {task.end_time}
          </Text>
        )}

        <Animated.View 
          style={[
            styles.circleContainer,
            { transform: [{ scale: pulseAnim }] }
          ]}
        >
          <View style={styles.outerCircle}>
            <View style={styles.innerCircle}>
              {task.lottie_animation && getLottieSource(task.lottie_animation) ? (
                <AnimatedLottieView
                  ref={lottieRef}
                  source={getLottieSource(task.lottie_animation)!}
                  style={[
                    styles.lottieAnimation,
                    { transform: [{ scale: pulseAnim }] }
                  ]}
                  autoPlay={false}
                  loop={true}
                  resizeMode="contain"
                  onAnimationFinish={() => {
                    console.log('✅ Lottie animasyon bitti');
                  }}
                />
              ) : (
                <>
                  <Ionicons name="checkmark-circle-outline" size={100} color="#fff" />
                  <Text style={{color: 'red', fontSize: 12}}>
                    {task.lottie_animation ? `Animasyon bulunamadı: ${task.lottie_animation}` : 'Animasyon yok'}
                  </Text>
                </>
              )}
            </View>
          </View>
        </Animated.View>

        <Pressable 
          style={[
            styles.playButton, 
            isTimerRunning && styles.playButtonActive
          ]}
          onPress={toggleTimer}
        >
          <Ionicons 
            name={isTimerRunning ? "stop" : "play"} 
            size={40} 
            color="#fff" 
          />
        </Pressable>

        <Text style={styles.timerText}>{formatTime(remainingSeconds)}</Text>

        {totalSeconds > 0 && (
          <Text style={styles.progressText}>
            {Math.round((remainingSeconds / totalSeconds) * 100)}% kaldı
          </Text>
        )}

        {!isTimerRunning && remainingSeconds === 0 && totalSeconds > 0 && (
          <View style={styles.ratingContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Pressable
                key={star}
                onPress={() => handleRating(star)}
                style={styles.starButton}
              >
                <Ionicons
                  name={star <= rating ? "star" : "star-outline"}
                  size={44}
                  color={star <= rating ? "#FFD700" : PRIMARY}
                />
              </Pressable>
            ))}
          </View>
        )}
      </View>

      <BottomQuarterCircle style={styles.bottomQuarterCircle}/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    backgroundColor: LIGHT_BG,
    position: 'relative',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
 
    paddingHorizontal: 20,
  },
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#999',
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: PRIMARY,
    borderRadius: 12,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  taskTitle: {
    fontSize: 40,
    fontWeight: '700',
    color: '#5A5A5A',
    textAlign: 'center',

    marginTop:30,
  },
  timeInfo: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
    fontWeight: '500',
  },
  circleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  outerCircle: {
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#D1D5E8',
    marginTop: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  innerCircle: {
    width: 270,
    height: 270,
    borderRadius: 135,
    backgroundColor: '#ffffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  lottieAnimation: {
    width: 250,
    height: 250,
    alignSelf: 'center',
    justifyContent: 'center',
  },
  playButton: {
    width: 70,
    height: 70,
    borderRadius: 12,
    backgroundColor: '#8B9DC3',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  playButtonActive: {
    backgroundColor: '#E74C3C',
  },
  timerText: {
    fontSize: 48,
    fontWeight: '700',
    color: '#5A5A5A',
    marginBottom: 12,
    fontFamily: 'monospace',
  },
  progressText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    fontWeight: '500',
  },
  ratingContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 20,
    paddingHorizontal: 30,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: PRIMARY,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  starButton: {
    padding: 4,
  },

  bottomQuarterCircle:{
    position: 'absolute',
    right: -40,   // -40 yerine 0 ile başla, sonra ince ayar yap
    bottom: 0,
  },

  topQuarterCircle:{
    position: 'absolute',
    left: -40,
    top: 0,
  },

});