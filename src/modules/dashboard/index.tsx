import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '../../stores/appStore';
import { supabase } from '../../services/supabase';
import { HabitCard } from '../habits/components/HabitCard';
import './Dashboard.css';

interface Habit {
    id: string;
    name: string;
    icon: string;
    category: string;
    sort_order: number;
    automation_type?: string;
}

interface HabitLog {
    id: string;
    habit_id: string;
    logged_at: string;
}

export function Dashboard() {
    const { user, profile } = useAppStore();
    const [habits, setHabits] = useState<Habit[]>([]);
    const [logs, setLogs] = useState<HabitLog[]>([]);
    const [loading, setLoading] = useState(true);

    // Weight quick-log state
    const [weightInput, setWeightInput] = useState('');
    const [weightSaving, setWeightSaving] = useState(false);
    const [weightSaved, setWeightSaved] = useState(false);
    const [todayWeight, setTodayWeight] = useState<number | null>(null);

    // Meditation stat
    const [meditationToday, setMeditationToday] = useState(0);

    const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

    const loadData = useCallback(async () => {
        if (!user) return;
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - 30);

        const [habitsRes, logsRes, weightRes, medRes] = await Promise.all([
            supabase.from('habits')
                .select('id, name, icon, category, sort_order, automation_type')
                .eq('user_id', user.id)
                .eq('archived', false)
                .order('sort_order'),
            supabase.from('habit_logs')
                .select('id, habit_id, logged_at')
                .eq('user_id', user.id)
                .gte('logged_at', cutoff.toISOString().split('T')[0]),
            supabase.from('weight_entries')
                .select('weight_kg')
                .eq('user_id', user.id)
                .eq('recorded_at', todayStr)
                .limit(1),
            supabase.from('meditation_sessions')
                .select('completed_seconds')
                .eq('user_id', user.id)
                .gte('created_at', todayStr + 'T00:00:00'),
        ]);

        setHabits(habitsRes.data || []);
        setLogs(logsRes.data || []);

        if (weightRes.data && weightRes.data.length > 0) {
            setTodayWeight(Number(weightRes.data[0].weight_kg));
        }

        const totalMin = (medRes.data || []).reduce((s, r) => s + (r.completed_seconds || 0), 0);
        setMeditationToday(Math.floor(totalMin / 60));

        setLoading(false);
    }, [user, todayStr]);

    useEffect(() => { loadData(); }, [loadData]);

    // Habit log map
    const habitLogMap = useMemo(() => {
        const map: Record<string, Record<string, boolean>> = {};
        for (const h of habits) map[h.id] = {};
        for (const l of logs) {
            if (!map[l.habit_id]) map[l.habit_id] = {};
            map[l.habit_id][l.logged_at] = true;
        }
        return map;
    }, [habits, logs]);

    // Streaks
    const streaks = useMemo(() => {
        const result: Record<string, number> = {};
        for (const h of habits) {
            let streak = 0;
            const logSet = habitLogMap[h.id] || {};
            const d = new Date();
            if (!logSet[todayStr]) d.setDate(d.getDate() - 1);
            for (let i = 0; i < 365; i++) {
                const key = d.toISOString().split('T')[0];
                if (logSet[key]) { streak++; d.setDate(d.getDate() - 1); }
                else break;
            }
            if (habitLogMap[h.id]?.[todayStr]) streak = Math.max(streak, 1);
            result[h.id] = streak;
        }
        return result;
    }, [habits, habitLogMap, todayStr]);

    // Toggle habit
    async function toggleHabit(habitId: string) {
        if (!user) return;
        const isComplete = habitLogMap[habitId]?.[todayStr];
        if (isComplete) {
            const log = logs.find(l => l.habit_id === habitId && l.logged_at === todayStr);
            if (log) {
                await supabase.from('habit_logs').delete().eq('id', log.id);
                setLogs(prev => prev.filter(l => l.id !== log.id));
            }
        } else {
            const { data } = await supabase.from('habit_logs')
                .insert({ habit_id: habitId, user_id: user.id, logged_at: todayStr })
                .select('id, habit_id, logged_at')
                .single();
            if (data) setLogs(prev => [...prev, data]);
        }
    }

    // Quick weight log
    async function logWeight() {
        if (!user || !weightInput.trim()) return;
        const kg = parseFloat(weightInput);
        if (isNaN(kg) || kg < 20 || kg > 300) return;
        setWeightSaving(true);
        if (todayWeight !== null) {
            await supabase.from('weight_entries')
                .update({ weight_kg: kg })
                .eq('user_id', user.id)
                .eq('recorded_at', todayStr);
        } else {
            await supabase.from('weight_entries')
                .insert({ user_id: user.id, weight_kg: kg, recorded_at: todayStr });
        }
        setTodayWeight(kg);
        setWeightSaving(false);
        setWeightSaved(true);
        setWeightInput('');
        setTimeout(() => setWeightSaved(false), 2000);
    }

    const completedToday = habits.filter(h => habitLogMap[h.id]?.[todayStr]).length;
    const totalHabits = habits.length;
    const completionPct = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;
    const bestStreak = habits.length > 0 ? Math.max(0, ...Object.values(streaks)) : 0;

    // Time-based greeting
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

    if (!user) {
        return (
            <div className="dashboard">
                <section className="welcome-card">
                    <h1 className="welcome-title">Ultraviolet Perigee</h1>
                    <p className="welcome-subtitle">Sign in to start your journey.</p>
                    <Link to="/login" className="hub-signin-btn">Sign In →</Link>
                </section>
            </div>
        );
    }

    return (
        <div className="dashboard hub">
            {/* Hero */}
            <section className="hub-hero">
                <div className="hub-greeting">
                    <h1 className="hub-greeting-text">
                        {greeting}{profile?.display_name ? `, ${profile.display_name}` : ''}
                    </h1>
                    <p className="hub-date">
                        {new Date().toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </p>
                </div>

                {/* Progress ring */}
                {totalHabits > 0 && (
                    <div className="hub-ring-wrap">
                        <svg width="64" height="64" viewBox="0 0 64 64">
                            <circle cx="32" cy="32" r="28" fill="none"
                                stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
                            <circle cx="32" cy="32" r="28" fill="none"
                                stroke="var(--accent)" strokeWidth="4"
                                strokeDasharray={`${(completionPct / 100) * 175.9} 175.9`}
                                strokeLinecap="round"
                                transform="rotate(-90 32 32)" />
                        </svg>
                        <span className="hub-ring-pct">{completionPct}%</span>
                    </div>
                )}
            </section>

            {/* Quick Actions */}
            <section className="hub-actions">
                <Link to="/meditation" className="hub-action-btn meditation-action">
                    <span className="hub-action-icon">🧘</span>
                    <span className="hub-action-label">
                        {meditationToday > 0 ? `${meditationToday} min today` : 'Meditate'}
                    </span>
                </Link>

                <div className="hub-action-btn weight-action">
                    <span className="hub-action-icon">⚖️</span>
                    {weightSaved ? (
                        <span className="hub-action-label saved">✓ Saved</span>
                    ) : todayWeight !== null && !weightInput ? (
                        <span className="hub-action-label" onClick={() => setWeightInput(String(todayWeight))}>
                            {todayWeight} kg
                        </span>
                    ) : (
                        <form className="hub-weight-form" onSubmit={e => { e.preventDefault(); logWeight(); }}>
                            <input
                                type="number"
                                step="0.1"
                                className="hub-weight-input"
                                placeholder="kg"
                                value={weightInput}
                                onChange={e => setWeightInput(e.target.value)}
                                autoFocus={!!weightInput}
                            />
                            <button type="submit" className="hub-weight-submit" disabled={weightSaving}>
                                {weightSaving ? '...' : '→'}
                            </button>
                        </form>
                    )}
                </div>
            </section>

            {/* Today's Habits */}
            <section className="hub-habits-section">
                <div className="hub-section-header">
                    <h2 className="hub-section-title">Today</h2>
                    <div className="hub-habits-meta">
                        <span className="hub-habits-count">{completedToday}/{totalHabits}</span>
                        {bestStreak > 0 && <span className="hub-habits-streak">🔥 {bestStreak}</span>}
                        <Link to="/habits" className="hub-see-all">All →</Link>
                    </div>
                </div>

                {loading ? (
                    <p className="hub-loading">Loading...</p>
                ) : habits.length === 0 ? (
                    <div className="hub-empty">
                        <p>No habits yet.</p>
                        <Link to="/habits" className="hub-add-link">+ Create habits</Link>
                    </div>
                ) : (
                    <div className="hub-habits-grid">
                        {habits.map(h => (
                            <HabitCard
                                key={h.id}
                                icon={h.icon}
                                name={h.name}
                                completed={!!habitLogMap[h.id]?.[todayStr]}
                                streak={streaks[h.id] || 0}
                                logs={habitLogMap[h.id] || {}}
                                automationType={h.automation_type}
                                onToggle={() => toggleHabit(h.id)}
                                onEdit={() => { }}
                            />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
