import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Text,
  ScrollView,
  Alert,
} from 'react-native';
import { useTodos } from '../../providers/TodoProvider';
import { router } from 'expo-router';

export default function AddTodo() {
  const [task, setTask] = useState('');
  const [priority, setPriority] = useState(1);
  const { createTodo } = useTodos();

  const handleSubmit = async () => {
    if (!task.trim()) {
      Alert.alert('Error', 'Please enter a task');
      return;
    }

    try {
      await createTodo(task, undefined, priority);
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to create task');
      console.error(error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Task</Text>
      <TextInput
        style={styles.input}
        value={task}
        onChangeText={setTask}
        placeholder="Enter task"
        multiline
      />

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

      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSubmit}
      >
        <Text style={styles.submitButtonText}>Create Task</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#666',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
    minHeight: 100,
    textAlignVertical: 'top',
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
    borderColor: '#ddd',
    alignItems: 'center',
  },
  priorityButtonSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  priorityText: {
    color: '#666',
    fontWeight: '600',
  },
  priorityTextSelected: {
    color: 'white',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 