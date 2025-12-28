import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState, useEffect } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View, Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import LottiePicker from '../../components/LottiePicker';
import taskService from '../../services/taskService';
import { scheduleTaskNotification } from '../../utils/notifications';
import { useLocalSearchParams } from 'expo-router'; // veya useRoute

type InitialValues = {
  title?: string;
  details?: string;
  date?: Date;
  timeStart?: { hours: number; minutes: number } | null;
  timeEnd?: { hours: number; minutes: number } | null;
  lottieAnimation?: string | null;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  supportRequiredUserId: number;
  onSubmit: (data: {
    title: string;
    details: string;
    date: Date;
    timeStart?: { hours: number; minutes: number } | null;
    timeEnd?: { hours: number; minutes: number } | null;
    lottieAnimation?: string | null;
  }) => void;
  initialValues?: InitialValues; // <-- EKLE
};

export default function TaskFormForSupportRequired({ 
  visible, 
  onClose, 
  supportRequiredUserId,
  onSubmit,
  initialValues // <-- EKLE
}: Props) {
  const [title, setTitle] = useState(initialValues?.title ?? '');
  const [details, setDetails] = useState(initialValues?.details ?? '');
  const [date, setDate] = useState(initialValues?.date ?? new Date());
  const [selectedAnimation, setSelectedAnimation] = useState(initialValues?.lottieAnimation ?? null);
  const [timeStart, setTimeStart] = useState(initialValues?.timeStart ?? null);
  const [timeEnd, setTimeEnd] = useState(initialValues?.timeEnd ?? null);

  // Android DateTimePicker states
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false); // <-- EKLENDİ

  const canSubmit = useMemo(() => title.trim().length > 0, [title]);

  const handleSubmit = async () => {
    if (!canSubmit || isSubmitting) return; // <-- Çift submit engellendi
    setIsSubmitting(true); // <-- Submit başında aktif

    try {
      // ✅ Ebeveynin ID'sini al
      const userStr = await AsyncStorage.getItem('user');
      if (!userStr) {
        Alert.alert('Hata', 'Kullanıcı bilgisi bulunamadı');
        return;
      }
      
      const user = JSON.parse(userStr);
      const parentId = user.id;

      // ✅ assigned_to kontrolü
      if (!supportRequiredUserId) {
        Alert.alert('Hata', 'Görev atanacak kullanıcı bulunamadı');
        return;
      }

      // Backend'e gönder
      const taskData = {
        title,
        description: details,
        scheduled_date: date.toISOString().split('T')[0],
        start_time: timeStart 
          ? `${timeStart.hours.toString().padStart(2,'0')}:${timeStart.minutes.toString().padStart(2,'0')}:00`
          : null,
        end_time: timeEnd 
          ? `${timeEnd.hours.toString().padStart(2,'0')}:${timeEnd.minutes.toString().padStart(2,'0')}:00`
          : null,
        lottie_animation: selectedAnimation,
        assigned_to: supportRequiredUserId, // ✅ Zorunlu
        created_by: parentId, // ✅ Zorunlu
      };

      console.log('📤 Görev oluşturuluyor:', JSON.stringify(taskData, null, 2)); // ✅ Daha okunabilir log
      
      const response = await taskService.createTask(taskData);
      
      console.log('✅ Görev oluşturuldu:', response);
      
      // Yeni görev için bildirim zamanla
      await scheduleTaskNotification(title, date, timeStart);

      Alert.alert('✅ Başarılı', 'Görev oluşturuldu', [
        {
          text: 'Tamam',
          onPress: () => {
            // Reset form
            setTitle('');
            setDetails('');
            setDate(new Date());
            setTimeStart(null);
            setTimeEnd(null);
            setSelectedAnimation(null);
            
            // Parent callback
            onSubmit({ 
              title, 
              details, 
              date, 
              timeStart, 
              timeEnd,
              lottieAnimation: selectedAnimation 
            });
            
            onClose();
          }
        }
      ]);
      
    } catch (error: any) {
      console.error('❌ Görev oluşturma hatası:', error);
      const errorMessage =
        error.response?.data?.error || // <-- backend'den gelen özel hata
        error.response?.data?.detail ||
        error.response?.data?.message ||
        JSON.stringify(error.response?.data) ||
        error.message ||
        'Görev oluşturulamadı';

      Alert.alert('Hata', errorMessage);
    } finally {
      setIsSubmitting(false); // <-- Submit sonunda tekrar aktif
    }
  };

  // Date Picker Handler
  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (event.type === 'set' && selectedDate) {
      setDate(selectedDate);
    }
  };

  // Start Time Picker Handler
  const onStartTimeChange = (event: any, selectedTime?: Date) => {
    setShowStartTimePicker(false);
    if (event.type === 'set' && selectedTime) {
      setTimeStart({
        hours: selectedTime.getHours(),
        minutes: selectedTime.getMinutes(),
      });
    }
  };

  // End Time Picker Handler
  const onEndTimeChange = (event: any, selectedTime?: Date) => {
    setShowEndTimePicker(false);
    if (event.type === 'set' && selectedTime) {
      setTimeEnd({
        hours: selectedTime.getHours(),
        minutes: selectedTime.getMinutes(),
      });
    }
  };

  // EKLEYİN: initialValues veya visible değiştiğinde formu güncelle
  useEffect(() => {
    setTitle(initialValues?.title ?? '');
    setDetails(initialValues?.details ?? '');
    setDate(initialValues?.date ?? new Date());
    setSelectedAnimation(initialValues?.lottieAnimation ?? null);
    setTimeStart(initialValues?.timeStart ?? null);
    setTimeEnd(initialValues?.timeEnd ?? null);
  }, [initialValues, visible]);

  const params = useLocalSearchParams();
  const userId = Number(params.userId);

  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params.userId || isNaN(userId)) {
      // userId yoksa API çağrısı yapma!
      return;
    }
    const fetchStats = async () => {
      try {
        const result = await taskService.getUserStatistics(userId);
        setStats(result);
      } catch (error) {
        setStats(null);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [params.userId]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable onPress={(e) => e.stopPropagation()}>
          <View style={styles.sheet}>
            <View style={styles.card}>
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.title}>Görev Oluştur</Text>
                <Pressable onPress={onClose}>
                  <Ionicons name="close" size={28} color="#2F3C7E" />
                </Pressable>
              </View>

              <ScrollView 
                keyboardShouldPersistTaps="handled" 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 0 }}
              >
                {/* Title Input */}
                <TextInput
                  placeholder="Görev Başlığı *"
                  value={title}
                  onChangeText={setTitle}
                  style={styles.input}
                  placeholderTextColor="#999"
                />

                {/* Details Input */}
                <TextInput
                  placeholder="Görev Detayları (Opsiyonel)"
                  value={details}
                  onChangeText={setDetails}
                  style={[styles.input, styles.textArea]}
                  multiline
                  numberOfLines={4}
                  placeholderTextColor="#999"
                  textAlignVertical="top"
                />

                {/* Lottie Animation Picker */}
                <LottiePicker
                  selectedId={selectedAnimation}
                  onSelect={setSelectedAnimation}
                />

                {/* Date Picker Button */}
                <Pressable 
                  onPress={() => setShowDatePicker(true)} 
                  style={styles.datePill}
                >
                  <Ionicons name="calendar" size={18} color="#2F3C7E" />
                  <Text style={styles.dateText}>
                    {date.toLocaleDateString('tr-TR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </Text>
                </Pressable>

                {/* Time Pickers Row */}
                <View style={styles.row}>
                  {/* Start Time */}
                  <View style={styles.timeBoxContainer}>
                    <Text style={styles.timeLabel}>Başlangıç</Text>
                    <Pressable 
                      style={styles.timeBox} 
                      onPress={() => setShowStartTimePicker(true)}
                    >
                      <Text style={styles.timeValue}>
                        {timeStart 
                          ? `${timeStart.hours.toString().padStart(2,'0')}:${timeStart.minutes.toString().padStart(2,'0')}` 
                          : '-- : --'
                        }
                      </Text>
                    </Pressable>
                  </View>

                  {/* End Time */}
                  <View style={styles.timeBoxContainer}>
                    <Text style={styles.timeLabel}>Bitiş (Opsiyonel)</Text>
                    <Pressable 
                      style={styles.timeBox} 
                      onPress={() => setShowEndTimePicker(true)}
                    >
                      <Text style={styles.timeValue}>
                        {timeEnd 
                          ? `${timeEnd.hours.toString().padStart(2,'0')}:${timeEnd.minutes.toString().padStart(2,'0')}` 
                          : '-- : --'
                        }
                      </Text>
                    </Pressable>
                  </View>
                </View>

                {/* Submit Button */}
                <Pressable 
                  onPress={handleSubmit} 
                  style={[
                    styles.submitBtn, 
                    (!canSubmit || isSubmitting) && styles.submitBtnDisabled
                  ]}
                  disabled={!canSubmit || isSubmitting} // <-- Buton disable
                >
                  <Text style={styles.submitText}>
                    {isSubmitting ? "Kaydediliyor..." : "Kaydet"}
                  </Text>
                </Pressable>
              </ScrollView>

              {/* Android DateTimePickers */}
              {showDatePicker && (
                <DateTimePicker
                  value={date}
                  mode="date"
                  display="default"
                  onChange={onDateChange}
                  minimumDate={new Date()}
                />
              )}

              {showStartTimePicker && (
                <DateTimePicker
                  value={timeStart ? new Date(0, 0, 0, timeStart.hours, timeStart.minutes) : new Date()}
                  mode="time"
                  display="default"
                  onChange={onStartTimeChange}
                  is24Hour={true}
                />
              )}

              {showEndTimePicker && (
                <DateTimePicker
                  value={timeEnd ? new Date(0, 0, 0, timeEnd.hours, timeEnd.minutes) : new Date()}
                  mode="time"
                  display="default"
                  onChange={onEndTimeChange}
                  is24Hour={true}
                />
              )}
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    backgroundColor: 'rgba(255, 255, 255, 0)',
    justifyContent: 'flex-end',
    position: 'relative',

    flex: 1,
  },
  sheet: {
    backgroundColor: '#fff',
    //borderTopLeftRadius: 20,
    //borderTopRightRadius: 20,
    
    maxHeight: '100%',
    ...Platform.select({
      android: {
        elevation: 5,
        marginBottom:  -50,
        
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },
    }),
  },
  card: {
    backgroundColor: '#fff',
    padding: 28,
    paddingBottom: 18,
    borderRadius: 20,
    marginHorizontal: 16,
    marginTop: 12,
    shadowColor: '#ffffffff',
  
    shadowOpacity: 0.10,
    shadowRadius: 14,

  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#2F3C7E',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    padding: 16,
    marginTop: 18,
    fontSize: 17,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    minHeight: 48,
  },
  textArea: {
    height: 110,
    textAlignVertical: 'top',
  },
  datePill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#2F3C7E',
    borderRadius: 14,
    padding: 14,
    marginTop: 18,
    backgroundColor: '#F9F9F9',
  },
  dateText: {
    marginLeft: 8,
    color: '#2F3C7E',
    fontSize: 16,
    fontWeight: '500',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 22,
  },
  timeBoxContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  timeLabel: {
    fontSize: 15,
    color: '#666',
    marginBottom: 10,
    fontWeight: '600',
  },
  timeBox: {
    width: '100%',
    height: 54,
    borderRadius: 14,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  timeValue: {
    fontSize: 20,
    color: '#333',
    fontWeight: '700',
  },
  submitBtn: {
    backgroundColor: '#2F3C7E',
    borderRadius: 14,
    height: 54,
    marginTop: 32,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2F3C7E',
 
    shadowRadius: 8,
    elevation: 2,
  },
  submitBtnDisabled: {
    backgroundColor: '#2F3C7E',
    opacity:1,
  },
  submitText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 18,
    letterSpacing: 0.5,
  },
});