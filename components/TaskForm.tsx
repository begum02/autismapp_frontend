import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { scheduleTaskNotification } from '../utils/notifications';
import dayjs from 'dayjs';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    details: string;
    date: Date;
    timeStart?: { hours: number; minutes: number } | null;
    timeEnd?: { hours: number; minutes: number } | null;
  }) => void;
  initialValues?: {
    title?: string;
    details?: string;
    date?: Date;
    timeStart?: { hours: number; minutes: number } | null;
    timeEnd?: { hours: number; minutes: number } | null;
  };
};

export default function TaskForm({ visible, onClose, onSubmit, initialValues }: Props) {
  const [title, setTitle] = useState(initialValues?.title || '');
  const [details, setDetails] = useState(initialValues?.details || '');
  const [date, setDate] = useState(initialValues?.date || new Date());
  
  // Android DateTimePicker states
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  const [timeStart, setTimeStart] = useState(initialValues?.timeStart || null);
  const [timeEnd, setTimeEnd] = useState(initialValues?.timeEnd || null);

  const canSubmit = useMemo(() => title.trim().length > 0, [title]);

  const handleSubmit = async () => {
    if (!canSubmit) return;
    try {
      console.log('[TaskForm] Submit pressed');
      await onSubmit({ title, details, date, timeStart, timeEnd }); // <-- await ekle
      // reset ve modal kapama sadece başarılıysa
      setTitle('');
      setDetails('');
      setDate(new Date());
      setTimeStart(null);
      setTimeEnd(null);
      onClose();
    } catch (e) {
      console.error('[TaskForm] Submit error:', e);
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

  // Set initial values if provided
  useEffect(() => {
    setTitle(initialValues?.title || '');
    setDetails(initialValues?.details || '');
    setDate(initialValues?.date || new Date());
    setTimeStart(initialValues?.timeStart || null);
    setTimeEnd(initialValues?.timeEnd || null);
  }, [initialValues, visible]);

  const PURPLE = '#2F3C7E';

  const styles = StyleSheet.create({
    overlay: {
      backgroundColor: 'rgba(255, 255, 255, 0)',
      justifyContent: 'flex-end',
      flex: 1,
    },
    sheet: {
      backgroundColor: '#fff',
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      maxHeight: '90%',
      ...Platform.select({
        android: { elevation: 10 },
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.15,
          shadowRadius: 16,
        },
      }),
    },
    card: {
      backgroundColor: '#fff',
      padding: 28,
      paddingBottom: 18,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 28,
    },
    title: {
      fontSize: 26,
      fontWeight: '800',
      color: PURPLE,
      letterSpacing: -0.5,
    },
    input: {
      backgroundColor: '#F5F7FA',
      borderRadius: 14,
      padding: 16,
      marginTop: 8, // Eskiden 18'di, şimdi 8
      fontSize: 17,
      borderWidth: 1,
      borderColor: '#E0E0E0',
      color: PURPLE,
    },
    textArea: {
      height: 100,
      textAlignVertical: 'top',
    },
    label: {
      fontSize: 15,
      fontWeight: '600',
      color: PURPLE,
      marginBottom: 4, // Eskiden 10'du, şimdi 4
      marginTop: 4,    // Eskiden 10'du, şimdi 4
    },
    datePill: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1.5,
      borderColor: PURPLE,
      borderRadius: 14,
      padding: 16,
      marginTop: 18,
      backgroundColor: '#F9F9F9',
    },
    dateText: {
      marginLeft: 10,
      color: PURPLE,
      fontSize: 17,
      fontWeight: '600',
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
      marginHorizontal: 10,
    },
    timeLabel: {
      fontSize: 15,
      color: PURPLE,
      marginBottom: 12,
      fontWeight: '700',
    },
    timeBox: {
      width: '100%',
      height: 58,
      borderRadius: 14,
      backgroundColor: '#F5F7FA',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: '#E0E0E0',
    },
    timeValue: {
      fontSize: 22,
      color: PURPLE,
      fontWeight: '700',
    },
    submitBtn: {
      backgroundColor: PURPLE,
      borderRadius: 16,
      height: 56,
      marginTop: 32,
      marginBottom: 10,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: PURPLE,
      shadowRadius: 10,
      elevation: 3,
    },
   
    submitText: {
      color: '#fff',
      fontWeight: '700',
      fontSize: 18,
      letterSpacing: 0.3,
    },
  });

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
                <Text style={styles.title}>
                  {initialValues ? 'Görev Düzenle' : 'Görev Oluştur'}
                </Text>
                <Pressable onPress={onClose}>
                  <Ionicons name="close" size={28} color="#2F3C7E" />
                </Pressable>
              </View>

              <ScrollView 
                keyboardShouldPersistTaps="handled" 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
              >
                <Text style={[styles.label, {marginBottom:8}]}>Görev Başlığı</Text>
                <TextInput
                  placeholder="Görev Başlığı *"
                  value={title}
                  onChangeText={setTitle}
                  style={styles.input}
                  placeholderTextColor="#999"
                />

                <Text style={[styles.label, {marginBottom:8,marginTop:12}]}>Görev Detayları (Opsiyonel)</Text>
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

                <Text style={[styles.label,{marginBottom:2,marginTop:16}]} >Tarih</Text>
                <Pressable 
                  onPress={() => setShowDatePicker(true)} 
                  style={styles.datePill}
                >
                  <Ionicons name="calendar" size={18} color={PURPLE} />
                  <Text style={styles.dateText}>
                    {date.toLocaleDateString('tr-TR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </Text>
                </Pressable>

                <Text style={[styles.label,{marginTop:20,marginBottom:-20}]}>Zaman</Text>
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
                    <Text style={styles.timeLabel}>Bitiş</Text>
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
                  style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
                  disabled={!canSubmit}
                >
                  <Text style={styles.submitText}>Kaydet</Text>
                </Pressable>
              </ScrollView>

              {/* Android DateTimePickers */}
              {showDatePicker && (
                <DateTimePicker
                  value={date}
                  mode="date"
                  display="spinner"
                  onChange={onDateChange}
                  minimumDate={new Date()}
                />
              )}

              {showStartTimePicker && (
                <DateTimePicker
                  value={timeStart ? new Date(0, 0, 0, timeStart.hours, timeStart.minutes) : new Date()}
                  mode="time"
                  display="spinner"
                  onChange={onStartTimeChange}
                  is24Hour={true}
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
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const PURPLE = '#6C4AB6';

const styles = StyleSheet.create({
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
    flex: 1,
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    ...Platform.select({
      android: { elevation: 10 },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
      },
    }),
  },
  card: {
    backgroundColor: '#fff',
    padding: 28,
    paddingBottom: 18,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: PURPLE,
    letterSpacing: -0.5,
  },
  input: {
    backgroundColor: '#F5F7FA',
    borderRadius: 14,
    padding: 16,
    marginTop: 20, // Eskiden 18'di, şimdi 8
    fontSize: 17,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    color: PURPLE,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: PURPLE,
    marginBottom: 10, // Eskiden 10'du, şimdi 10
    marginTop: 10,    // Eskiden 10'du, şimdi 6
  },
  datePill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: PURPLE,
    borderRadius: 14,
    padding: 16,
    marginTop: 10,
    backgroundColor: '#F9F9F9',
  },
  dateText: {
    marginLeft: 10,
    color: PURPLE,
    fontSize: 17,
    fontWeight: '600',
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
    marginHorizontal: 10,
  },
  timeLabel: {
    fontSize: 15,
    color: PURPLE,
    marginBottom: 12,
    fontWeight: '700',
  },
  timeBox: {
    width: '100%',
    height: 58,
    borderRadius: 14,
    backgroundColor: '#F5F7FA',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  timeValue: {
    fontSize: 22,
    color: PURPLE,
    fontWeight: '700',
  },
  submitBtn: {
    backgroundColor: PURPLE,
    borderRadius: 16,
    height: 56,
    marginTop: 32,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: PURPLE,
    shadowRadius: 10,
    elevation: 3,
  },
  submitBtnDisabled: {
    backgroundColor: '#CCC',
    opacity: 0.6,
  },
  submitText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
    letterSpacing: 0.3,
  },
});