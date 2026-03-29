import { useNavigate } from 'react-router-dom';
import { API_BASE } from '../constants/api';

const Navbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user')) || {};

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include' // Make sure cookie is sent to be cleared properly
      });
    } catch (err) {
      console.error('Logout request failed', err);
    }
    
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm fixed top-0 w-full z-10 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <span className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
              <span className="w-8 h-8 flex items-center justify-center bg-indigo-600 rounded-md text-white font-black text-lg">E</span>
              Expensio
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-medium text-slate-800">Welcome, {user.name || 'User'}</span>
              <span className="text-xs text-slate-500 font-medium px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full mt-0.5">
                {user.role || 'Employee'}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="ml-4 px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
