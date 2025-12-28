import React, { useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet } from 'react-native';
import { CalendarProvider, WeekCalendar } from 'react-native-calendars';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';
dayjs.locale('tr');

// minimal theme override (TS tipini bypass etmek için any)
const weekTheme: any = {
  calendarBackground: 'transparent',
  todayTextColor: '#7B4FA0',
  arrowColor: '#7B4FA0',
  textDayFontWeight: '600',
  textDayFontSize: 14,
  textMonthFontWeight: '700',
  'stylesheet.day.basic': {
    base: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: '#2F3C7E',
      borderRadius: 20,
    },
    text: {
      fontFamily: 'Roboto',
      fontWeight: '700',
      fontSize: 17,
      color: '#222',
    },
    selected: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 0,
      borderRadius: 20,
      backgroundColor: '#AAAFCA', // seçili gün arkaplanı
    },
    selectedText: {
      fontFamily: 'Roboto',
      fontWeight: '700',
      fontSize: 17,
      color: '#2F3C7E',
    },
    today: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: '#2F3C7E',
      borderRadius: 20,
    },
    todayText: {
      fontFamily: 'Roboto',
      fontWeight: '700',
      fontSize: 17,
      color: '#7B4FA0',
    },
  },
  'stylesheet.calendar.header': {
    header: { backgroundColor: 'transparent', borderBottomWidth: 0 },
    week: { backgroundColor: 'transparent', borderBottomWidth: 0 },
  },
};

export default function CustomWeekCalendar() {
  const [date, setDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [header, setHeader] = useState(dayjs(date).format('MMMM YYYY'));

  const handleDateChanged = (dateString: string) => {
    setDate(dateString);
  };

  const handleMonthChange = ({ dateString }: { dateString: string }) => {
    const d = dayjs(dateString);
    setHeader(d.format('MMMM YYYY'));
  };

  const handleDayPress = (d: any) => {
    const nd = dayjs(d.dateString);
    setDate(nd.format('YYYY-MM-DD'));
    setHeader(nd.format('MMMM YYYY'));
  };

  // Visible months handler — kaydırma ile ay değiştiğinde tetiklenir
  const handleVisibleMonthsChange = (months: any[]) => {
    if (!months || months.length === 0) return;
    const m = months[0];
    // months item may contain year/month (no dateString), build a date safely
    const monthDate = m.dateString ? dayjs(m.dateString) : dayjs(new Date(m.year, (m.month || m.monthNumber) - 1, 1));
    setHeader(monthDate.format('MMMM YYYY'));
  };

  return (
    <SafeAreaView style={styles.container}>
      <CalendarProvider
        date={date}
        onDateChanged={handleDateChanged}
        onMonthChange={handleMonthChange}
      >
        <View style={styles.headerWrap} pointerEvents="box-none">
          <Text style={styles.title}>
            <Text style={styles.monthText}>{dayjs(date).format('MMMM').toUpperCase()} </Text>
            <Text style={styles.yearText}>{dayjs(date).format('YYYY')}</Text>
          </Text>
        </View>

        <View style={styles.weekWrapper}>
          <WeekCalendar
            firstDay={1}
            onDayPress={handleDayPress}
            // visible months callback for scroll/page changes
            onVisibleMonthsChange={handleVisibleMonthsChange as any}
            // fallback: onMonthChange for some versions
            onMonthChange={(m: any) => {
              if (m?.dateString) setHeader(dayjs(m.dateString).format('MMMM YYYY'));
            }}
            markedDates={{ [date]: { selected: true, selectedColor: '#AAAFCA' } }}
            theme={weekTheme}
            style={styles.weekCalendar}
          />
        </View>
      </CalendarProvider>

      <View style={styles.selectedWrap}>
        <Text style={styles.selectedText}>
          Seçili gün: {dayjs(date).format('dddd, DD MMMM YYYY')}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  headerWrap: { paddingTop: 12, paddingHorizontal: 16, alignItems: 'center', marginTop: 60 },
  title: {
    fontFamily: 'Roboto',
    fontSize: 35,
    fontWeight: '700',
    textTransform: 'uppercase',
    position: 'relative',
    top: -7,
    left: -80,
  },
  monthText: {
    color: '#E5E3BF',
    fontFamily: 'Roboto',
  },
  yearText: {
    color: '#474463',
    fontFamily: 'Roboto',
  },
  weekWrapper: { overflow: 'hidden', height: 80 },
  weekCalendar: { marginTop: 8, backgroundColor: 'transparent', height: '100%' },
  selectedWrap: { padding: 16, alignItems: 'center' },
  selectedText: { color: '#666', fontSize: 14 },
});
