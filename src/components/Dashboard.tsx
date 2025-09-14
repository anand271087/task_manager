import React, { useState } from 'react';
import { ArrowLeft, Plus, LogOut, CheckSquare, User } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface DashboardProps {
  onBack: () => void;
}

function Dashboard({ onBack }: DashboardProps) {
  const { user, signOut } = useAuth();
  const [tasks, setTasks] = useState([
    'Finish homework',
    'Call John',
    'Buy groceries'
  ]);
  const [newTask, setNewTask] = useState('');
  const [loggingOut, setLoggingOut] = useState(false);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTask.trim()) {
      setTasks([...tasks, newTask.trim()]);
      setNewTask('');
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
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-2xl">
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

            {/* Task list */}
            <div className="mb-8">
              <div className="bg-white/50 backdrop-blur-sm rounded-xl border border-gray-100 p-6">
                <ul className="space-y-4">
                  {tasks.map((task, index) => (
                    <li key={index} className="flex items-center space-x-3 text-gray-700">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                        {index + 1}
                      </span>
                      <span className="text-lg">{task}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Add new task form */}
            <form onSubmit={handleAddTask} className="mb-8">
              <div className="space-y-4">
                <label htmlFor="newTask" className="block text-sm font-semibold text-gray-700">
                  New Task
                </label>
                <div className="flex flex-col sm:flex-row gap-4">
                  <input
                    type="text"
                    id="newTask"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-white/50 backdrop-blur-sm placeholder-gray-400"
                    placeholder="Enter a new task..."
                  />
                  <button
                    type="submit"
                    className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-300 flex items-center justify-center space-x-2"
                  >
                    <Plus className="h-5 w-5" />
                    <span>Add Task</span>
                  </button>
                </div>
              </div>
            </form>

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