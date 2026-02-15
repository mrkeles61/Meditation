export interface CoreHabit {
    name: string;
    icon: string;
    category: string;
    automation_type: 'meditation' | 'steps' | 'gym';
    description: string;
    requires_permission: 'health' | 'location' | null;
}

export const CORE_HABITS: CoreHabit[] = [
    {
        name: 'Meditation',
        icon: '🧘',
        category: 'meditation',
        automation_type: 'meditation',
        description: 'Auto-tracked when you complete a session',
        requires_permission: null,
    },
    {
        name: '10K Steps',
        icon: '🚶',
        category: 'exercise',
        automation_type: 'steps',
        description: 'Auto-tracked from Apple Health / Google Fit',
        requires_permission: 'health',
    },
    {
        name: 'Go Gym',
        icon: '🏋️',
        category: 'exercise',
        automation_type: 'gym',
        description: 'Auto-tracked by location',
        requires_permission: 'location',
    },
];
