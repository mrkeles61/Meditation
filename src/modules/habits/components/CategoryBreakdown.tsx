import { useMemo } from 'react';

interface Props {
    habits: { id: string; category: string }[];
    habitLogMap: Record<string, Record<string, boolean>>;
    todayStr: string;
}

const CATEGORY_LABELS: Record<string, string> = {
    meditation: 'Meditation',
    exercise: 'Exercise',
    reading: 'Reading',
    nutrition: 'Nutrition',
    sleep: 'Sleep',
    custom: 'Custom',
};

const CATEGORY_COLORS: Record<string, string> = {
    meditation: '#c8956c',
    exercise: '#6ec87a',
    reading: '#7ab4e8',
    nutrition: '#e8b94a',
    sleep: '#a78bdb',
    custom: '#8a8078',
};

export function CategoryBreakdown({ habits, habitLogMap, todayStr }: Props) {
    const categories = useMemo(() => {
        const map: Record<string, { total: number; completed: number }> = {};
        for (const h of habits) {
            const cat = h.category || 'custom';
            if (!map[cat]) map[cat] = { total: 0, completed: 0 };
            map[cat].total++;
            if (habitLogMap[h.id]?.[todayStr]) map[cat].completed++;
        }
        return Object.entries(map)
            .map(([key, val]) => ({
                key,
                label: CATEGORY_LABELS[key] || key,
                color: CATEGORY_COLORS[key] || '#8a8078',
                ...val,
                pct: val.total > 0 ? Math.round((val.completed / val.total) * 100) : 0,
            }))
            .sort((a, b) => b.pct - a.pct);
    }, [habits, habitLogMap, todayStr]);

    if (categories.length <= 1) return null;

    return (
        <div className="category-breakdown">
            <h3 className="category-breakdown-title">Categories</h3>
            <div className="category-breakdown-bars">
                {categories.map(c => (
                    <div key={c.key} className="category-bar-row">
                        <span className="category-bar-label">{c.label}</span>
                        <div className="category-bar-track">
                            <div
                                className="category-bar-fill"
                                style={{ width: `${c.pct}%`, backgroundColor: c.color }}
                            />
                        </div>
                        <span className="category-bar-pct">{c.pct}%</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
