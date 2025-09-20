export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'pending' | 'in-progress' | 'done';

export interface Task {
  id: string;
  title: string;
  priority: TaskPriority;
  status: TaskStatus;
  user_id: string;
  parent_id?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTaskData {
  title: string;
  priority: TaskPriority;
  status: TaskStatus;
  parent_id?: string;
}

export interface UpdateTaskData {
  title?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  parent_id?: string;
}