/**
 * useTownSync — one-shot Supabase sync on mount.
 *
 * Reads the last 30 days of habit_logs, calculates a current-day-inclusive
 * streak per habit category, maps categories → building IDs, and
 * pushes the result into townStore via initBuildings().
 *
 * Runs once when the TownScene mounts. Refresh on focus is a future concern.
 */
import { useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useTownStore, STREAK_THRESHOLDS } from '../modules/town/stores/townStore';
import { BUILDING_REGISTRY } from '../modules/town/data/building-registry';
import type { BuildingState } from '../modules/town/types/town.types';

// Habits table `category` values that don't exactly match building IDs.
// Add overrides here if the user's category names differ.
const CATEGORY_TO_BUILDING: Record<string, string> = {
    fitness:      'gym',
    exercise:     'gym',
    workout:      'gym',
    books:        'reading',
    study:        'reading',
    food:         'nutrition',
    diet:         'nutrition',
    water:        'hydration',
    drink:        'hydration',
    focus:        'productivity',
    work:         'productivity',
    writing:      'journal',
    diary:        'journal',
    rest:         'sleep',
};

/** Compute the building ID for a habit category string. */
function categoryToBuilding(raw: string): string | null {
    const cat = raw.toLowerCase().trim();
    // Direct match first
    if (cat in BUILDING_REGISTRY) return cat;
    // Override map
    if (cat in CATEGORY_TO_BUILDING) return CATEGORY_TO_BUILDING[cat];
    return null;
}

/** Derive streak from an array of date strings ('YYYY-MM-DD'), going backwards from today. */
function calcStreak(logDates: string[], todayStr: string): number {
    if (logDates.length === 0) return 0;

    const dateSet = new Set(logDates);
    const cursor  = new Date(todayStr);
    let streak    = 0;

    // Walk backwards day by day until we hit a gap
    while (true) {
        const key = cursor.toISOString().slice(0, 10);
        if (dateSet.has(key)) {
            streak++;
            cursor.setDate(cursor.getDate() - 1);
        } else {
            // Allow one-day grace: if today is missing but yesterday exists, start from yesterday
            if (streak === 0) {
                cursor.setDate(cursor.getDate() - 1);
                const yesterday = cursor.toISOString().slice(0, 10);
                if (dateSet.has(yesterday)) {
                    streak++;
                    cursor.setDate(cursor.getDate() - 1);
                    continue;
                }
            }
            break;
        }
    }

    return streak;
}

/** Map streak days → building level (0–3). */
function streakToLevel(streakDays: number): number {
    if (streakDays >= STREAK_THRESHOLDS[2]) return 3;
    if (streakDays >= STREAK_THRESHOLDS[1]) return 2;
    if (streakDays >= STREAK_THRESHOLDS[0]) return 1;
    return 0;
}

export function useTownSync() {
    useEffect(() => {
        let cancelled = false;

        async function sync() {
            // Must be authenticated
            const { data: { user } } = await supabase.auth.getUser();
            if (!user || cancelled) return;

            const today          = new Date().toISOString().slice(0, 10);
            const thirtyDaysAgo  = new Date(Date.now() - 30 * 86_400_000).toISOString().slice(0, 10);

            // ── Fetch habits (for category mapping) ──────────────────────────
            const { data: habits, error: habitsErr } = await supabase
                .from('habits')
                .select('id, category')
                .eq('user_id', user.id)
                .eq('archived', false);

            if (habitsErr || !habits || cancelled) return;

            // Build habitId → buildingId
            const habitIdToBuilding: Record<string, string> = {};
            for (const h of habits) {
                if (!h.category) continue;
                const bid = categoryToBuilding(h.category);
                if (bid) habitIdToBuilding[h.id] = bid;
            }

            // ── Fetch logs (last 30 days) ────────────────────────────────────
            const { data: logs, error: logsErr } = await supabase
                .from('habit_logs')
                .select('habit_id, logged_at')
                .eq('user_id', user.id)
                .gte('logged_at', thirtyDaysAgo)
                .order('logged_at', { ascending: false });

            if (logsErr || !logs || cancelled) return;

            // Group logs by buildingId
            const buildingLogs: Record<string, string[]> = {};
            for (const log of logs) {
                const bid = habitIdToBuilding[log.habit_id];
                if (!bid) continue;
                if (!buildingLogs[bid]) buildingLogs[bid] = [];
                buildingLogs[bid].push(log.logged_at);
            }

            // ── daysSinceStart ───────────────────────────────────────────────
            const allDates = logs.map((l) => l.logged_at as string).sort();
            const firstDate = allDates[0];
            const daysSinceStart = firstDate
                ? Math.max(1, Math.floor((Date.now() - new Date(firstDate).getTime()) / 86_400_000) + 1)
                : 1;

            // ── Build BuildingState map ──────────────────────────────────────
            const prevBuildings = useTownStore.getState().buildings;
            const next: Record<string, BuildingState> = {};

            for (const habitType of Object.keys(BUILDING_REGISTRY)) {
                const dates      = buildingLogs[habitType] ?? [];
                const streak     = calcStreak(dates, today);
                const level      = streakToLevel(streak);
                const prevLevel  = prevBuildings[habitType]?.level ?? -1; // -1 → force no false level-up on first load
                const isFirstLoad = prevLevel === -1 ||
                    (prevBuildings[habitType]?.streakDays === 0 && prevBuildings[habitType]?.lastActivity === '');

                next[habitType] = {
                    id:           habitType,
                    habitType,
                    level,
                    unlocked:     level > 0,
                    streakDays:   streak,
                    lastActivity: dates[0] ?? '',
                    // Only flag a level-up when the level genuinely increased (suppress on initial load)
                    pendingLevelUp: !isFirstLoad && level > (prevBuildings[habitType]?.level ?? 0),
                };
            }

            if (cancelled) return;

            useTownStore.getState().initBuildings(next);
            useTownStore.setState({ daysSinceStart });
        }

        sync().catch((err) => console.warn('[useTownSync]', err));

        return () => { cancelled = true; };
    // Run once on mount — intentionally no deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
}
