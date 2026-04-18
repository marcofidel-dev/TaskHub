import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import CategoriesPage from './pages/CategoriesPage';
import TagsPage from './pages/TagsPage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './components/Auth/LoginPage';
import RegisterPage from './components/Auth/RegisterPage';
import './index.css';

function ProtectedRoute({ children, isAuthenticated, loading }) {
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
  const { user, isAuthenticated, loading, logout } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated} loading={loading}>
              <Dashboard user={user} onLogout={logout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/categories"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated} loading={loading}>
              <CategoriesPage user={user} onLogout={logout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/tags"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated} loading={loading}>
              <TagsPage user={user} onLogout={logout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/settings"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated} loading={loading}>
              <SettingsPage user={user} onLogout={logout} />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ToastProvider>
  );
}
