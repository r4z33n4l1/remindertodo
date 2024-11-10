export interface Todo {
  id: number;
  user_id: string;
  task: string;
  is_complete: boolean;
  inserted_at: string;
  group_id: number | null;
  priority_level: number;
  finish_by: string | null;
  calendar_event_id?: string;
  notifications: NotificationSchedule | null;
}

export type NotificationFrequency = 
  | 'once' 
  | 'hourly-on-due-date'
  | 'daily'
  | 'daily-from-due-date'
  | 'custom-interval';

export interface NotificationSchedule {
  id: string;
  todoId: string;
  title: string;
  body: string;
  frequency: NotificationFrequency;
  dueDate: string;
  settings: {
    notificationTime?: string;
    daysBeforeDue?: number;
    intervalMinutes?: number;
    startHour?: number;
    endHour?: number;
  };
  createdAt: string;
  updatedAt: string;
  lastNotificationAt?: string;
  nextNotificationAt: string;
  isActive: boolean;
  isCompleted: boolean;
}

export interface Group {
  id: number;
  created_at: string;
  name: string;
  deadline: string | null;
}

export interface TodoWithGroup extends Todo {
  group: Group | null;
} 