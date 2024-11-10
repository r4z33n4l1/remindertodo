import React, { createContext, useContext, useState, useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { Alert } from 'react-native';
import { NotificationSchedule } from '../types/database';
import * as notificationUtils from '../utils/notificationUtils';

type NotificationContextType = {
  scheduledNotifications: Notifications.NotificationRequest[];
  refreshNotifications: () => Promise<void>;
  cancelNotification: (id: string) => Promise<void>;
  scheduleNotification: (schedule: NotificationSchedule) => Promise<void>;
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [scheduledNotifications, setScheduledNotifications] = useState<
    Notifications.NotificationRequest[]
  >([]);

  useEffect(() => {
    setupNotifications();
    refreshNotifications();
  }, []);

  const setupNotifications = async () => {
    const hasPermission = await notificationUtils.requestNotificationPermissions();
    if (!hasPermission) {
      Alert.alert(
        'Permission Required',
        'Please enable notifications to receive reminders'
      );
    }
  };

  const refreshNotifications = async () => {
    const notifications = await notificationUtils.getAllScheduledNotifications();
    setScheduledNotifications(notifications);
  };

  const scheduleNotification = async (schedule: NotificationSchedule) => {
    try {
      const nextNotificationDate = notificationUtils.calculateNextNotificationDate(schedule);
      const notificationId = await notificationUtils.scheduleNotification(
        schedule.title,
        schedule.body,
        nextNotificationDate
      );
      await refreshNotifications();
      return notificationId;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      throw error;
    }
  };

  const cancelNotification = async (id: string) => {
    try {
      await notificationUtils.cancelNotification(id);
      await refreshNotifications();
    } catch (error) {
      console.error('Error canceling notification:', error);
      throw error;
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        scheduledNotifications,
        refreshNotifications,
        cancelNotification,
        scheduleNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}; 