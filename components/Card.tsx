import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View, Pressable } from "react-native";

type Props = {
  startTime: string;
  endTime: string;
  title: string;
  status?: string;
  onPress?: () => void; // Modal açmak için
  onComplete?: () => void;
  onStart?: () => void;
  onDelete?: () => void;
};

export default function Card({ 
  startTime, 
  endTime, 
  title, 
  status, 
  onPress,
  onComplete, 
  onStart, 
  onDelete 
}: Props) {
  const isCompleted = status === 'completed';
  const isInProgress = status === 'in_progress';
  const isPending = status === 'pending';

  return (
    <Pressable 
      style={styles.cardContainer}
      onPress={onPress} // Karta tıklayınca modal açılsın
    >
      <View style={styles.timeLine}>
        <Text style={styles.leftTopOfCardStartTime}>{startTime}</Text>
        <Text style={styles.leftBottomOfCardEndTime}>{endTime}</Text>
      </View>
      
      <View style={[styles.cardContent, isCompleted && styles.completedCard]}>
        <View style={styles.header}>
          <View style={styles.timePeriod}>
            <Ionicons name="time-outline" size={16} color="#fff" />
            <Text style={styles.startTime}>{startTime}</Text>
            {endTime && (
              <>
                <Text style={styles.separator}>-</Text>
                <Text style={styles.endTime}>{endTime}</Text>
              </>
            )}
          </View>
          
          {/* Tap Info */}
          <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.7)" />
        </View>

        {/* Başlık - Tamamlandıysa üstü çizili */}
        <Text 
          style={[
            styles.cardTitle,
            isCompleted && styles.completedTitle
          ]}
        >
          {title}
        </Text>

        {/* Status Badge */}
        <View style={styles.statusContainer}>
          {isCompleted && (
            <View style={styles.statusBadge}>
              <Ionicons name="checkmark-circle" size={16} color="#fff" />
              <Text style={styles.statusText}>Tamamlandı</Text>
            </View>
          )}
          {isInProgress && (
            <View style={styles.statusBadge}>
              <Ionicons name="play-circle" size={16} color="#fff" />
              <Text style={styles.statusText}>Devam Ediyor</Text>
            </View>
          )}
          {isPending && (
            <View style={styles.statusBadge}>
              <Ionicons name="time" size={16} color="#fff" />
              <Text style={styles.statusText}>Bekliyor</Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  timeLine: {
    flexDirection: "column",
    justifyContent: "space-between",
    marginRight: 12,
    height: 100,
  },
  leftTopOfCardStartTime: {
    color: "#94A3B8",
    fontSize: 12,
    fontWeight: '600',
  },
  leftBottomOfCardEndTime: {
    color: "#94A3B8",
    fontSize: 12,
    fontWeight: '600',
  },
  cardContent: {
    marginLeft: 40,
    width: 280,
    minHeight: 100,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#AAAFCA',
    justifyContent: "flex-start",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  completedCard: {
    opacity: 0.7,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  timePeriod: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  separator: {
    color: "#fff",
    fontWeight: "600",
  },
  startTime: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  endTime: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  cardTitle: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 18,
    marginBottom: 8,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    textDecorationStyle: 'solid',
    textDecorationColor: '#fff',
  },
  statusContainer: {
    marginTop: 4,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
  },
});