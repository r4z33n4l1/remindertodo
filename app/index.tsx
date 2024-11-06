import { useState } from "react";
import { Text, View, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { Todo } from "../types/schema";

export default function Index() {
  const [todos, setTodos] = useState<Todo[]>([]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Today's Reminders</Text>
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>+ Add Todo</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={todos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.todoItem}>
            <View style={styles.todoMain}>
              <Text style={styles.todoTitle}>{item.title}</Text>
              <Text style={styles.todoDesc}>{item.description}</Text>
            </View>
            <View style={styles.todoMeta}>
              <Text style={styles.points}>{item.points} pts</Text>
              {item.reminder.deadline && (
                <Text style={styles.deadline}>
                  {new Date(item.reminder.deadline).toLocaleTimeString()}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  todoItem: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  todoMain: {
    marginBottom: 8,
  },
  todoTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  todoDesc: {
    fontSize: 14,
    color: '#666',
  },
  todoMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  points: {
    fontSize: 14,
    fontWeight: '500',
    color: '#007AFF',
  },
  deadline: {
    fontSize: 14,
    color: '#666',
  },
});
