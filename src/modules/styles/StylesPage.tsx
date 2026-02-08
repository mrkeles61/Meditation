import React, { useState, useEffect, useCallback } from 'react';
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
   DURATION PICKERS
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

/* ── Clock Face with Suggestion Cards ── */
const QUICK_SUGGESTIONS = [5, 10, 15, 20, 30];

function ClockFacePicker() {
    const [value, setValue] = useState(10);
    const R = 110;
    const DOT_ORBIT = 0.76;

    const positions = DURATIONS.map((d, i) => {
        const angle = (i / DURATIONS.length) * 360 - 90;
        const rad = (angle * Math.PI) / 180;
        return { d, x: R + R * DOT_ORBIT * Math.cos(rad), y: R + R * DOT_ORBIT * Math.sin(rad) };
    });

    // Animated hand endpoint
    const activeIdx = DURATIONS.indexOf(value);
    const activeAngle = (activeIdx / DURATIONS.length) * 360 - 90;
    const handRad = (activeAngle * Math.PI) / 180;
    const handX = R + R * 0.52 * Math.cos(handRad);
    const handY = R + R * 0.52 * Math.sin(handRad);

    return (
        <div className="proto-frame proto-dark-center">
            <div className="picker-demo-wrap">
                <p className="picker-demo-label">Set Duration</p>

                {/* Clock */}
                <div className="clock-face" style={{ width: R * 2, height: R * 2 }}>
                    <svg width={R * 2} height={R * 2} className="clock-svg">
                        <circle cx={R} cy={R} r={R - 4} className="clock-ring" />
                        {/* Subtle hour marks */}
                        {Array.from({ length: 12 }, (_, i) => {
                            const a = (i * 30 - 90) * Math.PI / 180;
                            const inner = R - 14;
                            const outer = R - 6;
                            return <line key={i}
                                x1={R + inner * Math.cos(a)} y1={R + inner * Math.sin(a)}
                                x2={R + outer * Math.cos(a)} y2={R + outer * Math.sin(a)}
                                className="clock-tick" />;
                        })}
                        {/* Hand */}
                        <motion.line x1={R} y1={R}
                            animate={{ x2: handX, y2: handY }}
                            transition={{ type: 'spring', stiffness: 180, damping: 18 }}
                            className="clock-hand" />
                        <circle cx={R} cy={R} r={5} fill="var(--accent)" />
                        <circle cx={R} cy={R} r={2} fill="var(--bg-primary)" />
                    </svg>

                    {/* Duration dots */}
                    {positions.map((p) => (
                        <motion.button key={p.d}
                            className={`clock-dot ${value === p.d ? 'active' : ''}`}
                            style={{ left: p.x, top: p.y }}
                            onClick={() => setValue(p.d)}
                            whileTap={{ scale: 0.85 }}
                            animate={{ scale: value === p.d ? 1.25 : 1 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                            {p.d}
                        </motion.button>
                    ))}
                </div>

                {/* Selected value */}
                <AnimatePresence mode="wait">
                    <motion.p key={value} className="picker-demo-value"
                        initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -8, opacity: 0 }} transition={{ duration: 0.15 }}>
                        {value} minutes
                    </motion.p>
                </AnimatePresence>

                {/* Quick suggestion cards */}
                <div className="suggestion-cards">
                    {QUICK_SUGGESTIONS.map((d) => (
                        <motion.button key={d}
                            className={`suggestion-card ${value === d ? 'active' : ''}`}
                            onClick={() => setValue(d)}
                            whileTap={{ scale: 0.93 }}>
                            <span className="suggestion-num">{d}</span>
                            <span className="suggestion-unit">min</span>
                        </motion.button>
                    ))}
                </div>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════
   CANDLE MEDITATION TIMER
   ═══════════════════════════════════════════ */

const CANDLE_DEMO_SECONDS = 40;

function CandleMeditationTimer() {
    const [progress, setProgress] = useState(0); // 0 = start, 1 = done
    const [breathing, setBreathing] = useState<'inhale' | 'exhale'>('inhale');

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress((p) => {
                const n = p + 1 / (CANDLE_DEMO_SECONDS * 60);
                return n >= 1 ? 0 : n;
            });
        }, 1000 / 60);
        return () => clearInterval(interval);
    }, []);

    // Breathing cycle: 4s inhale, 4s exhale
    useEffect(() => {
        const cycle = setInterval(() => {
            setBreathing((b) => b === 'inhale' ? 'exhale' : 'inhale');
        }, 4000);
        return () => clearInterval(cycle);
    }, []);

    const remaining = 1 - progress;

    // Candle dimensions
    const MAX_WAX_HEIGHT = 200;
    const MIN_WAX_HEIGHT = 20;
    const waxHeight = MIN_WAX_HEIGHT + remaining * (MAX_WAX_HEIGHT - MIN_WAX_HEIGHT);

    // Flame size breathes with inhale/exhale
    const isInhale = breathing === 'inhale';

    return (
        <div className="proto-frame proto-dark-center">
            <div className="candle-timer-scene">
                {/* Ambient glow — tied to remaining wax */}
                <motion.div className="candle-ambient-glow"
                    animate={{
                        opacity: remaining * 0.2 + 0.02,
                        scale: [0.97, 1.03, 0.97],
                    }}
                    transition={{ scale: { duration: 4, repeat: Infinity, ease: 'easeInOut' } }}
                />

                {/* Flame group */}
                <div className="candle-flame-group" style={{ bottom: waxHeight + 22 }}>
                    {/* Outer flame — breathing */}
                    <motion.div className="candle-flame-outer"
                        animate={{
                            scaleY: isInhale ? 1.25 : 0.75,
                            scaleX: isInhale ? 0.9 : 1.1,
                            opacity: isInhale ? remaining * 0.7 + 0.15 : remaining * 0.4 + 0.1,
                        }}
                        transition={{ duration: 3.5, ease: 'easeInOut' }}
                    />
                    {/* Inner flame — breathing inverse accent */}
                    <motion.div className="candle-flame-inner"
                        animate={{
                            scaleY: isInhale ? 1.3 : 0.65,
                            scaleX: isInhale ? 0.85 : 1.15,
                            opacity: isInhale ? remaining * 0.8 + 0.2 : remaining * 0.5 + 0.15,
                        }}
                        transition={{ duration: 3.5, ease: 'easeInOut' }}
                    />
                    {/* Flame flicker — subtle random movement */}
                    <motion.div className="candle-flame-core"
                        animate={{
                            x: [-0.5, 0.8, -0.3, 0.5, -0.5],
                            scaleY: [1, 1.04, 0.97, 1.02, 1],
                        }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    />
                </div>

                {/* Wick */}
                <div className="candle-wick-line" style={{ bottom: waxHeight + 14 }} />

                {/* Wax body — height decreases very gradually */}
                <motion.div className="candle-wax-body"
                    animate={{ height: waxHeight }}
                    transition={{ duration: 0.5, ease: 'linear' }}
                />

                {/* Wax drip texture — subtle surface */}
                <div className="candle-wax-pool" />

                {/* Breathing guide text */}
                <motion.p className="candle-breath-guide"
                    key={breathing}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 0.4, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1 }}>
                    {isInhale ? 'breathe in' : 'breathe out'}
                </motion.p>
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
            { id: 'clock-face', label: 'Clock Face', component: <ClockFacePicker /> },
        ],
    },
    {
        id: 'timer-animation', label: 'Timer Animation', icon: '✦',
        variants: [
            { id: 'candle', label: 'Candle Meditation', component: <CandleMeditationTimer /> },
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
