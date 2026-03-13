import { Geolocation } from '@capacitor/geolocation';
import type { ILocationService, GymLocation, GeofenceStatus } from './types';

const DWELL_KEY_PREFIX = 'gym_dwell_arrival_';

function haversineMeters(
    lat1: number, lon1: number,
    lat2: number, lon2: number,
): number {
    const R = 6_371_000;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(Δφ / 2) ** 2 +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export class LocationNative implements ILocationService {
    async getCurrentPosition() {
        const pos = await Geolocation.getCurrentPosition({ enableHighAccuracy: true });
        return {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
        };
    }

    async checkGeofences(gyms: GymLocation[]): Promise<GeofenceStatus> {
        const { latitude, longitude } = await this.getCurrentPosition();
        const now = Date.now();

        // Find the first gym we're inside
        const insideGym = gyms.find((gym) => {
            const dist = haversineMeters(latitude, longitude, gym.latitude, gym.longitude);
            return dist <= gym.radius_meters;
        }) ?? null;

        // Update arrival timestamps in localStorage
        for (const gym of gyms) {
            const key = DWELL_KEY_PREFIX + gym.id;
            const inside = gym === insideGym;
            if (inside && !localStorage.getItem(key)) {
                localStorage.setItem(key, String(now));
            } else if (!inside && localStorage.getItem(key)) {
                localStorage.removeItem(key);
            }
        }

        let dwellMinutes = 0;
        if (insideGym) {
            const arrivalStr = localStorage.getItem(DWELL_KEY_PREFIX + insideGym.id);
            if (arrivalStr) {
                dwellMinutes = (now - Number(arrivalStr)) / 60_000;
            }
        }

        return { insideGym, dwellMinutes };
    }
}
