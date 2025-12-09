import { Ionicons } from '@expo/json-icons';
import React, { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import LottiePicker from './LottiePicker';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    details: string;
    date: Date;
    timeStart?: { hours: number; minutes: number } | null;
    timeEnd?: { hours: number; minutes: number } | null;
    lottieAnimation?: string | null;
  }) => void;
};

export default function TaskFormForSupportRequired({ visible, onClose, onSubmit }: Props) {
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [date, setDate] = useState(new Date());
  const [selectedAnimation, setSelectedAnimation] = useState<string | null>(null);
  
  // Android DateTimePicker states
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  const [timeStart, setTimeStart] = useState<{ hours: number; minutes: number } | null>(null);
  const [timeEnd, setTimeEnd] = useState<{ hours: number; minutes: number } | null>(null);

  const canSubmit = useMemo(() => title.trim().length > 0, [title]);

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit({ 
      title, 
      details, 
      date, 
      timeStart, 
      timeEnd,
      lottieAnimation: selectedAnimation 
    });
    // reset
    setTitle('');
    setDetails('');
    setDate(new Date());
    setTimeStart(null);
    setTimeEnd(null);
    setSelectedAnimation(null);
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
                contentContainerStyle={{ paddingBottom: 20 }}
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    flex: 1,
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%', // Biraz daha büyük yaptık
    ...Platform.select({
      android: {
        elevation: 5,
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
    padding: 20,
    paddingBottom: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2F3C7E',
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    padding: 12,
    marginTop: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  datePill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2F3C7E',
    borderRadius: 10,
    padding: 12,
    marginTop: 12,
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
    marginTop: 16,
  },
  timeBoxContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 6,
  },
  timeLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontWeight: '500',
  },
  timeBox: {
    width: '100%',
    height: 50,
    borderRadius: 10,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  timeValue: {
    fontSize: 18,
    color: '#333',
    fontWeight: '600',
  },
  submitBtn: {
    backgroundColor: '#2F3C7E',
    borderRadius: 10,
    height: 50,
    marginTop: 24,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnDisabled: {
    backgroundColor: '#CCC',
    opacity: 0.6,
  },
  submitText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});