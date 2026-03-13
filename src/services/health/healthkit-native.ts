import { Health } from '@capgo/capacitor-health';
import type { IHealthService, StepData, SleepData } from './types';

export class HealthKitNative implements IHealthService {
    async getSteps(): Promise<StepData> {
        const now = new Date();
        const midnight = new Date(now);
        midnight.setHours(0, 0, 0, 0);

        const morningStart = new Date(now);
        morningStart.setHours(4, 0, 0, 0);
        const morningEnd = new Date(now);
        morningEnd.setHours(11, 0, 0, 0);

        const [allDayResult, morningResult] = await Promise.all([
            Health.queryAggregated({
                startDate: midnight.toISOString(),
                endDate: now.toISOString(),
                dataType: 'steps',
                bucket: 'day',
            }),
            Health.queryAggregated({
                startDate: morningStart.toISOString(),
                endDate: morningEnd.toISOString(),
                dataType: 'steps',
                bucket: 'day',
            }),
        ]);

        const totalToday = allDayResult.data?.[0]?.value ?? 0;
        const morningSteps = morningResult.data?.[0]?.value ?? 0;

        return { totalToday, morningSteps };
    }

    async getSleep(): Promise<SleepData> {
        const now = new Date();
        // Look back 24h to catch last night's sleep
        const yesterday = new Date(now.getTime() - 24 * 3600 * 1000);

        const result = await Health.queryAggregated({
            startDate: yesterday.toISOString(),
            endDate: now.toISOString(),
            dataType: 'sleep_analysis',
            bucket: 'day',
        });

        // value is in seconds on some platforms, hours on others — normalize
        const raw = result.data?.[0]?.value ?? 0;
        const hoursLastNight = raw > 24 ? raw / 3600 : raw;

        return { hoursLastNight };
    }
}
