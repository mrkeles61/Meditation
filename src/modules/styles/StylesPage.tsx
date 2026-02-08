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
            <div className="mock-group">
                <label>Email</label>
                <input type="email" placeholder="you@example.com" readOnly />
            </div>
            <div className="mock-group">
                <label>Password</label>
                <input type="password" placeholder="••••••••" readOnly />
            </div>
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
                    transition={{ duration: s.duration, repeat: Infinity, delay: s.delay }}
                />
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
                    transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                />
            </svg>
            <div className="cosmic-card">
                <h2>Welcome Back</h2>
                <p className="cosmic-sub">Journey through the stars</p>
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

function PickerItemBase({ label, index, y, isActive, onClick }: {
    label: string; index: number; y: ReturnType<typeof useSpring>; isActive: boolean; onClick: () => void;
}) {
    const itemY = index * ITEM_HEIGHT;
    const distance = useTransform(y, (val: number) => Math.abs(val + itemY - CENTER_OFFSET));
    const scale = useTransform(distance, [0, ITEM_HEIGHT, ITEM_HEIGHT * 2], [1, 0.85, 0.7]);
    const opacity = useTransform(distance, [0, ITEM_HEIGHT, ITEM_HEIGHT * 2], [1, 0.5, 0.2]);
    return (
        <motion.div className={`picker-item ${isActive ? 'active' : ''}`}
            style={{ height: ITEM_HEIGHT, scale, opacity }} onClick={onClick}>
            {label}
        </motion.div>
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

function RadialDialPicker() {
    const [value, setValue] = useState(10);
    const [dragging, setDragging] = useState(false);
    const dialRef = useRef<HTMLDivElement>(null);
    const R = 110;
    function angleFromEvent(e: React.MouseEvent | React.TouchEvent) {
        if (!dialRef.current) return 0;
        const rect = dialRef.current.getBoundingClientRect();
        const cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        let a = Math.atan2(clientY - cy, clientX - cx) * (180 / Math.PI) + 90;
        if (a < 0) a += 360;
        return a;
    }
    function handleInteract(e: React.MouseEvent | React.TouchEvent) {
        const a = angleFromEvent(e);
        setValue(Math.max(1, Math.min(60, Math.round((a / 360) * 60))));
    }
    const deg = (value / 60) * 360;
    const hx = R + R * Math.sin((deg * Math.PI) / 180);
    const hy = R - R * Math.cos((deg * Math.PI) / 180);
    const lg = deg > 180 ? 1 : 0;
    const arc = `M ${R} 0 A ${R} ${R} 0 ${lg} 1 ${R + R * Math.sin((deg * Math.PI) / 180)} ${R - R * Math.cos((deg * Math.PI) / 180)}`;
    return (
        <div className="proto-frame proto-dark-center">
            <div className="picker-demo-wrap">
                <p className="picker-demo-label">Duration</p>
                <div ref={dialRef} className="radial-dial" style={{ width: R * 2, height: R * 2 }}
                    onMouseDown={(e) => { setDragging(true); handleInteract(e); }}
                    onMouseMove={(e) => dragging && handleInteract(e)}
                    onMouseUp={() => setDragging(false)} onMouseLeave={() => setDragging(false)}
                    onTouchStart={(e) => { setDragging(true); handleInteract(e); }}
                    onTouchMove={(e) => dragging && handleInteract(e)} onTouchEnd={() => setDragging(false)}>
                    <svg width={R * 2} height={R * 2} className="radial-svg">
                        <circle cx={R} cy={R} r={R - 2} className="radial-track" />
                        <path d={arc} className="radial-fill" fill="none" strokeWidth={4} />
                        {Array.from({ length: 12 }, (_, i) => {
                            const a = (i * 30 * Math.PI) / 180;
                            return <line key={i} x1={R + (R - 10) * Math.sin(a)} y1={R - (R - 10) * Math.cos(a)}
                                x2={R + (R - 2) * Math.sin(a)} y2={R - (R - 2) * Math.cos(a)} className="radial-tick" />;
                        })}
                    </svg>
                    <motion.div className="radial-handle" style={{ left: hx - 10, top: hy - 10 }} animate={{ scale: dragging ? 1.3 : 1 }} />
                    <div className="radial-center-value">
                        <span className="radial-number">{value}</span><span className="radial-unit">min</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StepperPicker() {
    const [idx, setIdx] = useState(DURATIONS.indexOf(10));
    const value = DURATIONS[idx];
    return (
        <div className="proto-frame proto-dark-center">
            <div className="picker-demo-wrap">
                <p className="picker-demo-label">Duration</p>
                <div className="stepper-picker">
                    <motion.button className="stepper-btn" onClick={() => setIdx((i) => Math.max(0, i - 1))} whileTap={{ scale: 0.85 }} disabled={idx === 0}>−</motion.button>
                    <div className="stepper-display">
                        <AnimatePresence mode="wait">
                            <motion.span key={value} className="stepper-value"
                                initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
                                {value}
                            </motion.span>
                        </AnimatePresence>
                        <span className="stepper-unit">min</span>
                    </div>
                    <motion.button className="stepper-btn" onClick={() => setIdx((i) => Math.min(DURATIONS.length - 1, i + 1))} whileTap={{ scale: 0.85 }} disabled={idx === DURATIONS.length - 1}>+</motion.button>
                </div>
                <div className="stepper-bar-track">
                    <motion.div className="stepper-bar-fill" animate={{ width: `${(idx / (DURATIONS.length - 1)) * 100}%` }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }} />
                </div>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════
   TIMER ANIMATION VARIANTS
   Fluid progress indicators for meditation
   ═══════════════════════════════════════════ */

const DEMO_DURATION = 30; // seconds for demo animation

function useSimulatedProgress(speed = 1) {
    const [progress, setProgress] = useState(0);
    useEffect(() => {
        const interval = setInterval(() => {
            setProgress((p) => {
                const next = p + (speed / DEMO_DURATION);
                return next >= 1 ? 0 : next;
            });
        }, 1000 / 60 * speed);
        return () => clearInterval(interval);
    }, [speed]);
    return progress;
}

/* ── 1. Orbital Ring — SVG circle depletion + orbiting dot ── */
function OrbitalRingTimer() {
    const progress = useSimulatedProgress(3);
    const R = 100;
    const circumference = 2 * Math.PI * R;
    const offset = circumference * progress;
    const orbitAngle = progress * 360 * 3; // orbits multiple times
    const dotX = 120 + R * Math.cos((orbitAngle * Math.PI) / 180);
    const dotY = 120 + R * Math.sin((orbitAngle * Math.PI) / 180);

    return (
        <div className="proto-frame proto-dark-center">
            <div className="timer-demo-wrap">
                <svg width={240} height={240} className="orbital-svg">
                    {/* Background track */}
                    <circle cx={120} cy={120} r={R} fill="none" stroke="rgba(200,149,108,0.06)" strokeWidth={3} />
                    {/* Progress arc — depletes */}
                    <motion.circle cx={120} cy={120} r={R} fill="none"
                        stroke="rgba(200,149,108,0.25)" strokeWidth={2} strokeLinecap="round"
                        strokeDasharray={circumference} strokeDashoffset={offset}
                        style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
                    />
                    {/* Orbiting dot */}
                    <motion.circle cx={dotX} cy={dotY} r={4} fill="var(--accent)"
                        animate={{ filter: ['drop-shadow(0 0 4px rgba(200,149,108,0.6))', 'drop-shadow(0 0 8px rgba(200,149,108,0.3))'] }}
                        transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
                    />
                    {/* Tiny trail particles */}
                    {[1, 2, 3].map((i) => {
                        const trailAngle = orbitAngle - i * 15;
                        const tx = 120 + R * Math.cos((trailAngle * Math.PI) / 180);
                        const ty = 120 + R * Math.sin((trailAngle * Math.PI) / 180);
                        return <circle key={i} cx={tx} cy={ty} r={2 - i * 0.5} fill="var(--accent)" opacity={0.3 - i * 0.08} />;
                    })}
                </svg>
                <p className="timer-demo-label">Orbital Ring</p>
            </div>
        </div>
    );
}

/* ── 2. Breathing Blob — morphing organic shape ── */
function BreathingBlobTimer() {
    const progress = useSimulatedProgress(3);
    const blobScale = 0.4 + (1 - progress) * 0.6; // shrinks as time passes
    return (
        <div className="proto-frame proto-dark-center">
            <div className="timer-demo-wrap">
                <div className="blob-container">
                    <motion.div
                        className="blob-shape"
                        animate={{
                            borderRadius: [
                                '40% 60% 60% 40% / 60% 30% 70% 40%',
                                '60% 40% 30% 70% / 40% 60% 60% 40%',
                                '50% 50% 40% 60% / 60% 40% 50% 50%',
                                '40% 60% 60% 40% / 60% 30% 70% 40%',
                            ],
                            scale: [blobScale, blobScale * 1.05, blobScale * 0.97, blobScale],
                        }}
                        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                        style={{
                            width: 180, height: 180,
                            background: `radial-gradient(circle, rgba(200,149,108,${0.15 + (1 - progress) * 0.2}) 0%, rgba(200,149,108,0.03) 70%)`,
                            boxShadow: `0 0 ${40 + (1 - progress) * 30}px rgba(200,149,108,${0.08 + (1 - progress) * 0.12})`,
                        }}
                    />
                    {/* Center glow */}
                    <motion.div className="blob-glow"
                        animate={{ opacity: [0.3, 0.6, 0.3], scale: [0.8, 1, 0.8] }}
                        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                    />
                </div>
                <p className="timer-demo-label">Breathing Blob</p>
            </div>
        </div>
    );
}

/* ── 3. Particle Drift — particles slowly fade/settle ── */
function ParticleDriftTimer() {
    const progress = useSimulatedProgress(3);
    const particleCount = Math.floor((1 - progress) * 30) + 2;
    const particles = useRef(
        Array.from({ length: 32 }, (_, i) => ({
            id: i, x: Math.random() * 200, baseY: Math.random() * 200,
            size: Math.random() * 3 + 1, speed: Math.random() * 0.5 + 0.3,
            drift: Math.random() * 40 - 20,
        }))
    ).current;

    return (
        <div className="proto-frame proto-dark-center">
            <div className="timer-demo-wrap">
                <div className="particle-field">
                    {particles.slice(0, particleCount).map((p) => {
                        const yOffset = Math.sin(progress * Math.PI * 2 * p.speed) * 20;
                        const xOffset = Math.sin(progress * Math.PI * 4 * p.speed) * p.drift;
                        return (
                            <motion.div
                                key={p.id}
                                className="particle-dot"
                                animate={{
                                    x: p.x + xOffset,
                                    y: p.baseY + yOffset + progress * 60,
                                    opacity: [0.2, 0.7, 0.2],
                                }}
                                transition={{ opacity: { duration: 3 + p.speed * 2, repeat: Infinity }, x: { duration: 0 }, y: { duration: 0 } }}
                                style={{ width: p.size, height: p.size }}
                            />
                        );
                    })}
                    {/* Central soft glow */}
                    <motion.div className="particle-center-glow"
                        animate={{ opacity: [0.1, 0.25, 0.1], scale: [0.95, 1.05, 0.95] }}
                        transition={{ duration: 5, repeat: Infinity }}
                        style={{ opacity: 0.15 * (1 - progress) }}
                    />
                </div>
                <p className="timer-demo-label">Particle Drift</p>
            </div>
        </div>
    );
}

/* ── 4. Arc Dissolve — concentric arcs fade out segment by segment ── */
function ArcDissolveTimer() {
    const progress = useSimulatedProgress(3);
    const arcs = [
        { r: 50, segments: 8, width: 2 },
        { r: 70, segments: 12, width: 1.5 },
        { r: 90, segments: 16, width: 1 },
        { r: 110, segments: 20, width: 0.5 },
    ];

    return (
        <div className="proto-frame proto-dark-center">
            <div className="timer-demo-wrap">
                <svg width={240} height={240} className="arc-svg">
                    {arcs.map((arc, ai) =>
                        Array.from({ length: arc.segments }, (_, si) => {
                            const startAngle = (si / arc.segments) * 360;
                            const endAngle = ((si + 0.7) / arc.segments) * 360;
                            const segProgress = (si + ai * arc.segments) / (arcs.reduce((s, a) => s + a.segments, 0));
                            const visible = segProgress > progress;
                            const x1 = 120 + arc.r * Math.cos((startAngle * Math.PI) / 180);
                            const y1 = 120 + arc.r * Math.sin((startAngle * Math.PI) / 180);
                            const x2 = 120 + arc.r * Math.cos((endAngle * Math.PI) / 180);
                            const y2 = 120 + arc.r * Math.sin((endAngle * Math.PI) / 180);
                            const largeArc = endAngle - startAngle > 180 ? 1 : 0;
                            return (
                                <motion.path
                                    key={`${ai}-${si}`}
                                    d={`M ${x1} ${y1} A ${arc.r} ${arc.r} 0 ${largeArc} 1 ${x2} ${y2}`}
                                    fill="none"
                                    stroke="var(--accent)"
                                    strokeWidth={arc.width}
                                    strokeLinecap="round"
                                    animate={{ opacity: visible ? 0.15 + (1 - progress) * 0.35 : 0 }}
                                    transition={{ duration: 0.3 }}
                                />
                            );
                        })
                    )}
                    {/* Center pulse */}
                    <motion.circle cx={120} cy={120} r={8} fill="var(--accent)"
                        animate={{ opacity: [0.2, 0.5, 0.2], r: [6, 10, 6] }}
                        transition={{ duration: 4, repeat: Infinity }}
                    />
                </svg>
                <p className="timer-demo-label">Arc Dissolve</p>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════
   CATEGORY REGISTRY
   ═══════════════════════════════════════════ */

const CATEGORIES: Category[] = [
    {
        id: 'login',
        label: 'Login / Register',
        icon: '🔐',
        variants: [
            { id: 'cosmic-ambient', label: 'Cosmic Ambient', tag: 'USED', component: <CosmicAmbientLogin /> },
        ],
    },
    {
        id: 'duration-picker',
        label: 'Duration Picker',
        icon: '⏱',
        variants: [
            { id: 'scroll-wheel', label: 'Scroll Wheel', tag: 'USED', component: <ScrollWheelPicker /> },
            { id: 'radial-dial', label: 'Radial Dial', component: <RadialDialPicker /> },
            { id: 'stepper', label: 'Stepper', component: <StepperPicker /> },
        ],
    },
    {
        id: 'timer-animation',
        label: 'Timer Animation',
        icon: '✦',
        variants: [
            { id: 'orbital-ring', label: 'Orbital Ring', component: <OrbitalRingTimer /> },
            { id: 'breathing-blob', label: 'Breathing Blob', component: <BreathingBlobTimer /> },
            { id: 'particle-drift', label: 'Particle Drift', component: <ParticleDriftTimer /> },
            { id: 'arc-dissolve', label: 'Arc Dissolve', component: <ArcDissolveTimer /> },
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
                            {v.label}
                            {v.tag && <span className="variant-tag">{v.tag}</span>}
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
                    ) : (
                        <div className="proto-empty">No variants yet</div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
