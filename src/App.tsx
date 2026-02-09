import { HashRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './components/AuthProvider';
import { Layout } from './components/Layout';
import { LoginPage } from './modules/auth/LoginPage';
import { Dashboard } from './modules/dashboard/index';
import { MeditationPage } from './modules/meditation/index';
import { StylesPage } from './modules/styles/StylesPage';

export default function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="meditation" element={<MeditationPage />} />
            <Route path="styles" element={<StylesPage />} />
          </Route>
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </AuthProvider>
    </HashRouter>
  );
}
