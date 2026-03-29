import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { API_BASE } from '../constants/api';

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    country: '',
    currency_code: '',
    role: 'Employee'
  });
  const [countries, setCountries] = useState([]);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch('https://restcountries.com/v3.1/all?fields=name,currencies');
        const data = await response.json();
        const formattedCountries = data
          .map(country => {
            const currencyCode = Math.max(0, Object.keys(country.currencies || {}).length) 
              ? Object.keys(country.currencies)[0] 
              : '';
            return {
              name: country.name.common,
              currencyCode: currencyCode
            };
          })
          .filter(c => c.currencyCode)
          .sort((a, b) => a.name.localeCompare(b.name));
        
        setCountries(formattedCountries);
      } catch (err) {
        console.error('Failed to fetch countries:', err);
      }
    };
    fetchCountries();
  }, []);

  const calculatePasswordStrength = (pwd) => {
    if (!pwd) return 0;
    let strength = 0;
    if (pwd.length >= 8) strength += 25;
    if (pwd.match(/[a-z]+/)) strength += 25;
    if (pwd.match(/[A-Z]+/)) strength += 25;
    if (pwd.match(/[0-9]+/)) strength += 25;
    return strength;
  };

  const validate = (data, field = null) => {
    let newErrors = { ...errors };

    if (!field || field === 'name') {
      if (!data.name.trim()) newErrors.name = 'Name is required';
      else delete newErrors.name;
    }

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
      } else if (data.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      } else {
        delete newErrors.password;
      }
    }

    if (!field || field === 'country') {
      if (!data.country) newErrors.country = 'Please select a country';
      else delete newErrors.country;
    }

    if (field) setErrors(newErrors);
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'country') {
      const selectedCountry = countries.find(c => c.name === value);
      setFormData(prev => ({
        ...prev,
        country: value,
        currency_code: selectedCountry ? selectedCountry.currencyCode : ''
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
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
        // TODO: replace with real API call
        // const response = await fetch(`${API_BASE}/api/auth/signup`, {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(formData),
        // });
        // if (!response.ok) throw new Error('Registration failed');
        // const data = await response.json();
        
        // Mock successful registration delay
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        // Mock data
        const mockData = {
          token: "mock-jwt-token-67890",
          user: { 
            name: formData.name, 
            email: formData.email, 
            role: formData.role,
            country: formData.country,
            currency_code: formData.currency_code
          }
        };

        localStorage.setItem('token', mockData.token);
        localStorage.setItem('user', JSON.stringify(mockData.user));
        
        navigate('/dashboard');
      } catch (err) {
        setApiError(err.message || 'Registration failed');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const pwdStrength = calculatePasswordStrength(formData.password);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center flex-col items-center">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-2xl shadow-indigo-200 shadow-lg">
            E
          </div>
          <h2 className="mt-6 font-bold text-center text-3xl tracking-tight text-slate-900">
            Join Expensio
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600">
            Create an account to manage your expenses
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-2xl sm:px-10 border border-slate-100">
          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            {apiError && (
               <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                 <p className="text-sm text-red-700 font-medium">{apiError}</p>
               </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700">Full Name</label>
              <div className="mt-1">
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`block w-full appearance-none rounded-lg border px-3 py-2 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 sm:text-sm ${errors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-500'}`}
                  placeholder="John Doe"
                />
              </div>
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email address</label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`block w-full appearance-none rounded-lg border px-3 py-2 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 sm:text-sm ${errors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-500'}`}
                  placeholder="name@company.com"
                />
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">Password</label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`block w-full appearance-none rounded-lg border px-3 py-2 pr-10 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 sm:text-sm ${errors.password ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-500'}`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-500"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {/* Strength Indicator */}
              {formData.password && (
                <div className="mt-2">
                  <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden flex">
                    <div className={`h-full transition-all duration-300 ${pwdStrength <= 25 ? 'bg-red-500 w-1/4' : pwdStrength <= 50 ? 'bg-orange-500 w-2/4' : pwdStrength <= 75 ? 'bg-yellow-400 w-3/4' : 'bg-emerald-500 w-full'}`}></div>
                  </div>
                </div>
              )}
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-slate-700">Country</label>
                <div className="mt-1">
                  <select
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`block w-full appearance-none rounded-lg border px-3 py-2 bg-white shadow-sm focus:outline-none focus:ring-2 sm:text-sm ${errors.country ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-500'}`}
                  >
                    <option value="" disabled>Select country</option>
                    {countries.map((c, i) => (
                      <option key={i} value={c.name}>{c.name} ({c.currencyCode})</option>
                    ))}
                  </select>
                </div>
                {errors.country && <p className="mt-1 text-sm text-red-600">{errors.country}</p>}
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-slate-700">Role</label>
                <div className="mt-1">
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="block w-full appearance-none rounded-lg border border-slate-300 px-3 py-2 bg-white shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="Employee">Employee</option>
                    <option value="Manager">Manager</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-2">
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
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
             <span className="text-sm text-slate-500">Already have an account? </span>
             <Link to="/login" className="text-sm font-semibold text-indigo-600 hover:text-indigo-500 transition-colors">
               Login
             </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
