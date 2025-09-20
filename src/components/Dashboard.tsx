import React, { useState } from 'react';
import { ArrowLeft, Plus, LogOut, CheckSquare, User, Trash2, Edit3, AlertCircle, Loader, Sparkles, Save } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTasks } from '../hooks/useTasks';
import { TaskPriority, TaskStatus } from '../types/task';

interface DashboardProps {
  onBack: () => void;
}

function Dashboard({ onBack }: DashboardProps) {
  const { user, signOut } = useAuth();
  const { tasks, subtasks, loading, error, createTask, updateTask, deleteTask } = useTasks();
  const [newTask, setNewTask] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>('medium');
  const [loggingOut, setLoggingOut] = useState(false);
  const [addingTask, setAddingTask] = useState(false);
  const [generatingSubtasks, setGeneratingSubtasks] = useState<string | null>(null);
  const [suggestedSubtasks, setSuggestedSubtasks] = useState<Record<string, string[]>>({});
  const [savingSubtask, setSavingSubtask] = useState<string | null>(null);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    try {
      setAddingTask(true);
      await createTask({
        title: newTask.trim(),
        priority: newTaskPriority,
        status: 'pending',
      });
      setNewTask('');
      setNewTaskPriority('medium');
    } catch (error) {
      console.error('Failed to add task:', error);
    } finally {
      setAddingTask(false);
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    try {
      await updateTask(taskId, { status: newStatus });
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(taskId);
      } catch (error) {
        console.error('Failed to delete task:', error);
      }
    }
  };

  const generateSubtasks = async (taskId: string, taskTitle: string) => {
    try {
      setGeneratingSubtasks(taskId);
      
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-subtasks`;
      const headers = {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({ taskTitle }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate subtasks');
      }

      const data = await response.json();
      setSuggestedSubtasks(prev => ({
        ...prev,
        [taskId]: data.subtasks || [],
      }));
    } catch (error) {
      console.error('Failed to generate subtasks:', error);
      setError('Failed to generate subtasks. Please try again.');
    } finally {
      setGeneratingSubtasks(null);
    }
  };

  const saveSubtask = async (parentId: string, subtaskTitle: string) => {
    try {
      setSavingSubtask(`${parentId}-${subtaskTitle}`);
      await createTask({
        title: subtaskTitle,
        priority: 'medium',
        status: 'pending',
        parent_id: parentId,
      });
      
      // Remove the saved subtask from suggestions
      setSuggestedSubtasks(prev => ({
        ...prev,
        [parentId]: prev[parentId]?.filter(s => s !== subtaskTitle) || [],
      }));
    } catch (error) {
      console.error('Failed to save subtask:', error);
    } finally {
      setSavingSubtask(null);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await signOut();
      onBack();
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setLoggingOut(false);
    }
  };

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'done':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'in-progress':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'pending':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-white flex flex-col">
      {/* Header with back button */}
      <header className="w-full p-6">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors duration-200"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="font-medium">Back to Home</span>
        </button>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-start justify-center px-6 py-12">
        <div className="w-full max-w-4xl">
          {/* Dashboard card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
            {/* Heading */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <CheckSquare className="h-8 w-8 text-blue-600 mr-3" />
                <h1 className="text-3xl font-bold text-gray-900">
                  {user ? `Welcome, ${user.user_metadata?.full_name || user.email}!` : 'Your Tasks'}
                </h1>
              </div>
              {user && (
                <div className="flex items-center justify-center space-x-2 text-gray-600 mb-4">
                  <User className="h-4 w-4" />
                  <span className="text-sm">{user.email}</span>
                </div>
              )}
              <p className="text-gray-600">
                {user ? 'Manage your daily tasks and stay productive' : 'This is a demo of the task manager'}
              </p>
            </div>

            {/* Error message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center space-x-3 mb-6">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Add new task form */}
            <form onSubmit={handleAddTask} className="mb-8">
              <div className="space-y-4">
                <label htmlFor="newTask" className="block text-sm font-semibold text-gray-700">
                  New Task
                </label>
                <div className="flex flex-col lg:flex-row gap-4">
                  <input
                    type="text"
                    id="newTask"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-white/50 backdrop-blur-sm placeholder-gray-400"
                    placeholder="Enter a new task..."
                    disabled={addingTask}
                  />
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as TaskPriority)}
                    className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                    disabled={addingTask}
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                  <button
                    type="submit"
                    disabled={addingTask || !newTask.trim()}
                    className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-300 flex items-center justify-center space-x-2"
                  >
                    {addingTask ? (
                      <Loader className="h-5 w-5 animate-spin" />
                    ) : (
                      <Plus className="h-5 w-5" />
                    )}
                    <span>{addingTask ? 'Adding...' : 'Add Task'}</span>
                  </button>
                </div>
              </div>
            </form>

            {/* Task list */}
            <div className="mb-8">
              <div className="bg-white/50 backdrop-blur-sm rounded-xl border border-gray-100 p-6">
                {loading ? (
                  <div className="text-center py-8">
                    <Loader className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">Loading your tasks...</p>
                  </div>
                ) : tasks.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No tasks yet. Add your first task above!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {tasks.map((task) => (
                      <div 
                        key={task.id}
                        className="bg-white rounded-lg border border-gray-100 hover:shadow-md transition-shadow duration-200"
                      >
                        {/* Main task */}
                        <div className="flex items-center justify-between p-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className={`font-medium ${task.status === 'done' ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                                {task.title}
                              </h3>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(task.priority)}`}>
                                {task.priority}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(task.status)}`}>
                                {task.status.replace('-', ' ')}
                              </span>
                              <span className="text-xs text-gray-500">
                                {new Date(task.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            <select
                              value={task.status}
                              onChange={(e) => handleStatusChange(task.id, e.target.value as TaskStatus)}
                              className="text-sm border border-gray-200 rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                            >
                              <option value="pending">Pending</option>
                              <option value="in-progress">In Progress</option>
                              <option value="done">Done</option>
                            </select>
                            <button
                              onClick={() => handleDeleteTask(task.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                              title="Delete task"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        {/* Generate subtasks button */}
                        <div className="px-4 pb-2">
                          <button
                            onClick={() => generateSubtasks(task.id, task.title)}
                            disabled={generatingSubtasks === task.id}
                            className="flex items-center space-x-2 px-3 py-2 text-sm bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:from-purple-400 disabled:to-blue-400 disabled:cursor-not-allowed text-white font-medium rounded-lg shadow-sm hover:shadow-md transform hover:-translate-y-0.5 disabled:transform-none transition-all duration-200"
                          >
                            {generatingSubtasks === task.id ? (
                              <Loader className="h-4 w-4 animate-spin" />
                            ) : (
                              <Sparkles className="h-4 w-4" />
                            )}
                            <span>
                              {generatingSubtasks === task.id ? 'Generating...' : 'Generate Subtasks with AI'}
                            </span>
                          </button>
                        </div>

                        {/* Suggested subtasks */}
                        {suggestedSubtasks[task.id] && suggestedSubtasks[task.id].length > 0 && (
                          <div className="px-4 pb-2">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Suggested Subtasks:</h4>
                            <div className="space-y-2">
                              {suggestedSubtasks[task.id].map((subtask, index) => (
                                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                  <span className="text-sm text-gray-700 flex-1">{subtask}</span>
                                  <button
                                    onClick={() => saveSubtask(task.id, subtask)}
                                    disabled={savingSubtask === `${task.id}-${subtask}`}
                                    className="ml-2 flex items-center space-x-1 px-2 py-1 text-xs bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed text-white font-medium rounded transition-colors duration-200"
                                  >
                                    {savingSubtask === `${task.id}-${subtask}` ? (
                                      <Loader className="h-3 w-3 animate-spin" />
                                    ) : (
                                      <Save className="h-3 w-3" />
                                    )}
                                    <span>Save</span>
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Existing subtasks */}
                        {subtasks[task.id] && subtasks[task.id].length > 0 && (
                          <div className="px-4 pb-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Subtasks:</h4>
                            <div className="space-y-2">
                              {subtasks[task.id].map((subtask) => (
                                <div key={subtask.id} className="flex items-center justify-between p-2 bg-blue-50 rounded-lg border border-blue-100">
                                  <div className="flex-1">
                                    <span className={`text-sm ${subtask.status === 'done' ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                                      {subtask.title}
                                    </span>
                                    <div className="flex items-center space-x-2 mt-1">
                                      <span className={`px-1.5 py-0.5 text-xs font-medium rounded border ${getStatusColor(subtask.status)}`}>
                                        {subtask.status.replace('-', ' ')}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-1 ml-2">
                                    <select
                                      value={subtask.status}
                                      onChange={(e) => handleStatusChange(subtask.id, e.target.value as TaskStatus)}
                                      className="text-xs border border-gray-200 rounded px-1 py-0.5 focus:ring-1 focus:ring-blue-100 focus:border-blue-500"
                                    >
                                      <option value="pending">Pending</option>
                                      <option value="in-progress">In Progress</option>
                                      <option value="done">Done</option>
                                    </select>
                                    <button
                                      onClick={() => handleDeleteTask(subtask.id)}
                                      className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors duration-200"
                                      title="Delete subtask"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Logout button */}
            <div className="text-center">
              {user ? (
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="px-8 py-3 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-gray-300 flex items-center justify-center space-x-2 mx-auto"
                >
                  <LogOut className="h-5 w-5" />
                  <span>{loggingOut ? 'Signing out...' : 'Logout'}</span>
                </button>
              ) : (
                <button
                  onClick={onBack}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-300 flex items-center justify-center space-x-2 mx-auto"
                >
                  <ArrowLeft className="h-5 w-5" />
                  <span>Back to Home</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full p-6 text-center">
        <p className="text-sm text-gray-500">
          © 2025 TaskFlow. Built with precision and care.
        </p>
      </footer>
    </div>
  );
}

export default Dashboard;