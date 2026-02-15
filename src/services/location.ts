import { Capacitor } from '@capacitor/core';

export interface LatLng {
    lat: number;
    lng: number;
}

export async function getCurrentPosition(): Promise<LatLng | null> {
    if (!Capacitor.isNativePlatform()) return null;

    try {
        const { Geolocation } = await import('@capacitor/geolocation');
        const pos = await Geolocation.getCurrentPosition({ enableHighAccuracy: true });
        return { lat: pos.coords.latitude, lng: pos.coords.longitude };
    } catch {
        return null;
    }
}

export async function requestLocationPermission(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) return false;

    try {
        const { Geolocation } = await import('@capacitor/geolocation');
        const status = await Geolocation.requestPermissions();
        return status.location === 'granted';
    } catch {
        return false;
    }
}

export function distanceMeters(a: LatLng, b: LatLng): number {
    const R = 6371e3;
    const toRad = (n: number) => (n * Math.PI) / 180;
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const sinLat = Math.sin(dLat / 2);
    const sinLng = Math.sin(dLng / 2);
    const h = sinLat * sinLat + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * sinLng * sinLng;
    return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}
