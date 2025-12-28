import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { CalendarProvider, WeekCalendar } from 'react-native-calendars';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';
dayjs.locale('tr');

export default function WeeklyStrip() {
  const [date, setDate] = useState(dayjs().format('YYYY-MM-DD'));

  return (
    <View style={styles.container}>
      <CalendarProvider date={date}>
        <WeekCalendar
          firstDay={1}
          onDayPress={(d) => setDate(d.dateString)}
          style={styles.calendar}
          theme={{
            todayTextColor: '#7B4FA0',
            selectedDayBackgroundColor: '#7B4FA0',
            selectedDayTextColor: '#fff',
            textDayFontWeight: '600',
            textMonthFontWeight: '700',
            arrowColor: '#7B4FA0',
          }}
        />
      </CalendarProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 100,
  },
  calendar: {
    elevation: 2,
    marginTop:100
  },
});
