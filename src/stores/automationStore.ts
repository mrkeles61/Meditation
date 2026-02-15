import { create } from 'zustand';
import { getTodaySteps } from '../services/health';

interface AutomationState {
    stepCount: number | null;
    nearGym: boolean;
    lastFetched: number;
    fetchSteps: () => Promise<void>;
    setNearGym: (value: boolean) => void;
}

const TTL = 5 * 60 * 1000; // 5 minutes

export const useAutomationStore = create<AutomationState>((set, get) => ({
    stepCount: null,
    nearGym: false,
    lastFetched: 0,

    async fetchSteps() {
        const now = Date.now();
        if (now - get().lastFetched < TTL) return;
        const steps = await getTodaySteps();
        set({ stepCount: steps, lastFetched: now });
    },

    setNearGym(value: boolean) {
        set({ nearGym: value });
    },
}));
