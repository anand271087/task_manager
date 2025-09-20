import React from 'react';
import { CheckSquare } from 'lucide-react';
import { useAuth } from './hooks/useAuth';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import ProfilePage from './components/ProfilePage';

type Page = 'home' | 'login' | 'signup' | 'dashboard' | 'profile';

function App() {
  const [currentPage, setCurrentPage] = React.useState<Page>('home');
  const { user, loading } = useAuth();

  // Show loading spinner while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <CheckSquare className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is authenticated and trying to access login/signup, redirect to dashboard
  if (user && (currentPage === 'login' || currentPage === 'signup')) {
    setCurrentPage('dashboard');
  }

  if (currentPage === 'login') {
    return <Login onBack={() => setCurrentPage('home')} onSuccess={() => setCurrentPage('dashboard')} />;
  }

  if (currentPage === 'signup') {
    return <Signup onBack={() => setCurrentPage('home')} onSuccess={() => setCurrentPage('dashboard')} />;
  }

  if (currentPage === 'dashboard') {
    return <Dashboard onBack={() => setCurrentPage('home')} onProfile={() => setCurrentPage('profile')} />;
  }

  if (currentPage === 'profile') {
    return <ProfilePage onBack={() => setCurrentPage('dashboard')} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-white flex flex-col">
      {/* Header with logo */}
      <header className="w-full p-6 flex justify-center">
        <div className="flex items-center space-x-3">
          <CheckSquare className="h-8 w-8 text-blue-600" />
          <span className="text-xl font-semibold text-gray-800 hidden sm:block">TaskFlow</span>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-2xl mx-auto text-center space-y-12">
          {/* Welcome heading */}
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Welcome to My
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-sky-500">
                Task Manager
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 max-w-xl mx-auto leading-relaxed">
              Organize your tasks, boost your productivity, and achieve your goals with our intuitive task management solution.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto">
            {!user ? (
              <>
                <button 
                  onClick={() => setCurrentPage('login')}
                  className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-300"
                >
                  Login
                </button>
                
                <button 
                  onClick={() => setCurrentPage('signup')}
                  className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-gray-50 text-gray-900 font-semibold border-2 border-gray-200 hover:border-blue-300 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-300"
                >
                  Signup
                </button>
              </>
            ) : null}
            
            <button 
              onClick={() => setCurrentPage('dashboard')}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-sky-300"
            >
              {user ? 'Go to Dashboard' : 'View Demo'}
            </button>
          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-16">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 mx-auto bg-blue-100 rounded-lg flex items-center justify-center">
                <CheckSquare className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Stay Organized</h3>
              <p className="text-sm text-gray-600">Keep all your tasks in one place with our clean interface</p>
            </div>
            
            <div className="text-center space-y-3">
              <div className="w-12 h-12 mx-auto bg-sky-100 rounded-lg flex items-center justify-center">
                <CheckSquare className="h-6 w-6 text-sky-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Track Progress</h3>
              <p className="text-sm text-gray-600">Monitor your productivity and celebrate achievements</p>
            </div>
            
            <div className="text-center space-y-3">
              <div className="w-12 h-12 mx-auto bg-blue-100 rounded-lg flex items-center justify-center">
                <CheckSquare className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Boost Efficiency</h3>
              <p className="text-sm text-gray-600">Streamline your workflow with powerful task management</p>
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

export default App;