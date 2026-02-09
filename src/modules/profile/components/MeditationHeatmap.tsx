import { useState, useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { supabase } from '../../../services/supabase';

interface SessionRecord {
    completed_seconds: number;
    sound_type: string;
    created_at: string;
}

interface Props {
    userId: string;
}

const SOUND_ICON: Record<string, string> = {
    rain: '🌧', ocean: '🌊', 'singing-bowl': '🔔',
    fireplace: '🔥', forest: '🌲', silence: '🤫',
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function MeditationHeatmap({ userId }: Props) {
    const [sessions, setSessions] = useState<SessionRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDay, setSelectedDay] = useState<string | null>(null);

    useEffect(() => {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        supabase
            .from('meditation_sessions')
            .select('completed_seconds, sound_type, created_at')
            .eq('user_id', userId)
            .gte('created_at', sixMonthsAgo.toISOString())
            .order('created_at', { ascending: false })
            .then(({ data }) => {
                setSessions(data || []);
                setLoading(false);
            });
    }, [userId]);

    const { stats, dayMap, months } = useMemo(() => {
        const dayMap = new Map<string, SessionRecord[]>();
        let totalMinutes = 0;

        for (const s of sessions) {
            const d = new Date(s.created_at);
            const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
            if (!dayMap.has(key)) dayMap.set(key, []);
            dayMap.get(key)!.push(s);
            totalMinutes += s.completed_seconds || 0;
        }

        // All-time streak (longest)
        const allTimeSessions = [...sessions].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        const activeDaysSet = new Set<string>();
        for (const s of allTimeSessions) {
            const d = new Date(s.created_at);
            activeDaysSet.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
        }

        let longestStreak = 0;
        let currentStreak = 0;
        const today = new Date();
        for (let i = 0; i < 180; i++) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
            if (activeDaysSet.has(key)) {
                if (i === 0 || currentStreak > 0) currentStreak++;
                longestStreak = Math.max(longestStreak, currentStreak);
            } else if (i > 0) {
                currentStreak = 0;
            }
        }

        // Build 6 months of calendar data
        const months: { year: number; month: number; label: string; days: { day: number; key: string; count: number; empty?: boolean }[] }[] = [];
        const now = new Date();
        for (let m = 5; m >= 0; m--) {
            const date = new Date(now.getFullYear(), now.getMonth() - m, 1);
            const year = date.getFullYear();
            const month = date.getMonth();
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const firstDow = date.getDay();

            const days: { day: number; key: string; count: number; empty?: boolean }[] = [];
            for (let e = 0; e < firstDow; e++) days.push({ day: 0, key: `e${m}-${e}`, count: 0, empty: true });
            for (let d = 1; d <= daysInMonth; d++) {
                const key = `${year}-${month}-${d}`;
                const count = dayMap.get(key)?.length || 0;
                days.push({ day: d, key, count });
            }
            months.push({ year, month, label: `${MONTHS[month]} ${year}`, days });
        }

        return {
            stats: {
                totalSessions: sessions.length,
                totalMinutes: Math.round(totalMinutes / 60),
                longestStreak,
                currentStreak,
            },
            dayMap,
            months,
        };
    }, [sessions]);

    function handleDayClick(key: string, count: number) {
        if (count === 0) return;
        setSelectedDay(selectedDay === key ? null : key);
    }

    const daySessions = selectedDay ? (dayMap.get(selectedDay) || []) : [];

    if (loading) return <div className="heatmap-loading">Loading...</div>;

    return (
        <div className="meditation-heatmap">
            {/* All-time stats */}
            <div className="heatmap-stats">
                <div className="heatmap-stat">
                    <span className="heatmap-stat-value">{stats.totalSessions}</span>
                    <span className="heatmap-stat-label">sessions</span>
                </div>
                <div className="heatmap-stat-divider" />
                <div className="heatmap-stat">
                    <span className="heatmap-stat-value">{stats.totalMinutes}</span>
                    <span className="heatmap-stat-label">minutes</span>
                </div>
                <div className="heatmap-stat-divider" />
                <div className="heatmap-stat">
                    <span className="heatmap-stat-value">{stats.longestStreak}</span>
                    <span className="heatmap-stat-label">best streak</span>
                </div>
                <div className="heatmap-stat-divider" />
                <div className="heatmap-stat">
                    <span className="heatmap-stat-value">{stats.currentStreak}</span>
                    <span className="heatmap-stat-label">current</span>
                </div>
            </div>

            {/* 6-month heatmap */}
            <div className="heatmap-months">
                {months.map((m) => (
                    <div key={m.label} className="heatmap-month">
                        <span className="heatmap-month-label">{m.label}</span>
                        <div className="heatmap-grid">
                            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                                <span key={i} className="heatmap-dow">{d}</span>
                            ))}
                            {m.days.map((d) => (
                                <span
                                    key={d.key}
                                    className={`heatmap-cell${d.empty ? ' empty' : ''}${d.count > 0 ? ' active' : ''}${d.count >= 2 ? ' hot' : ''}${selectedDay === d.key ? ' selected' : ''}`}
                                    onClick={() => !d.empty && handleDayClick(d.key, d.count)}
                                >
                                    {d.empty ? '' : d.day}
                                </span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Day detail */}
            <AnimatePresence>
                {selectedDay && daySessions.length > 0 && (
                    <motion.div className="heatmap-day-detail"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}>
                        <div className="heatmap-day-detail-inner">
                            <p className="heatmap-day-title">{daySessions.length} session{daySessions.length > 1 ? 's' : ''}</p>
                            <div className="heatmap-sessions-list">
                                {daySessions.map((s, i) => {
                                    const mins = Math.floor(s.completed_seconds / 60);
                                    const secs = s.completed_seconds % 60;
                                    const time = new Date(s.created_at).toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit' });
                                    return (
                                        <div key={i} className="heatmap-session-pill">
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
