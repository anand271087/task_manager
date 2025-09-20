import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Task, Subtask, CreateTaskData, CreateSubtaskData, UpdateTaskData, UpdateSubtaskData } from '../types/task';
import { useAuth } from './useAuth';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [subtasks, setSubtasks] = useState<Record<string, Subtask[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Fetch tasks from database
  const fetchTasks = async () => {
    if (!user) {
      setTasks([]);
      setSubtasks({});
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch main tasks
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (tasksError) {
        throw tasksError;
      }

      setTasks(tasksData || []);

      // Fetch all subtasks for the user
      const { data: subtasksData, error: subtasksError } = await supabase
        .from('subtasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (subtasksError) {
        throw subtasksError;
      }

      // Group subtasks by task_id
      const subtaskMap: Record<string, Subtask[]> = {};
      if (subtasksData) {
        subtasksData.forEach((subtask) => {
          if (!subtaskMap[subtask.task_id]) {
            subtaskMap[subtask.task_id] = [];
          }
          subtaskMap[subtask.task_id].push(subtask);
        });
      }

      // Initialize empty arrays for tasks without subtasks
      tasksData?.forEach((task) => {
        if (!subtaskMap[task.id]) {
          subtaskMap[task.id] = [];
        }
      });

      setSubtasks(subtaskMap);
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
      setTasks(prevTasks => [data, ...prevTasks]);
      setSubtasks(prevSubtasks => ({
        ...prevSubtasks,
        [data.id]: [],
      }));
      
      return data;
    } catch (err) {
      console.error('Error creating task:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create task';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Create a new subtask
  const createSubtask = async (subtaskData: CreateSubtaskData) => {
    if (!user) {
      throw new Error('User must be authenticated to create subtasks');
    }

    try {
      setError(null);

      const { data, error } = await supabase
        .from('subtasks')
        .insert([
          {
            ...subtaskData,
            user_id: user.id,
          },
        ])
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Add the new subtask to the local state
      setSubtasks(prevSubtasks => ({
        ...prevSubtasks,
        [data.task_id]: [data, ...(prevSubtasks[data.task_id] || [])],
      }));
      
      return data;
    } catch (err) {
      console.error('Error creating subtask:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create subtask';
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
      setTasks(prevTasks =>
        prevTasks.map(task => (task.id === id ? data : task))
      );
      
      return data;
    } catch (err) {
      console.error('Error updating task:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update task';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Update an existing subtask
  const updateSubtask = async (id: string, updates: UpdateSubtaskData) => {
    if (!user) {
      throw new Error('User must be authenticated to update subtasks');
    }

    try {
      setError(null);

      const { data, error } = await supabase
        .from('subtasks')
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

      // Update the subtask in local state
      setSubtasks(prevSubtasks => ({
        ...prevSubtasks,
        [data.task_id]: prevSubtasks[data.task_id]?.map(subtask => 
          subtask.id === id ? data : subtask
        ) || [],
      }));
      
      return data;
    } catch (err) {
      console.error('Error updating subtask:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update subtask';
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

      // Remove task and its subtasks from local state
      setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
      setSubtasks(prevSubtasks => {
        const newSubtasks = { ...prevSubtasks };
        delete newSubtasks[id];
        return newSubtasks;
      });
    } catch (err) {
      console.error('Error deleting task:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete task';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Delete a subtask
  const deleteSubtask = async (id: string) => {
    if (!user) {
      throw new Error('User must be authenticated to delete subtasks');
    }

    try {
      setError(null);

      // Find the subtask to get its task_id before deletion
      let taskId: string | null = null;
      for (const [tId, subs] of Object.entries(subtasks)) {
        if (subs.some(sub => sub.id === id)) {
          taskId = tId;
          break;
        }
      }

      const { error } = await supabase
        .from('subtasks')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      // Remove subtask from local state
      if (taskId) {
        setSubtasks(prevSubtasks => ({
          ...prevSubtasks,
          [taskId]: prevSubtasks[taskId].filter(subtask => subtask.id !== id),
        }));
      }
    } catch (err) {
      console.error('Error deleting subtask:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete subtask';
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
    createSubtask,
    updateTask,
    updateSubtask,
    deleteTask,
    deleteSubtask,
    refetch: fetchTasks,
  };
}