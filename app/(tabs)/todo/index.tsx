import React, { useMemo } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity } from 'react-native';
import { useTodos } from '../../../providers/TodoProvider';
import { TodoItem } from '../../../components/TodoItem';
import { Collapsible } from '../../../components/Collapsible';
import { router } from 'expo-router';
import { TodoWithGroup } from '../../../types/database';
import { Ionicons } from '@expo/vector-icons';

interface GroupedTodos {
  id: number | null;
  name: string;
  todos: {
    completed: TodoWithGroup[];
    incomplete: TodoWithGroup[];
  };
}

export default function TodoScreen() {
  const { todos, groups } = useTodos();

  const groupedTodos = useMemo(() => {
    const grouped = new Map<number | null, GroupedTodos>();
    
    // Initialize "Not Grouped" category
    grouped.set(null, {
      id: null,
      name: 'Not Grouped',
      todos: {
        completed: [],
        incomplete: [],
      },
    });

    // Initialize groups from the groups array
    groups.forEach(group => {
      grouped.set(group.id, {
        id: group.id,
        name: group.name,
        todos: {
          completed: [],
          incomplete: [],
        },
      });
    });

    // Sort todos into groups
    todos.forEach(todo => {
      const groupId = todo.group_id;
      if (grouped.has(groupId)) {
        const group = grouped.get(groupId)!;
        if (todo.is_complete) {
          group.todos.completed.push(todo);
        } else {
          group.todos.incomplete.push(todo);
        }
      } else {
        const notGrouped = grouped.get(null)!;
        if (todo.is_complete) {
          notGrouped.todos.completed.push(todo);
        } else {
          notGrouped.todos.incomplete.push(todo);
        }
      }
    });

    // Sort todos within each completion status by priority and date
    const sortByPriority = (a: TodoWithGroup, b: TodoWithGroup) => {
      if (a.priority_level !== b.priority_level) {
        return b.priority_level - a.priority_level;
      }
      return new Date(b.inserted_at).getTime() - new Date(a.inserted_at).getTime();
    };

    grouped.forEach(group => {
      group.todos.completed.sort(sortByPriority);
      group.todos.incomplete.sort(sortByPriority);
    });

    return Array.from(grouped.values())
      .filter(group => 
        group.todos.completed.length > 0 || group.todos.incomplete.length > 0
      )
      .sort((a, b) => {
        if (a.id === null) return -1;
        if (b.id === null) return 1;
        return a.name.localeCompare(b.name);
      });
  }, [todos, groups]);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/todo/create')}
      >
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>

      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {groupedTodos.map(group => (
            <Collapsible
              key={group.id ?? 'ungrouped'}
              title={group.name}
              count={group.todos.completed.length + group.todos.incomplete.length}
            >
              {group.todos.incomplete.length > 0 && (
                <>
                  <Text style={styles.sectionTitle}>To Do</Text>
                  {group.todos.incomplete.map(todo => (
                    <TodoItem
                      key={todo.id}
                      todo={todo}
                      onEdit={() => router.push(`/todo/edit?id=${todo.id}`)}
                    />
                  ))}
                </>
              )}

              {group.todos.incomplete.length > 0 && group.todos.completed.length > 0 && (
                <View style={styles.separator} />
              )}

              {group.todos.completed.length > 0 && (
                <>
                  <Text style={styles.sectionTitle}>Completed</Text>
                  {group.todos.completed.map(todo => (
                    <TodoItem
                      key={todo.id}
                      todo={todo}
                      onEdit={() => router.push(`/todo/edit?id=${todo.id}`)}
                    />
                  ))}
                </>
              )}
            </Collapsible>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 80, // Space for FAB
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginVertical: 8,
    marginLeft: 4,
  },
  separator: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 12,
    marginHorizontal: 4,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#007AFF',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
