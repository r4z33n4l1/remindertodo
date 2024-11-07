import React, { useState } from 'react';
import {
  Modal,
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useTodos } from '../providers/TodoProvider';
import { Group } from '../types/database';

interface AddTodoModalProps {
  visible: boolean;
  onClose: () => void;
}

export function AddTodoModal({ visible, onClose }: AddTodoModalProps) {
  const [task, setTask] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<number | undefined>();
  const [priority, setPriority] = useState(1);
  const { createTodo, groups } = useTodos();

  const handleSubmit = async () => {
    if (!task.trim()) {
      alert('Please enter a task');
      return;
    }

    try {
      await createTodo(task, selectedGroup, priority);
      setTask('');
      setSelectedGroup(undefined);
      setPriority(1);
      onClose();
    } catch (error) {
      alert('Error creating todo');
      console.error(error);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalContainer}
      >
        <View style={styles.modalContent}>
          <ScrollView>
            <Text style={styles.modalTitle}>Add New Task</Text>

            <Text style={styles.label}>Task</Text>
            <TextInput
              style={styles.input}
              value={task}
              onChangeText={setTask}
              placeholder="Enter task"
              multiline
            />

            <Text style={styles.label}>Group</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedGroup}
                onValueChange={(value) => setSelectedGroup(value)}
              >
                <Picker.Item label="No Group" value={undefined} />
                {groups.map((group) => (
                  <Picker.Item
                    key={group.id}
                    label={group.name}
                    value={group.id}
                  />
                ))}
              </Picker>
            </View>

            <Text style={styles.label}>Priority</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={priority}
                onValueChange={(value) => setPriority(value)}
              >
                <Picker.Item label="Low" value={1} />
                <Picker.Item label="Medium" value={2} />
                <Picker.Item label="High" value={3} />
              </Picker>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={onClose}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.submitButton]}
                onPress={handleSubmit}
              >
                <Text style={styles.buttonText}>Add Task</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
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
    marginBottom: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 20,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButton: {
    backgroundColor: '#007AFF',
  },
  cancelButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 