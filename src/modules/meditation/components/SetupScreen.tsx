import { useRef, useEffect, useCallback } from 'react';
import { motion, useMotionValue, useSpring, useTransform, animate } from 'framer-motion';
import { useMeditationStore, type SoundType } from '../store';
import './SetupScreen.css';

/* ─── Duration options (in minutes) ─── */
const DURATIONS = [1, 2, 3, 5, 10, 15, 20, 25, 30, 45, 60];
const ITEM_HEIGHT = 56;
const VISIBLE_COUNT = 5;
const CONTAINER_HEIGHT = ITEM_HEIGHT * VISIBLE_COUNT;

const SOUNDS: { id: SoundType; label: string }[] = [
    { id: 'rain', label: '🌧 Rain' },
    { id: 'ocean', label: '🌊 Ocean' },
    { id: 'singing-bowl', label: '🔔 Bowl' },
    { id: 'silence', label: '🤫 Silence' },
];

/* ─── Scroll Wheel Picker ─── */
function ScrollPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const y = useMotionValue(0);
    const springY = useSpring(y, { stiffness: 300, damping: 30 });

    const currentIndex = DURATIONS.indexOf(value);
    const centerOffset = (VISIBLE_COUNT - 1) / 2 * ITEM_HEIGHT;

    // Sync position when value changes externally
    useEffect(() => {
        const idx = DURATIONS.indexOf(value);
        if (idx >= 0) {
            const target = -idx * ITEM_HEIGHT + centerOffset;
            animate(y, target, { type: 'spring', stiffness: 300, damping: 30 });
        }
    }, [value, centerOffset, y]);

    const snapToNearest = useCallback(() => {
        const currentY = y.get();
        const idx = Math.round((centerOffset - currentY) / ITEM_HEIGHT);
        const clampedIdx = Math.max(0, Math.min(DURATIONS.length - 1, idx));
        const target = -clampedIdx * ITEM_HEIGHT + centerOffset;
        animate(y, target, { type: 'spring', stiffness: 300, damping: 30 });
        onChange(DURATIONS[clampedIdx]);
    }, [y, centerOffset, onChange]);

    return (
        <div className="scroll-picker" style={{ height: CONTAINER_HEIGHT }}>
            <div className="picker-highlight" />
            <div className="picker-fade-top" />
            <div className="picker-fade-bottom" />
            <motion.div
                ref={containerRef}
                className="picker-track"
                style={{ y: springY }}
                drag="y"
                dragConstraints={{
                    top: -(DURATIONS.length - 1) * ITEM_HEIGHT + centerOffset,
                    bottom: centerOffset,
                }}
                dragElastic={0.1}
                onDragEnd={snapToNearest}
            >
                {DURATIONS.map((dur, i) => (
                    <PickerItem
                        key={dur}
                        label={`${dur} min`}
                        index={i}
                        y={springY}
                        centerOffset={centerOffset}
                        isActive={i === currentIndex}
                        onClick={() => onChange(dur)}
                    />
                ))}
            </motion.div>
        </div>
    );
}

function PickerItem({
    label, index, y, centerOffset, isActive, onClick,
}: {
    label: string; index: number; y: ReturnType<typeof useSpring>;
    centerOffset: number; isActive: boolean; onClick: () => void;
}) {
    const itemY = index * ITEM_HEIGHT;
    const distance = useTransform(y, (val) => Math.abs(val + itemY - centerOffset));
    const scale = useTransform(distance, [0, ITEM_HEIGHT, ITEM_HEIGHT * 2], [1, 0.85, 0.7]);
    const opacity = useTransform(distance, [0, ITEM_HEIGHT, ITEM_HEIGHT * 2], [1, 0.5, 0.2]);

    return (
        <motion.div
            className={`picker-item ${isActive ? 'active' : ''}`}
            style={{ height: ITEM_HEIGHT, scale, opacity }}
            onClick={onClick}
        >
            {label}
        </motion.div>
    );
}

/* ─── Setup Screen ─── */
export function SetupScreen() {
    const { duration, selectedSound, showTimer, setDuration, setSelectedSound, setShowTimer, startSession } = useMeditationStore();

    const durationMinutes = Math.round(duration / 60);

    function handleDurationChange(minutes: number) {
        setDuration(minutes * 60);
    }

    return (
        <div className="setup-screen">
            <h1 className="setup-title">Meditation</h1>
            <p className="setup-subtitle">Find your calm</p>

            <div className="setup-section">
                <label className="setup-label">Duration</label>
                <ScrollPicker value={durationMinutes} onChange={handleDurationChange} />
            </div>

            <div className="setup-section">
                <label className="setup-label">Ambient Sound</label>
                <div className="sound-options">
                    {SOUNDS.map((sound) => (
                        <button
                            key={sound.id}
                            className={`sound-option ${selectedSound === sound.id ? 'active' : ''}`}
                            onClick={() => setSelectedSound(sound.id)}
                        >
                            {sound.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="setup-section timer-toggle-section">
                <label className="setup-label">Show Timer</label>
                <button
                    className={`toggle-pill ${showTimer ? 'on' : ''}`}
                    onClick={() => setShowTimer(!showTimer)}
                >
                    <span className="toggle-knob" />
                </button>
            </div>

            <button className="begin-button" onClick={startSession}>
                Begin
            </button>
        </div>
    );
}
