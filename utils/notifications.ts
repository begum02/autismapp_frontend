import * as Notifications from 'expo-notifications';

export async function scheduleTaskNotification(
  title: string,
  date: Date,
  timeStart?: { hours: number; minutes: number } | null
) {
  if (!timeStart) return;
  const triggerDate = new Date(date);
  triggerDate.setHours(timeStart.hours);
  triggerDate.setMinutes(timeStart.minutes - 5); // 5 dakika önce
  triggerDate.setSeconds(0);

  // Eğer geçmiş bir tarihse, bildirim planlama!
  if (triggerDate.getTime() < Date.now()) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Görev Yaklaşıyor!',
      body: `"${title}" göreviniz 5 dakika sonra başlayacak.`,
      sound: true,
    },
    trigger: triggerDate as any, // <-- tip zorlaması
  });
}