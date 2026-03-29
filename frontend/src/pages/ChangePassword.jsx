import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { API_BASE } from '../constants/api';

const ChangePassword = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [formData, setFormData] = useState({
    currentPassword:  '',
    newPassword:      '',
    confirmPassword:  '',
  });
  const [errors, setErrors]     = useState({});
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrent, setShowCurrent]   = useState(false);
  const [showNew, setShowNew]           = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);

  const validate = (data, field = null) => {
    const newErrors = { ...errors };

    if (!field || field === 'currentPassword') {
      if (!data.currentPassword.trim()) newErrors.currentPassword = 'Current password is required.';
      else delete newErrors.currentPassword;
    }

    if (!field || field === 'newPassword') {
      if (!data.newPassword) {
        newErrors.newPassword = 'New password is required.';
      } else if (data.newPassword.length < 8) {
        newErrors.newPassword = 'Must be at least 8 characters.';
      } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])/.test(data.newPassword)) {
        newErrors.newPassword = 'Must include uppercase, lowercase, number, and special character.';
      } else {
        delete newErrors.newPassword;
      }
    }

    if (!field || field === 'confirmPassword') {
      if (!data.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password.';
      } else if (data.confirmPassword !== data.newPassword) {
        newErrors.confirmPassword = 'Passwords do not match.';
      } else {
        delete newErrors.confirmPassword;
      }
    }

    if (field) setErrors(newErrors);
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setApiError('');
  };

  const handleBlur = (e) => {
    validate({ ...formData, [e.target.name]: e.target.value }, e.target.name);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const currentErrors = validate(formData);
    setErrors(currentErrors);
    if (Object.keys(currentErrors).length > 0) return;

    setIsLoading(true);
    setApiError('');

    try {
      const response = await fetch(`${API_BASE}/api/auth/change-password`, {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({
          currentPassword:  formData.currentPassword,
          newPassword:      formData.newPassword,
          confirmPassword:  formData.confirmPassword,
        }),
      });

      let data;
      try {
        data = await response.json();
      } catch {
        throw new Error('Server returned invalid JSON.');
      }

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to change password.');
      }

      // Clear the mustChangePassword flag from the stored user
      const user = JSON.parse(localStorage.getItem('user')) || {};
      user.mustChangePassword = false;
      localStorage.setItem('user', JSON.stringify(user));

      navigate('/dashboard');
    } catch (err) {
      setApiError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const calculatePasswordStrength = (pwd) => {
    if (!pwd) return 0;
    let s = 0;
    if (pwd.length >= 8)       s += 25;
    if (/[a-z]/.test(pwd))     s += 25;
    if (/[A-Z]/.test(pwd))     s += 25;
    if (/[0-9\W_]/.test(pwd))  s += 25;
    return s;
  };

  const pwdStrength = calculatePasswordStrength(formData.newPassword);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex flex-col items-center">
          <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="mt-5 text-3xl font-bold tracking-tight text-slate-900">Change your password</h2>
          <p className="mt-2 text-sm text-slate-500 text-center max-w-xs">
            Your account requires a password change before you can continue.
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 sm:rounded-2xl border border-slate-100">
          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            {apiError && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                <p className="text-sm text-red-700 font-medium">{apiError}</p>
              </div>
            )}

            {/* Current Password */}
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-slate-700">Current Password</label>
              <div className="mt-1 relative">
                <input
                  id="currentPassword"
                  name="currentPassword"
                  type={showCurrent ? 'text' : 'password'}
                  value={formData.currentPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`block w-full rounded-lg border px-3 py-2 pr-10 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 text-sm ${errors.currentPassword ? 'border-red-300 focus:ring-red-500' : 'border-slate-300 focus:ring-indigo-500 focus:border-indigo-500'}`}
                  placeholder="Your current password"
                />
                <button type="button" onClick={() => setShowCurrent(p => !p)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600">
                  {showCurrent ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.currentPassword && <p className="mt-1 text-sm text-red-600">{errors.currentPassword}</p>}
            </div>

            {/* New Password */}
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-slate-700">New Password</label>
              <div className="mt-1 relative">
                <input
                  id="newPassword"
                  name="newPassword"
                  type={showNew ? 'text' : 'password'}
                  value={formData.newPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`block w-full rounded-lg border px-3 py-2 pr-10 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 text-sm ${errors.newPassword ? 'border-red-300 focus:ring-red-500' : 'border-slate-300 focus:ring-indigo-500 focus:border-indigo-500'}`}
                  placeholder="New password (min. 8 characters)"
                />
                <button type="button" onClick={() => setShowNew(p => !p)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600">
                  {showNew ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {formData.newPassword && (
                <div className="mt-2">
                  <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-300 ${pwdStrength <= 25 ? 'bg-red-500 w-1/4' : pwdStrength <= 50 ? 'bg-orange-500 w-2/4' : pwdStrength <= 75 ? 'bg-yellow-400 w-3/4' : 'bg-emerald-500 w-full'}`} />
                  </div>
                </div>
              )}
              {errors.newPassword && <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700">Confirm New Password</label>
              <div className="mt-1 relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`block w-full rounded-lg border px-3 py-2 pr-10 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 text-sm ${errors.confirmPassword ? 'border-red-300 focus:ring-red-500' : 'border-slate-300 focus:ring-indigo-500 focus:border-indigo-500'}`}
                  placeholder="Repeat your new password"
                />
                <button type="button" onClick={() => setShowConfirm(p => !p)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600">
                  {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full justify-center items-center rounded-lg bg-indigo-600 py-2.5 px-4 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    Changing Password...
                  </>
                ) : 'Change Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
