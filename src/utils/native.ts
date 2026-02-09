import { Capacitor } from '@capacitor/core';

export function isNative(): boolean {
    return Capacitor.isNativePlatform();
}

/* ─── Haptics ─── */
export async function haptic(style: 'light' | 'medium' | 'heavy' = 'medium') {
    if (isNative()) {
        const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
        const map = { light: ImpactStyle.Light, medium: ImpactStyle.Medium, heavy: ImpactStyle.Heavy };
        await Haptics.impact({ style: map[style] });
    } else if (navigator.vibrate) {
        const ms = { light: 10, medium: 20, heavy: 40 };
        navigator.vibrate(ms[style]);
    }
}

/* ─── Keep Screen On ─── */
let wakeLockSentinel: WakeLockSentinel | null = null;

export async function keepScreenOn() {
    if (isNative()) {
        const { KeepAwake } = await import('@capacitor-community/keep-awake');
        await KeepAwake.keepAwake();
    } else if ('wakeLock' in navigator) {
        try {
            wakeLockSentinel = await navigator.wakeLock.request('screen');
        } catch { /* silent — user denied or unsupported */ }
    }
}

export async function releaseScreen() {
    if (isNative()) {
        const { KeepAwake } = await import('@capacitor-community/keep-awake');
        await KeepAwake.allowSleep();
    } else if (wakeLockSentinel) {
        await wakeLockSentinel.release();
        wakeLockSentinel = null;
    }
}

/* ─── Local Notifications ─── */
export async function scheduleNotification(title: string, body: string, delayMs: number) {
    if (isNative()) {
        const { LocalNotifications } = await import('@capacitor/local-notifications');
        await LocalNotifications.schedule({
            notifications: [{
                id: Date.now(),
                title,
                body,
                schedule: { at: new Date(Date.now() + delayMs) },
            }],
        });
    } else if ('Notification' in window && Notification.permission === 'granted') {
        setTimeout(() => new Notification(title, { body }), delayMs);
    }
}
