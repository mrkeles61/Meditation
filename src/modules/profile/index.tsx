import { useState, useEffect } from 'react';
import { useAppStore } from '../../stores/appStore';
import { supabase } from '../../services/supabase';
import { WeightChart } from './components/WeightChart';
import { MeditationHeatmap } from './components/MeditationHeatmap';
import './profile.css';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function ProfilePage() {
    const { user, profile } = useAppStore();
    const [weightInput, setWeightInput] = useState('');
    const [todayWeight, setTodayWeight] = useState<number | null>(null);
    const [saving, setSaving] = useState(false);
    const [averageDay, setAverageDay] = useState(() => {
        const stored = localStorage.getItem('up-weight-avg-day');
        return stored ? parseInt(stored) : 1; // Default Monday
    });

    // Fetch today's existing entry
    useEffect(() => {
        if (!user) return;
        const today = new Date().toISOString().split('T')[0];
        supabase
            .from('weight_entries')
            .select('weight_kg')
            .eq('user_id', user.id)
            .eq('recorded_at', today)
            .maybeSingle()
            .then(({ data }) => {
                if (data) {
                    setTodayWeight(Number(data.weight_kg));
                    setWeightInput(String(data.weight_kg));
                }
            });
    }, [user]);

    async function handleLogWeight() {
        if (!user || !weightInput) return;
        const kg = parseFloat(weightInput);
        if (isNaN(kg) || kg < 20 || kg > 300) return;

        setSaving(true);
        const today = new Date().toISOString().split('T')[0];
        await supabase
            .from('weight_entries')
            .upsert({ user_id: user.id, weight_kg: kg, recorded_at: today }, { onConflict: 'user_id,recorded_at' });

        setTodayWeight(kg);
        setSaving(false);
    }

    function handleDayChange(day: number) {
        setAverageDay(day);
        localStorage.setItem('up-weight-avg-day', String(day));
    }

    if (!user) {
        return (
            <div className="profile-page">
                <p className="profile-signin-prompt">Sign in to view your profile.</p>
            </div>
        );
    }

    return (
        <div className="profile-page">
            {/* Header */}
            <div className="profile-header">
                <div className="profile-avatar">
                    {profile?.avatar_url ? (
                        <img src={profile.avatar_url} alt="" />
                    ) : (
                        <span className="profile-avatar-placeholder">
                            {(profile?.display_name || user.email || '?')[0].toUpperCase()}
                        </span>
                    )}
                </div>
                <div className="profile-info">
                    <h2 className="profile-name">{profile?.display_name || user.email?.split('@')[0]}</h2>
                    <span className="profile-tier-badge">{profile?.subscription_tier || 'free'}</span>
                </div>
            </div>

            {/* Weight Tracker */}
            <section className="profile-section">
                <h3 className="section-title">⚖️ Weight</h3>

                <div className="weight-input-row">
                    <input
                        type="number"
                        step="0.1"
                        min="20"
                        max="300"
                        className="weight-input"
                        placeholder={todayWeight ? String(todayWeight) : 'kg'}
                        value={weightInput}
                        onChange={(e) => setWeightInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleLogWeight()}
                    />
                    <button className="weight-log-btn" onClick={handleLogWeight} disabled={saving}>
                        {saving ? '...' : todayWeight ? 'Update' : 'Log'}
                    </button>
                </div>

                <div className="weight-avg-picker">
                    <span className="avg-label">Average every</span>
                    <select
                        className="avg-select"
                        value={averageDay}
                        onChange={(e) => handleDayChange(Number(e.target.value))}
                    >
                        {DAYS.map((d, i) => (
                            <option key={i} value={i}>{d}</option>
                        ))}
                    </select>
                </div>

                <WeightChart userId={user.id} averageDay={averageDay} />
            </section>

            {/* Meditation Progress */}
            <section className="profile-section">
                <h3 className="section-title">🧘 Meditation — All Time</h3>
                <MeditationHeatmap userId={user.id} />
            </section>
        </div>
    );
}
