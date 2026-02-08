import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useMeditationStore } from '../store';
import { supabase } from '../../../services/supabase';
import { useAppStore } from '../../../stores/appStore';
import { Link } from 'react-router-dom';
import './CompletionScreen.css';

interface SessionStats {
    streak: number;
    totalSessions: number;
    totalMinutes: number;
}

async function fetchStats(userId: string): Promise<SessionStats> {
    const { data } = await supabase
        .from('meditation_sessions')
        .select('created_at, completed_seconds')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(365);

    if (!data || data.length === 0) return { streak: 1, totalSessions: 1, totalMinutes: 0 };

    // Total stats
    const totalSessions = data.length;
    const totalMinutes = Math.round(data.reduce((sum, s) => sum + (s.completed_seconds || 0), 0) / 60);

    // Streak calculation — count consecutive days going backward
    const daySet = new Set<string>();
    for (const s of data) {
        const d = new Date(s.created_at);
        daySet.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
    }

    const today = new Date();
    let streak = 0;
    for (let i = 0; i < 365; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        if (daySet.has(key)) {
            streak++;
        } else if (i === 0) {
            // Today might not have a session saved yet (it's being saved now), count it
            streak = 1;
        } else {
            break;
        }
    }

    return { streak: Math.max(1, streak), totalSessions, totalMinutes };
}

export function CompletionScreen() {
    const { duration, elapsed, selectedSound, reset } = useMeditationStore();
    const { user } = useAppStore();
    const [stats, setStats] = useState<SessionStats | null>(null);
    const [saved, setSaved] = useState(false);

    const completedMinutes = Math.floor(elapsed / 60);
    const completedSeconds = elapsed % 60;
    const isFullSession = elapsed >= duration;

    // Save session on mount
    useEffect(() => {
        async function save() {
            if (user && !saved) {
                await supabase.from('meditation_sessions').insert({
                    user_id: user.id,
                    duration_seconds: duration,
                    completed_seconds: elapsed,
                    sound_type: selectedSound,
                });
                setSaved(true);
                const s = await fetchStats(user.id);
                setStats(s);
            }
        }
        save();
    }, [user, saved, duration, elapsed, selectedSound]);

    return (
        <div className="completion-screen">
            <motion.div className="completion-card"
                initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}>

                <div className="completion-icon">{isFullSession ? '✨' : '🌿'}</div>
                <h1 className="completion-title">
                    {isFullSession ? 'Session Complete' : 'Session Ended'}
                </h1>
                <p className="completion-duration">
                    {completedMinutes}:{completedSeconds.toString().padStart(2, '0')}
                </p>
                <p className="completion-message">
                    {isFullSession
                        ? 'Well done. Every moment of stillness counts.'
                        : 'Even a short pause makes a difference.'}
                </p>

                {/* Stats row (#10) */}
                {stats && (
                    <motion.div className="completion-stats"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}>
                        <div className="stat-item">
                            <span className="stat-value">🔥 {stats.streak}</span>
                            <span className="stat-label">{stats.streak === 1 ? 'day' : 'day streak'}</span>
                        </div>
                        <div className="stat-divider" />
                        <div className="stat-item">
                            <span className="stat-value">{stats.totalSessions}</span>
                            <span className="stat-label">sessions</span>
                        </div>
                        <div className="stat-divider" />
                        <div className="stat-item">
                            <span className="stat-value">{stats.totalMinutes}</span>
                            <span className="stat-label">total min</span>
                        </div>
                    </motion.div>
                )}

                {!user && (
                    <p className="completion-hint">
                        <Link to="/login">Sign in</Link> to save your sessions
                    </p>
                )}
                <button className="completion-button" onClick={reset}>
                    {user ? 'Continue' : 'Back to Dashboard'}
                </button>
            </motion.div>
        </div>
    );
}
