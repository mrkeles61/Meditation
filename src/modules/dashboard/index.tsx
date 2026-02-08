import { Link } from 'react-router-dom';
import { useAppStore } from '../../stores/appStore';
import './Dashboard.css';

export function Dashboard() {
    const { profile } = useAppStore();

    return (
        <div className="dashboard">
            <section className="welcome-card">
                <h1 className="welcome-title">
                    Welcome{profile?.display_name ? `, ${profile.display_name}` : ''}
                </h1>
                <p className="welcome-subtitle">How are you feeling today?</p>
            </section>

            <div className="dashboard-grid">
                <Link to="/meditation" className="module-card meditation-card">
                    <span className="module-icon">◎</span>
                    <h2 className="module-title">Meditation</h2>
                    <p className="module-desc">Start a breathing session</p>
                    <span className="module-action">Begin →</span>
                </Link>

                <div className="module-card locked">
                    <span className="module-icon">✓</span>
                    <h2 className="module-title">Habits</h2>
                    <p className="module-desc">Coming soon</p>
                </div>

                <div className="module-card locked">
                    <span className="module-icon">⏱</span>
                    <h2 className="module-title">Productivity</h2>
                    <p className="module-desc">Coming soon</p>
                </div>

                <div className="module-card locked">
                    <span className="module-icon">♥</span>
                    <h2 className="module-title">Health</h2>
                    <p className="module-desc">Coming soon</p>
                </div>

                <div className="module-card locked">
                    <span className="module-icon">✎</span>
                    <h2 className="module-title">Journal</h2>
                    <p className="module-desc">Coming soon</p>
                </div>

                <div className="module-card locked">
                    <span className="module-icon">☺</span>
                    <h2 className="module-title">Mood</h2>
                    <p className="module-desc">Coming soon</p>
                </div>
            </div>
        </div>
    );
}
