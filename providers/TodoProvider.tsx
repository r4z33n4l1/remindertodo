import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { TodoWithGroup, Group, NotificationSchedule } from '../types/database';
import * as todoUtils from '../utils/todoUtils';

type TodoContextType = {
  todos: TodoWithGroup[];
  groups: Group[];
  loading: boolean;
  createTodo: (
    task: string,
    finish_by: string | null,
    groupId?: number,
    priorityLevel?: number,
    notifications?: NotificationSchedule | null
  ) => Promise<void>;
  updateTodo: (todoId: number, updates: any) => Promise<void>;
  deleteTodo: (todoId: number) => Promise<void>;
  createGroup: (name: string, deadline?: string) => Promise<void>;
  refreshTodos: () => Promise<void>;
};

const TodoContext = createContext<TodoContextType | undefined>(undefined);

export function TodoProvider({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  const [todos, setTodos] = useState<TodoWithGroup[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshTodos = async () => {
    if (!session?.user) return;
    try {
      const [fetchedTodos, fetchedGroups] = await Promise.all([
        todoUtils.fetchTodos(session.user.id),
        todoUtils.fetchGroups(),
      ]);
      setTodos(fetchedTodos);
      setGroups(fetchedGroups);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user) {
      refreshTodos();
    }
  }, [session]);

  const createTodo = async (
    task: string,
    finish_by: string | null = null,
    groupId?: number,
    priorityLevel: number = 1,
    notifications: NotificationSchedule | null = null
  ) => {
    if (!session?.user) return;
    await todoUtils.createTodo(
      session.user.id,
      task,
      finish_by,
      groupId,
      priorityLevel,
      notifications
    );
    refreshTodos();
  };

  const updateTodo = async (todoId: number, updates: any) => {
    await todoUtils.updateTodo(todoId, updates);
    refreshTodos();
  };

  const deleteTodo = async (todoId: number) => {
    await todoUtils.deleteTodo(todoId);
    refreshTodos();
  };

  const createGroup = async (name: string, deadline?: string) => {
    await todoUtils.createGroup(name, deadline);
    refreshTodos();
  };

  return (
    <TodoContext.Provider
      value={{
        todos,
        groups,
        loading,
        createTodo,
        updateTodo,
        deleteTodo,
        createGroup,
        refreshTodos,
      }}
    >
      {children}
    </TodoContext.Provider>
  );
}

export const useTodos = () => {
  const context = useContext(TodoContext);
  if (context === undefined) {
    throw new Error('useTodos must be used within a TodoProvider');
  }
  return context;
}; 