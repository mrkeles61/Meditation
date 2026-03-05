export interface ScenePosition {
    x: number;      // 0-1, percentage of scene width
    y: number;      // 0-1, percentage of scene height
    scale: number;  // 1.0 = default
}

export interface BuildingDefinition {
    id: string;
    habitType: string;
    name: string;
    description: string;
    position: ScenePosition;
    baseWidth: number;
    baseHeight: number;
    levels: BuildingLevel[];
}

export interface BuildingLevel {
    level: number;
    label: string;
    primaryColor: string;
    accentColor: string;
    roofColor: string;
    features: string[];
}

export interface BuildingState {
    id: string;
    habitType: string;
    level: number;
    unlocked: boolean;
    streakDays: number;
    lastActivity: string;
    pendingLevelUp: boolean;
}

export interface NPCRoute {
    id: string;
    color: string;
    points: ScenePosition[];
    speed: number;
}
