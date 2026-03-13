import { create } from 'zustand';
import type { BuildingState } from '../types/town.types';

// Days of streak required to reach each level
export const STREAK_THRESHOLDS = [3, 7, 14] as const; // L1, L2, L3

interface TownState {
    buildings: Record<string, BuildingState>;
    selectedBuilding: string | null;
    totalLevel: number;
    daysSinceStart: number;

    selectBuilding:   (id: string | null) => void;
    updateBuildingLevel: (id: string, level: number) => void;
    triggerLevelUp:   (id: string) => void;
    clearLevelUpFlag: (id: string) => void;
    initBuildings:    (buildings: Record<string, BuildingState>) => void;
}

const DEFAULT_BUILDINGS: Record<string, BuildingState> = {
    meditation:   { id: 'meditation',   habitType: 'meditation',   level: 1, unlocked: true,  streakDays: 0, lastActivity: '', pendingLevelUp: false },
    gym:          { id: 'gym',          habitType: 'gym',          level: 1, unlocked: true,  streakDays: 0, lastActivity: '', pendingLevelUp: false },
    reading:      { id: 'reading',      habitType: 'reading',      level: 0, unlocked: false, streakDays: 0, lastActivity: '', pendingLevelUp: false },
    nutrition:    { id: 'nutrition',    habitType: 'nutrition',    level: 0, unlocked: false, streakDays: 0, lastActivity: '', pendingLevelUp: false },
    sleep:        { id: 'sleep',        habitType: 'sleep',        level: 0, unlocked: false, streakDays: 0, lastActivity: '', pendingLevelUp: false },
    hydration:    { id: 'hydration',    habitType: 'hydration',    level: 0, unlocked: false, streakDays: 0, lastActivity: '', pendingLevelUp: false },
    productivity: { id: 'productivity', habitType: 'productivity', level: 0, unlocked: false, streakDays: 0, lastActivity: '', pendingLevelUp: false },
    journal:      { id: 'journal',      habitType: 'journal',      level: 0, unlocked: false, streakDays: 0, lastActivity: '', pendingLevelUp: false },
};

function calcTotal(buildings: Record<string, BuildingState>): number {
    return Object.values(buildings).reduce((sum, b) => sum + b.level, 0);
}

export const useTownStore = create<TownState>((set) => ({
    buildings:      DEFAULT_BUILDINGS,
    selectedBuilding: null,
    totalLevel:     calcTotal(DEFAULT_BUILDINGS),
    daysSinceStart: 1,

    selectBuilding: (id) => set({ selectedBuilding: id }),

    updateBuildingLevel: (id, level) =>
        set((s) => {
            const buildings = { ...s.buildings, [id]: { ...s.buildings[id], level } };
            return { buildings, totalLevel: calcTotal(buildings) };
        }),

    triggerLevelUp: (id) =>
        set((s) => ({
            buildings: {
                ...s.buildings,
                [id]: { ...s.buildings[id], pendingLevelUp: true },
            },
        })),

    clearLevelUpFlag: (id) =>
        set((s) => ({
            buildings: {
                ...s.buildings,
                [id]: { ...s.buildings[id], pendingLevelUp: false },
            },
        })),

    initBuildings: (buildings) => set({ buildings, totalLevel: calcTotal(buildings) }),
}));
