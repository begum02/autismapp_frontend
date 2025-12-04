import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CalendarProvider, WeekCalendar, CalendarProps } from 'react-native-calendars';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';

dayjs.locale('tr');

type Props = Partial<CalendarProps> & {
  date?: string;
  onDayPress?: (day: { dateString: string }) => void;
  onVisibleMonthsChange?: (visibleMonths: any[]) => void; // parent'tan geliyor (opsiyonel)
  onMonthChange?: (month: any) => void;                    // parent'tan geliyor (opsiyonel)
};

const baseWeekTheme: any = {
  calendarBackground: 'transparent',
  todayTextColor: '#7B4FA0',
  arrowColor: '#7B4FA0',
  textDayFontWeight: '600',
  textDayFontSize: 14,
  textMonthFontWeight: '700',
  'stylesheet.day.basic': {
    base: {
      width: 40, height: 40,
      alignItems: 'center', justifyContent: 'center',
      borderWidth: 2, borderColor: '#2F3C7E', borderRadius: 20,
    },
    text: { fontFamily: 'Roboto', fontWeight: '700', fontSize: 17, color: '#222' },
    selected: {
      width: 40, height: 40,
      alignItems: 'center', justifyContent: 'center',
      borderWidth: 0, borderRadius: 20, backgroundColor: '#AAAFCA',
    },
    selectedText: { fontFamily: 'Roboto', fontWeight: '700', fontSize: 17, color: '#2F3C7E' },
    today: {
      width: 40, height: 40,
      alignItems: 'center', justifyContent: 'center',
      borderWidth: 2, borderColor: '#2F3C7E', borderRadius: 20,
    },
    todayText: { fontFamily: 'Roboto', fontWeight: '700', fontSize: 17, color: '#7B4FA0' },
  },
  'stylesheet.calendar.header': {
    header: { backgroundColor: 'transparent', borderBottomWidth: 0 },
    week: { backgroundColor: 'transparent', borderBottomWidth: 0 },
  },
};

export default function CustomWeekCalendar(props: Props) {
  const {
    date: propDate,
    onDayPress: propOnDayPress,
    onVisibleMonthsChange: propOnVisibleMonthsChange,
    onMonthChange: propOnMonthChange,
    theme: propTheme,
    markedDates: propMarked,
    ...weekProps
  } = props;

  const [date, setDate] = useState<string>(propDate ?? dayjs().format('YYYY-MM-DD'));
  const [headerDate, setHeaderDate] = useState(dayjs(propDate ?? date));

  // dışarıdan gelen date prop'u ile senkron
  useEffect(() => {
    if (propDate && propDate !== date) {
      setDate(propDate);
      setHeaderDate(dayjs(propDate));
      // Parent "visible months" bekliyorsa bir kere initial bildir
      propOnVisibleMonthsChange?.([{ dateString: propDate } as any]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propDate]);

  // Gün seçimi (tap)
  const handleDayPress = useCallback(
    (d: any) => {
      const ds = d?.dateString;
      if (ds) {
        setDate(ds);
        setHeaderDate(dayjs(ds));
      }
      propOnDayPress?.(d);
    },
    [propOnDayPress]
  );

  // 🔑 ESAS FİKİR: Scroll/Swipe olaylarını CalendarProvider'dan yakala
  const handleProviderDateChanged = useCallback((d: string /*, updateSource*/) => {
    // Haftalar arası kaydırınca odaklanan gün değişir → başlık ve state güncellenir
    setDate(d);
    setHeaderDate(dayjs(d));
  }, []);

  const handleProviderMonthChange = useCallback((m: any /*, updateSource*/) => {
    // Ay sınırı geçildi; parent'a forward + başlığı ayın 1'ine ayarla
    try {
      const monthDate = m?.dateString
        ? dayjs(m.dateString)
        : dayjs(new Date(m.year, (m.month ?? m.monthNumber) - 1, 1));
      setHeaderDate(monthDate);
    } catch {}
    // Parent callback'lerini bilgilendir
    if (propOnVisibleMonthsChange) propOnVisibleMonthsChange([m]);
    if (propOnMonthChange) propOnMonthChange(m);
  }, [propOnVisibleMonthsChange, propOnMonthChange]);

  const theme = { ...baseWeekTheme, ...(propTheme as object) };
  const markedDates = propMarked ?? { [date]: { selected: true, selectedColor: '#AAAFCA' } };

  return (
    <View style={styles.container}>
      <CalendarProvider
        date={date}
        onDateChanged={handleProviderDateChanged}
        onMonthChange={handleProviderMonthChange}
      >
        {/* İç header (istersen burayı tamamen kaldırabilirsin; parent zaten kendi başlığını çiziyor) */}
        <View style={styles.headerWrap} pointerEvents="box-none">
          <Text style={styles.title}>
            <Text style={styles.monthText}>{headerDate.format('MMMM').toUpperCase()} </Text>
            <Text style={styles.yearText}>{headerDate.format('YYYY')}</Text>
          </Text>
        </View>

        <View style={styles.weekWrapper} pointerEvents="auto">
          <WeekCalendar
            firstDay={1}
            pastScrollRange={6}
            futureScrollRange={6}
            onDayPress={handleDayPress}
            // DİKKAT: onVisibleMonthsChange / onMonthChange'ı CalendarProvider yönetiyor.
            markedDates={markedDates}
            theme={theme}
            style={styles.weekCalendar}
            {...(weekProps as any)}
          />
        </View>
      </CalendarProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: 'transparent' },
  headerWrap: { paddingTop: 12, alignItems: 'center', marginTop: 24 },
  title: { fontFamily: 'Roboto', fontSize: 28, fontWeight: '700', textTransform: 'uppercase' },
  monthText: { color: '#E5E3BF', fontFamily: 'Roboto' },
  yearText: { color: '#474463', fontFamily: 'Roboto' },
  weekWrapper: { overflow: 'hidden', height: 100, width: '100%', paddingVertical: 8, zIndex: 10, elevation: 0 },
  weekCalendar: { backgroundColor: 'transparent', height: '100%' },
});
