import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://31.97.228.17:4061/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        const { admin, token } = data;
        localStorage.setItem('adminId', admin._id);
        localStorage.setItem('name', admin.name);
        localStorage.setItem('email', admin.email);
        localStorage.setItem('token', token);

        console.log('Admin ID saved to localStorage:', localStorage.getItem('adminId'));
        navigate('/dashboard');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred while logging in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12 bg-cover bg-center"
      style={{
        backgroundImage:
          "url('https://img.freepik.com/free-photo/hand-painted-watercolor-background-with-sky-clouds-shape_24972-1095.jpg?t=st=1746429807~exp=1746433407~hmac=e3434110c0769d2ad42bd54e0534379335887da5831a723df88f4f74891e28d2&w=1380')",
      }}
    >
      <div className="bg-white/20 backdrop-blur-xl border border-white/30 shadow-2xl rounded-2xl w-full max-w-md overflow-hidden">
        <div className="p-8 sm:p-10 space-y-6 bg-white/40 backdrop-blur-sm">
          {/* New Image at the top */}
          <div className="flex justify-center">
            <img
              src="https://editezy.com/Subtract.png"
              alt="EDITEZY Logo"
              className="w-24 h-24 object-contain"
            />
          </div>

          <div className="text-center">
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              EDITEZY
            </h1>
            <p className="text-gray-800 text-sm mt-1 font-medium">Admin Login</p>
          </div>

          {error && (
            <div className="p-3 text-red-700 bg-red-100/80 rounded-md shadow-sm text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-800" htmlFor="email">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full px-4 py-3 mt-1 text-sm bg-white/50 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 backdrop-blur-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800" htmlFor="password">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 mt-1 text-sm bg-white/50 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 backdrop-blur-sm"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-6 text-white text-sm font-medium rounded-full transition duration-200 ${
                isLoading
                  ? 'bg-gradient-to-r from-blue-400 to-purple-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:scale-[1.02]'
              }`}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;