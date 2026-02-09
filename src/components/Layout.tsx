import { NavLink, Link, Outlet, useLocation } from 'react-router-dom';
import { useAppStore } from '../stores/appStore';
import { supabase } from '../services/supabase';
import './Layout.css';

const NAV_ITEMS = [
    { to: '/', icon: '◉', label: 'Dashboard' },
    { to: '/meditation', icon: '◎', label: 'Meditation' },
    { to: '/styles', icon: '◈', label: 'Styles' },
];

const BOTTOM_TABS = [
    { to: '/', icon: '◉', label: 'Home' },
    { to: '/meditation', icon: '◎', label: 'Meditate' },
];

export function Layout() {
    const { sidebarOpen, toggleSidebar, user, profile } = useAppStore();
    const location = useLocation();

    // Hide bottom nav during fullscreen meditation phases
    const isMeditationActive = location.pathname === '/meditation';

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
                    {user ? (
                        <>
                            <div className="user-info">
                                <span className="user-name">{profile?.display_name || user.email}</span>
                                <span className="user-tier">{profile?.role === 'admin' ? 'Admin' : profile?.subscription_tier}</span>
                            </div>
                            <button className="sign-out-btn" onClick={handleSignOut}>Sign Out</button>
                        </>
                    ) : (
                        <Link to="/login" className="sign-in-link">Sign In</Link>
                    )}
                </div>
            </aside>

            <div className="sidebar-overlay" onClick={toggleSidebar} />

            <main className="main-content">
                <header className="mobile-header">
                    <span className="mobile-logo">Ultraviolet Perigee</span>
                </header>
                <div className="content-area">
                    <Outlet />
                </div>
            </main>

            {/* Mobile bottom tab bar */}
            {!isMeditationActive && (
                <nav className="bottom-nav">
                    {BOTTOM_TABS.map((tab) => (
                        <NavLink
                            key={tab.to}
                            to={tab.to}
                            end={tab.to === '/'}
                            className={({ isActive }) => `bottom-tab ${isActive ? 'active' : ''}`}
                        >
                            <span className="bottom-tab-icon">{tab.icon}</span>
                            <span className="bottom-tab-label">{tab.label}</span>
                        </NavLink>
                    ))}
                </nav>
            )}
        </div>
    );
}
