import { useMemo } from 'react';

interface Props {
    habits: { id: string; name: string }[];
    habitLogMap: Record<string, Record<string, boolean>>;
}

export function WeeklyHeatmap({ habits, habitLogMap }: Props) {
    const days = useMemo(() => {
        const result: { key: string; label: string; completed: number; total: number }[] = [];
        const now = new Date();
        for (let i = 6; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(d.getDate() - i);
            const key = d.toISOString().split('T')[0];
            const label = d.toLocaleDateString('en', { weekday: 'short' });
            let completed = 0;
            for (const h of habits) {
                if (habitLogMap[h.id]?.[key]) completed++;
            }
            result.push({ key, label, completed, total: habits.length });
        }
        return result;
    }, [habits, habitLogMap]);

    if (habits.length === 0) return null;

    return (
        <div className="weekly-heatmap">
            <h3 className="weekly-heatmap-title">This Week</h3>
            <div className="weekly-heatmap-grid">
                {days.map(d => {
                    const pct = d.total > 0 ? d.completed / d.total : 0;
                    return (
                        <div key={d.key} className="weekly-heatmap-cell">
                            <div
                                className="weekly-heatmap-block"
                                style={{ opacity: 0.15 + pct * 0.85 }}
                            />
                            <span className="weekly-heatmap-count">{d.completed}/{d.total}</span>
                            <span className="weekly-heatmap-label">{d.label}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
