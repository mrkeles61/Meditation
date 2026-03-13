export interface StepData {
    /** Total steps since midnight local time */
    totalToday: number;
    /** Steps between 04:00 and 11:00 local time (morning walk window) */
    morningSteps: number;
}

export interface SleepData {
    /** Sleep duration in hours for the most recent night */
    hoursLastNight: number;
}

export interface IHealthService {
    getSteps(): Promise<StepData>;
    getSleep(): Promise<SleepData>;
}
