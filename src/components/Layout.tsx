import { NavLink, Outlet } from 'react-router-dom';
import { useAppStore } from '../stores/appStore';
import { supabase } from '../services/supabase';
import './Layout.css';

const NAV_ITEMS = [
    { to: '/', icon: '◉', label: 'Dashboard' },
    { to: '/meditation', icon: '◎', label: 'Meditation' },
    // Future modules:
    // { to: '/habits', icon: '✓', label: 'Habits' },
    // { to: '/productivity', icon: '⏱', label: 'Productivity' },
    // { to: '/health', icon: '♥', label: 'Health' },
    // { to: '/journal', icon: '✎', label: 'Journal' },
    // { to: '/mood', icon: '☺', label: 'Mood' },
    // { to: '/goals', icon: '⚑', label: 'Goals' },
];

export function Layout() {
    const { sidebarOpen, toggleSidebar, profile } = useAppStore();

    async function handleSignOut() {
        await supabase.auth.signOut();
    }

    return (
        <div className={`layout ${sidebarOpen ? 'sidebar-open' : ''}`}>
            <aside className="sidebar">
                <div className="sidebar-header">
                    <span className="sidebar-logo">UP</span>
                    <button className="sidebar-close" onClick={toggleSidebar}>✕</button>
                </div>

                <nav className="sidebar-nav">
                    {NAV_ITEMS.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.to === '/'}
                            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                            onClick={() => useAppStore.getState().setSidebarOpen(false)}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            <span className="nav-label">{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <div className="user-info">
                        <span className="user-name">{profile?.display_name || 'User'}</span>
                        <span className="user-tier">{profile?.role === 'admin' ? 'Admin' : profile?.subscription_tier}</span>
                    </div>
                    <button className="sign-out-btn" onClick={handleSignOut}>Sign Out</button>
                </div>
            </aside>

            <div className="sidebar-overlay" onClick={toggleSidebar} />

            <main className="main-content">
                <header className="mobile-header">
                    <button className="menu-btn" onClick={toggleSidebar}>☰</button>
                    <span className="mobile-logo">Ultraviolet Perigee</span>
                </header>
                <div className="content-area">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
