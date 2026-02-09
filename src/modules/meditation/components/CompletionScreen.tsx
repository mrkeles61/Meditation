import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMeditationStore } from '../store';
import { supabase } from '../../../services/supabase';
import { useAppStore } from '../../../stores/appStore';
import { Link } from 'react-router-dom';
import './CompletionScreen.css';

interface SessionRecord {
    completed_seconds: number;
    sound_type: string;
    created_at: string;
}

interface SessionStats {
    streak: number;
    monthSessions: number;
    monthMinutes: number;
    activeDays: Set<string>;
    sessions: SessionRecord[];
}

async function fetchStats(userId: string): Promise<SessionStats> {
    const { data } = await supabase
        .from('meditation_sessions')
        .select('created_at, completed_seconds, sound_type')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(365);

    if (!data || data.length === 0) {
        return { streak: 1, monthSessions: 1, monthMinutes: 0, activeDays: new Set(), sessions: [] };
    }

    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    // Filter to current month for stats
    const monthData = data.filter((s) => {
        const d = new Date(s.created_at);
        return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    });
    const monthSessions = monthData.length;
    const monthMinutes = Math.round(monthData.reduce((sum, s) => sum + (s.completed_seconds || 0), 0) / 60);

    const activeDays = new Set<string>();
    for (const s of data) {
        const d = new Date(s.created_at);
        activeDays.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
    }

    const today = new Date();
    let streak = 0;
    for (let i = 0; i < 365; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        if (activeDays.has(key)) {
            streak++;
        } else if (i === 0) {
            streak = 1;
        } else {
            break;
        }
    }

    return { streak: Math.max(1, streak), monthSessions, monthMinutes, activeDays, sessions: data };
}

/* ─── Sound icons ─── */
const SOUND_ICON: Record<string, string> = {
    rain: '🌧', ocean: '🌊', 'singing-bowl': '🔔',
    fireplace: '🔥', forest: '🌲', silence: '🤫',
};

/* ─── Interactive Monthly Calendar ─── */
const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

function MonthlyCalendar({ activeDays, sessions }: { activeDays: Set<string>; sessions: SessionRecord[] }) {
    const [selectedDay, setSelectedDay] = useState<number | null>(null);
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const monthName = now.toLocaleString('en', { month: 'long' });
    const today = now.getDate();

    const firstDay = new Date(year, month, 1).getDay();
    const offset = firstDay === 0 ? 6 : firstDay - 1;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells: { day: number; active: boolean; isToday: boolean; empty: boolean }[] = [];
    for (let i = 0; i < offset; i++) {
        cells.push({ day: 0, active: false, isToday: false, empty: true });
    }
    for (let d = 1; d <= daysInMonth; d++) {
        const key = `${year}-${month}-${d}`;
        cells.push({ day: d, active: activeDays.has(key), isToday: d === today, empty: false });
    }

    // Sessions for selected day
    const daySessions = selectedDay
        ? sessions.filter((s) => {
            const d = new Date(s.created_at);
            return d.getFullYear() === year && d.getMonth() === month && d.getDate() === selectedDay;
        })
        : [];

    function handleDayClick(day: number, isActive: boolean) {
        if (!isActive) return;
        setSelectedDay(selectedDay === day ? null : day);
    }

    return (
        <div className="month-calendar">
            <p className="month-label">{monthName} {year}</p>
            <div className="calendar-grid">
                {WEEKDAYS.map((w, i) => (
                    <span key={i} className="cal-weekday">{w}</span>
                ))}
                {cells.map((c, i) => (
                    <span key={i}
                        className={[
                            'cal-day',
                            c.empty && 'empty',
                            c.active && 'active',
                            c.isToday && 'today',
                            c.day === selectedDay && 'selected',
                        ].filter(Boolean).join(' ')}
                        onClick={() => !c.empty && handleDayClick(c.day, c.active)}>
                        {c.empty ? '' : c.day}
                    </span>
                ))}
            </div>

            {/* Day detail panel */}
            <AnimatePresence>
                {selectedDay && daySessions.length > 0 && (
                    <motion.div className="day-detail"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}>
                        <div className="day-detail-inner">
                            <p className="day-detail-title">
                                {monthName} {selectedDay} · {daySessions.length} session{daySessions.length > 1 ? 's' : ''}
                            </p>
                            <div className="day-sessions-list">
                                {daySessions.map((s, i) => {
                                    const mins = Math.floor(s.completed_seconds / 60);
                                    const secs = s.completed_seconds % 60;
                                    const time = new Date(s.created_at).toLocaleTimeString('en', {
                                        hour: 'numeric', minute: '2-digit',
                                    });
                                    return (
                                        <div key={i} className="day-session-pill">
                                            <span>{mins}:{secs.toString().padStart(2, '0')}</span>
                                            <span className="pill-dot">·</span>
                                            <span>{SOUND_ICON[s.sound_type] || ''} {s.sound_type}</span>
                                            <span className="pill-dot">·</span>
                                            <span className="pill-time">{time}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

/* ─── Completion Screen ─── */
export function CompletionScreen() {
    const { duration, elapsed, selectedSound, reset } = useMeditationStore();
    const { user } = useAppStore();
    const [stats, setStats] = useState<SessionStats | null>(null);
    const [saved, setSaved] = useState(false);

    const completedMinutes = Math.floor(elapsed / 60);
    const completedSeconds = elapsed % 60;
    const isFullSession = elapsed >= duration;

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
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}>

                {/* Zone 1 — Compact hero line */}
                <div className="completion-hero">
                    <span className="hero-icon">{isFullSession ? '✨' : '🌿'}</span>
                    <span className="hero-title">{isFullSession ? 'Complete' : 'Ended'}</span>
                    <span className="hero-sep">·</span>
                    <span className="hero-duration">
                        {completedMinutes}:{completedSeconds.toString().padStart(2, '0')}
                    </span>
                </div>

                {/* Zone 2 — Compact stats */}
                {stats && (
                    <div className="completion-stats">
                        <div className="stat-item">
                            <span className="stat-value">🔥 {stats.streak}</span>
                            <span className="stat-label">streak</span>
                        </div>
                        <div className="stat-divider" />
                        <div className="stat-item">
                            <span className="stat-value">{stats.monthSessions}</span>
                            <span className="stat-label">this month</span>
                        </div>
                        <div className="stat-divider" />
                        <div className="stat-item">
                            <span className="stat-value">{stats.monthMinutes}</span>
                            <span className="stat-label">min</span>
                        </div>
                    </div>
                )}

                {/* Zone 3 — Interactive calendar */}
                {stats && (
                    <MonthlyCalendar activeDays={stats.activeDays} sessions={stats.sessions} />
                )}

                {!user && (
                    <p className="completion-hint">
                        <Link to="/login">Sign in</Link> to track progress
                    </p>
                )}
                <button className="completion-button" onClick={reset}>Continue</button>
            </motion.div>
        </div>
    );
}
