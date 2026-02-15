import { HashRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './components/AuthProvider';
import { Layout } from './components/Layout';
import { LoginPage } from './modules/auth/LoginPage';
import { TownView } from './modules/town/index';
import { MeditationPage } from './modules/meditation/index';
import { HabitsPage } from './modules/habits/index';
import { StylesPage } from './modules/styles/StylesPage';
import { ProfilePage } from './modules/profile/index';
import { ChatPage } from './modules/chat/index';

export default function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<TownView />} />
            <Route path="meditation" element={<MeditationPage />} />
            <Route path="habits" element={<HabitsPage />} />
            <Route path="styles" element={<StylesPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="chat" element={<ChatPage />} />
          </Route>
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </AuthProvider>
    </HashRouter>
  );
}
