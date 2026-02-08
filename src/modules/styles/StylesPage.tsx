import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, animate } from 'framer-motion';
import './StylesPage.css';

/* ═══════════════════════════════════════════
   Component Library Registry
   Add new categories and variants here.
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

/* ─── Mock Form (shared) ─── */
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

/* ─── Login: Cosmic + Ambient (USED) ─── */
function CosmicAmbientLogin() {
    const stars = Array.from({ length: 40 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 0.5,
        delay: Math.random() * 4,
        duration: Math.random() * 2 + 2,
    }));

    return (
        <div className="proto-frame cosmic-ambient-bg">
            {stars.map((s) => (
                <motion.div
                    key={s.id}
                    className="star"
                    style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.size, height: s.size }}
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: s.duration, repeat: Infinity, delay: s.delay }}
                />
            ))}
            <svg className="lib-wave" viewBox="0 0 1440 320" preserveAspectRatio="none">
                <motion.path
                    fill="rgba(200, 149, 108, 0.06)"
                    animate={{
                        d: [
                            'M0,224L48,213.3C96,203,192,181,288,186.7C384,192,480,224,576,234.7C672,245,768,235,864,208C960,181,1056,139,1152,128C1248,117,1344,139,1392,149.3L1440,160L1440,320L0,320Z',
                            'M0,160L48,181.3C96,203,192,245,288,250.7C384,256,480,224,576,208C672,192,768,192,864,202.7C960,213,1056,235,1152,234.7C1248,235,1344,213,1392,202.7L1440,192L1440,320L0,320Z',
                            'M0,224L48,213.3C96,203,192,181,288,186.7C384,192,480,224,576,234.7C672,245,768,235,864,208C960,181,1056,139,1152,128C1248,117,1344,139,1392,149.3L1440,160L1440,320L0,320Z',
                        ],
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

/* ── 1. Scroll Wheel (USED) ── */
function PickerItemBase({
    label, index, y, isActive, onClick,
}: {
    label: string; index: number; y: ReturnType<typeof useSpring>;
    isActive: boolean; onClick: () => void;
}) {
    const itemY = index * ITEM_HEIGHT;
    const distance = useTransform(y, (val: number) => Math.abs(val + itemY - CENTER_OFFSET));
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
                    <div className="picker-fade-top" />
                    <div className="picker-fade-bottom" />
                    <motion.div
                        className="picker-track"
                        style={{ y: springY }}
                        drag="y"
                        dragConstraints={{ top: -(DURATIONS.length - 1) * ITEM_HEIGHT + CENTER_OFFSET, bottom: CENTER_OFFSET }}
                        dragElastic={0.1}
                        onDragEnd={snap}
                    >
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

/* ── 2. Radial Dial ── */
function RadialDialPicker() {
    const [value, setValue] = useState(10);
    const [dragging, setDragging] = useState(false);
    const dialRef = useRef<HTMLDivElement>(null);
    const RADIUS = 110;

    function angleFromEvent(e: React.MouseEvent | React.TouchEvent) {
        if (!dialRef.current) return 0;
        const rect = dialRef.current.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        let angle = Math.atan2(clientY - cy, clientX - cx) * (180 / Math.PI) + 90;
        if (angle < 0) angle += 360;
        return angle;
    }

    function angleToMinutes(angle: number): number {
        const frac = angle / 360;
        const raw = Math.round(frac * 60);
        return Math.max(1, Math.min(60, raw));
    }

    function handleInteract(e: React.MouseEvent | React.TouchEvent) {
        const angle = angleFromEvent(e);
        setValue(angleToMinutes(angle));
    }

    const angleDeg = (value / 60) * 360;
    const handleX = RADIUS + RADIUS * Math.sin((angleDeg * Math.PI) / 180);
    const handleY = RADIUS - RADIUS * Math.cos((angleDeg * Math.PI) / 180);

    // SVG arc
    const endX = RADIUS + RADIUS * Math.sin((angleDeg * Math.PI) / 180);
    const endY = RADIUS - RADIUS * Math.cos((angleDeg * Math.PI) / 180);
    const largeArc = angleDeg > 180 ? 1 : 0;
    const arcPath = `M ${RADIUS} 0 A ${RADIUS} ${RADIUS} 0 ${largeArc} 1 ${endX} ${endY}`;

    return (
        <div className="proto-frame proto-dark-center">
            <div className="picker-demo-wrap">
                <p className="picker-demo-label">Duration</p>
                <div
                    ref={dialRef}
                    className="radial-dial"
                    style={{ width: RADIUS * 2, height: RADIUS * 2 }}
                    onMouseDown={(e) => { setDragging(true); handleInteract(e); }}
                    onMouseMove={(e) => dragging && handleInteract(e)}
                    onMouseUp={() => setDragging(false)}
                    onMouseLeave={() => setDragging(false)}
                    onTouchStart={(e) => { setDragging(true); handleInteract(e); }}
                    onTouchMove={(e) => dragging && handleInteract(e)}
                    onTouchEnd={() => setDragging(false)}
                >
                    <svg width={RADIUS * 2} height={RADIUS * 2} className="radial-svg">
                        <circle cx={RADIUS} cy={RADIUS} r={RADIUS - 2} className="radial-track" />
                        <path d={arcPath} className="radial-fill" fill="none" strokeWidth={4} />
                        {/* Tick marks */}
                        {Array.from({ length: 12 }, (_, i) => {
                            const a = (i * 30 * Math.PI) / 180;
                            const x1 = RADIUS + (RADIUS - 10) * Math.sin(a);
                            const y1 = RADIUS - (RADIUS - 10) * Math.cos(a);
                            const x2 = RADIUS + (RADIUS - 2) * Math.sin(a);
                            const y2 = RADIUS - (RADIUS - 2) * Math.cos(a);
                            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} className="radial-tick" />;
                        })}
                    </svg>
                    {/* Handle */}
                    <motion.div
                        className="radial-handle"
                        style={{ left: handleX - 10, top: handleY - 10 }}
                        animate={{ scale: dragging ? 1.3 : 1 }}
                    />
                    {/* Center value */}
                    <div className="radial-center-value">
                        <span className="radial-number">{value}</span>
                        <span className="radial-unit">min</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ── 3. iOS Drum Roller (3D perspective) ── */
function DrumRollerPicker() {
    const [value, setValue] = useState(10);
    const y = useMotionValue(0);
    const springY = useSpring(y, { stiffness: 200, damping: 25 });

    useEffect(() => {
        const idx = DURATIONS.indexOf(value);
        if (idx >= 0) animate(y, -idx * ITEM_HEIGHT + CENTER_OFFSET, { type: 'spring', stiffness: 200, damping: 25 });
    }, [value, y]);

    const snap = useCallback(() => {
        const idx = Math.round((CENTER_OFFSET - y.get()) / ITEM_HEIGHT);
        const ci = Math.max(0, Math.min(DURATIONS.length - 1, idx));
        animate(y, -ci * ITEM_HEIGHT + CENTER_OFFSET, { type: 'spring', stiffness: 200, damping: 25 });
        setValue(DURATIONS[ci]);
    }, [y]);

    return (
        <div className="proto-frame proto-dark-center">
            <div className="picker-demo-wrap">
                <p className="picker-demo-label">Duration</p>
                <div className="drum-picker" style={{ height: CONTAINER_HEIGHT }}>
                    <div className="drum-highlight" />
                    <div className="drum-fade-top" />
                    <div className="drum-fade-bottom" />
                    <motion.div
                        className="drum-track"
                        style={{ y: springY, perspective: 300 }}
                        drag="y"
                        dragConstraints={{ top: -(DURATIONS.length - 1) * ITEM_HEIGHT + CENTER_OFFSET, bottom: CENTER_OFFSET }}
                        dragElastic={0.08}
                        onDragEnd={snap}
                    >
                        {DURATIONS.map((d, i) => (
                            <DrumItem key={d} label={`${d} min`} index={i} y={springY} isActive={d === value} onClick={() => setValue(d)} />
                        ))}
                    </motion.div>
                </div>
                <p className="picker-demo-value">{value} minutes</p>
            </div>
        </div>
    );
}

function DrumItem({
    label, index, y, isActive, onClick,
}: {
    label: string; index: number; y: ReturnType<typeof useSpring>;
    isActive: boolean; onClick: () => void;
}) {
    const itemY = index * ITEM_HEIGHT;
    const distance = useTransform(y, (val: number) => (val + itemY - CENTER_OFFSET) / ITEM_HEIGHT);
    const rotateX = useTransform(distance, [-3, 0, 3], [60, 0, -60]);
    const opacity = useTransform(distance, [-2, -1, 0, 1, 2], [0, 0.4, 1, 0.4, 0]);
    const scale = useTransform(distance, [-2, 0, 2], [0.8, 1, 0.8]);

    return (
        <motion.div
            className={`drum-item ${isActive ? 'active' : ''}`}
            style={{ height: ITEM_HEIGHT, rotateX, opacity, scale, transformOrigin: 'center center' }}
            onClick={onClick}
        >
            {label}
        </motion.div>
    );
}

/* ── 4. Grid Tap Selector ── */
function GridTapPicker() {
    const [value, setValue] = useState(10);

    return (
        <div className="proto-frame proto-dark-center">
            <div className="picker-demo-wrap">
                <p className="picker-demo-label">Duration</p>
                <div className="grid-picker">
                    {DURATIONS.map((d) => (
                        <motion.button
                            key={d}
                            className={`grid-cell ${value === d ? 'active' : ''}`}
                            onClick={() => setValue(d)}
                            whileTap={{ scale: 0.9 }}
                            animate={value === d ? { scale: [1, 1.08, 1], borderColor: 'rgba(200, 149, 108, 0.6)' } : {}}
                            transition={{ duration: 0.2 }}
                        >
                            <span className="grid-num">{d}</span>
                            <span className="grid-unit">min</span>
                        </motion.button>
                    ))}
                </div>
                <p className="picker-demo-value">{value} minutes</p>
            </div>
        </div>
    );
}

/* ── 5. Stepper with Spring ── */
function StepperPicker() {
    const [idx, setIdx] = useState(DURATIONS.indexOf(10));
    const value = DURATIONS[idx];

    function inc() { setIdx((i) => Math.min(DURATIONS.length - 1, i + 1)); }
    function dec() { setIdx((i) => Math.max(0, i - 1)); }

    return (
        <div className="proto-frame proto-dark-center">
            <div className="picker-demo-wrap">
                <p className="picker-demo-label">Duration</p>
                <div className="stepper-picker">
                    <motion.button className="stepper-btn" onClick={dec} whileTap={{ scale: 0.85 }} disabled={idx === 0}>−</motion.button>
                    <div className="stepper-display">
                        <AnimatePresence mode="wait">
                            <motion.span
                                key={value}
                                className="stepper-value"
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: -20, opacity: 0 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                            >
                                {value}
                            </motion.span>
                        </AnimatePresence>
                        <span className="stepper-unit">min</span>
                    </div>
                    <motion.button className="stepper-btn" onClick={inc} whileTap={{ scale: 0.85 }} disabled={idx === DURATIONS.length - 1}>+</motion.button>
                </div>
                {/* Progress bar */}
                <div className="stepper-bar-track">
                    <motion.div
                        className="stepper-bar-fill"
                        animate={{ width: `${((idx) / (DURATIONS.length - 1)) * 100}%` }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                </div>
            </div>
        </div>
    );
}

/* ─── Category Registry ─── */
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
            { id: 'drum-roller', label: 'iOS Drum Roller', component: <DrumRollerPicker /> },
            { id: 'grid-tap', label: 'Grid Tap', component: <GridTapPicker /> },
            { id: 'stepper', label: 'Stepper', component: <StepperPicker /> },
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

            {/* Category tabs */}
            <div className="style-tabs">
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat.id}
                        className={`style-tab ${activeCat === cat.id ? 'active' : ''}`}
                        onClick={() => selectCategory(cat.id)}
                    >
                        <span>{cat.icon}</span> {cat.label}
                    </button>
                ))}
            </div>

            {/* Variant chips */}
            {category.variants.length > 0 && (
                <div className="variant-chips">
                    {category.variants.map((v) => (
                        <button
                            key={v.id}
                            className={`variant-chip ${activeVariant === v.id ? 'active' : ''}`}
                            onClick={() => setActiveVariant(v.id)}
                        >
                            {v.label}
                            {v.tag && <span className="variant-tag">{v.tag}</span>}
                        </button>
                    ))}
                </div>
            )}

            {/* Preview */}
            <div className="proto-viewport">
                <AnimatePresence mode="wait">
                    {variant ? (
                        <motion.div
                            key={variant.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            style={{ height: '100%' }}
                        >
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
