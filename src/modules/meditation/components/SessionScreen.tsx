import { useEffect, useRef, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useMeditationStore } from '../store';
import { startAmbient, playChime } from '../sounds';
import { BreathingCircle } from './BreathingCircle';
import './SessionScreen.css';

export function SessionScreen() {
    const { duration, elapsed, selectedSound, showTimer, tick, endSession } = useMeditationStore();
    const intervalRef = useRef<number | null>(null);
    const soundRef = useRef<ReturnType<typeof startAmbient> | null>(null);

    const remaining = duration - elapsed;
    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;

    const handleEnd = useCallback(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        soundRef.current?.stop();
        playChime();
        setTimeout(() => endSession(), 1500);
    }, [endSession]);

    useEffect(() => {
        // Start ambient audio
        if (selectedSound !== 'silence') {
            soundRef.current = startAmbient(selectedSound as 'rain' | 'ocean' | 'singing-bowl');
        }

        // Start timer
        intervalRef.current = window.setInterval(() => tick(), 1000);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            soundRef.current?.stop();
        };
    }, [selectedSound, tick]);

    // Check if session should end
    useEffect(() => {
        if (elapsed >= duration) handleEnd();
    }, [elapsed, duration, handleEnd]);

    // Handle early exit
    function handleEarlyExit() {
        if (intervalRef.current) clearInterval(intervalRef.current);
        soundRef.current?.stop();
        setTimeout(() => endSession(), 300);
    }

    return (
        <div className="session-screen" onClick={handleEarlyExit}>
            <BreathingCircle />
            <AnimatePresence>
                {showTimer && (
                    <motion.div
                        className="session-timer"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        {minutes}:{seconds.toString().padStart(2, '0')}
                    </motion.div>
                )}
            </AnimatePresence>
            <p className="session-hint">tap anywhere to end</p>
        </div>
    );
}
