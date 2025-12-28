import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState, useEffect } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import LottiePickerModal from '../../components/LottiePicker';
import taskService from '../../services/taskService';
import { scheduleTaskNotification } from '../../utils/notifications';

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
  initialValues?: InitialValues;
};

export default function TaskFormForSupportRequired({ 
  visible, 
  onClose, 
  supportRequiredUserId,
  onSubmit,
  initialValues
}: Props) {
  const [title, setTitle] = useState(initialValues?.title ?? '');
  const [details, setDetails] = useState(initialValues?.details ?? '');
  const [date, setDate] = useState(initialValues?.date ?? new Date());
  const [selectedAnimation, setSelectedAnimation] = useState(initialValues?.lottieAnimation ?? null);
  const [timeStart, setTimeStart] = useState(initialValues?.timeStart ?? null);
  const [timeEnd, setTimeEnd] = useState(initialValues?.timeEnd ?? null);

  // Modal states
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [showAnimationPicker, setShowAnimationPicker] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = useMemo(() => title.trim().length > 0, [title]);

  const handleSubmit = async () => {
    if (!canSubmit || isSubmitting) return;
    setIsSubmitting(true);

    try {
      // Sadece verileri parent'a ilet
      onSubmit({ 
        title, 
        details, 
        date, 
        timeStart, 
        timeEnd,
        lottieAnimation: selectedAnimation 
      });
      // Modalı parent kapatacak
    } catch (error: any) {
      // Hata gösterimi
      Alert.alert('Hata', error.message || 'Görev kaydedilemedi');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (event.type === 'set' && selectedDate) {
      setDate(selectedDate);
    }
  };

  const onStartTimeChange = (event: any, selectedTime?: Date) => {
    setShowStartTimePicker(false);
    if (event.type === 'set' && selectedTime) {
      setTimeStart({
        hours: selectedTime.getHours(),
        minutes: selectedTime.getMinutes(),
      });
    }
  };

  const onEndTimeChange = (event: any, selectedTime?: Date) => {
    setShowEndTimePicker(false);
    if (event.type === 'set' && selectedTime) {
      setTimeEnd({
        hours: selectedTime.getHours(),
        minutes: selectedTime.getMinutes(),
      });
    }
  };

  useEffect(() => {
    setTitle(initialValues?.title ?? '');
    setDetails(initialValues?.details ?? '');
    setDate(initialValues?.date ?? new Date());
    setSelectedAnimation(initialValues?.lottieAnimation ?? null);
    setTimeStart(initialValues?.timeStart ?? null);
    setTimeEnd(initialValues?.timeEnd ?? null);
  }, [initialValues, visible]);

  // Seçili animasyonun ismini al
  const getAnimationName = (id: string | null) => {
    const animations: { [key: string]: string } = {
      'preparing-bag': 'Çanta Hazırla',
      'brushing-teeth': 'Diş Fırçala',
      'plug-device': 'Şarj Et',
      'washing-hands': 'El Dezenfekte',
      'shower': 'Duş Al',
      'toilet': 'Tuvalet',
      'drinking-water': 'Su İç',
      'washing-machine': 'Çamaşır Yıka',
    };
    return id ? animations[id] : null;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
        <View style={styles.overlay}>
          <Pressable style={styles.backdrop} onPress={onClose} />
          
          <View style={styles.sheet}>
            <View style={styles.handleBar} />
            
            <View style={styles.container}>
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.title}>Görev Oluştur</Text>
                <Pressable onPress={onClose} style={styles.closeButton}>
                  <Ionicons name="close" size={26} color="#333" />
                </Pressable>
              </View>

              <ScrollView 
                keyboardShouldPersistTaps="handled" 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom:80 }}
              >
                {/* Title Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Görev Başlığı</Text>
                  <TextInput
                    placeholder="Görev başlığı"
                    value={title}
                    onChangeText={setTitle}
                    style={styles.input}
                    placeholderTextColor="#999"
                  />
                </View>

                {/* Details Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Görev Detayları</Text>
                  <TextInput
                    placeholder="Görev hakkında ek bilgiler..."
                    value={details}
                    onChangeText={setDetails}
                    style={[styles.input, styles.textArea]}
                    multiline
                    numberOfLines={4}
                    placeholderTextColor="#999"
                    textAlignVertical="top"
                  />
                </View>

                {/* Animation Picker Button */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Animasyon Seç </Text>
                  <Pressable 
                    onPress={() => setShowAnimationPicker(true)} 
                    style={styles.animationButton}
                  >
                    <View style={styles.animationIconContainer}>
                      <Ionicons 
                        name={selectedAnimation ? "checkmark-circle" : "happy-outline"} 
                        size={22} 
                        color={selectedAnimation ? "#10B981" : "#2F3C7E"} 
                      />
                    </View>
                    <Text style={[
                      styles.animationText,
                      !selectedAnimation && styles.animationTextPlaceholder
                    ]}>
                      {selectedAnimation ? getAnimationName(selectedAnimation) : 'Animasyon seçin'}
                    </Text>
                    <Ionicons name="chevron-forward" size={20} color="#999" />
                  </Pressable>
                </View>

                {/* Date Picker */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Tarih</Text>
                  <Pressable 
                    onPress={() => setShowDatePicker(true)} 
                    style={styles.dateButton}
                  >
                    <View style={styles.dateIconContainer}>
                      <Ionicons name="calendar-outline" size={22} color="#2F3C7E" />
                    </View>
                    <Text style={styles.dateText}>
                      {date.toLocaleDateString('tr-TR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </Text>
                    <Ionicons name="chevron-forward" size={20} color="#999" />
                  </Pressable>
                </View>

                {/* Time Pickers */}
                <View style={styles.timeSection}>
                  <Text style={styles.label}>Zaman</Text>
                  <View style={styles.timeRow}>
                    {/* Start Time */}
                    <View style={styles.timeColumn}>
                      <Text style={styles.timeLabel}>Başlangıç</Text>
                      <Pressable 
                        style={styles.timeButton} 
                        onPress={() => setShowStartTimePicker(true)}
                      >
                        <Ionicons name="time-outline" size={20} color="#2F3C7E" />
                        <Text style={styles.timeValue}>
                          {timeStart 
                            ? `${timeStart.hours.toString().padStart(2,'0')}:${timeStart.minutes.toString().padStart(2,'0')}` 
                            : '--:--'
                          }
                        </Text>
                      </Pressable>
                    </View>

                    {/* End Time */}
                    <View style={styles.timeColumn}>
                      <Text style={styles.timeLabel}>Bitiş</Text>
                      <Pressable 
                        style={styles.timeButton} 
                        onPress={() => setShowEndTimePicker(true)}
                      >
                        <Ionicons name="time-outline" size={20} color="#2F3C7E" />
                        <Text style={styles.timeValue}>
                          {timeEnd 
                            ? `${timeEnd.hours.toString().padStart(2,'0')}:${timeEnd.minutes.toString().padStart(2,'0')}` 
                            : '--:--'
                          }
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
                       <View style={styles.buttonContainer}>
              <Pressable 
                onPress={handleSubmit} 
                style={[
                  styles.submitBtn, 
                  (!canSubmit || isSubmitting) && styles.submitBtnDisabled
                ]}
                disabled={!canSubmit || isSubmitting}
              >
                <Text style={styles.submitText}>
                  {isSubmitting ? "Kaydediliyor..." : "Kaydet"}
                </Text>
              </Pressable>
            </View>
              </ScrollView>

              {/* Submit Button */}
             

              {/* DateTimePickers */}
              {showDatePicker && (
                <DateTimePicker
                  value={date}
                  mode="date"
                  display="spinner"
                  onChange={onDateChange}
                  accentColor="#2F3C7E" // iOS ve Android için (iOS'ta sadece bazı display modlarında)
                  textColor="#2F3C7E"   // Sadece iOS
                />
              )}

              {showStartTimePicker && (
                <DateTimePicker
                  value={timeStart ? new Date(0, 0, 0, timeStart.hours, timeStart.minutes) : new Date()}
                  mode="time"
                  display="spinner"
                  onChange={onStartTimeChange}
                  is24Hour={true}
                  accentColor="#2F3C7E" // iOS ve Android için (iOS'ta sadece bazı display modlarında)
                  
                />
              )}

              {showEndTimePicker && (
                <DateTimePicker
                  value={timeEnd ? new Date(0, 0, 0, timeEnd.hours, timeEnd.minutes) : new Date()}
                  mode="time"
                  display="spinner"
                  onChange={onEndTimeChange}
                  is24Hour={true}
                />
              )}
            </View>
          </View>
        </View>
      </SafeAreaView>

      {/* Animation Picker Modal */}
      <LottiePickerModal
        visible={showAnimationPicker}
        onClose={() => setShowAnimationPicker(false)}
        selectedId={selectedAnimation}
        onSelect={(id) => {
          setSelectedAnimation(id);
          setShowAnimationPicker(false);
        }}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0)',

      justifyContent: 'flex-end',
      

   
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '100%',
    ...Platform.select({
      android: {
        elevation: 8,
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
    }),
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  container: {
    padding: 20,
    paddingTop: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#2F3C7E',
    letterSpacing: -0.5,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2F3C7E',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    color: '#1F2937',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  animationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
  },
  animationIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  animationText: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  animationTextPlaceholder: {
    color: '#9CA3AF',
    fontWeight: '400',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
  },
  dateIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  dateText: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  timeSection: {
    marginBottom: 20,
  },
  timeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  timeColumn: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 13,
    color: '#2F3C7E',
    marginBottom: 8,
    fontWeight: '500',
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 14,
    gap: 8,
  },
  timeValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  buttonContainer: {
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
  },
  submitBtn: {
    backgroundColor: '#2F3C7E',
    borderRadius: 14,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2F3C7E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnDisabled: {

    shadowOpacity: 1,
  },
  submitText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 17,
    letterSpacing: 0.3,
  },
});