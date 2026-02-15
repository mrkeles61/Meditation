import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CORE_HABITS } from '../core-habits';

const EMOJI_OPTIONS = [
    '✓', '🧘', '🏃', '📚', '💧', '🥗', '😴', '✍️',
    '🏋️', '🎯', '💊', '🧹', '🎵', '🌿', '💻', '🚶',
];

const CATEGORIES = [
    { key: 'meditation', label: 'Meditation' },
    { key: 'exercise', label: 'Exercise' },
    { key: 'reading', label: 'Reading' },
    { key: 'nutrition', label: 'Nutrition' },
    { key: 'sleep', label: 'Sleep' },
    { key: 'custom', label: 'Custom' },
];

interface HabitData {
    id?: string;
    name: string;
    icon: string;
    category: string;
    automation_type?: string;
    is_core?: boolean;
}

interface Props {
    open: boolean;
    initial?: HabitData;
    existingAutomationTypes?: string[];
    onSave: (data: HabitData) => void;
    onArchive?: () => void;
    onClose: () => void;
}

export function AddHabitModal({ open, initial, existingAutomationTypes = [], onSave, onArchive, onClose }: Props) {
    const [name, setName] = useState(initial?.name || '');
    const [icon, setIcon] = useState(initial?.icon || '✓');
    const [category, setCategory] = useState(initial?.category || 'custom');

    const suggestedHabits = initial ? [] : CORE_HABITS.filter(
        h => !existingAutomationTypes.includes(h.automation_type)
    );

    function handleSave() {
        if (!name.trim()) return;
        onSave({ id: initial?.id, name: name.trim(), icon, category });
        setName('');
        setIcon('✓');
        setCategory('custom');
    }

    function handleAddSuggested(habit: typeof CORE_HABITS[number]) {
        onSave({
            name: habit.name,
            icon: habit.icon,
            category: habit.category,
            automation_type: habit.automation_type,
            is_core: true,
        });
    }

    return (
        <AnimatePresence>
            {open && (
                <motion.div className="habit-modal-overlay"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={onClose}>
                    <motion.div className="habit-modal"
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={e => e.stopPropagation()}>

                        <h3 className="habit-modal-title">
                            {initial?.id ? 'Edit Habit' : 'New Habit'}
                        </h3>

                        {/* Suggested habits — only in create mode */}
                        {suggestedHabits.length > 0 && (
                            <div className="habit-modal-field">
                                <label className="habit-modal-label">Suggested</label>
                                <div className="suggested-habits-list">
                                    {suggestedHabits.map(h => (
                                        <button
                                            key={h.automation_type}
                                            className="suggested-habit-card"
                                            onClick={() => handleAddSuggested(h)}
                                        >
                                            <span className="suggested-habit-icon">{h.icon}</span>
                                            <div className="suggested-habit-info">
                                                <span className="suggested-habit-name">{h.name}</span>
                                                <span className="suggested-habit-desc">{h.description}</span>
                                            </div>
                                            <span className="suggested-habit-add">+</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Divider between suggested and custom */}
                        {suggestedHabits.length > 0 && (
                            <div className="habit-modal-divider">
                                <span>or create custom</span>
                            </div>
                        )}

                        <div className="habit-modal-field">
                            <label className="habit-modal-label">Name</label>
                            <input
                                className="habit-modal-input"
                                placeholder="e.g. Read 20 pages"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSave()}
                                autoFocus
                            />
                        </div>

                        <div className="habit-modal-field">
                            <label className="habit-modal-label">Icon</label>
                            <div className="habit-emoji-grid">
                                {EMOJI_OPTIONS.map(e => (
                                    <button key={e}
                                        className={`habit-emoji-btn ${icon === e ? 'selected' : ''}`}
                                        onClick={() => setIcon(e)}>
                                        {e}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="habit-modal-field">
                            <label className="habit-modal-label">Category</label>
                            <div className="habit-cat-grid">
                                {CATEGORIES.map(c => (
                                    <button key={c.key}
                                        className={`habit-cat-btn ${category === c.key ? 'selected' : ''}`}
                                        onClick={() => setCategory(c.key)}>
                                        {c.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {initial?.id && onArchive && (
                            <div className="habit-modal-danger">
                                <button className="habit-archive-btn" onClick={onArchive}>
                                    Archive Habit
                                </button>
                            </div>
                        )}

                        <div className="habit-modal-actions">
                            <button className="habit-modal-cancel" onClick={onClose}>Cancel</button>
                            <button className="habit-modal-save" onClick={handleSave} disabled={!name.trim()}>
                                {initial?.id ? 'Save' : 'Create'}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
