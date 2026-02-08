import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, animate } from 'framer-motion';
import './StylesPage.css';

/* ═══════════════════════════════════════════
   Component Library Registry
   Tag: USED = currently in production
   ═══════════════════════════════════════════ */

interface Variant {
    id: string;
    label: string;
    tag?: 'USED';
    component: React.ReactNode;
}

interface Category {
    id: string;
    label: string;
    icon: string;
    variants: Variant[];
}

/* ═══════════════════════════════════════════
   LOGIN VARIANTS
   ═══════════════════════════════════════════ */

function MockForm() {
    return (
        <div className="mock-form">
            <div className="mock-group"><label>Email</label><input type="email" placeholder="you@example.com" readOnly /></div>
            <div className="mock-group"><label>Password</label><input type="password" placeholder="••••••••" readOnly /></div>
            <button className="mock-btn">Sign In</button>
            <p className="mock-toggle">Don't have an account? <span>Sign up</span></p>
        </div>
    );
}

function CosmicAmbientLogin() {
    const stars = Array.from({ length: 40 }, (_, i) => ({
        id: i, x: Math.random() * 100, y: Math.random() * 100,
        size: Math.random() * 2 + 0.5, delay: Math.random() * 4, duration: Math.random() * 2 + 2,
    }));
    return (
        <div className="proto-frame cosmic-ambient-bg">
            {stars.map((s) => (
                <motion.div key={s.id} className="star"
                    style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.size, height: s.size }}
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: s.duration, repeat: Infinity, delay: s.delay }} />
            ))}
            <svg className="lib-wave" viewBox="0 0 1440 320" preserveAspectRatio="none">
                <motion.path fill="rgba(200, 149, 108, 0.06)"
                    animate={{
                        d: [
                            'M0,224L48,213.3C96,203,192,181,288,186.7C384,192,480,224,576,234.7C672,245,768,235,864,208C960,181,1056,139,1152,128C1248,117,1344,139,1392,149.3L1440,160L1440,320L0,320Z',
                            'M0,160L48,181.3C96,203,192,245,288,250.7C384,256,480,224,576,208C672,192,768,192,864,202.7C960,213,1056,235,1152,234.7C1248,235,1344,213,1392,202.7L1440,192L1440,320L0,320Z',
                            'M0,224L48,213.3C96,203,192,181,288,186.7C384,192,480,224,576,234.7C672,245,768,235,864,208C960,181,1056,139,1152,128C1248,117,1344,139,1392,149.3L1440,160L1440,320L0,320Z',
                        ]
                    }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }} />
            </svg>
            <div className="cosmic-card">
                <h2>Welcome Back</h2><p className="cosmic-sub">Journey through the stars</p>
                <MockForm />
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════
   DURATION PICKER VARIANTS
   ═══════════════════════════════════════════ */

const DURATIONS = [1, 2, 3, 5, 10, 15, 20, 25, 30, 45, 60];
const ITEM_HEIGHT = 56;
const VISIBLE_COUNT = 5;
const CENTER_OFFSET = (VISIBLE_COUNT - 1) / 2 * ITEM_HEIGHT;
const CONTAINER_HEIGHT = ITEM_HEIGHT * VISIBLE_COUNT;

/* ── Scroll Wheel (USED) ── */
function PickerItemBase({ label, index, y, isActive, onClick }: {
    label: string; index: number; y: ReturnType<typeof useSpring>; isActive: boolean; onClick: () => void;
}) {
    const itemY = index * ITEM_HEIGHT;
    const distance = useTransform(y, (val: number) => Math.abs(val + itemY - CENTER_OFFSET));
    const scale = useTransform(distance, [0, ITEM_HEIGHT, ITEM_HEIGHT * 2], [1, 0.85, 0.7]);
    const opacity = useTransform(distance, [0, ITEM_HEIGHT, ITEM_HEIGHT * 2], [1, 0.5, 0.2]);
    return (
        <motion.div className={`picker-item ${isActive ? 'active' : ''}`}
            style={{ height: ITEM_HEIGHT, scale, opacity }} onClick={onClick}>{label}</motion.div>
    );
}

function ScrollWheelPicker() {
    const [value, setValue] = useState(10);
    const y = useMotionValue(0);
    const springY = useSpring(y, { stiffness: 300, damping: 30 });
    useEffect(() => {
        const idx = DURATIONS.indexOf(value);
        if (idx >= 0) animate(y, -idx * ITEM_HEIGHT + CENTER_OFFSET, { type: 'spring', stiffness: 300, damping: 30 });
    }, [value, y]);
    const snap = useCallback(() => {
        const idx = Math.round((CENTER_OFFSET - y.get()) / ITEM_HEIGHT);
        const ci = Math.max(0, Math.min(DURATIONS.length - 1, idx));
        animate(y, -ci * ITEM_HEIGHT + CENTER_OFFSET, { type: 'spring', stiffness: 300, damping: 30 });
        setValue(DURATIONS[ci]);
    }, [y]);
    return (
        <div className="proto-frame proto-dark-center">
            <div className="picker-demo-wrap">
                <p className="picker-demo-label">Duration</p>
                <div className="scroll-picker" style={{ height: CONTAINER_HEIGHT }}>
                    <div className="picker-highlight" />
                    <div className="picker-fade-top" /><div className="picker-fade-bottom" />
                    <motion.div className="picker-track" style={{ y: springY }} drag="y"
                        dragConstraints={{ top: -(DURATIONS.length - 1) * ITEM_HEIGHT + CENTER_OFFSET, bottom: CENTER_OFFSET }}
                        dragElastic={0.1} onDragEnd={snap}>
                        {DURATIONS.map((d, i) => (
                            <PickerItemBase key={d} label={`${d} min`} index={i} y={springY} isActive={d === value} onClick={() => setValue(d)} />
                        ))}
                    </motion.div>
                </div>
                <p className="picker-demo-value">{value} minutes</p>
            </div>
        </div>
    );
}

/* ── Horizontal Carousel ── */
function CarouselPicker() {
    const [value, setValue] = useState(10);
    const CARD_W = 80;
    const x = useMotionValue(0);
    const springX = useSpring(x, { stiffness: 300, damping: 30 });

    useEffect(() => {
        const idx = DURATIONS.indexOf(value);
        if (idx >= 0) animate(x, -idx * CARD_W, { type: 'spring', stiffness: 300, damping: 30 });
    }, [value, x]);

    const snap = useCallback(() => {
        const idx = Math.round(-x.get() / CARD_W);
        const ci = Math.max(0, Math.min(DURATIONS.length - 1, idx));
        animate(x, -ci * CARD_W, { type: 'spring', stiffness: 300, damping: 30 });
        setValue(DURATIONS[ci]);
    }, [x]);

    return (
        <div className="proto-frame proto-dark-center">
            <div className="picker-demo-wrap">
                <p className="picker-demo-label">Duration</p>
                <div className="carousel-picker">
                    <div className="carousel-indicator" />
                    <div className="carousel-fade-left" />
                    <div className="carousel-fade-right" />
                    <motion.div className="carousel-track" style={{ x: springX }} drag="x"
                        dragConstraints={{ left: -(DURATIONS.length - 1) * CARD_W, right: 0 }}
                        dragElastic={0.1} onDragEnd={snap}>
                        {DURATIONS.map((d) => {
                            const active = d === value;
                            return (
                                <motion.div key={d} className={`carousel-card ${active ? 'active' : ''}`}
                                    style={{ width: CARD_W }} onClick={() => setValue(d)}
                                    animate={{ scale: active ? 1.15 : 0.9, opacity: active ? 1 : 0.4 }}>
                                    <span className="carousel-num">{d}</span>
                                    <span className="carousel-unit">min</span>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                </div>
                <p className="picker-demo-value">{value} minutes</p>
            </div>
        </div>
    );
}

/* ── Clock Face Tap ── */
function ClockFacePicker() {
    const [value, setValue] = useState(10);
    const R = 100;
    const positions = DURATIONS.map((d, i) => {
        const angle = (i / DURATIONS.length) * 360 - 90;
        return {
            d, x: R + R * 0.78 * Math.cos((angle * Math.PI) / 180),
            y: R + R * 0.78 * Math.sin((angle * Math.PI) / 180),
        };
    });
    return (
        <div className="proto-frame proto-dark-center">
            <div className="picker-demo-wrap">
                <p className="picker-demo-label">Duration</p>
                <div className="clock-face" style={{ width: R * 2, height: R * 2 }}>
                    <svg width={R * 2} height={R * 2} className="clock-svg">
                        <circle cx={R} cy={R} r={R - 4} className="clock-ring" />
                        {/* Hand */}
                        {(() => {
                            const idx = DURATIONS.indexOf(value);
                            const angle = (idx / DURATIONS.length) * 360 - 90;
                            const hx = R + R * 0.55 * Math.cos((angle * Math.PI) / 180);
                            const hy = R + R * 0.55 * Math.sin((angle * Math.PI) / 180);
                            return <motion.line x1={R} y1={R} x2={hx} y2={hy} className="clock-hand"
                                animate={{ x2: hx, y2: hy }} transition={{ type: 'spring', stiffness: 200, damping: 20 }} />;
                        })()}
                        <circle cx={R} cy={R} r={4} fill="var(--accent)" />
                    </svg>
                    {positions.map((p) => (
                        <motion.button key={p.d} className={`clock-dot ${value === p.d ? 'active' : ''}`}
                            style={{ left: p.x, top: p.y }} onClick={() => setValue(p.d)}
                            whileTap={{ scale: 0.85 }} animate={{ scale: value === p.d ? 1.3 : 1 }}>
                            {p.d}
                        </motion.button>
                    ))}
                </div>
                <p className="picker-demo-value">{value} minutes</p>
            </div>
        </div>
    );
}

/* ── Smooth Slider ── */
function SliderPicker() {
    const [idx, setIdx] = useState(DURATIONS.indexOf(10));
    const value = DURATIONS[idx];
    const pct = (idx / (DURATIONS.length - 1)) * 100;
    return (
        <div className="proto-frame proto-dark-center">
            <div className="picker-demo-wrap">
                <p className="picker-demo-label">Duration</p>
                <div className="slider-container">
                    <div className="slider-labels">
                        {DURATIONS.map((d, i) => (
                            <span key={d} className={`slider-mark ${i === idx ? 'active' : ''}`}
                                onClick={() => setIdx(i)}>{d}</span>
                        ))}
                    </div>
                    <div className="slider-track">
                        <motion.div className="slider-fill" animate={{ width: `${pct}%` }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }} />
                        <motion.div className="slider-thumb" animate={{ left: `${pct}%` }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }} />
                    </div>
                    <input type="range" className="slider-input" min={0} max={DURATIONS.length - 1}
                        value={idx} onChange={(e) => setIdx(Number(e.target.value))} />
                </div>
                <AnimatePresence mode="wait">
                    <motion.p key={value} className="picker-demo-value"
                        initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }}
                        transition={{ duration: 0.15 }}>{value} minutes</motion.p>
                </AnimatePresence>
            </div>
        </div>
    );
}

/* ── Card Flip ── */
function CardFlipPicker() {
    const [idx, setIdx] = useState(DURATIONS.indexOf(10));
    const value = DURATIONS[idx];
    function inc() { setIdx((i) => Math.min(DURATIONS.length - 1, i + 1)); }
    function dec() { setIdx((i) => Math.max(0, i - 1)); }
    return (
        <div className="proto-frame proto-dark-center">
            <div className="picker-demo-wrap">
                <p className="picker-demo-label">Duration</p>
                <div className="flip-picker">
                    <motion.button className="flip-arrow" onClick={dec} whileTap={{ scale: 0.8 }} disabled={idx === 0}>▲</motion.button>
                    <div className="flip-card-container">
                        <AnimatePresence mode="wait">
                            <motion.div key={value} className="flip-card"
                                initial={{ rotateX: -90, opacity: 0 }}
                                animate={{ rotateX: 0, opacity: 1 }}
                                exit={{ rotateX: 90, opacity: 0 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 25 }}>
                                <span className="flip-num">{value}</span>
                                <span className="flip-unit">min</span>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                    <motion.button className="flip-arrow" onClick={inc} whileTap={{ scale: 0.8 }} disabled={idx === DURATIONS.length - 1}>▼</motion.button>
                </div>
            </div>
        </div>
    );
}

/* ── Bubble Select ── */
function BubblePicker() {
    const [value, setValue] = useState(10);
    // Random-ish positions for each bubble
    const positions = useRef(DURATIONS.map((d, i) => ({
        d, x: 30 + (i % 4) * 70 + Math.random() * 20 - 10,
        y: 20 + Math.floor(i / 4) * 80 + Math.random() * 15,
    }))).current;
    return (
        <div className="proto-frame proto-dark-center">
            <div className="picker-demo-wrap">
                <p className="picker-demo-label">Duration</p>
                <div className="bubble-field">
                    {positions.map((p) => {
                        const active = p.d === value;
                        const size = active ? 64 : 44 + (p.d / 60) * 12;
                        return (
                            <motion.button key={p.d} className={`bubble ${active ? 'active' : ''}`}
                                style={{ left: p.x, top: p.y, width: size, height: size }}
                                onClick={() => setValue(p.d)}
                                animate={{
                                    scale: active ? [1, 1.08, 1] : 1,
                                    boxShadow: active ? '0 0 20px rgba(200,149,108,0.3)' : '0 0 0px transparent',
                                }}
                                whileHover={{ scale: 1.1 }}
                                transition={{ scale: { duration: 2, repeat: active ? Infinity : 0 } }}>
                                {p.d}
                            </motion.button>
                        );
                    })}
                </div>
                <p className="picker-demo-value">{value} minutes</p>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════
   TIMER ANIMATION VARIANTS — Relaxing
   ═══════════════════════════════════════════ */

const DEMO_DURATION = 30;

function useSimulatedProgress(speed = 1) {
    const [progress, setProgress] = useState(0);
    useEffect(() => {
        const interval = setInterval(() => {
            setProgress((p) => { const n = p + (speed / DEMO_DURATION); return n >= 1 ? 0 : n; });
        }, 1000 / 60 * speed);
        return () => clearInterval(interval);
    }, [speed]);
    return progress;
}

/* ── 1. Water Ripple ── */
function WaterRippleTimer() {
    const progress = useSimulatedProgress(3);
    const rippleCount = 4;
    return (
        <div className="proto-frame proto-dark-center">
            <div className="timer-demo-wrap">
                <div className="ripple-container">
                    {Array.from({ length: rippleCount }, (_, i) => {
                        const delay = i * 2.5;
                        const baseOpacity = 0.08 + (1 - progress) * 0.12;
                        return (
                            <motion.div key={i} className="ripple-ring"
                                animate={{
                                    scale: [0.2, 1.8],
                                    opacity: [baseOpacity, 0],
                                }}
                                transition={{
                                    duration: 6 + progress * 4, // slower as time passes
                                    repeat: Infinity,
                                    delay,
                                    ease: 'easeOut',
                                }} />
                        );
                    })}
                    {/* Center drop */}
                    <motion.div className="ripple-center"
                        animate={{ scale: [1, 0.85, 1], opacity: [0.6, 0.3, 0.6] }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }} />
                </div>
                <p className="timer-demo-label">Water Ripple</p>
            </div>
        </div>
    );
}

/* ── 2. Zen Enso ── */
function ZenEnsoTimer() {
    const progress = useSimulatedProgress(3);
    const R = 80;
    const circumference = 2 * Math.PI * R;
    // Circle draws itself slowly, then fades and redraws
    const pathProgress = 1 - progress; // depletes
    return (
        <div className="proto-frame proto-dark-center">
            <div className="timer-demo-wrap">
                <svg width={200} height={200} className="enso-svg">
                    {/* Faint background circle */}
                    <circle cx={100} cy={100} r={R} fill="none" stroke="rgba(200,149,108,0.04)" strokeWidth={3} />
                    {/* Enso stroke — calligraphy-style with varying width */}
                    <motion.circle cx={100} cy={100} r={R} fill="none"
                        stroke="rgba(200,149,108,0.35)"
                        strokeWidth={2.5}
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={circumference * (1 - pathProgress * 0.92)} // never quite closes
                        style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
                    />
                    {/* Brush stroke end — thicker trailing point */}
                    {(() => {
                        const endAngle = -90 + pathProgress * 0.92 * 360;
                        const ex = 100 + R * Math.cos((endAngle * Math.PI) / 180);
                        const ey = 100 + R * Math.sin((endAngle * Math.PI) / 180);
                        return <circle cx={ex} cy={ey} r={3} fill="rgba(200,149,108,0.5)" />;
                    })()}
                </svg>
                <p className="timer-demo-label">Zen Ensō</p>
            </div>
        </div>
    );
}

/* ── 3. Aurora Waves ── */
function AuroraWavesTimer() {
    const progress = useSimulatedProgress(3);
    const intensity = 1 - progress;
    return (
        <div className="proto-frame proto-dark-center aurora-bg">
            <div className="timer-demo-wrap aurora-content">
                <div className="aurora-layers">
                    <motion.div className="aurora-layer aurora-1"
                        animate={{ x: [-30, 30, -30], y: [-10, 10, -10], opacity: [0.15 * intensity, 0.25 * intensity, 0.15 * intensity] }}
                        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }} />
                    <motion.div className="aurora-layer aurora-2"
                        animate={{ x: [20, -20, 20], y: [5, -15, 5], opacity: [0.1 * intensity, 0.2 * intensity, 0.1 * intensity] }}
                        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }} />
                    <motion.div className="aurora-layer aurora-3"
                        animate={{ x: [-15, 25, -15], y: [-8, 12, -8], opacity: [0.08 * intensity, 0.18 * intensity, 0.08 * intensity] }}
                        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }} />
                </div>
                <p className="timer-demo-label" style={{ position: 'relative', zIndex: 2 }}>Aurora Waves</p>
            </div>
        </div>
    );
}

/* ── 4. Candle Flame ── */
function CandleFlameTimer() {
    const progress = useSimulatedProgress(3);
    const flameHeight = 40 + (1 - progress) * 50; // shrinks
    const glowIntensity = 0.1 + (1 - progress) * 0.25;
    return (
        <div className="proto-frame proto-dark-center">
            <div className="timer-demo-wrap">
                <div className="candle-scene">
                    {/* Glow */}
                    <motion.div className="candle-glow"
                        animate={{ opacity: [glowIntensity * 0.8, glowIntensity, glowIntensity * 0.7], scale: [0.95, 1.05, 0.95] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }} />
                    {/* Flame */}
                    <motion.div className="candle-flame"
                        style={{ height: flameHeight }}
                        animate={{
                            scaleX: [1, 0.85, 1.1, 0.9, 1],
                            scaleY: [1, 1.05, 0.95, 1.08, 1],
                            x: [-1, 1.5, -0.5, 1, -1],
                        }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}>
                        <div className="flame-inner" />
                        <div className="flame-outer" />
                    </motion.div>
                    {/* Wick */}
                    <div className="candle-wick" />
                    {/* Wax body */}
                    <div className="candle-body" />
                </div>
                <p className="timer-demo-label">Candle Flame</p>
            </div>
        </div>
    );
}

/* ── 5. Moon Phase ── */
function MoonPhaseTimer() {
    const progress = useSimulatedProgress(3);
    const R = 60;
    // Moon phase: full → new. Shadow covers from right to left
    const phase = progress; // 0 = full, 1 = new
    return (
        <div className="proto-frame proto-dark-center">
            <div className="timer-demo-wrap">
                <div className="moon-scene">
                    {/* Ambient glow */}
                    <motion.div className="moon-glow"
                        animate={{ opacity: [0.08 * (1 - phase), 0.15 * (1 - phase), 0.08 * (1 - phase)], scale: [1, 1.1, 1] }}
                        transition={{ duration: 5, repeat: Infinity }} />
                    <svg width={R * 2 + 20} height={R * 2 + 20} className="moon-svg">
                        {/* Moon surface */}
                        <circle cx={R + 10} cy={R + 10} r={R} fill="rgba(200,180,150,0.15)" />
                        <circle cx={R + 10} cy={R + 10} r={R} fill="none" stroke="rgba(200,180,150,0.08)" strokeWidth={1} />
                        {/* Craters */}
                        <circle cx={R - 5} cy={R - 10} r={8} fill="rgba(200,180,150,0.05)" />
                        <circle cx={R + 25} cy={R + 20} r={12} fill="rgba(200,180,150,0.04)" />
                        <circle cx={R + 5} cy={R + 30} r={6} fill="rgba(200,180,150,0.03)" />
                        {/* Phase shadow — uses clip path with ellipse */}
                        <clipPath id="moonClip"><circle cx={R + 10} cy={R + 10} r={R} /></clipPath>
                        <ellipse cx={R + 10 + (1 - phase * 2) * R} cy={R + 10} rx={R} ry={R}
                            fill="rgba(10,10,16,0.92)" clipPath="url(#moonClip)" />
                    </svg>
                    {/* Small stars around */}
                    {Array.from({ length: 8 }, (_, i) => {
                        const angle = (i / 8) * 360;
                        const dist = R + 30 + Math.random() * 20;
                        return (
                            <motion.div key={i} className="moon-star"
                                style={{
                                    left: `calc(50% + ${dist * Math.cos((angle * Math.PI) / 180)}px)`,
                                    top: `calc(50% + ${dist * Math.sin((angle * Math.PI) / 180)}px)`,
                                }}
                                animate={{ opacity: [0, 0.5, 0] }}
                                transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 3 }} />
                        );
                    })}
                </div>
                <p className="timer-demo-label">Moon Phase</p>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════
   CATEGORY REGISTRY
   ═══════════════════════════════════════════ */

const CATEGORIES: Category[] = [
    {
        id: 'login', label: 'Login / Register', icon: '🔐',
        variants: [
            { id: 'cosmic-ambient', label: 'Cosmic Ambient', tag: 'USED', component: <CosmicAmbientLogin /> },
        ],
    },
    {
        id: 'duration-picker', label: 'Duration Picker', icon: '⏱',
        variants: [
            { id: 'scroll-wheel', label: 'Scroll Wheel', tag: 'USED', component: <ScrollWheelPicker /> },
            { id: 'carousel', label: 'Horizontal Carousel', component: <CarouselPicker /> },
            { id: 'clock-face', label: 'Clock Face', component: <ClockFacePicker /> },
            { id: 'slider', label: 'Smooth Slider', component: <SliderPicker /> },
            { id: 'card-flip', label: 'Card Flip', component: <CardFlipPicker /> },
            { id: 'bubble', label: 'Bubble Select', component: <BubblePicker /> },
        ],
    },
    {
        id: 'timer-animation', label: 'Timer Animation', icon: '✦',
        variants: [
            { id: 'water-ripple', label: 'Water Ripple', component: <WaterRippleTimer /> },
            { id: 'zen-enso', label: 'Zen Ensō', component: <ZenEnsoTimer /> },
            { id: 'aurora-waves', label: 'Aurora Waves', component: <AuroraWavesTimer /> },
            { id: 'candle-flame', label: 'Candle Flame', component: <CandleFlameTimer /> },
            { id: 'moon-phase', label: 'Moon Phase', component: <MoonPhaseTimer /> },
        ],
    },
];

/* ─── Page ─── */
export function StylesPage() {
    const [activeCat, setActiveCat] = useState(CATEGORIES[0].id);
    const [activeVariant, setActiveVariant] = useState(CATEGORIES[0].variants[0]?.id || '');
    const category = CATEGORIES.find((c) => c.id === activeCat)!;
    const variant = category.variants.find((v) => v.id === activeVariant);
    function selectCategory(catId: string) {
        setActiveCat(catId);
        const cat = CATEGORIES.find((c) => c.id === catId)!;
        setActiveVariant(cat.variants[0]?.id || '');
    }
    return (
        <div className="styles-page">
            <h1 className="styles-title">Component Library</h1>
            <p className="styles-subtitle">Browse and preview UI components</p>
            <div className="style-tabs">
                {CATEGORIES.map((cat) => (
                    <button key={cat.id} className={`style-tab ${activeCat === cat.id ? 'active' : ''}`}
                        onClick={() => selectCategory(cat.id)}>
                        <span>{cat.icon}</span> {cat.label}
                    </button>
                ))}
            </div>
            {category.variants.length > 0 && (
                <div className="variant-chips">
                    {category.variants.map((v) => (
                        <button key={v.id} className={`variant-chip ${activeVariant === v.id ? 'active' : ''}`}
                            onClick={() => setActiveVariant(v.id)}>
                            {v.label}{v.tag && <span className="variant-tag">{v.tag}</span>}
                        </button>
                    ))}
                </div>
            )}
            <div className="proto-viewport">
                <AnimatePresence mode="wait">
                    {variant ? (
                        <motion.div key={variant.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }} style={{ height: '100%' }}>
                            {variant.component}
                        </motion.div>
                    ) : <div className="proto-empty">No variants yet</div>}
                </AnimatePresence>
            </div>
        </div>
    );
}
