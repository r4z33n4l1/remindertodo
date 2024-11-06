export interface Todo {
  id: string;
  title: string;
  description: string;
  points: number;
  parentTodoId?: string; // for related/sub tasks
  completed: boolean;
  createdAt: Date;
  reminder: ReminderSettings;
}

export interface ReminderSettings {
  deadline?: Date;
  frequency: ReminderFrequency;
  enabled: boolean;
  lastNotified?: Date;
}

export enum ReminderFrequency {
  NONE = 'NONE',
  ONCE = 'ONCE',
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  CUSTOM = 'CUSTOM'
}

export interface CustomReminderSchedule {
  intervalHours: number; // For custom intervals
  specificDays?: number[]; // 0-6 for days of week
  specificTimes?: string[]; // HH:mm format
} 