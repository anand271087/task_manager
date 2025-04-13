import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CheckCircle2, Circle, LogOut, Plus, Trash2, User } from 'lucide-react';
import { supabase } from './lib/supabase';
import Auth from './components/Auth';

/* Added a comment line*/

interface Task {
  id: string;
  title: string;
  description: string | null;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  created_at: string;
}

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  const [session, setSession] = useState(null);
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        setUserName(session.user.user_metadata.full_name || '');
        fetchTasks();
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        setUserName(session.user.user_metadata.full_name || '');
        fetchTasks();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error.message);
      alert('Error fetching tasks. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([
          {
            title: newTask.trim(),
            user_id: session.user.id,
            priority: 'medium'
          }
        ])
        .select()
        .single();

      if (error) throw error;

      setTasks([data, ...tasks]);
      setNewTask('');
    } catch (error) {
      console.error('Error adding task:', error.message);
      alert('Error adding task. Please try again.');
    }
  };

  const toggleTask = async (id: string, completed: boolean) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ completed })
        .eq('id', id);

      if (error) throw error;

      setTasks(tasks.map(task => 
        task.id === id ? { ...task, completed } : task
      ));
    } catch (error) {
      console.error('Error updating task:', error.message);
      alert('Error updating task. Please try again.');
    }
  };

  const deleteTask = async (id: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTasks(tasks.filter(task => task.id !== id));
    } catch (error) {
      console.error('Error deleting task:', error.message);
      alert('Error deleting task. Please try again.');
    }
  };

  if (!session) {
    return (
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-500 to-cyan-400">
      {/* Header with User Info */}
      <div className="absolute top-4 right-4 flex items-center gap-4">
        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-lg rounded-lg px-4 py-2">
          <User size={20} className="text-white" />
          <span className="text-white">{userName}</span>
        </div>
        <button
          onClick={handleSignOut}
          className="bg-white/10 backdrop-blur-lg rounded-lg p-2 text-white hover:bg-white/20 transition-colors"
        >
          <LogOut size={20} />
        </button>
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center text-white mb-12">
          <h1 className="text-5xl font-bold mb-4">Task Manager</h1>
          <p className="text-xl opacity-90">Organize your day, achieve your goals</p>
        </div>

        {/* Task Input Form */}
        <div className="max-w-2xl mx-auto bg-white/10 backdrop-blur-lg rounded-xl p-6 shadow-lg mb-8">
          <form onSubmit={addTask} className="flex gap-2">
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Add a new task..."
              className="flex-1 px-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/70 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-white text-purple-600 rounded-lg font-semibold hover:bg-opacity-90 transition-colors flex items-center gap-2"
            >
              <Plus size={20} />
              Add
            </button>
          </form>
        </div>

        {/* Tasks List */}
        <div className="max-w-2xl mx-auto space-y-4">
          {loading ? (
            <div className="text-center text-white/70 py-8">
              Loading tasks...
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center text-white/70 py-8">
              No tasks yet. Add some tasks to get started!
            </div>
          ) : (
            tasks.map(task => (
              <div
                key={task.id}
                className="bg-white/10 backdrop-blur-lg rounded-xl p-4 flex items-center gap-4 group hover:bg-white/20 transition-colors"
              >
                <button
                  onClick={() => toggleTask(task.id, !task.completed)}
                  className="text-white hover:scale-110 transition-transform"
                >
                  {task.completed ? (
                    <CheckCircle2 className="text-green-400" size={24} />
                  ) : (
                    <Circle className="text-white/70" size={24} />
                  )}
                </button>
                <div className="flex-1">
                  <span className={`text-white ${task.completed ? 'line-through opacity-70' : ''}`}>
                    {task.title}
                  </span>
                  {task.priority && (
                    <span className={`ml-2 text-sm px-2 py-1 rounded-full ${
                      task.priority === 'high' ? 'bg-red-500/20 text-red-200' :
                      task.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-200' :
                      'bg-green-500/20 text-green-200'
                    }`}>
                      {task.priority}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="text-white/70 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default App;