import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View, ScrollView } from 'react-native';

type Props = {
  visible: boolean;
  onClose: () => void;
  task: {
    id: number;
    title: string;
    description?: string;
    scheduled_date: string;
    start_time: string;
    end_time?: string;
    status: string;
  } | null;
  onEdit: () => void;
  onDelete: () => void;
  onComplete: () => void;
  onStart: () => void;
};

export default function EditModal({
  visible,
  onClose,
  task,
  onEdit,
  onDelete,
  onComplete,
  onStart,
}: Props) {
  if (!task) return null;

  const isPending = task.status === 'pending';
  const isInProgress = task.status === 'in_progress';
  const isCompleted = task.status === 'completed';

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable onPress={(e) => e.stopPropagation()} style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <Ionicons name="document-text" size={24} color="#2F3C7E" />
                <Text style={styles.headerTitle}>Görev Detayı</Text>
              </View>
              <Pressable onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={28} color="#666" />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Task Info */}
              <View style={styles.taskInfo}>
                {/* Status Badge */}
                <View style={[styles.statusBadge, isCompleted && styles.statusCompleted]}>
                  <Ionicons 
                    name={
                      isCompleted ? 'checkmark-circle' : 
                      isInProgress ? 'play-circle' : 
                      'time'
                    } 
                    size={16} 
                    color="#fff" 
                  />
                  <Text style={styles.statusText}>
                    {isCompleted ? 'Tamamlandı' : 
                     isInProgress ? 'Devam Ediyor' : 
                     'Bekliyor'}
                  </Text>
                </View>

                {/* Title */}
                <Text style={[styles.taskTitle, isCompleted && styles.taskTitleCompleted]}>
                  {task.title}
                </Text>

                {/* Time Info */}
                <View style={styles.timeContainer}>
                  <View style={styles.timeRow}>
                    <Ionicons name="calendar-outline" size={18} color="#666" />
                    <Text style={styles.timeText}>
                      {new Date(task.scheduled_date).toLocaleDateString('tr-TR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </Text>
                  </View>
                  
                  <View style={styles.timeRow}>
                    <Ionicons name="time-outline" size={18} color="#666" />
                    <Text style={styles.timeText}>
                      {task.start_time} {task.end_time && `- ${task.end_time}`}
                    </Text>
                  </View>
                </View>

                {/* Description */}
                {task.description && (
                  <View style={styles.descriptionContainer}>
                    <Text style={styles.descriptionLabel}>Açıklama:</Text>
                    <Text style={styles.descriptionText}>{task.description}</Text>
                  </View>
                )}
              </View>

              {/* Action Buttons */}
              <View style={styles.actionContainer}>
                {/* Edit Button - Sadece pending ve in_progress için */}
                {!isCompleted && (
                  <Pressable 
                    style={[styles.actionButton, styles.editButton]} 
                    onPress={() => {
                      onClose();
                      onEdit();
                    }}
                  >
                    <Ionicons name="create-outline" size={22} color="#fff" />
                    <Text style={styles.actionButtonText}>Düzenle</Text>
                  </Pressable>
                )}

                {/* Start Button - Sadece pending için */}
                {isPending && (
                  <Pressable 
                    style={[styles.actionButton, styles.startButton]} 
                    onPress={() => {
                      onClose();
                      onStart();
                    }}
                  >
                    <Ionicons name="play-circle-outline" size={22} color="#fff" />
                    <Text style={styles.actionButtonText}>Başlat</Text>
                  </Pressable>
                )}

                {/* Complete Button - Sadece pending ve in_progress için */}
                {!isCompleted && (
                  <Pressable 
                    style={[styles.actionButton, styles.completeButton]} 
                    onPress={() => {
                      onClose();
                      onComplete();
                    }}
                  >
                    <Ionicons name="checkmark-circle-outline" size={22} color="#fff" />
                    <Text style={styles.actionButtonText}>Tamamla</Text>
                  </Pressable>
                )}

                {/* Delete Button */}
                <Pressable 
                  style={[styles.actionButton, styles.deleteButton]} 
                  onPress={() => {
                    onClose();
                    onDelete();
                  }}
                >
                  <Ionicons name="trash-outline" size={22} color="#fff" />
                  <Text style={styles.actionButtonText}>Sil</Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalContent: {
    padding: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2F3C7E',
  },
  closeButton: {
    padding: 4,
  },
  taskInfo: {
    marginBottom: 20,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#AAAFCA',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },
  statusCompleted: {
    backgroundColor: '#4CAF50',
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  taskTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
    lineHeight: 28,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  timeContainer: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  timeText: {
    fontSize: 15,
    color: '#666',
    fontWeight: '500',
  },
  descriptionContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#AAAFCA',
  },
  descriptionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 6,
  },
  descriptionText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  actionContainer: {
    gap: 10,
    marginTop: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  editButton: {
    backgroundColor: '#2F3C7E',
  },
  startButton: {
    backgroundColor: '#FF9800',
  },
  completeButton: {
    backgroundColor: '#4CAF50',
  },
  deleteButton: {
    backgroundColor: '#F44336',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});