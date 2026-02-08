import { useEffect, useRef, useCallback } from 'react';
import { Howl } from 'howler';
import { useMeditationStore } from '../store';
import { BreathingCircle } from './BreathingCircle';
import './SessionScreen.css';

const SOUND_FILES: Record<string, string> = {
    rain: '/audio/rain.mp3',
    ocean: '/audio/ocean.mp3',
    'singing-bowl': '/audio/singing-bowl.mp3',
};

export function SessionScreen() {
    const { duration, elapsed, selectedSound, tick, endSession } = useMeditationStore();
    const intervalRef = useRef<number | null>(null);
    const soundRef = useRef<Howl | null>(null);
    const chimeRef = useRef<Howl | null>(null);

    const handleEnd = useCallback(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (soundRef.current) {
            soundRef.current.fade(soundRef.current.volume(), 0, 1000);
            setTimeout(() => soundRef.current?.stop(), 1000);
        }

        chimeRef.current = new Howl({ src: ['/audio/chime.mp3'], volume: 0.5 });
        chimeRef.current.play();

        setTimeout(() => endSession(), 1500);
    }, [endSession]);

    useEffect(() => {
        // Start ambient audio
        if (selectedSound !== 'silence') {
            const src = SOUND_FILES[selectedSound];
            if (src) {
                soundRef.current = new Howl({
                    src: [src],
                    loop: true,
                    volume: 0,
                });
                soundRef.current.play();
                soundRef.current.fade(0, 0.4, 2000);
            }
        }

        // Start timer
        intervalRef.current = window.setInterval(() => {
            tick();
        }, 1000);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            soundRef.current?.unload();
            chimeRef.current?.unload();
        };
    }, [selectedSound, tick]);

    // Check if session should end
    useEffect(() => {
        if (elapsed >= duration) {
            handleEnd();
        }
    }, [elapsed, duration, handleEnd]);

    // Handle early exit
    function handleEarlyExit() {
        if (intervalRef.current) clearInterval(intervalRef.current);
        soundRef.current?.fade(soundRef.current.volume(), 0, 500);
        setTimeout(() => {
            soundRef.current?.stop();
            endSession();
        }, 500);
    }

    return (
        <div className="session-screen" onClick={handleEarlyExit}>
            <BreathingCircle />
        </div>
    );
}
