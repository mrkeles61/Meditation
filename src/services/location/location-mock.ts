import type { ILocationService, GymLocation, GeofenceStatus } from './types';

/**
 * Mock location service for browser/dev testing.
 *
 * Simulates arriving at the first gym 30 seconds after the module is first
 * imported, then staying for 25 minutes (triggers the 20-min threshold).
 */
const MOCK_INIT_TIME = Date.now();
const ARRIVE_AFTER_MS = 30_000;   // 30s after init
const LEAVE_AFTER_MS  = 25 * 60_000; // 25 min later

export class LocationMock implements ILocationService {
    async getCurrentPosition() {
        // Return a fixed coordinate (Istanbul city center)
        return { latitude: 41.0082, longitude: 28.9784 };
    }

    async checkGeofences(gyms: GymLocation[]): Promise<GeofenceStatus> {
        if (gyms.length === 0) return { insideGym: null, dwellMinutes: 0 };

        const elapsed = Date.now() - MOCK_INIT_TIME;
        const isInsideWindow =
            elapsed >= ARRIVE_AFTER_MS && elapsed < ARRIVE_AFTER_MS + LEAVE_AFTER_MS;

        if (!isInsideWindow) return { insideGym: null, dwellMinutes: 0 };

        const insideGym = gyms[0];
        const dwellMinutes = (elapsed - ARRIVE_AFTER_MS) / 60_000;
        return { insideGym, dwellMinutes };
    }
}
