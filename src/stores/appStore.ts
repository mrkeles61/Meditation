import { create } from 'zustand';
import type { User } from '@supabase/supabase-js';

interface Profile {
    id: string;
    role: 'user' | 'admin';
    subscription_tier: 'free' | 'premium';
    display_name: string | null;
}

interface AppState {
    user: User | null;
    profile: Profile | null;
    sidebarOpen: boolean;
    loading: boolean;

    setUser: (user: User | null) => void;
    setProfile: (profile: Profile | null) => void;
    toggleSidebar: () => void;
    setSidebarOpen: (open: boolean) => void;
    setLoading: (loading: boolean) => void;

    isAdmin: () => boolean;
    isPremium: () => boolean;
}

export const useAppStore = create<AppState>((set, get) => ({
    user: null,
    profile: null,
    sidebarOpen: false,
    loading: true,

    setUser: (user) => set({ user }),
    setProfile: (profile) => set({ profile }),
    toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
    setSidebarOpen: (open) => set({ sidebarOpen: open }),
    setLoading: (loading) => set({ loading }),

    isAdmin: () => get().profile?.role === 'admin',
    isPremium: () => {
        const p = get().profile;
        return p?.subscription_tier === 'premium' || p?.role === 'admin';
    },
}));
