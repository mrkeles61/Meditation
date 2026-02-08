import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMeditationStore } from '../store';
import { playBell } from '../sounds';
import './CountdownScreen.css';

export function CountdownScreen() {
    const [count, setCount] = useState(3);
    const { startSession } = useMeditationStore();

    useEffect(() => {
        // Play bell on each count
        playBell();

        if (count <= 0) {
            startSession();
            return;
        }

        const timer = setTimeout(() => {
            setCount((c) => c - 1);
        }, 1200);

        return () => clearTimeout(timer);
    }, [count, startSession]);

    return (
        <div className="countdown-screen">
            <AnimatePresence mode="wait">
                {count > 0 && (
                    <motion.div
                        key={count}
                        className="countdown-number"
                        initial={{ opacity: 0, scale: 0.6 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.3 }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                    >
                        {count}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
