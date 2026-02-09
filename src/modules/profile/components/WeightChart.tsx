import { useState, useEffect, useMemo } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { supabase } from '../../../services/supabase';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

interface WeightEntry {
    weight_kg: number;
    recorded_at: string;
}

interface Props {
    userId: string;
    averageDay: number; // 0=Sun, 1=Mon, ..., 6=Sat
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function WeightChart({ userId, averageDay }: Props) {
    const [entries, setEntries] = useState<WeightEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        supabase
            .from('weight_entries')
            .select('weight_kg, recorded_at')
            .eq('user_id', userId)
            .gte('recorded_at', sixMonthsAgo.toISOString().split('T')[0])
            .order('recorded_at', { ascending: true })
            .then(({ data }) => {
                setEntries(data || []);
                setLoading(false);
            });
    }, [userId]);

    const { labels, dailyData, avgData, stats } = useMemo(() => {
        if (entries.length === 0) return { labels: [], dailyData: [], avgData: [], stats: null };

        const map = new Map<string, number>();
        for (const e of entries) map.set(e.recorded_at, Number(e.weight_kg));

        const labels: string[] = [];
        const dailyData: (number | null)[] = [];
        const avgData: (number | null)[] = [];

        const today = new Date();
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        for (let d = new Date(sixMonthsAgo); d <= today; d.setDate(d.getDate() + 1)) {
            const key = d.toISOString().split('T')[0];
            const short = `${d.getMonth() + 1}/${d.getDate()}`;
            labels.push(short);

            const val = map.get(key) ?? null;
            dailyData.push(val);

            // Weekly average on the chosen day
            if (d.getDay() === averageDay) {
                const weekEntries: number[] = [];
                for (let i = 0; i < 7; i++) {
                    const wd = new Date(d);
                    wd.setDate(wd.getDate() - i);
                    const wk = wd.toISOString().split('T')[0];
                    const wv = map.get(wk);
                    if (wv !== undefined) weekEntries.push(wv);
                }
                avgData.push(weekEntries.length > 0 ? +(weekEntries.reduce((a, b) => a + b, 0) / weekEntries.length).toFixed(1) : null);
            } else {
                avgData.push(null);
            }
        }

        const current = entries[entries.length - 1]?.weight_kg;
        const recent7 = entries.slice(-7);
        const avg7 = recent7.length > 0 ? +(recent7.reduce((s, e) => s + Number(e.weight_kg), 0) / recent7.length).toFixed(1) : null;

        const thirtyAgo = entries.find((e) => {
            const diff = (today.getTime() - new Date(e.recorded_at).getTime()) / 86400000;
            return diff >= 28 && diff <= 35;
        });
        const change30 = thirtyAgo && current ? +(Number(current) - Number(thirtyAgo.weight_kg)).toFixed(1) : null;

        return { labels, dailyData, avgData, stats: { current: Number(current), avg7, change30 } };
    }, [entries, averageDay]);

    if (loading) return <div className="weight-chart-loading">Loading...</div>;
    if (entries.length === 0) return <div className="weight-chart-empty">No weight entries yet. Log your first entry above!</div>;

    const chartData = {
        labels: labels as string[],
        datasets: [
            {
                label: 'Daily',
                data: dailyData,
                borderColor: 'rgba(200, 149, 108, 0.6)',
                backgroundColor: 'rgba(200, 149, 108, 0.08)',
                pointRadius: 2,
                pointHoverRadius: 5,
                borderWidth: 1.5,
                tension: 0.3,
                fill: true,
                spanGaps: true,
            },
            {
                label: `${DAY_LABELS[averageDay]} Avg`,
                data: avgData,
                borderColor: 'transparent',
                backgroundColor: 'rgba(200, 149, 108, 1)',
                pointRadius: 5,
                pointHoverRadius: 7,
                borderWidth: 0,
                spanGaps: false,
                showLine: false,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                ticks: { color: '#5a534d', maxTicksLimit: 8, font: { size: 10 } },
                grid: { display: false },
                border: { display: false },
            },
            y: {
                ticks: { color: '#5a534d', font: { size: 10 } },
                grid: { color: 'rgba(255,255,255,0.04)' },
                border: { display: false },
            },
        },
        plugins: {
            tooltip: {
                backgroundColor: '#1a1a25',
                titleColor: '#e0d5c7',
                bodyColor: '#e0d5c7',
                borderColor: 'rgba(255,255,255,0.06)',
                borderWidth: 1,
                padding: 8,
                displayColors: false,
                callbacks: {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    label: (ctx: any) =>
                        ctx.raw !== null ? `${ctx.dataset.label}: ${ctx.raw} kg` : '',
                },
            },
            legend: { display: false },
        },
        interaction: { intersect: false, mode: 'index' as const },
    } as const;

    return (
        <div className="weight-chart-section">
            <div className="weight-chart-container">
                <Line data={chartData} options={options} />
            </div>
            {stats && (
                <div className="weight-stats-row">
                    <div className="weight-stat">
                        <span className="weight-stat-value">{stats.current}</span>
                        <span className="weight-stat-label">current kg</span>
                    </div>
                    {stats.avg7 !== null && (
                        <>
                            <div className="weight-stat-divider" />
                            <div className="weight-stat">
                                <span className="weight-stat-value">{stats.avg7}</span>
                                <span className="weight-stat-label">7-day avg</span>
                            </div>
                        </>
                    )}
                    {stats.change30 !== null && (
                        <>
                            <div className="weight-stat-divider" />
                            <div className="weight-stat">
                                <span className={`weight-stat-value ${stats.change30 > 0 ? 'up' : stats.change30 < 0 ? 'down' : ''}`}>
                                    {stats.change30 > 0 ? '+' : ''}{stats.change30}
                                </span>
                                <span className="weight-stat-label">30-day</span>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
