import { useState, useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { supabase } from '../../../services/supabase';

interface SessionRecord {
    completed_seconds: number;
    sound_type: string;
    created_at: string;
}

interface Props {
    userId: string;
    dailyGoalMinutes: number;
    onGoalChange: (newGoal: number) => void;
}

const SOUND_ICON: Record<string, string> = {
    rain: '🌧', ocean: '🌊', 'singing-bowl': '🔔',
    fireplace: '🔥', forest: '🌲', silence: '🤫',
};

const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const CELL_SIZE = 18;
const CELL_GAP = 3;

function getHeatColor(ratio: number): string {
    if (ratio <= 0) return 'rgba(255,255,255,0.03)';
    if (ratio < 0.5) return 'rgba(200,149,108,0.18)';
    if (ratio < 1.0) return 'rgba(200,149,108,0.40)';
    return 'rgba(200,149,108,0.72)'; // >= 100% goal
}

export function MeditationHeatmap({ userId, dailyGoalMinutes, onGoalChange }: Props) {
    const currentYear = new Date().getFullYear();
    const [year, setYear] = useState(currentYear);
    const [sessions, setSessions] = useState<SessionRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDay, setSelectedDay] = useState<string | null>(null);
    const [goalInput, setGoalInput] = useState(String(dailyGoalMinutes));

    useEffect(() => {
        const startOfYear = `${year}-01-01T00:00:00.000Z`;
        const endOfYear = `${year + 1}-01-01T00:00:00.000Z`;

        setLoading(true);
        supabase
            .from('meditation_sessions')
            .select('completed_seconds, sound_type, created_at')
            .eq('user_id', userId)
            .gte('created_at', startOfYear)
            .lt('created_at', endOfYear)
            .order('created_at', { ascending: false })
            .then(({ data }) => {
                setSessions(data || []);
                setLoading(false);
            });
    }, [userId, year]);

    const { stats, dayMap, grid, monthLabels } = useMemo(() => {
        const dayMap = new Map<string, SessionRecord[]>();
        let totalMinutes = 0;

        for (const s of sessions) {
            const d = new Date(s.created_at);
            const key = d.toISOString().split('T')[0];
            if (!dayMap.has(key)) dayMap.set(key, []);
            dayMap.get(key)!.push(s);
            totalMinutes += s.completed_seconds || 0;
        }

        // Streaks (within this year's data)
        let longestStreak = 0;
        let currentStreak = 0;
        const today = new Date();
        const yearEnd = year === currentYear ? today : new Date(year, 11, 31);
        const yearStart = new Date(year, 0, 1);
        const totalDaysInRange = Math.ceil((yearEnd.getTime() - yearStart.getTime()) / 86400000) + 1;

        for (let i = 0; i < totalDaysInRange; i++) {
            const d = new Date(yearEnd);
            d.setDate(d.getDate() - i);
            if (d < yearStart) break;
            const key = d.toISOString().split('T')[0];
            if (dayMap.has(key)) {
                if (i === 0 || currentStreak > 0) currentStreak++;
                longestStreak = Math.max(longestStreak, currentStreak);
            } else if (i > 0) {
                currentStreak = 0;
            }
        }

        // Build grid starting from Jan 1 of selected year
        const jan1 = new Date(year, 0, 1);
        const jan1Dow = jan1.getDay(); // 0=Sun
        const lastDay = year === currentYear ? today : new Date(year, 11, 31);

        const grid: { date: string; dayOfWeek: number; weekCol: number; minutes: number; ratio: number }[] = [];
        const monthLabels: { label: string; weekCol: number }[] = [];
        const seenMonths = new Set<number>();

        // Start from the Sunday of the week containing Jan 1
        const gridStart = new Date(jan1);
        gridStart.setDate(gridStart.getDate() - jan1Dow);

        const totalRenderDays = Math.ceil((lastDay.getTime() - gridStart.getTime()) / 86400000) + 1;

        for (let i = 0; i < totalRenderDays; i++) {
            const d = new Date(gridStart);
            d.setDate(d.getDate() + i);
            if (d > lastDay) break;

            const key = d.toISOString().split('T')[0];
            const dayOfWeek = d.getDay();
            const weekCol = Math.floor(i / 7);

            // Don't render cells before Jan 1 (pre-padding)
            const isBeforeYear = d < jan1;

            const daySessions = isBeforeYear ? [] : (dayMap.get(key) || []);
            const dayMinutes = daySessions.reduce((s, r) => s + (r.completed_seconds || 0), 0) / 60;
            const ratio = isBeforeYear ? -1 : (dailyGoalMinutes > 0 ? dayMinutes / dailyGoalMinutes : 0);

            grid.push({ date: key, dayOfWeek, weekCol, minutes: isBeforeYear ? -1 : +dayMinutes.toFixed(1), ratio });

            // Month labels on first day of each month
            if (!isBeforeYear && d.getDate() === 1 && !seenMonths.has(d.getMonth())) {
                seenMonths.add(d.getMonth());
                monthLabels.push({ label: MONTH_NAMES[d.getMonth()], weekCol });
            }
        }

        return {
            stats: {
                totalSessions: sessions.length,
                totalMinutes: Math.round(totalMinutes / 60),
                longestStreak,
                currentStreak,
            },
            dayMap,
            grid,
            monthLabels,
        };
    }, [sessions, dailyGoalMinutes, year, currentYear]);

    const totalWeeks = grid.length > 0 ? grid[grid.length - 1].weekCol + 1 : 0;
    const svgW = 30 + totalWeeks * (CELL_SIZE + CELL_GAP);
    const svgH = 7 * (CELL_SIZE + CELL_GAP) + 40;

    function handleCellClick(date: string, minutes: number) {
        if (minutes <= 0) return;
        setSelectedDay(selectedDay === date ? null : date);
    }

    const daySessions = selectedDay ? (dayMap.get(selectedDay) || []) : [];

    if (loading) return <div className="ghm-loading">Loading...</div>;

    return (
        <div className="github-meditation-heatmap">
            {/* Year switcher + stats */}
            <div className="ghm-top-row">
                <div className="ghm-year-switcher">
                    <button className="ghm-year-btn" onClick={() => setYear(y => y - 1)} disabled={year <= 2024}>
                        ‹
                    </button>
                    <span className="ghm-year-label">{year}</span>
                    <button className="ghm-year-btn" onClick={() => setYear(y => y + 1)} disabled={year >= currentYear}>
                        ›
                    </button>
                </div>
                <div className="ghm-stats">
                    <div className="ghm-stat">
                        <span className="ghm-stat-value">{stats.totalSessions}</span>
                        <span className="ghm-stat-label">sessions</span>
                    </div>
                    <div className="ghm-stat-divider" />
                    <div className="ghm-stat">
                        <span className="ghm-stat-value">{stats.totalMinutes}</span>
                        <span className="ghm-stat-label">minutes</span>
                    </div>
                    <div className="ghm-stat-divider" />
                    <div className="ghm-stat">
                        <span className="ghm-stat-value">{stats.longestStreak}</span>
                        <span className="ghm-stat-label">best streak</span>
                    </div>
                    <div className="ghm-stat-divider" />
                    <div className="ghm-stat">
                        <span className="ghm-stat-value">{stats.currentStreak}</span>
                        <span className="ghm-stat-label">current</span>
                    </div>
                </div>
            </div>

            {/* Goal indicator — editable */}
            <div className="ghm-goal-banner">
                <span className="ghm-goal-icon">🎯</span>
                <span className="ghm-goal-text">
                    Daily goal:
                </span>
                <input
                    type="number"
                    min="1"
                    max="120"
                    className="ghm-goal-input"
                    value={goalInput}
                    onChange={(e) => setGoalInput(e.target.value)}
                    onBlur={() => {
                        const v = parseInt(goalInput);
                        if (!isNaN(v) && v >= 1 && v <= 120 && v !== dailyGoalMinutes) onGoalChange(v);
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            const v = parseInt(goalInput);
                            if (!isNaN(v) && v >= 1 && v <= 120 && v !== dailyGoalMinutes) onGoalChange(v);
                        }
                    }}
                />
                <span className="ghm-goal-text">min</span>
            </div>

            {/* GitHub-style heatmap */}
            <div className="ghm-chart-wrap">
                <svg width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`} className="ghm-svg">
                    {/* Day-of-week labels */}
                    {DAY_LABELS.map((label, i) => (
                        label ? (
                            <text key={i} x={12} y={24 + i * (CELL_SIZE + CELL_GAP) + CELL_SIZE / 2 + 3}
                                textAnchor="end" fill="var(--text-muted)" fontSize={9}
                                fontFamily="var(--font-mono)">
                                {label}
                            </text>
                        ) : null
                    ))}

                    {/* Month labels */}
                    {monthLabels.map((m, i) => (
                        <text key={i} x={24 + m.weekCol * (CELL_SIZE + CELL_GAP)} y={14}
                            fill="var(--text-muted)" fontSize={9} fontFamily="var(--font-mono)">
                            {m.label}
                        </text>
                    ))}

                    {/* Cells */}
                    {grid.map((cell, i) => {
                        if (cell.ratio < 0) {
                            // Pre-Jan-1 padding — invisible
                            return <rect key={i}
                                x={24 + cell.weekCol * (CELL_SIZE + CELL_GAP)}
                                y={20 + cell.dayOfWeek * (CELL_SIZE + CELL_GAP)}
                                width={CELL_SIZE} height={CELL_SIZE}
                                rx={3} fill="transparent" />;
                        }
                        return (
                            <rect key={i}
                                x={24 + cell.weekCol * (CELL_SIZE + CELL_GAP)}
                                y={20 + cell.dayOfWeek * (CELL_SIZE + CELL_GAP)}
                                width={CELL_SIZE} height={CELL_SIZE}
                                rx={3}
                                fill={getHeatColor(cell.ratio)}
                                className={cell.minutes > 0 ? 'ghm-cell-active' : ''}
                                onClick={() => handleCellClick(cell.date, cell.minutes)}
                            />
                        );
                    })}
                </svg>
            </div>

            {/* Legend */}
            <div className="ghm-legend">
                <span className="ghm-legend-label">Less</span>
                {[0, 0.3, 0.7, 1.0].map((r, i) => (
                    <span key={i} className="ghm-legend-cell" style={{ background: getHeatColor(r) }} />
                ))}
                <span className="ghm-legend-label">More</span>
                <span className="ghm-legend-goal">= {dailyGoalMinutes}min goal</span>
            </div>

            {/* Day detail */}
            <AnimatePresence>
                {selectedDay && daySessions.length > 0 && (
                    <motion.div className="ghm-day-detail"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}>
                        <div className="ghm-day-detail-inner">
                            <p className="ghm-day-title">
                                {new Date(selectedDay + 'T12:00:00').toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })}
                                {' · '}
                                {daySessions.length} session{daySessions.length > 1 ? 's' : ''}
                            </p>
                            <div className="ghm-sessions-list">
                                {daySessions.map((s, i) => {
                                    const mins = Math.floor(s.completed_seconds / 60);
                                    const secs = s.completed_seconds % 60;
                                    const time = new Date(s.created_at).toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit' });
                                    return (
                                        <div key={i} className="ghm-session-pill">
                                            <span>{mins}:{secs.toString().padStart(2, '0')}</span>
                                            <span className="pill-dot">·</span>
                                            <span>{SOUND_ICON[s.sound_type] || ''} {s.sound_type}</span>
                                            <span className="pill-dot">·</span>
                                            <span className="pill-time">{time}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
