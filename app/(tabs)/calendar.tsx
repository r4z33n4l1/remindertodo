import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Alert, TouchableOpacity, ScrollView, Platform } from 'react-native';
import * as Calendar from 'expo-calendar';
import { useTodos } from '../../providers/TodoProvider';
import { TodoWithGroup } from '../../types/database';
import { Ionicons } from '@expo/vector-icons';

export default function CalendarView() {
  const { todos, updateTodo } = useTodos();
  const [calendarId, setCalendarId] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    checkAndSetupCalendar();
  }, []);

  const checkAndSetupCalendar = async () => {
    try {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant calendar permissions to sync your todos.');
        return;
      }

      // Check if our calendar already exists
      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      const existingCalendar = calendars.find(cal => cal.name === 'Todo Reminders');

      if (existingCalendar) {
        setCalendarId(existingCalendar.id);
      } else {
        const newCalendarId = await createCalendar();
        setCalendarId(newCalendarId);
      }
    } catch (error) {
      console.error('Calendar setup error:', error);
      Alert.alert('Error', 'Failed to setup calendar');
    }
  };

  const createCalendar = async () => {
    try {
      let defaultCalendarSource: Calendar.Source;
      
      if (Platform.OS === 'ios') {
        const calendar = await Calendar.getDefaultCalendarAsync();
        defaultCalendarSource = {
          id: calendar.source.id,
          type: calendar.source.type,
          name: calendar.source.name,
          isLocalAccount: calendar.source.isLocalAccount,
        };
      } else {
        defaultCalendarSource = {
          id: 'todo_reminders',
          type: 'local',
          name: 'Todo Reminders',
          isLocalAccount: true,
        };
      }

      const newCalendarId = await Calendar.createCalendarAsync({
        title: 'Todo Reminders',
        color: '#007AFF',
        entityType: Calendar.EntityTypes.EVENT,
        sourceId: defaultCalendarSource.id,
        source: defaultCalendarSource,
        name: 'Todo Reminders',
        ownerAccount: 'personal',
        accessLevel: Calendar.CalendarAccessLevel.OWNER,
      });

      return newCalendarId;
    } catch (error) {
      console.error('Create calendar error:', error);
      throw error;
    }
  };

  const syncTodosToCalendar = async () => {
    if (!calendarId) {
      Alert.alert('Error', 'Calendar not set up');
      return;
    }

    setSyncing(true);
    try {
      const todosWithDates = todos.filter(todo => 
        todo.finish_by !== null && !todo.is_complete
      );

      for (const todo of todosWithDates) {
        if (!todo.finish_by) continue;
        
        try {
          // If todo already has an event, update it
          if (todo.calendar_event_id) {
            try {
              // Check if event still exists
              await Calendar.getEventAsync(todo.calendar_event_id);
              
              // Update existing event
              await Calendar.updateEventAsync(todo.calendar_event_id, {
                title: todo.task,
                notes: `Priority: ${getPriorityText(todo.priority_level)}${todo.group ? `\nGroup: ${todo.group.name}` : ''}`,
                startDate: new Date(todo.finish_by),
                endDate: new Date(new Date(todo.finish_by).getTime() + 30 * 60000),
                alarms: [{ relativeOffset: -30 }],
              });
            } catch (error) {
              // Event doesn't exist anymore, create new one
              const eventId = await createCalendarEvent(todo);
              await updateTodo(todo.id, { calendar_event_id: eventId });
            }
          } else {
            // Create new event
            const eventId = await createCalendarEvent(todo);
            await updateTodo(todo.id, { calendar_event_id: eventId });
          }
        } catch (error) {
          console.error(`Error syncing todo ${todo.id}:`, error);
        }
      }

      // Clean up completed todos' events
      const completedTodos = todos.filter(todo => 
        todo.is_complete && todo.calendar_event_id
      );

      for (const todo of completedTodos) {
        if (todo.calendar_event_id) {
          try {
            await Calendar.deleteEventAsync(todo.calendar_event_id);
            await updateTodo(todo.id, { calendar_event_id: null });
          } catch (error) {
            console.error(`Error cleaning up event for todo ${todo.id}:`, error);
          }
        }
      }

      Alert.alert('Success', 'Todos have been synced to your calendar');
    } catch (error) {
      console.error('Sync error:', error);
      Alert.alert('Error', 'Failed to sync todos to calendar');
    } finally {
      setSyncing(false);
    }
  };

  const createCalendarEvent = async (todo: TodoWithGroup) => {
    if (!calendarId || !todo.finish_by) throw new Error('Invalid todo data');

    const eventId = await Calendar.createEventAsync(calendarId, {
      title: todo.task,
      notes: `Priority: ${getPriorityText(todo.priority_level)}${todo.group ? `\nGroup: ${todo.group.name}` : ''}`,
      startDate: new Date(todo.finish_by),
      endDate: new Date(new Date(todo.finish_by).getTime() + 30 * 60000),
      alarms: [{ relativeOffset: -30 }],
    });

    return eventId;
  };

  const handleDeleteEvent = async (todo: TodoWithGroup) => {
    if (!todo.calendar_event_id) return;

    try {
      await Calendar.deleteEventAsync(todo.calendar_event_id);
      await updateTodo(todo.id, { calendar_event_id: null });
      Alert.alert('Success', 'Calendar event removed');
    } catch (error) {
      console.error('Delete event error:', error);
      Alert.alert('Error', 'Failed to remove calendar event');
    }
  };

  const getPriorityText = (level: number) => {
    switch (level) {
      case 3: return 'High';
      case 2: return 'Medium';
      case 1: return 'Low';
      default: return 'None';
    }
  };

  const getUpcomingTodos = () => {
    return todos
      .filter(todo => todo.finish_by !== null && !todo.is_complete)
      .sort((a, b) => {
        if (!a.finish_by || !b.finish_by) return 0;
        return new Date(a.finish_by).getTime() - new Date(b.finish_by).getTime();
      });
  };

  const upcomingTodos = getUpcomingTodos();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.syncButton}
        onPress={syncTodosToCalendar}
        disabled={syncing}
      >
        <Ionicons name="sync" size={20} color="white" />
        <Text style={styles.syncButtonText}>
          {syncing ? 'Syncing...' : 'Sync to Calendar'}
        </Text>
      </TouchableOpacity>

      <ScrollView style={styles.todoList}>
        <Text style={styles.sectionTitle}>Upcoming Tasks</Text>
        {upcomingTodos.length === 0 ? (
          <Text style={styles.emptyText}>No upcoming tasks with deadlines</Text>
        ) : (
          upcomingTodos.map(todo => (
            <View key={todo.id} style={styles.todoItem}>
              <View style={styles.todoHeader}>
                <Text style={styles.todoTitle}>{todo.task}</Text>
                <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(todo.priority_level) }]}>
                  <Text style={styles.priorityText}>{getPriorityText(todo.priority_level)}</Text>
                </View>
              </View>
              {todo.finish_by && (
                <Text style={styles.todoDate}>
                  Due: {new Date(todo.finish_by).toLocaleString()}
                </Text>
              )}
              {todo.group && (
                <Text style={styles.todoGroup}>Group: {todo.group.name}</Text>
              )}
              {todo.calendar_event_id && (
                <TouchableOpacity 
                  style={styles.calendarButton}
                  onPress={() => handleDeleteEvent(todo)}
                >
                  <Ionicons name="calendar" size={16} color="#007AFF" />
                  <Text style={styles.calendarButtonText}>Remove from Calendar</Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const getPriorityColor = (level: number) => {
  switch (level) {
    case 3: return '#FF3B30';
    case 2: return '#FF9500';
    case 1: return '#34C759';
    default: return '#999';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 16,
  },
  syncButton: {
    flexDirection: 'row',
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  syncButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  todoList: {
    flex: 1,
  },
  todoItem: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  todoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  todoTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  todoDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  todoGroup: {
    fontSize: 14,
    color: '#666',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    marginTop: 32,
  },
  calendarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    padding: 8,
    borderRadius: 4,
    backgroundColor: '#f0f0f0',
  },
  calendarButtonText: {
    marginLeft: 4,
    color: '#007AFF',
    fontSize: 14,
  },
}); 