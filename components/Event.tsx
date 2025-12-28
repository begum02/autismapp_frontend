import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface EventProps {
  id: string;
  title: string;
  color?: string;
  startTime?: string;
  endTime?: string;
}

export default function Event({ id, title, color = '#A5A3C7', startTime, endTime }: EventProps) {
  return (
    <View style={[styles.eventContainer, { backgroundColor: color }]}>
      <View style={styles.contentContainer}>
        <Text style={styles.eventTitle} numberOfLines={1}>{title}</Text>
        <View style={styles.timeContainer}>
          {startTime && <Text style={styles.timeText}>{startTime}</Text>}
          {endTime && <Text style={styles.timeText}>- {endTime}</Text>}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  eventContainer: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    minHeight: 50,
    marginVertical: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1.5,
    elevation: 1,
  },
  contentContainer: {
    flex: 1,
  },
  eventTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
    marginBottom: 2,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    color: '#fff',
    fontSize: 12,
    opacity: 0.9,
    fontWeight: '400',
  },
});