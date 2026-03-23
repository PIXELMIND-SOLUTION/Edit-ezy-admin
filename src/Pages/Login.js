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
      // Call the API for login
      const response = await fetch('http://31.97.206.144:4061/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store the adminId, name, and email in localStorage
        const { admin, token } = data;
        localStorage.setItem('adminId', admin._id);
        localStorage.setItem('name', admin.name);
        localStorage.setItem('email', admin.email);
        localStorage.setItem('token', token);  // Optionally store the token

        // Log the adminId to check if it's stored correctly
        console.log('Admin ID saved to localStorage:', localStorage.getItem('adminId'));

        // Redirect to the dashboard after successful login
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
      <div className="bg-white/70 backdrop-blur-md shadow-2xl rounded-xl w-full max-w-3xl overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left - Form */}
          <div className="p-8 sm:p-10 space-y-6">
           <div className="text-center">
  <h1 className="text-3xl font-extrabold text-center flex justify-center items-center gap-2">
    <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
      POSTER
    </span>
    <span className="text-black">BANAVO</span>
  </h1>

  <p className="text-gray-700 text-sm mt-1">Admin Login</p>
</div>

            {error && (
              <div className="p-3 text-red-600 bg-red-100 rounded-md shadow-sm text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700" htmlFor="email">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@domain.com"
                  className="w-full px-4 py-3 mt-1 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700" htmlFor="password">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 mt-1 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 px-6 text-white text-sm font-medium rounded-full transition duration-200
    ${isLoading
                    ? 'bg-gradient-to-r from-blue-400 to-purple-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:scale-[1.02]'
                  }`}
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </button>

            </form>
          </div>

          {/* Right - Illustration */}
          <div className="hidden md:block">
            <img
              src="https://mir-s3-cdn-cf.behance.net/projects/original/ec753e129429523.61a1e79332f16.png"
              alt="Vendor Login Illustration"
              className="object-cover w-full h-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
