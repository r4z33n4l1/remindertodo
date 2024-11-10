import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { NotificationSchedule } from '../types/database';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function requestNotificationPermissions() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    return false;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return true;
}

export async function scheduleNotification(
  title: string,
  body: string,
  trigger: Date
): Promise<string> {
  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
    },
    trigger: {
      date: trigger,
    },
  });
  return id;
}

export async function cancelNotification(notificationId: string) {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}

export async function getAllScheduledNotifications() {
  return await Notifications.getAllScheduledNotificationsAsync();
}

export function calculateNextNotificationDate(schedule: NotificationSchedule): Date {
  const dueDate = new Date(schedule.dueDate);
  const now = new Date();

  switch (schedule.frequency) {
    case 'once':
      return dueDate;

    case 'daily':
      const [hours, minutes] = schedule.settings.notificationTime!.split(':').map(Number);
      const nextDaily = new Date();
      nextDaily.setHours(hours, minutes, 0, 0);
      if (nextDaily <= now) {
        nextDaily.setDate(nextDaily.getDate() + 1);
      }
      return nextDaily;

    case 'daily-from-due-date':
      const daysBeforeDue = schedule.settings.daysBeforeDue || 1;
      const startDate = new Date(dueDate);
      startDate.setDate(startDate.getDate() - daysBeforeDue);
      if (startDate <= now) {
        return dueDate;
      }
      return startDate;

    case 'hourly-on-due-date':
      const dueDateHourly = new Date(dueDate);
      const startHour = schedule.settings.startHour || 9;
      const endHour = schedule.settings.endHour || 17;
      dueDateHourly.setHours(startHour, 0, 0, 0);
      return dueDateHourly;

    case 'custom-interval':
      const intervalMinutes = schedule.settings.intervalMinutes || 60;
      const nextInterval = new Date(now.getTime() + intervalMinutes * 60000);
      return nextInterval;

    default:
      return dueDate;
  }
} 