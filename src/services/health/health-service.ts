import { Capacitor } from '@capacitor/core';
import type { IHealthService } from './types';

let _instance: IHealthService | null = null;

export async function getHealthService(): Promise<IHealthService> {
    if (_instance) return _instance;

    if (Capacitor.isNativePlatform()) {
        const { HealthKitNative } = await import('./healthkit-native');
        _instance = new HealthKitNative();
    } else {
        const { HealthKitMock } = await import('./healthkit-mock');
        _instance = new HealthKitMock();
    }

    return _instance;
}

export type { IHealthService, StepData, SleepData } from './types';
