import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './components/AuthProvider';
import { Layout } from './components/Layout';
import { LoginPage } from './modules/auth/LoginPage';
import { Dashboard } from './modules/dashboard/index';
import { MeditationPage } from './modules/meditation/index';
import { useAppStore } from './stores/appStore';

function ProtectedRoutes() {
  const { user, loading } = useAppStore();

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;

  return <Layout />;
}

function AppRoutes() {
  const { user, loading } = useAppStore();

  if (loading) return null;

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/" element={<ProtectedRoutes />}>
        <Route index element={<Dashboard />} />
        <Route path="meditation" element={<MeditationPage />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
