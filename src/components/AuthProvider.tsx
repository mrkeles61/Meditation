import { useEffect, useState, type ReactNode } from 'react';
import { App } from '@capacitor/app';
import { supabase } from '../services/supabase';
import { useAppStore } from '../stores/appStore';
import { runAutomations } from '../services/automations';

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const { setUser, setProfile, setLoading, user } = useAppStore();
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            setInitialized(true);
            if (session?.user) runAutomations(session.user.id);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            if (session?.user) runAutomations(session.user.id);
        });

        const appListener = App.addListener('appStateChange', async ({ isActive }) => {
            if (isActive) {
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) runAutomations(session.user.id);
            }
        });

        return () => {
            subscription.unsubscribe();
            appListener.then(h => h.remove());
        };
    }, [setUser]);

    useEffect(() => {
        if (!user) {
            setProfile(null);
            setLoading(false);
            return;
        }

        async function loadProfile() {
            const { data } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user!.id)
                .single();

            if (data) {
                setProfile({
                    id: data.id,
                    role: data.role,
                    subscription_tier: data.subscription_tier,
                    display_name: data.display_name,
                    avatar_url: data.avatar_url || null,
                    height_cm: data.height_cm ? Number(data.height_cm) : null,
                    goal_weight_kg: data.goal_weight_kg ? Number(data.goal_weight_kg) : null,
                    meditation_goal_minutes: data.meditation_goal_minutes ?? 15,
                });
            }
            setLoading(false);
        }

        loadProfile();
    }, [user, setProfile, setLoading]);

    if (!initialized) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100dvh',
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-secondary)',
            }}>
                Loading...
            </div>
        );
    }

    return <>{children}</>;
}
