export interface GymLocation {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    radius_meters: number;
}

export interface GeofenceStatus {
    /** Which gym (if any) the user is currently inside */
    insideGym: GymLocation | null;
    /** How long (in minutes) the user has been inside this gym continuously */
    dwellMinutes: number;
}

export interface ILocationService {
    getCurrentPosition(): Promise<{ latitude: number; longitude: number }>;
    checkGeofences(gyms: GymLocation[]): Promise<GeofenceStatus>;
}
