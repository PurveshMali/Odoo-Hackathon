import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { API_BASE } from '../constants/api';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState('');

  const validate = (data, field = null) => {
    let newErrors = { ...errors };
    if (!field || field === 'email') {
      if (!data.email) {
        newErrors.email = 'Email is required';
      } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(data.email)) {
        newErrors.email = 'Enter a valid email address';
      } else {
        delete newErrors.email;
      }
    }
    if (!field || field === 'password') {
      if (!data.password) {
        newErrors.password = 'Password is required';
      } else {
        delete newErrors.password;
      }
    }
    if (field) setErrors(newErrors);
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setApiError('');
  };

  const handleBlur = (e) => {
    validate({ ...formData, [e.target.name]: e.target.value }, e.target.name);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const currentErrors = validate(formData);
    setErrors(currentErrors);

    if (Object.keys(currentErrors).length === 0) {
      setIsLoading(true);
      setApiError('');

      try {
        const response = await fetch(`${API_BASE}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
          credentials: 'include' // allow receiving the HttpOnly refreshToken
        });
        
        let data;
        try {
          data = await response.json();
        } catch {
          throw new Error('Server returned invalid JSON. Is the backend running?');
        }

        if (!response.ok || !data.success) {
          throw new Error(data.message || data.error || 'Invalid credentials');
        }

        localStorage.setItem('token', data.data.accessToken);
        localStorage.setItem('user', JSON.stringify(data.data.user));

        // If admin flagged this user to change password, redirect there first
        if (data.data.mustChangePassword) {
          navigate('/change-password');
        } else {
          navigate('/dashboard');
        }
      } catch (err) {
        setApiError(err.message || 'Invalid credentials');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center flex-col items-center">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-2xl shadow-indigo-200 shadow-lg">
            E
          </div>
          <h2 className="mt-6 font-bold text-center text-3xl tracking-tight text-slate-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600">
            Welcome back to Expensio
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-2xl sm:px-10 border border-slate-100">
          <form className="space-y-6" onSubmit={handleSubmit} noValidate>
            {apiError && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm text-red-700 font-medium">{apiError}</p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`block w-full appearance-none rounded-lg border px-3 py-2 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 sm:text-sm transition-colors ${
                    errors.email 
                      ? 'border-red-300 text-red-900 focus:border-red-500 focus:ring-red-500' 
                      : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-500'
                  }`}
                  placeholder="name@company.com"
                />
              </div>
              {errors.email && <p className="mt-2 text-sm text-red-600 font-medium">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`block w-full appearance-none rounded-lg border px-3 py-2 pr-10 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 sm:text-sm transition-colors ${
                    errors.password 
                      ? 'border-red-300 text-red-900 focus:border-red-500 focus:ring-red-500' 
                      : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-500'
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-500"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <Eye className="h-5 w-5" aria-hidden="true" />
                  )}
                </button>
              </div>
              {errors.password && <p className="mt-2 text-sm text-red-600 font-medium">{errors.password}</p>}
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full justify-center items-center rounded-lg border border-transparent bg-indigo-600 py-2.5 px-4 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </>
                ) : (
                  'Login'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-slate-500">New to Expensio?</span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link to="/signup" className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors">
                Create an account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
