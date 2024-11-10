import React, { useMemo } from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { useTodos } from '../../providers/TodoProvider';
import { TodoItem } from '../../components/TodoItem';
import { Collapsible } from '../../components/Collapsible';
import { router } from 'expo-router';
import { TodoWithGroup } from '../../types/database';

interface GroupedTodos {
  id: number | null;
  name: string;
  todos: {
    completed: TodoWithGroup[];
    incomplete: TodoWithGroup[];
  };
}

export default function AllTasks() {
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
        // If group doesn't exist, put in "Not Grouped"
        const notGrouped = grouped.get(null)!;
        if (todo.is_complete) {
          notGrouped.todos.completed.push(todo);
        } else {
          notGrouped.todos.incomplete.push(todo);
        }
      }
    });

    // Sort todos within each completion status by priority
    const sortByPriority = (a: TodoWithGroup, b: TodoWithGroup) => {
      if (a.priority_level !== b.priority_level) {
        return b.priority_level - a.priority_level;
      }
      return new Date(b.inserted_at).getTime() - new Date(a.inserted_at).getTime();
    };

    // Sort each group's todos
    grouped.forEach(group => {
      group.todos.completed.sort(sortByPriority);
      group.todos.incomplete.sort(sortByPriority);
    });

    return Array.from(grouped.values())
      // Filter out empty groups
      .filter(group => 
        group.todos.completed.length > 0 || group.todos.incomplete.length > 0
      )
      // Sort groups (Not Grouped always first, then alphabetically)
      .sort((a, b) => {
        if (a.id === null) return -1;
        if (b.id === null) return 1;
        return a.name.localeCompare(b.name);
      });
  }, [todos, groups]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {groupedTodos.map(group => (
          <Collapsible
            key={group.id ?? 'ungrouped'}
            title={group.name}
            count={group.todos.completed.length + group.todos.incomplete.length}
          >
            {/* Incomplete Tasks */}
            {group.todos.incomplete.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>To Do</Text>
                {group.todos.incomplete.map(todo => (
                  <TodoItem
                    key={todo.id}
                    todo={todo}
                    onEdit={() => router.push(`/todo/${todo.id}`)}
                  />
                ))}
              </>
            )}

            {/* Separator if both sections have items */}
            {group.todos.incomplete.length > 0 && group.todos.completed.length > 0 && (
              <View style={styles.separator} />
            )}

            {/* Completed Tasks */}
            {group.todos.completed.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Completed</Text>
                {group.todos.completed.map(todo => (
                  <TodoItem
                    key={todo.id}
                    todo={todo}
                    onEdit={() => router.push(`/todo/${todo.id}`)}
                  />
                ))}
              </>
            )}
          </Collapsible>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  content: {
    padding: 16,
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
}); 