import { Capacitor } from '@capacitor/core';

const isNative = () => Capacitor.isNativePlatform();

export async function isHealthAvailable(): Promise<boolean> {
    if (!isNative()) return false;
    try {
        const { Health } = await import('@capgo/capacitor-health');
        const result = await Health.isAvailable();
        return result.available;
    } catch {
        return false;
    }
}

export async function requestHealthPermissions(): Promise<boolean> {
    if (!isNative()) return false;
    try {
        const { Health } = await import('@capgo/capacitor-health');
        await Health.requestAuthorization({
            read: ['steps'],
            write: [],
        });
        return true;
    } catch {
        return false;
    }
}

export async function getTodaySteps(): Promise<number> {
    if (!isNative()) return 7500; // dev mock for web/simulator

    try {
        const { Health } = await import('@capgo/capacitor-health');
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        const result = await Health.queryAggregated({
            dataType: 'steps',
            startDate: startOfDay.toISOString(),
            endDate: now.toISOString(),
        });

        const total = result.samples.reduce((sum, s) => sum + (s.value || 0), 0);
        return total;
    } catch {
        return 0;
    }
}
