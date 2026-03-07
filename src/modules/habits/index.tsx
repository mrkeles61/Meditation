import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAppStore } from '../../stores/appStore';
import { supabase } from '../../services/supabase';
import { HabitCard } from './components/HabitCard';
import { AddHabitModal } from './components/AddHabitModal';
import { MonthlyGrid } from './components/MonthlyGrid';
import { CoreHabitOnboarding } from './components/CoreHabitOnboarding';
import { VoiceInputModal } from './components/VoiceInputModal';
import { WeeklyHeatmap } from './components/WeeklyHeatmap';
import { CategoryBreakdown } from './components/CategoryBreakdown';
import { type CoreHabit } from './core-habits';
import {
    DndContext, closestCenter, PointerSensor, TouchSensor,
    useSensor, useSensors, type DragEndEvent,
} from '@dnd-kit/core';
import {
    SortableContext, rectSortingStrategy, useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import './habits.css';

interface Habit {
    id: string;
    name: string;
    icon: string;
    category: string;
    sort_order: number;
    automation_type?: string;
    is_core?: boolean;
}

interface HabitLog {
    id: string;
    habit_id: string;
    logged_at: string;
}

const CATEGORIES = ['all', 'meditation', 'exercise', 'reading', 'nutrition', 'sleep', 'custom'];

/* ─── Sortable wrapper ─── */
function SortableHabitCard({ habit, completed, streak, logs, onToggle, onEdit }: {
    habit: Habit;
    completed: boolean;
    streak: number;
    logs: Record<string, boolean>;
    onToggle: () => void;
    onEdit: () => void;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: habit.id });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 10 : 'auto' as const,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <HabitCard
                icon={habit.icon}
                name={habit.name}
                completed={completed}
                streak={streak}
                logs={logs}
                automationType={habit.automation_type}
                onToggle={onToggle}
                onEdit={onEdit}
            />
        </div>
    );
}

export function HabitsPage() {
    const { user } = useAppStore();
    const [habits, setHabits] = useState<Habit[]>([]);
    const [logs, setLogs] = useState<HabitLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
    const [viewMode, setViewMode] = useState<'today' | 'month'>('today');
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [voiceOpen, setVoiceOpen] = useState(false);

    const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
    );

    const loadData = useCallback(async () => {
        if (!user) return;
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - 60);

        const [habitsRes, logsRes] = await Promise.all([
            supabase.from('habits')
                .select('id, name, icon, category, sort_order, automation_type, is_core')
                .eq('user_id', user.id)
                .eq('archived', false)
                .order('sort_order'),
            supabase.from('habit_logs')
                .select('id, habit_id, logged_at')
                .eq('user_id', user.id)
                .gte('logged_at', cutoff.toISOString().split('T')[0]),
        ]);

        const habitData = habitsRes.data || [];
        setHabits(habitData);
        setLogs(logsRes.data || []);
        setLoading(false);

        // Show onboarding if no habits and hasn't been dismissed
        if (habitData.length === 0 && !localStorage.getItem('habit_onboarding_seen')) {
            setShowOnboarding(true);
        }
    }, [user]);

    useEffect(() => { loadData(); }, [loadData]);

    const habitLogMap = useMemo(() => {
        const map: Record<string, Record<string, boolean>> = {};
        for (const h of habits) map[h.id] = {};
        for (const l of logs) {
            if (!map[l.habit_id]) map[l.habit_id] = {};
            map[l.habit_id][l.logged_at] = true;
        }
        return map;
    }, [habits, logs]);

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

    async function toggleHabitDate(habitId: string, date: string) {
        if (!user) return;
        const existing = logs.find(l => l.habit_id === habitId && l.logged_at === date);
        if (existing) {
            await supabase.from('habit_logs').delete().eq('id', existing.id);
            setLogs(prev => prev.filter(l => l.id !== existing.id));
        } else {
            const { data } = await supabase.from('habit_logs')
                .insert({ habit_id: habitId, user_id: user.id, logged_at: date })
                .select('id, habit_id, logged_at')
                .single();
            if (data) setLogs(prev => [...prev, data]);
        }
    }

    function toggleHabit(habitId: string) {
        toggleHabitDate(habitId, todayStr);
    }

    async function saveHabit(data: { id?: string; name: string; icon: string; category: string; automation_type?: string; is_core?: boolean }) {
        if (!user) return;
        if (data.id) {
            await supabase.from('habits')
                .update({ name: data.name, icon: data.icon, category: data.category })
                .eq('id', data.id);
        } else {
            await supabase.from('habits')
                .insert({
                    user_id: user.id,
                    name: data.name,
                    icon: data.icon,
                    category: data.category,
                    sort_order: habits.length,
                    automation_type: data.automation_type || null,
                    is_core: data.is_core || false,
                });
        }
        setModalOpen(false);
        setEditingHabit(null);
        loadData();
    }

    async function addCoreHabits(coreHabits: CoreHabit[]) {
        if (!user) return;
        const inserts = coreHabits.map((h, i) => ({
            user_id: user.id,
            name: h.name,
            icon: h.icon,
            category: h.category,
            sort_order: habits.length + i,
            automation_type: h.automation_type,
            is_core: true,
        }));
        await supabase.from('habits').insert(inserts);
        localStorage.setItem('habit_onboarding_seen', '1');
        setShowOnboarding(false);
        loadData();
    }

    function skipOnboarding() {
        localStorage.setItem('habit_onboarding_seen', '1');
        setShowOnboarding(false);
    }

    async function archiveHabit() {
        if (!editingHabit) return;
        await supabase.from('habits').update({ archived: true }).eq('id', editingHabit.id);
        setModalOpen(false);
        setEditingHabit(null);
        loadData();
    }

    // Drag-and-drop reorder
    async function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIdx = habits.findIndex(h => h.id === active.id);
        const newIdx = habits.findIndex(h => h.id === over.id);
        if (oldIdx === -1 || newIdx === -1) return;

        const reordered = [...habits];
        const [moved] = reordered.splice(oldIdx, 1);
        reordered.splice(newIdx, 0, moved);

        // Optimistic UI update
        setHabits(reordered.map((h, i) => ({ ...h, sort_order: i })));

        // Batch update sort_order in DB
        await Promise.all(
            reordered.map((h, i) =>
                supabase.from('habits').update({ sort_order: i }).eq('id', h.id)
            )
        );
    }

    const filtered = filter === 'all' ? habits : habits.filter(h => h.category === filter);
    const completedToday = habits.filter(h => habitLogMap[h.id]?.[todayStr]).length;
    const longestStreak = habits.length > 0 ? Math.max(0, ...Object.values(streaks)) : 0;

    if (!user) return <div className="habits-page"><p className="habits-empty">Sign in to track habits.</p></div>;

    return (
        <div className="habits-page">
            <div className="habits-header">
                <h2 className="habits-title">Habits</h2>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button className="habits-voice-btn" onClick={() => setVoiceOpen(true)}>🎤</button>
                    <button className="habits-add-btn" onClick={() => { setEditingHabit(null); setModalOpen(true); }}>
                        + New
                    </button>
                </div>
            </div>

            <div className="habits-view-toggle">
                <button className={`habits-view-btn ${viewMode === 'today' ? 'active' : ''}`}
                    onClick={() => setViewMode('today')}>Today</button>
                <button className={`habits-view-btn ${viewMode === 'month' ? 'active' : ''}`}
                    onClick={() => setViewMode('month')}>Month</button>
            </div>

            {habits.length > 0 && viewMode === 'today' && (
                <div className="habits-stats">
                    <div className="habits-stat">
                        <span className="habits-stat-value">{completedToday}/{habits.length}</span>
                        <span className="habits-stat-label">today</span>
                    </div>
                    <div className="habits-stat-divider" />
                    <div className="habits-stat">
                        <span className="habits-stat-value">{longestStreak}</span>
                        <span className="habits-stat-label">best streak</span>
                    </div>
                    <div className="habits-stat-divider" />
                    <div className="habits-stat">
                        <span className="habits-stat-value">
                            {habits.length > 0 ? Math.round((completedToday / habits.length) * 100) : 0}%
                        </span>
                        <span className="habits-stat-label">completion</span>
                    </div>
                </div>
            )}

            {habits.length > 0 && viewMode === 'today' && (
                <WeeklyHeatmap habits={habits} habitLogMap={habitLogMap} />
            )}

            {habits.length > 0 && viewMode === 'today' && (
                <CategoryBreakdown habits={habits} habitLogMap={habitLogMap} todayStr={todayStr} />
            )}

            {viewMode === 'today' ? (
                <>
                    {habits.length > 0 && (
                        <div className="habits-categories">
                            {CATEGORIES.map(c => (
                                <button key={c}
                                    className={`habits-cat-pill ${filter === c ? 'active' : ''}`}
                                    onClick={() => setFilter(c)}>
                                    {c === 'all' ? 'All' : c.charAt(0).toUpperCase() + c.slice(1)}
                                </button>
                            ))}
                        </div>
                    )}

                    {loading ? (
                        <p className="habits-empty">Loading...</p>
                    ) : filtered.length === 0 && habits.length === 0 ? (
                        showOnboarding ? (
                            <CoreHabitOnboarding onComplete={addCoreHabits} onSkip={skipOnboarding} />
                        ) : (
                            <div className="habits-empty">
                                <span className="habits-empty-icon">✓</span>
                                <p>No habits yet. Tap <strong>+ New</strong> to create your first habit.</p>
                            </div>
                        )
                    ) : filtered.length === 0 ? (
                        <p className="habits-empty">No habits in this category.</p>
                    ) : (
                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                            <SortableContext items={filtered.map(h => h.id)} strategy={rectSortingStrategy}>
                                <div className="habits-grid">
                                    {filtered.map(h => (
                                        <SortableHabitCard
                                            key={h.id}
                                            habit={h}
                                            completed={!!habitLogMap[h.id]?.[todayStr]}
                                            streak={streaks[h.id] || 0}
                                            logs={habitLogMap[h.id] || {}}
                                            onToggle={() => toggleHabit(h.id)}
                                            onEdit={() => { setEditingHabit(h); setModalOpen(true); }}
                                        />
                                    ))}
                                </div>
                            </SortableContext>
                        </DndContext>
                    )}
                </>
            ) : (
                <MonthlyGrid habits={habits} logs={logs} onToggle={toggleHabitDate} />
            )}

            <AddHabitModal
                open={modalOpen}
                initial={editingHabit ? { id: editingHabit.id, name: editingHabit.name, icon: editingHabit.icon, category: editingHabit.category } : undefined}
                existingAutomationTypes={habits.filter(h => h.automation_type).map(h => h.automation_type!)}
                onSave={saveHabit}
                onArchive={editingHabit ? archiveHabit : undefined}
                onClose={() => { setModalOpen(false); setEditingHabit(null); }}
            />

            <VoiceInputModal
                open={voiceOpen}
                habits={habits.map(h => ({ id: h.id, name: h.name, category: h.category }))}
                onConfirm={(habitIds) => {
                    habitIds.forEach(id => {
                        if (!habitLogMap[id]?.[todayStr]) toggleHabit(id);
                    });
                }}
                onAddSuggestion={(name) => {
                    setVoiceOpen(false);
                    setEditingHabit(null);
                    setModalOpen(true);
                    // Pre-fill suggestion name via a small timeout to let modal render
                    setTimeout(() => {
                        const input = document.querySelector('.habit-modal-input') as HTMLInputElement;
                        if (input) { input.value = name; input.dispatchEvent(new Event('input', { bubbles: true })); }
                    }, 100);
                }}
                onClose={() => setVoiceOpen(false)}
            />
        </div>
    );
}
