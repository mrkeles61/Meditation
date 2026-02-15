import { useMemo } from 'react';

interface LogMap {
    [dateStr: string]: boolean;
}

interface Props {
    icon: string;
    name: string;
    completed: boolean;
    streak: number;
    logs: LogMap;
    automationType?: string;
    onToggle: () => void;
    onEdit: () => void;
}

export function HabitCard({ icon, name, completed, streak, logs, automationType, onToggle, onEdit }: Props) {
    // Last 7 days for the mini strip
    const weekDots = useMemo(() => {
        const dots: { key: string; done: boolean; today: boolean }[] = [];
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        for (let i = 6; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(d.getDate() - i);
            const key = d.toISOString().split('T')[0];
            dots.push({ key, done: !!logs[key], today: key === todayStr });
        }
        return dots;
    }, [logs]);

    return (
        <div className={`habit-card ${completed ? 'completed' : ''}`} onClick={onToggle}>
            <button className="habit-card-menu" onClick={e => { e.stopPropagation(); onEdit(); }}>⋯</button>
            <div className="habit-card-check">{completed ? '✓' : ''}</div>
            <span className="habit-card-icon">{icon}</span>
            <span className="habit-card-name">
                {name}
                {automationType && <span className="habit-auto-badge">⚡</span>}
            </span>
            <span className={`habit-card-streak ${streak > 0 ? 'has-streak' : ''}`}>
                {streak > 0 ? `🔥 ${streak}d` : '—'}
            </span>
            <div className="habit-card-week">
                {weekDots.map(d => (
                    <span key={d.key} className={`habit-week-dot ${d.done ? 'done' : ''} ${d.today ? 'today' : ''}`} />
                ))}
            </div>
        </div>
    );
}
