import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TodoWithGroup } from '../types/database';
import { useTodos } from '../providers/TodoProvider';

interface TodoItemProps {
  todo: TodoWithGroup;
  onEdit: () => void;
}

export function TodoItem({ todo, onEdit }: TodoItemProps) {
  const { updateTodo, deleteTodo } = useTodos();

  const handleToggleComplete = async () => {
    try {
      await updateTodo(todo.id, { is_complete: !todo.is_complete });
    } catch (error) {
      console.error('Error toggling todo:', error);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTodo(todo.id);
            } catch (error) {
              console.error('Error deleting todo:', error);
            }
          },
        },
      ]
    );
  };

  const getPriorityColor = () => {
    switch (todo.priority_level) {
      case 3:
        return '#FF3B30';
      case 2:
        return '#FF9500';
      default:
        return '#34C759';
    }
  };

  return (
    <View style={[styles.container, todo.is_complete && styles.completedContainer]}>
      <TouchableOpacity
        style={styles.checkbox}
        onPress={handleToggleComplete}
      >
        <View
          style={[
            styles.checkboxInner,
            todo.is_complete && styles.checkboxChecked,
          ]}
        >
          {todo.is_complete && (
            <Ionicons name="checkmark" size={16} color="white" />
          )}
        </View>
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text
            style={[
              styles.title,
              todo.is_complete && styles.completedText,
            ]}
          >
            {todo.task}
          </Text>
          <View
            style={[
              styles.priorityBadge,
              { backgroundColor: getPriorityColor() },
            ]}
          >
            <Text style={styles.priorityText}>
              {todo.priority_level === 3
                ? 'High'
                : todo.priority_level === 2
                ? 'Medium'
                : 'Low'}
            </Text>
          </View>
        </View>

        {todo.group && (
          <Text style={styles.group}>
            <Ionicons name="folder-outline" size={14} /> {todo.group.name}
          </Text>
        )}

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={onEdit}
          >
            <Ionicons name="pencil-outline" size={20} color="#007AFF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleDelete}
          >
            <Ionicons name="trash-outline" size={20} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  completedContainer: {
    opacity: 0.7,
    backgroundColor: '#f8f8f8',
  },
  checkbox: {
    marginRight: 12,
    justifyContent: 'center',
  },
  checkboxInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#007AFF',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  priorityText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  group: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
    gap: 12,
  },
  actionButton: {
    padding: 4,
  },
}); 