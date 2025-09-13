import React, { useState } from 'react';
import { ArrowLeft, Mail, Lock } from 'lucide-react';

interface LoginProps {
  onBack: () => void;
}

function Login({ onBack }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle login logic here
    console.log('Login attempt:', { email, password });
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
        <div className="w-full max-w-md">
          {/* Login form card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
            {/* Heading */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Login</h1>
              <p className="text-gray-600">Welcome back! Please sign in to your account.</p>
            </div>

            {/* Login form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email field */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-white/50 backdrop-blur-sm placeholder-gray-400"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              {/* Password field */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-white/50 backdrop-blur-sm placeholder-gray-400"
                    placeholder="Enter your password"
                    required
                  />
                </div>
              </div>

              {/* Login button */}
              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-300"
                >
                  Login
                </button>
              </div>
            </form>

            {/* Additional links */}
            <div className="mt-6 text-center space-y-2">
              <a href="#" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                Forgot your password?
              </a>
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
                  Sign up here
                </a>
              </p>
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

export default Login;