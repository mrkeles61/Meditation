import { Capacitor } from '@capacitor/core';
import type { ILocationService } from './types';

let _instance: ILocationService | null = null;

export async function getLocationService(): Promise<ILocationService> {
    if (_instance) return _instance;

    if (Capacitor.isNativePlatform()) {
        const { LocationNative } = await import('./location-native');
        _instance = new LocationNative();
    } else {
        const { LocationMock } = await import('./location-mock');
        _instance = new LocationMock();
    }

    return _instance;
}

export type { ILocationService, GymLocation, GeofenceStatus } from './types';
