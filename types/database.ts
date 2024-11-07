export interface Todo {
  id: number;
  user_id: string;
  task: string;
  is_complete: boolean;
  inserted_at: string;
  group_id: number | null;
  priority_level: number;
}

export interface Group {
  id: number;
  created_at: string;
  name: string;
  deadline: string | null;
}

export interface TodoWithGroup extends Todo {
  group: Group | null;
} 