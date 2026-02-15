import { useState } from 'react';
import { motion } from 'framer-motion';
import { CORE_HABITS, type CoreHabit } from '../core-habits';

interface Props {
    onComplete: (selected: CoreHabit[]) => void;
    onSkip: () => void;
}

export function CoreHabitOnboarding({ onComplete, onSkip }: Props) {
    const [selected, setSelected] = useState<Set<string>>(new Set());

    function toggle(type: string) {
        setSelected(prev => {
            const next = new Set(prev);
            if (next.has(type)) next.delete(type);
            else next.add(type);
            return next;
        });
    }

    function handleStart() {
        const habits = CORE_HABITS.filter(h => selected.has(h.automation_type));
        if (habits.length > 0) onComplete(habits);
    }

    return (
        <motion.div className="onboarding-container"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}>

            <div className="onboarding-header">
                <span className="onboarding-icon">✨</span>
                <h2 className="onboarding-title">Start with core habits</h2>
                <p className="onboarding-subtitle">
                    Select habits to track. Automated ones track themselves.
                </p>
            </div>

            <div className="onboarding-grid">
                {CORE_HABITS.map(h => {
                    const isSelected = selected.has(h.automation_type);
                    return (
                        <button
                            key={h.automation_type}
                            className={`onboarding-card ${isSelected ? 'selected' : ''}`}
                            onClick={() => toggle(h.automation_type)}
                        >
                            <span className="onboarding-card-icon">{h.icon}</span>
                            <span className="onboarding-card-name">{h.name}</span>
                            <span className="onboarding-card-desc">{h.description}</span>
                            <span className="onboarding-card-check">
                                {isSelected ? '✓' : ''}
                            </span>
                        </button>
                    );
                })}
            </div>

            <div className="onboarding-actions">
                <button
                    className="onboarding-start-btn"
                    onClick={handleStart}
                    disabled={selected.size === 0}
                >
                    Get Started ({selected.size})
                </button>
                <button className="onboarding-skip-btn" onClick={onSkip}>
                    Skip for now
                </button>
            </div>
        </motion.div>
    );
}
