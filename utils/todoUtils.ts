import { supabase } from './supabase';
import { Todo, Group, TodoWithGroup, NotificationSchedule } from '../types/database';

export async function fetchTodos(userId: string): Promise<TodoWithGroup[]> {
  const { data, error } = await supabase
    .from('todos')
    .select(`
      *,
      group (*)
    `)
    .eq('user_id', userId)
    .order('inserted_at', { ascending: false });

  if (error) {
    console.error('Error fetching todos:', error);
    throw error;
  }

  return data || [];
}

export async function createTodo(
  userId: string,
  task: string,
  finish_by: string | null = null,
  groupId?: number,
  priorityLevel: number = 1,
  notifications: NotificationSchedule | null = null
): Promise<Todo> {
  const { data, error } = await supabase
    .from('todos')
    .insert([
      {
        user_id: userId,
        task,
        group_id: groupId,
        priority_level: priorityLevel,
        is_complete: false,
        finish_by,
        notifications,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating todo:', error);
    throw error;
  }

  return data;
}

export async function updateTodo(
  todoId: number,
  updates: Partial<Omit<Todo, 'id' | 'user_id' | 'inserted_at'>>
): Promise<Todo> {
  const { data, error } = await supabase
    .from('todos')
    .update(updates)
    .eq('id', todoId)
    .select()
    .single();

  if (error) {
    console.error('Error updating todo:', error);
    throw error;
  }

  return data;
}

export async function deleteTodo(todoId: number): Promise<void> {
  const { error } = await supabase
    .from('todos')
    .delete()
    .eq('id', todoId);

  if (error) {
    console.error('Error deleting todo:', error);
    throw error;
  }
}

// Group operations
export async function fetchGroups(): Promise<Group[]> {
  const { data, error } = await supabase
    .from('group')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching groups:', error);
    throw error;
  }

  return data || [];
}

export async function createGroup(name: string, deadline?: string): Promise<Group> {
  const { data, error } = await supabase
    .from('group')
    .insert([
      {
        name,
        deadline,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating group:', error);
    throw error;
  }

  return data;
} 