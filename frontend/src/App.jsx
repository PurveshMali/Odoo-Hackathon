import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing        from './pages/Landing';
import Login          from './pages/Login';
import Signup         from './pages/Signup';
import Dashboard      from './pages/Dashboard';
import ChangePassword from './pages/ChangePassword';

// Redirect logged-in users away from auth pages
const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (token) return <Navigate to="/dashboard" replace />;
  return children;
};

// Guard: only accessible when user has a valid token
// Also redirects to /change-password if mustChangePassword is set
const AuthenticatedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;

  const user = JSON.parse(localStorage.getItem('user')) || {};
  if (user.mustChangePassword) return <Navigate to="/change-password" replace />;

  return children;
};

// Guard: accessible only when logged in AND mustChangePassword is true
const ChangePasswordGuard = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />

        <Route path="/login"  element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />

        <Route
          path="/dashboard"
          element={
            <AuthenticatedRoute>
              <Dashboard />
            </AuthenticatedRoute>
          }
        />

        <Route
          path="/change-password"
          element={
            <ChangePasswordGuard>
              <ChangePassword />
            </ChangePasswordGuard>
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
