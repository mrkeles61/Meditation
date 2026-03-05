import { motion, AnimatePresence } from 'framer-motion';
import { getBuildingDef } from '../data/building-registry';
import { useTownStore } from '../stores/townStore';

interface Props {
    habitType: string | null;
    onClose: () => void;
}

const HABIT_ROUTES: Record<string, string> = {
    meditation: '#/meditation',
    gym: '#/habits',
    journal: '#/habits',
    sleep: '#/habits',
    nutrition: '#/habits',
    reading: '#/habits',
    hydration: '#/habits',
    productivity: '#/habits',
};

export function BuildingPanel({ habitType, onClose }: Props) {
    const buildings = useTownStore((s) => s.buildings);
    if (!habitType) return null;

    const def = getBuildingDef(habitType);
    const state = buildings[habitType];
    const level = state?.level ?? 0;
    const bl = def?.levels[Math.min(level, (def?.levels.length ?? 1) - 1)];

    const maxLevel = (def?.levels.length ?? 1) - 1;
    const streakForNext = level === 0 ? 3 : level === 1 ? 7 : level === 2 ? 14 : 30;
    const progress = Math.min((state?.streakDays ?? 0) / streakForNext, 1);

    return (
        <AnimatePresence>
            {habitType && (
                <>
                    <motion.div
                        className="building-panel-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />
                    <motion.div
                        className="building-panel"
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    >
                        <div className="building-panel-handle" />

                        <div className="building-panel-header">
                            <h3 className="building-panel-name">
                                {def?.name ?? habitType}
                            </h3>
                            <div className="building-panel-stars">
                                {Array.from({ length: maxLevel }, (_, i) => (
                                    <span key={i} className={i < level ? 'star-filled' : 'star-empty'}>
                                        {i < level ? '★' : '☆'}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <span className="building-panel-level">
                            {bl?.label ?? 'Unknown'} · Level {level}/{maxLevel}
                        </span>

                        <p className="building-panel-desc">
                            {def?.description ?? ''}
                        </p>

                        {level > 0 && (
                            <>
                                <div className="building-panel-stats">
                                    <div className="building-panel-stat">
                                        <span className="stat-label">Streak</span>
                                        <span className="stat-value">{state?.streakDays ?? 0}d 🔥</span>
                                    </div>
                                </div>

                                {level < maxLevel && (
                                    <div className="building-panel-progress">
                                        <div className="progress-bar">
                                            <div
                                                className="progress-fill"
                                                style={{ width: `${progress * 100}%` }}
                                            />
                                        </div>
                                        <span className="progress-label">
                                            {state?.streakDays ?? 0}/{streakForNext} → Lv{level + 1}
                                        </span>
                                    </div>
                                )}

                                <a
                                    className="building-panel-btn"
                                    href={HABIT_ROUTES[habitType] ?? '#/habits'}
                                >
                                    Open {def?.name ?? habitType}
                                </a>
                            </>
                        )}

                        {level === 0 && (
                            <div className="building-panel-locked">
                                <span className="locked-icon">🔒</span>
                                <p>Track {def?.name ?? habitType} for 3 days to unlock this building!</p>
                                <a
                                    className="building-panel-btn"
                                    href={HABIT_ROUTES[habitType] ?? '#/habits'}
                                >
                                    Start Tracking
                                </a>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
