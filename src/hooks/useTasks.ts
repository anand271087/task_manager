import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Task, CreateTaskData, UpdateTaskData } from '../types/task';
import { useAuth } from './useAuth';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [subtasks, setSubtasks] = useState<Record<string, Task[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Fetch tasks from database
  const fetchTasks = async () => {
    if (!user) {
      setTasks([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id) 
        .is('parent_id', null)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setTasks(data || []);

      // Fetch subtasks for each main task
      if (data && data.length > 0) {
        const subtaskPromises = data.map(async (task) => {
          const { data: taskSubtasks, error: subtaskError } = await supabase
            .from('tasks')
            .select('*')
            .eq('user_id', user.id)
            .eq('parent_id', task.id)
            .order('created_at', { ascending: false });

          if (subtaskError) {
            console.error('Error fetching subtasks:', subtaskError);
            return { taskId: task.id, subtasks: [] };
          }

          return { taskId: task.id, subtasks: taskSubtasks || [] };
        });

        const subtaskResults = await Promise.all(subtaskPromises);
        const subtaskMap: Record<string, Task[]> = {};
        subtaskResults.forEach(({ taskId, subtasks }) => {
          subtaskMap[taskId] = subtasks;
        });
        setSubtasks(subtaskMap);
      }
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  // Create a new task
  const createTask = async (taskData: CreateTaskData) => {
    if (!user) {
      throw new Error('User must be authenticated to create tasks');
    }

    try {
      setError(null);

      const { data, error } = await supabase
        .from('tasks')
        .insert([
          {
            ...taskData,
            user_id: user.id,
          },
        ])
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Add the new task to the local state
      if (data.parent_id) {
        // This is a subtask
        setSubtasks(prevSubtasks => ({
          ...prevSubtasks,
          [data.parent_id!]: [data, ...(prevSubtasks[data.parent_id!] || [])],
        }));
      } else {
        // This is a main task
        setTasks(prevTasks => [data, ...prevTasks]);
        setSubtasks(prevSubtasks => ({
          ...prevSubtasks,
          [data.id]: [],
        }));
      }
      return data;
    } catch (err) {
      console.error('Error creating task:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create task';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Update an existing task
  const updateTask = async (id: string, updates: UpdateTaskData) => {
    if (!user) {
      throw new Error('User must be authenticated to update tasks');
    }

    try {
      setError(null);

      const { data, error } = await supabase
        .from('tasks')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Update the task in local state
      if (data.parent_id) {
        // This is a subtask
        setSubtasks(prevSubtasks => ({
          ...prevSubtasks,
          [data.parent_id!]: prevSubtasks[data.parent_id!]?.map(task => 
            task.id === id ? data : task
          ) || [],
        }));
      } else {
        // This is a main task
        setTasks(prevTasks =>
          prevTasks.map(task => (task.id === id ? data : task))
        );
      }
      return data;
    } catch (err) {
      console.error('Error updating task:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update task';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Delete a task
  const deleteTask = async (id: string) => {
    if (!user) {
      throw new Error('User must be authenticated to delete tasks');
    }

    try {
      setError(null);

      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      // Find the task to determine if it's a main task or subtask
      const mainTask = tasks.find(task => task.id === id);
      const isMainTask = !!mainTask;

      if (isMainTask) {
        // Remove main task and its subtasks
        setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
        setSubtasks(prevSubtasks => {
          const newSubtasks = { ...prevSubtasks };
          delete newSubtasks[id];
          return newSubtasks;
        });
      } else {
        // Remove subtask
        const parentId = Object.keys(subtasks).find(parentId =>
          subtasks[parentId].some(subtask => subtask.id === id)
        );
        if (parentId) {
          setSubtasks(prevSubtasks => ({
            ...prevSubtasks,
            [parentId]: prevSubtasks[parentId].filter(task => task.id !== id),
          }));
        }
      }
    } catch (err) {
      console.error('Error deleting task:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete task';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Fetch tasks when user changes
  useEffect(() => {
    fetchTasks();
  }, [user]);

  return {
    tasks,
    subtasks,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    refetch: fetchTasks,
  };
}