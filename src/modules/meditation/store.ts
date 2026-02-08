import { create } from 'zustand';

export type SoundType = 'rain' | 'ocean' | 'singing-bowl' | 'fireplace' | 'forest' | 'silence';
export type MeditationPhase = 'setup' | 'countdown' | 'session' | 'completion';

interface MeditationState {
    phase: MeditationPhase;
    duration: number;
    selectedSound: SoundType;
    elapsed: number;
    isActive: boolean;
    showTimer: boolean;

    setPhase: (phase: MeditationPhase) => void;
    setDuration: (duration: number) => void;
    setSelectedSound: (sound: SoundType) => void;
    setElapsed: (elapsed: number) => void;
    setShowTimer: (show: boolean) => void;
    tick: () => void;
    startCountdown: () => void;
    startSession: () => void;
    endSession: () => void;
    reset: () => void;
}

export const useMeditationStore = create<MeditationState>((set) => ({
    phase: 'setup',
    duration: 600,
    selectedSound: 'rain',
    elapsed: 0,
    isActive: false,
    showTimer: true,

    setPhase: (phase) => set({ phase }),
    setDuration: (duration) => set({ duration }),
    setSelectedSound: (sound) => set({ selectedSound: sound }),
    setElapsed: (elapsed) => set({ elapsed }),
    setShowTimer: (show) => set({ showTimer: show }),
    tick: () => set((s) => ({ elapsed: s.elapsed + 1 })),
    startCountdown: () => set({ phase: 'countdown' }),
    startSession: () => set({ phase: 'session', elapsed: 0, isActive: true }),
    endSession: () => set((s) => ({ phase: 'completion', isActive: false, elapsed: s.elapsed })),
    reset: () => set({ phase: 'setup', elapsed: 0, isActive: false }),
}));
