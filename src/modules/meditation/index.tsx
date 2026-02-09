import { AnimatePresence, motion } from 'framer-motion';
import { useMeditationStore } from './store';
import { SetupScreen } from './components/SetupScreen';
import { CountdownScreen } from './components/CountdownScreen';
import { SessionScreen } from './components/SessionScreen';
import { CompletionScreen } from './components/CompletionScreen';

const overlay: React.CSSProperties = {
    position: 'fixed', inset: 0, zIndex: 200,
    background: 'var(--bg-primary)',
};

export function MeditationPage() {
    const { phase } = useMeditationStore();

    return (
        <>
            {/* Normal in-flow screens */}
            {phase === 'setup' && <SetupScreen />}
            {phase === 'completion' && <CompletionScreen />}

            {/* Fullscreen overlays — render immediately, cover everything */}
            <AnimatePresence>
                {phase === 'countdown' && (
                    <motion.div key="countdown" style={overlay}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}>
                        <CountdownScreen />
                    </motion.div>
                )}
                {phase === 'session' && (
                    <motion.div key="session" style={overlay}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1 }}>
                        <SessionScreen />
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
