import { supabase } from './supabase';
import { getTodaySteps } from './health';

export async function runAutomations(userId: string): Promise<void> {
    await Promise.allSettled([
        checkStepAutomation(userId),
        checkGymAutomation(userId),
    ]);
}

async function checkStepAutomation(userId: string): Promise<void> {
    // Check if user has a steps habit
    const { data: habit } = await supabase.from('habits')
        .select('id')
        .eq('user_id', userId)
        .eq('automation_type', 'steps')
        .eq('archived', false)
        .limit(1)
        .single();

    if (!habit) return;

    const today = new Date().toISOString().split('T')[0];

    // Check if already logged today
    const { data: existing } = await supabase.from('habit_logs')
        .select('id')
        .eq('habit_id', habit.id)
        .eq('logged_at', today)
        .limit(1);

    if (existing && existing.length > 0) return;

    // Get step count
    const steps = await getTodaySteps();
    if (steps >= 10000) {
        await supabase.from('habit_logs')
            .insert({ habit_id: habit.id, user_id: userId, logged_at: today });
    }
}

async function checkGymAutomation(userId: string): Promise<void> {
    // Check if user has a gym habit
    const { data: habit } = await supabase.from('habits')
        .select('id')
        .eq('user_id', userId)
        .eq('automation_type', 'gym')
        .eq('archived', false)
        .limit(1)
        .single();

    if (!habit) return;

    const today = new Date().toISOString().split('T')[0];

    // Check if already logged today
    const { data: existing } = await supabase.from('habit_logs')
        .select('id')
        .eq('habit_id', habit.id)
        .eq('logged_at', today)
        .limit(1);

    if (existing && existing.length > 0) return;

    // Load gym settings
    const { data: settings } = await supabase.from('automation_settings')
        .select('config')
        .eq('user_id', userId)
        .eq('automation_type', 'gym')
        .limit(1)
        .single();

    if (!settings?.config?.lat || !settings?.config?.lng) return;

    try {
        const { getCurrentPosition, distanceMeters } = await import('./location');
        const pos = await getCurrentPosition();
        if (!pos) return;

        const dist = distanceMeters(pos, { lat: settings.config.lat, lng: settings.config.lng });
        const radiusM = settings.config.radius_m || 200;
        const dwellMinutes = settings.config.dwell_minutes || 15;

        if (dist <= radiusM) {
            // Within radius — check dwell time
            const storedArrival = localStorage.getItem(`gym_arrival_${userId}`);
            if (!storedArrival) {
                localStorage.setItem(`gym_arrival_${userId}`, Date.now().toString());
                return;
            }

            const elapsed = (Date.now() - parseInt(storedArrival)) / 60000;
            if (elapsed >= dwellMinutes) {
                await supabase.from('habit_logs')
                    .insert({ habit_id: habit.id, user_id: userId, logged_at: today });
                localStorage.removeItem(`gym_arrival_${userId}`);
            }
        } else {
            // Outside radius — clear arrival
            localStorage.removeItem(`gym_arrival_${userId}`);
        }
    } catch {
        // Location not available (web or permission denied)
    }
}
