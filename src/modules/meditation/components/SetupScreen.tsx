import { motion, AnimatePresence } from 'framer-motion';
import { useMeditationStore, type SoundType } from '../store';
import './SetupScreen.css';

/* ─── Duration options (in minutes) ─── */
const DURATIONS = [1, 2, 3, 5, 10, 15, 20, 25, 30, 45, 60];
const QUICK_SUGGESTIONS = [5, 10, 15, 20, 30];

const SOUNDS: { id: SoundType; label: string }[] = [
    { id: 'rain', label: '🌧 Rain' },
    { id: 'ocean', label: '🌊 Ocean' },
    { id: 'singing-bowl', label: '🔔 Bowl' },
    { id: 'fireplace', label: '🔥 Fire' },
    { id: 'forest', label: '🌲 Forest' },
    { id: 'silence', label: '🤫 Silence' },
];

/* ─── Clock Face Picker ─── */
function ClockFacePicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
    const SIZE = 240;
    const CX = SIZE / 2;
    const CY = SIZE / 2;
    const DOT_R = 82;
    const HAND_R = 52;
    const TICK_INNER = 92;
    const TICK_OUTER = 99;
    const DOT_SIZE = 26;

    const positions = DURATIONS.map((d, i) => {
        const angle = (i / DURATIONS.length) * 360 - 90;
        const rad = (angle * Math.PI) / 180;
        return { d, cx: CX + DOT_R * Math.cos(rad), cy: CY + DOT_R * Math.sin(rad) };
    });

    const activeIdx = DURATIONS.indexOf(value);
    const activeAngle = (activeIdx / DURATIONS.length) * 360 - 90;
    const handRad = (activeAngle * Math.PI) / 180;
    const handX = CX + HAND_R * Math.cos(handRad);
    const handY = CY + HAND_R * Math.sin(handRad);

    return (
        <div className="clock-picker-wrap">
            <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="clock-svg">
                {/* Outer ring */}
                <circle cx={CX} cy={CY} r={TICK_OUTER + 6} fill="none" stroke="rgba(200,149,108,0.06)" strokeWidth={1} />

                {/* 12 tick marks */}
                {Array.from({ length: 12 }, (_, i) => {
                    const a = (i * 30 - 90) * Math.PI / 180;
                    return <line key={i}
                        x1={CX + TICK_INNER * Math.cos(a)} y1={CY + TICK_INNER * Math.sin(a)}
                        x2={CX + TICK_OUTER * Math.cos(a)} y2={CY + TICK_OUTER * Math.sin(a)}
                        stroke="rgba(200,149,108,0.1)" strokeWidth={1} />;
                })}

                {/* Animated hand */}
                <motion.line
                    x1={CX} y1={CY} x2={handX} y2={handY}
                    stroke="var(--accent)" strokeWidth={2} strokeLinecap="round"
                    initial={false}
                    animate={{ x2: handX, y2: handY }}
                    transition={{ type: 'spring', stiffness: 180, damping: 18 }}
                />

                {/* Center hub */}
                <circle cx={CX} cy={CY} r={4} fill="var(--accent)" />
                <circle cx={CX} cy={CY} r={1.5} fill="var(--bg-primary)" />

                {/* Duration dots */}
                {positions.map((p) => {
                    const active = p.d === value;
                    return (
                        <g key={p.d} onClick={() => onChange(p.d)} style={{ cursor: 'pointer' }}>
                            <circle cx={p.cx} cy={p.cy} r={DOT_SIZE / 2 + 4} fill="transparent" />
                            <circle cx={p.cx} cy={p.cy} r={DOT_SIZE / 2}
                                fill={active ? 'var(--accent)' : 'var(--bg-secondary)'}
                                stroke={active ? 'var(--accent)' : 'rgba(200,149,108,0.12)'}
                                strokeWidth={1} />
                            {active && (
                                <circle cx={p.cx} cy={p.cy} r={DOT_SIZE / 2 + 3}
                                    fill="none" stroke="rgba(200,149,108,0.2)" strokeWidth={1} />
                            )}
                            <text x={p.cx} y={p.cy} textAnchor="middle" dominantBaseline="central"
                                fill={active ? 'var(--bg-primary)' : 'var(--text-secondary)'}
                                fontSize={10} fontWeight={700} fontFamily="var(--font-mono)"
                                style={{ pointerEvents: 'none' }}>
                                {p.d}
                            </text>
                        </g>
                    );
                })}
            </svg>

            {/* Selected value */}
            <AnimatePresence mode="wait">
                <motion.p key={value} className="clock-value"
                    initial={{ y: 6, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -6, opacity: 0 }} transition={{ duration: 0.12 }}>
                    {value} min
                </motion.p>
            </AnimatePresence>

            {/* Quick suggestion cards */}
            <div className="suggestion-cards">
                {QUICK_SUGGESTIONS.map((d) => (
                    <motion.button key={d}
                        className={`suggestion-card ${value === d ? 'active' : ''}`}
                        onClick={() => onChange(d)}
                        whileTap={{ scale: 0.93 }}>
                        <span className="suggestion-num">{d}</span>
                        <span className="suggestion-unit">min</span>
                    </motion.button>
                ))}
            </div>
        </div>
    );
}

/* ─── Setup Screen ─── */
export function SetupScreen() {
    const { duration, selectedSound, showTimer, setDuration, setSelectedSound, setShowTimer, startCountdown } = useMeditationStore();

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
                <ClockFacePicker value={durationMinutes} onChange={handleDurationChange} />
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

            <button className="begin-button" onClick={startCountdown}>
                Begin
            </button>
        </div>
    );
}
