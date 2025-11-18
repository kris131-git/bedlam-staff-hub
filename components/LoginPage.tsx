
import React, { useState } from 'react';

interface LoginPageProps {
  onLogin: (username: string, password: string) => string | null;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()){
      setError('Please enter a username and password.');
      return;
    }
    const errorMsg = onLogin(username, password);
    if (errorMsg) {
      setError(errorMsg);
    } else {
      setError('');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-cover bg-center" style={{ backgroundImage: "url('https://picsum.photos/1920/1080?blur=5&grayscale')" }}>
      <div className="absolute inset-0 bg-black/60"></div>
      <div className="relative z-10 w-full max-w-md p-8 space-y-8 bg-dark-card rounded-2xl shadow-2xl">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white">The Bedlam Ball Staff Hub</h1>
          <p className="mt-2 text-dark-text-secondary">Welcome back, please sign in to your account.</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-dark-border bg-gray-900 placeholder-gray-500 text-white rounded-t-md focus:outline-none focus:ring-brand-primary focus:border-brand-primary focus:z-10 sm:text-sm"
                placeholder="Username"
              />
            </div>
            <div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-dark-border bg-gray-900 placeholder-gray-500 text-white rounded-b-md focus:outline-none focus:ring-brand-primary focus:border-brand-primary focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>
          
          {error && <p className="text-sm text-red-500 text-center">{error}</p>}

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-brand-primary hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-card focus:ring-brand-primary transition-colors duration-300"
            >
              Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
