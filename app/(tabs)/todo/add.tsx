import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Text,
  ScrollView,
  Alert,
  Platform,
  Switch,
} from 'react-native';
import { useTodos } from '../../../providers/TodoProvider';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { NotificationFrequency, NotificationSchedule } from '../../../types/database';
import { Picker } from '@react-native-picker/picker';
import { v4 as uuidv4 } from 'uuid';

export default function AddTodo() {
  const [task, setTask] = useState('');
  const [priority, setPriority] = useState(1);
  const [finishBy, setFinishBy] = useState<Date | null>(null);
  const [showIOSDatePicker, setShowIOSDatePicker] = useState(false);
  const [showIOSTimePicker, setShowIOSTimePicker] = useState(false);

  // Notification settings
  const [enableNotifications, setEnableNotifications] = useState(false);
  const [notificationFrequency, setNotificationFrequency] = useState<NotificationFrequency>('once');
  const [notificationTime, setNotificationTime] = useState<Date>(new Date());
  const [showNotificationTimePicker, setShowNotificationTimePicker] = useState(false);
  const [daysBeforeDue, setDaysBeforeDue] = useState('1');
  const [intervalMinutes, setIntervalMinutes] = useState('60');
  const [startHour, setStartHour] = useState('9');
  const [endHour, setEndHour] = useState('17');

  const { createTodo } = useTodos();

  const onChange = (event: any, selectedDate?: Date) => {
    if (event.type === 'dismissed') {
      return;
    }

    const currentDate = selectedDate || finishBy || new Date();
    
    if (currentDate <= new Date()) {
      Alert.alert('Error', 'Please select a future date and time');
      return;
    }

    setFinishBy(currentDate);

    if (Platform.OS === 'android') {
      if (!finishBy) {
        showAndroidTimePicker(currentDate);
      }
    }
  };

  const showAndroidDatePicker = () => {
    DateTimePickerAndroid.open({
      value: finishBy || new Date(),
      onChange,
      mode: 'date',
      minimumDate: new Date(),
    });
  };

  const showAndroidTimePicker = (date: Date) => {
    DateTimePickerAndroid.open({
      value: date,
      onChange,
      mode: 'time',
      is24Hour: true,
    });
  };

  const showDatePicker = () => {
    if (Platform.OS === 'android') {
      showAndroidDatePicker();
    } else {
      setShowIOSDatePicker(true);
    }
  };

  const createNotificationSchedule = (): NotificationSchedule | null => {
    if (!enableNotifications || !finishBy) return null;

    const schedule: NotificationSchedule = {
      id: uuidv4(),
      todoId: '', // Will be set after todo creation
      title: task,
      body: `Due: ${finishBy.toLocaleString()}`,
      frequency: notificationFrequency,
      dueDate: finishBy.toISOString(),
      settings: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      nextNotificationAt: new Date().toISOString(),
      isActive: true,
      isCompleted: false,
    };

    switch (notificationFrequency) {
      case 'daily':
      case 'daily-from-due-date':
        schedule.settings.notificationTime = notificationTime.toLocaleTimeString('en-US', { 
          hour12: false,
          hour: '2-digit',
          minute: '2-digit'
        });
        if (notificationFrequency === 'daily-from-due-date') {
          schedule.settings.daysBeforeDue = parseInt(daysBeforeDue);
        }
        break;

      case 'custom-interval':
        schedule.settings.intervalMinutes = parseInt(intervalMinutes);
        break;

      case 'hourly-on-due-date':
        schedule.settings.startHour = parseInt(startHour);
        schedule.settings.endHour = parseInt(endHour);
        break;
    }

    return schedule;
  };

  const handleSubmit = async () => {
    if (!task.trim()) {
      Alert.alert('Error', 'Please enter a task');
      return;
    }

    if (enableNotifications && !finishBy) {
      Alert.alert('Error', 'Please set a due date for notifications');
      return;
    }

    try {
      const notificationSchedule = createNotificationSchedule();
      await createTodo(
        task,
        finishBy?.toISOString() || null,
        undefined,
        priority,
        notificationSchedule
      );
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to create task');
      console.error(error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.label}>Task</Text>
        <TextInput
          style={styles.input}
          value={task}
          onChangeText={setTask}
          placeholder="Enter task"
          placeholderTextColor="#999"
          multiline
        />

        <Text style={styles.label}>Finish By</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={showDatePicker}
        >
          <Ionicons name="calendar-outline" size={24} color="#007AFF" />
          <Text style={styles.dateButtonText}>
            {finishBy 
              ? finishBy.toLocaleString()
              : 'Select Date and Time'}
          </Text>
        </TouchableOpacity>

        {/* iOS Date Picker */}
        {Platform.OS === 'ios' && (
          <>
            {showIOSDatePicker && (
              <View style={styles.pickerContainer}>
                <DateTimePicker
                  value={finishBy || new Date()}
                  mode="date"
                  display="inline"
                  minimumDate={new Date()}
                  onChange={(event, date) => {
                    setShowIOSDatePicker(false);
                    if (date) {
                      onChange(event, date);
                      setShowIOSTimePicker(true);
                    }
                  }}
                  themeVariant="light"
                />
              </View>
            )}
            {showIOSTimePicker && (
              <View style={styles.pickerContainer}>
                <DateTimePicker
                  value={finishBy || new Date()}
                  mode="time"
                  display="spinner"
                  onChange={(event, date) => {
                    setShowIOSTimePicker(false);
                    if (date) {
                      onChange(event, date);
                    }
                  }}
                  themeVariant="light"
                />
              </View>
            )}
          </>
        )}

        <Text style={styles.label}>Priority</Text>
        <View style={styles.priorityContainer}>
          {[1, 2, 3].map((level) => (
            <TouchableOpacity
              key={level}
              style={[
                styles.priorityButton,
                priority === level && styles.priorityButtonSelected,
              ]}
              onPress={() => setPriority(level)}
            >
              <Text
                style={[
                  styles.priorityText,
                  priority === level && styles.priorityTextSelected,
                ]}
              >
                {level === 1 ? 'Low' : level === 2 ? 'Medium' : 'High'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.notificationToggle}>
          <Text style={styles.label}>Enable Notifications</Text>
          <Switch
            value={enableNotifications}
            onValueChange={setEnableNotifications}
          />
        </View>

        {enableNotifications && (
          <View style={styles.notificationSection}>
            <Text style={styles.label}>Notification Frequency</Text>
            <Picker
              selectedValue={notificationFrequency}
              onValueChange={(value) => setNotificationFrequency(value as NotificationFrequency)}
              style={styles.picker}
            >
              <Picker.Item label="Once (On due date)" value="once" />
              <Picker.Item label="Hourly (On due date)" value="hourly-on-due-date" />
              <Picker.Item label="Daily" value="daily" />
              <Picker.Item label="Daily before due date" value="daily-from-due-date" />
              <Picker.Item label="Custom interval" value="custom-interval" />
            </Picker>

            {(notificationFrequency === 'daily' || notificationFrequency === 'daily-from-due-date') && (
              <TouchableOpacity
                style={styles.timeButton}
                onPress={() => setShowNotificationTimePicker(true)}
              >
                <Text style={styles.timeButtonText}>
                  Notification Time: {notificationTime.toLocaleTimeString()}
                </Text>
              </TouchableOpacity>
            )}

            {notificationFrequency === 'daily-from-due-date' && (
              <View style={styles.inputRow}>
                <Text style={styles.label}>Days before due date:</Text>
                <TextInput
                  style={styles.numberInput}
                  value={daysBeforeDue}
                  onChangeText={setDaysBeforeDue}
                  keyboardType="number-pad"
                />
              </View>
            )}

            {notificationFrequency === 'custom-interval' && (
              <View style={styles.inputRow}>
                <Text style={styles.label}>Interval (minutes):</Text>
                <TextInput
                  style={styles.numberInput}
                  value={intervalMinutes}
                  onChangeText={setIntervalMinutes}
                  keyboardType="number-pad"
                />
              </View>
            )}

            {notificationFrequency === 'hourly-on-due-date' && (
              <View>
                <View style={styles.inputRow}>
                  <Text style={styles.label}>Start Hour (0-23):</Text>
                  <TextInput
                    style={styles.numberInput}
                    value={startHour}
                    onChangeText={setStartHour}
                    keyboardType="number-pad"
                  />
                </View>
                <View style={styles.inputRow}>
                  <Text style={styles.label}>End Hour (0-23):</Text>
                  <TextInput
                    style={styles.numberInput}
                    value={endHour}
                    onChangeText={setEndHour}
                    keyboardType="number-pad"
                  />
                </View>
              </View>
            )}

            {showNotificationTimePicker && Platform.OS === 'ios' && (
              <DateTimePicker
                value={notificationTime}
                mode="time"
                display="spinner"
                onChange={(event, selectedDate) => {
                  setShowNotificationTimePicker(false);
                  if (selectedDate) {
                    setNotificationTime(selectedDate);
                  }
                }}
              />
            )}
          </View>
        )}

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
        >
          <Text style={styles.submitButtonText}>Create Task</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  card: {
    margin: 16,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
    minHeight: 100,
    textAlignVertical: 'top',
    backgroundColor: '#fff',
    color: '#333',
    fontSize: 16,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginBottom: 24,
    backgroundColor: '#fff',
  },
  dateButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  priorityContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  priorityButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  priorityButtonSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  priorityText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 15,
  },
  priorityTextSelected: {
    color: 'white',
  },
  notificationSection: {
    marginTop: 16,
  },
  notificationToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 16,
  },
  picker: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginBottom: 16,
  },
  timeButton: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  timeButtonText: {
    color: '#007AFF',
    textAlign: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  numberInput: {
    backgroundColor: '#f0f0f0',
    padding: 8,
    borderRadius: 8,
    width: 80,
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 