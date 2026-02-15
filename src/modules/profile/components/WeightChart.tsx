import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../../services/supabase';

interface WeightEntry {
    weight_kg: number;
    recorded_at: string;
}

interface Props {
    userId: string;
    goalWeight: number | null;
}

type Timeframe = '1W' | '1M' | '3M' | '6M' | '1Y';
const TIMEFRAMES: { key: Timeframe; label: string; days: number }[] = [
    { key: '1W', label: '1W', days: 7 },
    { key: '1M', label: '1M', days: 30 },
    { key: '3M', label: '3M', days: 90 },
    { key: '6M', label: '6M', days: 180 },
    { key: '1Y', label: '1Y', days: 365 },
];

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const W = 560, H = 280, PAD_L = 48, PAD_R = 20, PAD_T = 28, PAD_B = 36;

export function WeightChart({ userId, goalWeight }: Props) {
    const [entries, setEntries] = useState<WeightEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [timeframe, setTimeframe] = useState<Timeframe>('1M');

    useEffect(() => {
        const start = new Date();
        start.setFullYear(start.getFullYear() - 1);
        supabase
            .from('weight_entries')
            .select('weight_kg, recorded_at')
            .eq('user_id', userId)
            .gte('recorded_at', start.toISOString().split('T')[0])
            .order('recorded_at', { ascending: true })
            .then(({ data }) => {
                setEntries(data || []);
                setLoading(false);
            });
    }, [userId]);

    const tfDays = TIMEFRAMES.find(t => t.key === timeframe)!.days;
    const useWeekly = tfDays >= 30;

    const { points, yMin, yMax, yTicks, xTicks, stats } = useMemo(() => {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - tfDays);
        const cutoffStr = cutoff.toISOString().split('T')[0];
        const filtered = entries.filter(e => e.recorded_at >= cutoffStr);

        if (filtered.length === 0) {
            return { points: [], yMin: 0, yMax: 100, yTicks: [], xTicks: [], stats: null };
        }

        let dataPoints: { kg: number; label: string; dateMs: number }[];

        if (useWeekly) {
            // Aggregate into weekly averages (grouped by Monday of each week)
            const weeks = new Map<string, { sum: number; count: number; startDate: Date }>();
            for (const e of filtered) {
                const d = new Date(e.recorded_at + 'T12:00:00');
                const day = d.getDay();
                const monday = new Date(d);
                monday.setDate(d.getDate() - ((day + 6) % 7));
                const weekKey = monday.toISOString().split('T')[0];
                if (!weeks.has(weekKey)) weeks.set(weekKey, { sum: 0, count: 0, startDate: monday });
                const w = weeks.get(weekKey)!;
                w.sum += Number(e.weight_kg);
                w.count++;
            }
            dataPoints = Array.from(weeks.entries())
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([, w]) => ({
                    kg: +(w.sum / w.count).toFixed(1),
                    label: `${w.startDate.getMonth() + 1}/${w.startDate.getDate()}`,
                    dateMs: w.startDate.getTime(),
                }));
        } else {
            // 1W: use calendar-based positioning (all 7 days on x-axis)
            // Build a map of date -> weight for the data we have
            const dateMap = new Map<string, number>();
            for (const e of filtered) {
                dateMap.set(e.recorded_at, Number(e.weight_kg));
            }

            // Generate all days in the range
            const today = new Date();
            today.setHours(12, 0, 0, 0);
            const allDays: { dateStr: string; dateObj: Date }[] = [];
            for (let i = tfDays; i >= 0; i--) {
                const d = new Date(today);
                d.setDate(today.getDate() - i);
                allDays.push({ dateStr: d.toISOString().split('T')[0], dateObj: d });
            }

            // Only create data points for days that have data
            dataPoints = [];
            for (const day of allDays) {
                const kg = dateMap.get(day.dateStr);
                if (kg !== undefined) {
                    dataPoints.push({
                        kg,
                        label: DAY_NAMES[day.dateObj.getDay()],
                        dateMs: day.dateObj.getTime(),
                    });
                }
            }
        }

        if (dataPoints.length === 0) {
            return { points: [], yMin: 0, yMax: 100, yTicks: [], xTicks: [], stats: null };
        }

        // For 1W, normalize against the full 7-day calendar range (not just data range)
        let rangeStart: number, rangeEnd: number;
        if (!useWeekly) {
            const today = new Date();
            today.setHours(12, 0, 0, 0);
            const weekAgo = new Date(today);
            weekAgo.setDate(today.getDate() - tfDays);
            rangeStart = weekAgo.getTime();
            rangeEnd = today.getTime();
        } else {
            rangeStart = dataPoints[0].dateMs;
            rangeEnd = dataPoints[dataPoints.length - 1].dateMs;
        }
        const msRange = Math.max(rangeEnd - rangeStart, 1);

        const points = dataPoints.map(dp => ({
            ...dp,
            t: (dp.dateMs - rangeStart) / msRange,
        }));

        // Y range
        const allVals = points.map(p => p.kg);
        if (goalWeight) allVals.push(goalWeight);
        const dataMin = Math.min(...allVals);
        const dataMax = Math.max(...allVals);
        const yPad = Math.max((dataMax - dataMin) * 0.15, 0.5);
        const yMin = Math.floor((dataMin - yPad) * 2) / 2;
        const yMax = Math.ceil((dataMax + yPad) * 2) / 2;

        // Y ticks
        const yTicks: number[] = [];
        const step = yMax - yMin > 10 ? 2 : 1;
        for (let v = Math.ceil(yMin); v <= Math.floor(yMax); v += step) {
            yTicks.push(v);
        }

        // X ticks: for 1W show all calendar days; for weekly show subset
        const xTicks: { t: number; label: string }[] = [];
        if (!useWeekly) {
            // Show every calendar day on x-axis
            const today = new Date();
            today.setHours(12, 0, 0, 0);
            for (let i = tfDays; i >= 0; i--) {
                const d = new Date(today);
                d.setDate(today.getDate() - i);
                const t = (d.getTime() - rangeStart) / msRange;
                xTicks.push({ t, label: DAY_NAMES[d.getDay()] });
            }
        } else {
            const maxTicks = Math.min(points.length, 8);
            for (let i = 0; i < maxTicks; i++) {
                const idx = maxTicks <= 1 ? 0 : Math.round(i * (points.length - 1) / (maxTicks - 1));
                xTicks.push({ t: points[idx].t, label: points[idx].label });
            }
        }

        // Stats
        const current = Number(filtered[filtered.length - 1].weight_kg);
        const recent7 = filtered.slice(-7);
        const avg7 = recent7.length > 0 ? +(recent7.reduce((s, e) => s + Number(e.weight_kg), 0) / recent7.length).toFixed(1) : null;

        const todayDate = new Date();
        const prevWeek = filtered.filter(e => {
            const diff = (todayDate.getTime() - new Date(e.recorded_at + 'T12:00:00').getTime()) / 86400000;
            return diff >= 7 && diff < 14;
        });
        const prevAvg = prevWeek.length > 0 ? +(prevWeek.reduce((s, e) => s + Number(e.weight_kg), 0) / prevWeek.length).toFixed(1) : null;
        const weeklyChange = prevAvg !== null && avg7 !== null ? +(avg7 - prevAvg).toFixed(1) : null;
        const toGoal = goalWeight ? +(current - goalWeight).toFixed(1) : null;

        return { points, yMin, yMax, yTicks, xTicks, stats: { current, avg7, weeklyChange, toGoal } };
    }, [entries, tfDays, goalWeight, useWeekly]);

    const plotW = W - PAD_L - PAD_R;
    const plotH = H - PAD_T - PAD_B;
    const yRange = yMax - yMin || 1;

    const toX = (t: number) => PAD_L + t * plotW;
    const toY = (v: number) => PAD_T + plotH - ((v - yMin) / yRange) * plotH;

    // Line path through points
    const linePath = points.length > 0
        ? points.map((p, i) => `${i === 0 ? 'M' : 'L'}${toX(p.t).toFixed(1)},${toY(p.kg).toFixed(1)}`).join(' ')
        : '';

    // Area fill
    const areaPath = points.length > 1
        ? linePath + ` L${toX(points[points.length - 1].t).toFixed(1)},${PAD_T + plotH} L${toX(points[0].t).toFixed(1)},${PAD_T + plotH} Z`
        : '';

    // Figure out which dots get value labels
    const labelledIndices = useMemo(() => {
        if (points.length === 0) return new Set<number>();
        if (!useWeekly) {
            // 1W: label all dots (max 8 points)
            return new Set(points.map((_, i) => i));
        }
        const minGap = 48;
        const set = new Set<number>();
        set.add(0);
        set.add(points.length - 1);
        let lastX = toX(points[0].t);
        for (let i = 1; i < points.length - 1; i++) {
            const x = toX(points[i].t);
            if (x - lastX >= minGap) {
                set.add(i);
                lastX = x;
            }
        }
        return set;
    }, [points, useWeekly]);

    if (loading) return <div className="wt-loading">Loading...</div>;
    if (entries.length === 0) return <div className="wt-empty">No weight entries yet. Log your first entry above!</div>;

    return (
        <div className="weight-tracker-chart">
            {/* Timeframe pills */}
            <div className="wt-timeframe-row">
                {TIMEFRAMES.map(t => (
                    <button key={t.key}
                        className={`wt-tf-pill ${timeframe === t.key ? 'active' : ''}`}
                        onClick={() => setTimeframe(t.key)}>
                        {t.label}
                    </button>
                ))}
            </div>

            {/* SVG Chart */}
            <div className="wt-chart-wrap">
                <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="wt-svg">
                    {/* Y grid + labels */}
                    {yTicks.map((v, i) => (
                        <g key={i}>
                            <line x1={PAD_L} y1={toY(v)} x2={PAD_L + plotW} y2={toY(v)}
                                stroke="rgba(255,255,255,0.05)" strokeWidth={0.5} />
                            <text x={PAD_L - 8} y={toY(v) + 3.5} textAnchor="end"
                                fill="var(--text-muted)" fontSize={10} fontFamily="var(--font-mono)">
                                {v}
                            </text>
                        </g>
                    ))}

                    {/* X labels */}
                    {xTicks.map((tick, i) => (
                        <text key={i} x={toX(tick.t)} y={H - 6}
                            textAnchor="middle" fill="var(--text-muted)" fontSize={10} fontFamily="var(--font-mono)">
                            {tick.label}
                        </text>
                    ))}

                    {/* Axes */}
                    <line x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={PAD_T + plotH}
                        stroke="rgba(255,255,255,0.08)" strokeWidth={1} />
                    <line x1={PAD_L} y1={PAD_T + plotH} x2={PAD_L + plotW} y2={PAD_T + plotH}
                        stroke="rgba(255,255,255,0.08)" strokeWidth={1} />

                    {/* Goal line */}
                    {goalWeight && goalWeight >= yMin && goalWeight <= yMax && (
                        <g>
                            <line x1={PAD_L} y1={toY(goalWeight)} x2={PAD_L + plotW} y2={toY(goalWeight)}
                                stroke="rgba(76,175,80,0.4)" strokeWidth={1} strokeDasharray="6,4" />
                            <text x={PAD_L + plotW + 4} y={toY(goalWeight) + 3.5}
                                fill="rgba(76,175,80,0.7)" fontSize={10} fontFamily="var(--font-mono)">
                                {goalWeight}
                            </text>
                        </g>
                    )}

                    {/* Area fill */}
                    {areaPath && <path d={areaPath} fill="rgba(200,149,108,0.06)" />}

                    {/* Line */}
                    {linePath && <path d={linePath} fill="none" stroke="var(--accent)" strokeWidth={2} strokeLinejoin="round" />}

                    {/* Dots + labels */}
                    {points.map((p, i) => {
                        const x = toX(p.t);
                        const y = toY(p.kg);
                        const showLabel = labelledIndices.has(i);
                        return (
                            <g key={i}>
                                <circle cx={x} cy={y} r={useWeekly ? 4 : 3.5} fill="var(--accent)" />
                                {showLabel && (
                                    <text x={x} y={y - 8} textAnchor="middle"
                                        fill="rgba(200,149,108,0.7)" fontSize={9} fontFamily="var(--font-mono)">
                                        {p.kg}
                                    </text>
                                )}
                            </g>
                        );
                    })}

                    {/* Current endpoint highlight */}
                    {points.length > 0 && (
                        <circle cx={toX(points[points.length - 1].t)} cy={toY(points[points.length - 1].kg)}
                            r={5} fill="var(--accent)" stroke="rgba(200,149,108,0.3)" strokeWidth={2} />
                    )}
                </svg>
                {useWeekly && <p className="wt-agg-note">weekly averages</p>}
            </div>

            {/* Stats row */}
            {stats && (
                <div className="wt-stats-row">
                    <div className="wt-stat">
                        <span className="wt-stat-value">{stats.current}</span>
                        <span className="wt-stat-label">current kg</span>
                    </div>
                    {stats.avg7 !== null && (
                        <>
                            <div className="wt-stat-divider" />
                            <div className="wt-stat">
                                <span className="wt-stat-value">{stats.avg7}</span>
                                <span className="wt-stat-label">7-day avg</span>
                            </div>
                        </>
                    )}
                    {stats.toGoal !== null && (
                        <>
                            <div className="wt-stat-divider" />
                            <div className="wt-stat">
                                <span className={`wt-stat-value ${stats.toGoal <= 0 ? 'goal-reached' : ''}`}>
                                    {stats.toGoal <= 0 ? '🎉 Goal!' : `${stats.toGoal} to go`}
                                </span>
                                <span className="wt-stat-label">goal</span>
                            </div>
                        </>
                    )}
                    {stats.weeklyChange !== null && (
                        <>
                            <div className="wt-stat-divider" />
                            <div className="wt-stat">
                                <span className={`wt-stat-value ${stats.weeklyChange < 0 ? 'wt-down' : stats.weeklyChange > 0 ? 'wt-up' : ''}`}>
                                    {stats.weeklyChange > 0 ? '↑' : stats.weeklyChange < 0 ? '↓' : '→'} {Math.abs(stats.weeklyChange)}
                                </span>
                                <span className="wt-stat-label">weekly</span>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
