import { AnimatePresence, motion } from 'framer-motion';
import { useMeditationStore } from './store';
import { SetupScreen } from './components/SetupScreen';
import { CountdownScreen } from './components/CountdownScreen';
import { SessionScreen } from './components/SessionScreen';
import { CompletionScreen } from './components/CompletionScreen';

export function MeditationPage() {
    const { phase } = useMeditationStore();

    return (
        <AnimatePresence mode="wait">
            {phase === 'setup' && (
                <motion.div key="setup"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.5 }}>
                    <SetupScreen />
                </motion.div>
            )}
            {phase === 'countdown' && (
                <motion.div key="countdown"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}>
                    <CountdownScreen />
                </motion.div>
            )}
            {phase === 'session' && (
                <motion.div key="session"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1.5 }}
                    style={{ height: '100%' }}>
                    <SessionScreen />
                </motion.div>
            )}
            {phase === 'completion' && (
                <motion.div key="completion"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}>
                    <CompletionScreen />
                </motion.div>
            )}
        </AnimatePresence>
    );
}
