import type { IHealthService, StepData, SleepData } from './types';

/**
 * Deterministic mock health service for browser/dev testing.
 *
 * Step model (crosses 10 000 by ~15:00):
 *   06:00–08:00 → 1 500 steps/hr (morning burst)
 *   08:00–22:00 → 600 steps/hr (daytime)
 *
 * Sleep: always returns 7h 32m (passes 7h threshold).
 */
export class HealthKitMock implements IHealthService {
    async getSteps(): Promise<StepData> {
        const now = new Date();
        const minutesSinceMidnight = now.getHours() * 60 + now.getMinutes();

        let totalToday = 0;
        let morningSteps = 0;

        const morningStartMin = 6 * 60;   // 06:00
        const morningEndMin   = 8 * 60;   // 08:00
        const morningWindowMin = 4 * 60;  // picker: 04:00
        const morningPickerEnd = 11 * 60; // 11:00

        // Morning burst: 06:00–08:00 at 1500/hr
        const morningBurstMinutes = Math.min(
            Math.max(minutesSinceMidnight - morningStartMin, 0),
            morningEndMin - morningStartMin,
        );
        const morningBurstSteps = Math.floor((morningBurstMinutes / 60) * 1500);

        // Daytime: 08:00+ at 600/hr
        const daytimeMinutes = Math.max(minutesSinceMidnight - morningEndMin, 0);
        const daytimeSteps = Math.floor((daytimeMinutes / 60) * 600);

        totalToday = morningBurstSteps + daytimeSteps;

        // Morning window steps (04:00–11:00): all burst steps fall in this window
        const inMorningWindow = Math.min(
            Math.max(minutesSinceMidnight - morningWindowMin, 0),
            morningPickerEnd - morningWindowMin,
        );
        // Steps accumulated inside the 04–11 window
        if (inMorningWindow > 0) {
            const bursMin = Math.min(Math.max(minutesSinceMidnight - morningStartMin, 0), 120);
            morningSteps = Math.floor((bursMin / 60) * 1500);
        }

        return { totalToday, morningSteps };
    }

    async getSleep(): Promise<SleepData> {
        return { hoursLastNight: 7.533 }; // 7h 32m — passes ≥7h threshold
    }
}
