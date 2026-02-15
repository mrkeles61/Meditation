import { useState, useMemo } from 'react';

interface Habit {
    id: string;
    name: string;
    icon: string;
}

interface HabitLog {
    id: string;
    habit_id: string;
    logged_at: string;
}

interface Props {
    habits: Habit[];
    logs: HabitLog[];
    onToggle: (habitId: string, date: string) => void;
}

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function MonthlyGrid({ habits, logs, onToggle }: Props) {
    const [monthOffset, setMonthOffset] = useState(0);

    const { year, month, daysInMonth, monthLabel, logSet, daysElapsed } = useMemo(() => {
        const now = new Date();
        now.setMonth(now.getMonth() + monthOffset);
        const year = now.getFullYear();
        const month = now.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const monthLabel = now.toLocaleDateString('en', { month: 'long', year: 'numeric' });

        const logSet = new Set<string>();
        for (const l of logs) logSet.add(`${l.habit_id}:${l.logged_at}`);

        // Days elapsed in this month (for progress calculation)
        const today = new Date();
        let daysElapsed: number;
        if (monthOffset < 0) {
            daysElapsed = daysInMonth; // Past months: full month
        } else {
            daysElapsed = Math.min(today.getDate(), daysInMonth);
        }

        return { year, month, daysInMonth, monthLabel, logSet, daysElapsed };
    }, [logs, monthOffset]);

    const todayStr = new Date().toISOString().split('T')[0];

    function dateStr(day: number) {
        return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }

    function handleCellClick(habitId: string, day: number) {
        const ds = dateStr(day);
        if (ds > todayStr) return;
        onToggle(habitId, ds);
    }

    // Per-habit completion stats
    const habitStats = useMemo(() => {
        return habits.map(h => {
            let done = 0;
            for (let d = 1; d <= daysElapsed; d++) {
                if (logSet.has(`${h.id}:${dateStr(d)}`)) done++;
            }
            const pct = daysElapsed > 0 ? Math.round((done / daysElapsed) * 100) : 0;
            return { done, pct };
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [habits, logSet, daysElapsed, year, month]);

    // Overall daily average
    const overallPct = habits.length > 0
        ? Math.round(habitStats.reduce((s, h) => s + h.pct, 0) / habits.length)
        : 0;

    return (
        <div className="monthly-grid-wrap">
            {/* Month nav */}
            <div className="monthly-nav">
                <button className="monthly-nav-btn" onClick={() => setMonthOffset(o => o - 1)}>←</button>
                <span className="monthly-nav-label">{monthLabel}</span>
                <button className="monthly-nav-btn" onClick={() => setMonthOffset(o => Math.min(o + 1, 0))}
                    disabled={monthOffset >= 0}>→</button>
            </div>

            {/* Overall progress */}
            <div className="mg-overall-bar">
                <span className="mg-overall-label">Overall</span>
                <div className="mg-progress-track">
                    <div className="mg-progress-fill" style={{ width: `${overallPct}%` }} />
                </div>
                <span className="mg-overall-pct">{overallPct}%</span>
            </div>

            {/* Grid table */}
            <div className="monthly-grid-scroll">
                <table className="monthly-grid-table">
                    <thead>
                        <tr>
                            <th className="mg-habit-col">Habit</th>
                            {Array.from({ length: daysInMonth }, (_, i) => {
                                const d = new Date(year, month, i + 1);
                                const dayName = DAY_NAMES[(d.getDay() + 6) % 7];
                                const isToday = dateStr(i + 1) === todayStr;
                                return (
                                    <th key={i} className={`mg-day-col ${isToday ? 'today' : ''}`}>
                                        <span className="mg-day-num">{i + 1}</span>
                                        <span className="mg-day-name">{dayName.charAt(0)}</span>
                                    </th>
                                );
                            })}
                            <th className="mg-progress-col">%</th>
                        </tr>
                    </thead>
                    <tbody>
                        {habits.map((h, hi) => (
                            <tr key={h.id}>
                                <td className="mg-habit-cell">
                                    <span className="mg-habit-icon">{h.icon}</span>
                                    <span className="mg-habit-name">{h.name}</span>
                                </td>
                                {Array.from({ length: daysInMonth }, (_, i) => {
                                    const ds = dateStr(i + 1);
                                    const done = logSet.has(`${h.id}:${ds}`);
                                    const isFuture = ds > todayStr;
                                    const isToday = ds === todayStr;
                                    return (
                                        <td key={i}
                                            className={`mg-cell ${done ? 'done' : ''} ${isFuture ? 'future' : ''} ${isToday ? 'today' : ''}`}
                                            onClick={() => handleCellClick(h.id, i + 1)}>
                                            {done && <span className="mg-check">✓</span>}
                                        </td>
                                    );
                                })}
                                <td className="mg-pct-cell">
                                    <div className="mg-row-bar">
                                        <div className="mg-row-bar-fill" style={{ width: `${habitStats[hi].pct}%` }} />
                                    </div>
                                    <span className="mg-row-pct">{habitStats[hi].pct}%</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
