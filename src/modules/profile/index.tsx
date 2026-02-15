import { useState, useEffect, useMemo } from 'react';
import { useAppStore } from '../../stores/appStore';
import { supabase } from '../../services/supabase';
import { WeightChart } from './components/WeightChart';
import { MeditationHeatmap } from './components/MeditationHeatmap';
import './profile.css';

function calcBMI(kg: number, cm: number): { value: number; label: string; cls: string } {
    const m = cm / 100;
    const bmi = +(kg / (m * m)).toFixed(1);
    if (bmi < 18.5) return { value: bmi, label: 'Underweight', cls: 'bmi-under' };
    if (bmi < 25) return { value: bmi, label: 'Normal', cls: 'bmi-normal' };
    if (bmi < 30) return { value: bmi, label: 'Overweight', cls: 'bmi-over' };
    return { value: bmi, label: 'Obese', cls: 'bmi-obese' };
}

export function ProfilePage() {
    const { user, profile, setProfile } = useAppStore();
    const [weightInput, setWeightInput] = useState('');
    const [todayWeight, setTodayWeight] = useState<number | null>(null);
    const [saving, setSaving] = useState(false);
    const [logFeedback, setLogFeedback] = useState<string | null>(null);
    const [logFeedbackCls, setLogFeedbackCls] = useState('');

    // Height & goal local state (synced with profile)
    const [heightInput, setHeightInput] = useState('');
    const [goalInput, setGoalInput] = useState('');

    // Sync from profile
    useEffect(() => {
        if (profile?.height_cm) setHeightInput(String(profile.height_cm));
        if (profile?.goal_weight_kg) setGoalInput(String(profile.goal_weight_kg));
    }, [profile?.height_cm, profile?.goal_weight_kg]);

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

        // Calculate feedback — compare to previous week's average
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const twoWeeksAgo = new Date();
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
        const { data: prevWeekData } = await supabase
            .from('weight_entries')
            .select('weight_kg')
            .eq('user_id', user.id)
            .gte('recorded_at', twoWeeksAgo.toISOString().split('T')[0])
            .lt('recorded_at', weekAgo.toISOString().split('T')[0]);

        if (prevWeekData && prevWeekData.length > 0) {
            const prevAvg = +(prevWeekData.reduce((s, e) => s + Number(e.weight_kg), 0) / prevWeekData.length).toFixed(1);
            const diff = +(kg - prevAvg).toFixed(1);
            if (diff < -0.05) {
                setLogFeedback(`${kg} kg — down ${Math.abs(diff)} from last week's avg (${prevAvg})`);
                setLogFeedbackCls('feedback-down');
            } else if (diff > 0.05) {
                setLogFeedback(`${kg} kg — up ${diff} from last week's avg (${prevAvg})`);
                setLogFeedbackCls('feedback-up');
            } else {
                setLogFeedback(`${kg} kg — same as last week's avg (${prevAvg})`);
                setLogFeedbackCls('feedback-same');
            }
        } else {
            setLogFeedback(`${kg} kg logged ✓`);
            setLogFeedbackCls('feedback-same');
        }

        setTodayWeight(kg);
        setSaving(false);
    }

    async function saveProfileField(field: 'height_cm' | 'goal_weight_kg', value: string) {
        if (!user || !profile) return;
        const num = parseFloat(value);
        if (isNaN(num)) return;
        await supabase
            .from('profiles')
            .update({ [field]: num })
            .eq('id', user.id);
        setProfile({ ...profile, [field]: num });
    }

    // BMI calculation
    const bmi = useMemo(() => {
        const weight = todayWeight || (weightInput ? parseFloat(weightInput) : null);
        const height = profile?.height_cm;
        if (!weight || !height || height < 50) return null;
        return calcBMI(weight, height);
    }, [todayWeight, weightInput, profile?.height_cm]);

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
                <div className="section-title-row">
                    <h3 className="section-title">⚖️ Weight</h3>
                    <span className="weight-today-date">
                        {new Date().toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </span>
                </div>

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

                {/* Log feedback */}
                {logFeedback && (
                    <div className={`wt-log-feedback ${logFeedbackCls}`}>
                        {logFeedback}
                    </div>
                )}

                {/* Height, Goal, BMI row */}
                <div className="wt-body-row">
                    <div className="wt-body-field">
                        <label className="wt-body-label">Height</label>
                        <div className="wt-body-input-wrap">
                            <input
                                type="number"
                                step="1"
                                min="50"
                                max="250"
                                className="wt-body-input"
                                placeholder="cm"
                                value={heightInput}
                                onChange={(e) => setHeightInput(e.target.value)}
                                onBlur={() => saveProfileField('height_cm', heightInput)}
                                onKeyDown={(e) => e.key === 'Enter' && saveProfileField('height_cm', heightInput)}
                            />
                            <span className="wt-body-unit">cm</span>
                        </div>
                    </div>
                    <div className="wt-body-field">
                        <label className="wt-body-label">Goal</label>
                        <div className="wt-body-input-wrap">
                            <input
                                type="number"
                                step="0.1"
                                min="30"
                                max="300"
                                className="wt-body-input"
                                placeholder="kg"
                                value={goalInput}
                                onChange={(e) => setGoalInput(e.target.value)}
                                onBlur={() => saveProfileField('goal_weight_kg', goalInput)}
                                onKeyDown={(e) => e.key === 'Enter' && saveProfileField('goal_weight_kg', goalInput)}
                            />
                            <span className="wt-body-unit">kg</span>
                        </div>
                    </div>
                    {bmi && (
                        <div className="wt-body-field">
                            <label className="wt-body-label">BMI</label>
                            <span className={`wt-bmi-badge ${bmi.cls}`}>
                                {bmi.value} · {bmi.label}
                            </span>
                        </div>
                    )}
                </div>

                <WeightChart userId={user.id} goalWeight={profile?.goal_weight_kg ?? null} />
            </section>

            {/* Meditation Progress */}
            <section className="profile-section">
                <h3 className="section-title">🧘 Meditation</h3>
                <MeditationHeatmap
                    userId={user.id}
                    dailyGoalMinutes={profile?.meditation_goal_minutes ?? 15}
                    onGoalChange={async (newGoal) => {
                        if (!user || !profile) return;
                        await supabase.from('profiles').update({ meditation_goal_minutes: newGoal }).eq('id', user.id);
                        setProfile({ ...profile, meditation_goal_minutes: newGoal });
                    }}
                />
            </section>
        </div>
    );
}
