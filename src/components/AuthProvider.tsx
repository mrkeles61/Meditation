import { useEffect, useState, type ReactNode } from 'react';
import { supabase } from '../services/supabase';
import { useAppStore } from '../stores/appStore';

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
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
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
