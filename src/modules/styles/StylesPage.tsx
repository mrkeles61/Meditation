import React, { useState, useEffect, useCallback, useRef } from 'react';
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
    const SIZE = 260;          // total SVG/container size
    const CX = SIZE / 2;      // center x
    const CY = SIZE / 2;      // center y
    const DOT_R = 90;          // radius at which dots sit
    const HAND_R = 58;         // hand length
    const TICK_INNER = 100;    // tick mark inner radius
    const TICK_OUTER = 108;    // tick mark outer radius
    const DOT_SIZE = 28;       // dot button diameter

    // Compute dot positions centered in SVG coordinate space
    const positions = DURATIONS.map((d, i) => {
        const angle = (i / DURATIONS.length) * 360 - 90; // start from top
        const rad = (angle * Math.PI) / 180;
        return { d, angle, cx: CX + DOT_R * Math.cos(rad), cy: CY + DOT_R * Math.sin(rad) };
    });

    // Hand endpoint
    const activeIdx = DURATIONS.indexOf(value);
    const activeAngle = (activeIdx / DURATIONS.length) * 360 - 90;
    const handRad = (activeAngle * Math.PI) / 180;
    const handX = CX + HAND_R * Math.cos(handRad);
    const handY = CY + HAND_R * Math.sin(handRad);

    return (
        <div className="proto-frame proto-dark-center">
            <div className="picker-demo-wrap">
                <p className="picker-demo-label">Set Duration</p>

                {/* Everything inside one SVG — no alignment issues */}
                <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="clock-svg">
                    {/* Outer ring */}
                    <circle cx={CX} cy={CY} r={TICK_OUTER + 8} fill="none" stroke="rgba(200,149,108,0.06)" strokeWidth={1} />

                    {/* 12 subtle tick marks */}
                    {Array.from({ length: 12 }, (_, i) => {
                        const a = (i * 30 - 90) * Math.PI / 180;
                        return <line key={i}
                            x1={CX + TICK_INNER * Math.cos(a)} y1={CY + TICK_INNER * Math.sin(a)}
                            x2={CX + TICK_OUTER * Math.cos(a)} y2={CY + TICK_OUTER * Math.sin(a)}
                            stroke="rgba(200,149,108,0.1)" strokeWidth={1} />;
                    })}

                    {/* Animated hand */}
                    <motion.line
                        x1={CX} y1={CY}
                        x2={handX} y2={handY}
                        stroke="var(--accent)" strokeWidth={2} strokeLinecap="round"
                        initial={false}
                        animate={{ x2: handX, y2: handY }}
                        transition={{ type: 'spring', stiffness: 180, damping: 18 }}
                    />

                    {/* Center hub */}
                    <circle cx={CX} cy={CY} r={5} fill="var(--accent)" />
                    <circle cx={CX} cy={CY} r={2} fill="var(--bg-primary)" />

                    {/* Duration dot buttons — rendered as SVG groups */}
                    {positions.map((p) => {
                        const active = p.d === value;
                        return (
                            <g key={p.d} onClick={() => setValue(p.d)} style={{ cursor: 'pointer' }}>
                                {/* Hit area */}
                                <circle cx={p.cx} cy={p.cy} r={DOT_SIZE / 2 + 4} fill="transparent" />
                                {/* Dot background */}
                                <circle cx={p.cx} cy={p.cy} r={DOT_SIZE / 2}
                                    fill={active ? 'var(--accent)' : 'var(--bg-secondary)'}
                                    stroke={active ? 'var(--accent)' : 'rgba(200,149,108,0.12)'}
                                    strokeWidth={1} />
                                {active && (
                                    <circle cx={p.cx} cy={p.cy} r={DOT_SIZE / 2 + 3}
                                        fill="none" stroke="rgba(200,149,108,0.2)" strokeWidth={1} />
                                )}
                                {/* Label */}
                                <text x={p.cx} y={p.cy} textAnchor="middle" dominantBaseline="central"
                                    fill={active ? 'var(--bg-primary)' : 'var(--text-secondary)'}
                                    fontSize={11} fontWeight={700} fontFamily="var(--font-mono)"
                                    style={{ pointerEvents: 'none' }}>
                                    {p.d}
                                </text>
                            </g>
                        );
                    })}
                </svg>

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
   CANDLE MEDITATION TIMER — SVG + rAF
   ═══════════════════════════════════════════ */

const CANDLE_DEMO_SECONDS = 60;

interface SmokeParticle {
    id: number;
    x: number;
    y: number;
    opacity: number;
    size: number;
    drift: number;
    speed: number;
}

function CandleMeditationTimer() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const rafRef = useRef<number>(0);
    const startRef = useRef<number>(0);
    const smokeRef = useRef<SmokeParticle[]>([]);
    const smokeIdRef = useRef(0);
    const [breathing, setBreathing] = useState<'inhale' | 'exhale'>('inhale');

    // Breathing cycle: 4s inhale, 4s exhale
    useEffect(() => {
        const cycle = setInterval(() => {
            setBreathing((b) => b === 'inhale' ? 'exhale' : 'inhale');
        }, 4000);
        return () => clearInterval(cycle);
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d')!;
        const W = 300;
        const H = 500;
        canvas.width = W * 2;  // retina
        canvas.height = H * 2;
        ctx.scale(2, 2);

        // Candle geometry
        const CANDLE_W = 36;
        const CANDLE_MAX_H = 220;
        const CANDLE_MIN_H = 30;
        const CANDLE_X = W / 2 - CANDLE_W / 2;
        const CANDLE_BOTTOM = H - 40;
        const WICK_H = 10;

        startRef.current = performance.now();

        function getProgress(now: number) {
            const elapsed = (now - startRef.current) / 1000;
            return (elapsed % CANDLE_DEMO_SECONDS) / CANDLE_DEMO_SECONDS;
        }

        // Spawn smoke particle
        function spawnSmoke(cx: number, tipY: number) {
            smokeRef.current.push({
                id: smokeIdRef.current++,
                x: cx + (Math.random() - 0.5) * 4,
                y: tipY - 5,
                opacity: 0.15 + Math.random() * 0.1,
                size: 1.5 + Math.random() * 2,
                drift: (Math.random() - 0.5) * 0.3,
                speed: 0.3 + Math.random() * 0.4,
            });
            // Cap at 15 particles
            if (smokeRef.current.length > 15) smokeRef.current.shift();
        }

        function drawFrame(now: number) {
            const progress = getProgress(now);
            const remaining = 1 - progress;
            ctx.clearRect(0, 0, W, H);

            const candleH = CANDLE_MIN_H + remaining * (CANDLE_MAX_H - CANDLE_MIN_H);
            const candleTop = CANDLE_BOTTOM - candleH;
            const cx = W / 2;

            // Breathing sine wave (continuous, not binary)
            const breathTime = (now / 1000) % 8;
            const breathPhase = Math.sin((breathTime / 8) * Math.PI * 2); // -1 to 1
            const breathScale = 0.7 + (breathPhase + 1) * 0.3; // 0.7 to 1.3

            // ── Ambient glow ──
            const glowR = 80 + remaining * 60;
            const glowGrad = ctx.createRadialGradient(cx, candleTop - 20, 0, cx, candleTop - 20, glowR);
            glowGrad.addColorStop(0, `rgba(255, 170, 60, ${0.06 * remaining * breathScale})`);
            glowGrad.addColorStop(0.5, `rgba(255, 140, 40, ${0.02 * remaining})`);
            glowGrad.addColorStop(1, 'transparent');
            ctx.fillStyle = glowGrad;
            ctx.fillRect(0, 0, W, H);

            // ── Candle body ──
            // Wax — subtle gradient, slightly rounded top
            const waxGrad = ctx.createLinearGradient(cx, candleTop, cx, CANDLE_BOTTOM);
            waxGrad.addColorStop(0, 'rgba(235, 220, 195, 0.10)');
            waxGrad.addColorStop(0.3, 'rgba(225, 208, 180, 0.08)');
            waxGrad.addColorStop(1, 'rgba(200, 180, 155, 0.05)');
            ctx.fillStyle = waxGrad;

            // Rounded top path (wax pool depression)
            ctx.beginPath();
            const poolDepth = 3;
            ctx.moveTo(CANDLE_X, candleTop + 4);
            // Concave top surface
            ctx.quadraticCurveTo(cx, candleTop + poolDepth + 4, CANDLE_X + CANDLE_W, candleTop + 4);
            // Right edge
            ctx.lineTo(CANDLE_X + CANDLE_W, CANDLE_BOTTOM);
            // Rounded bottom
            ctx.quadraticCurveTo(CANDLE_X + CANDLE_W, CANDLE_BOTTOM + 3, CANDLE_X + CANDLE_W - 2, CANDLE_BOTTOM + 3);
            ctx.lineTo(CANDLE_X + 2, CANDLE_BOTTOM + 3);
            ctx.quadraticCurveTo(CANDLE_X, CANDLE_BOTTOM + 3, CANDLE_X, CANDLE_BOTTOM);
            ctx.closePath();
            ctx.fill();

            // Wax edge highlight
            ctx.strokeStyle = 'rgba(200, 180, 155, 0.06)';
            ctx.lineWidth = 0.5;
            ctx.stroke();

            // ── Wax pool at top ──
            ctx.beginPath();
            ctx.ellipse(cx, candleTop + 4, CANDLE_W / 2 - 1, 3, 0, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 220, 170, 0.04)';
            ctx.fill();

            // ── Wick ──
            const wickTop = candleTop + 2 - WICK_H;
            ctx.beginPath();
            ctx.moveTo(cx - 0.7, candleTop + 4);
            ctx.lineTo(cx - 0.3, wickTop);
            ctx.lineTo(cx + 0.3, wickTop);
            ctx.lineTo(cx + 0.7, candleTop + 4);
            ctx.fillStyle = 'rgba(80, 60, 40, 0.6)';
            ctx.fill();

            // Wick ember glow
            ctx.beginPath();
            ctx.arc(cx, wickTop + 1, 1.5, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 200, 100, ${0.4 * remaining})`;
            ctx.fill();

            // ── Flame ──
            const flameTipY = wickTop;
            const flameBaseY = wickTop + 2;
            const flameH = (25 + remaining * 20) * breathScale;
            const flameW = (6 + remaining * 3) * (1.1 - breathScale * 0.15);

            // Subtle random jitter
            const jitterX = Math.sin(now * 0.005) * 0.8 + Math.sin(now * 0.013) * 0.4;
            const jitterY = Math.sin(now * 0.007) * 0.3;
            const fx = cx + jitterX;
            const fy = flameBaseY + jitterY;

            // Layer 3: Outer halo (very soft)
            const outerGrad = ctx.createRadialGradient(fx, fy - flameH * 0.3, 0, fx, fy - flameH * 0.3, flameH * 0.7);
            outerGrad.addColorStop(0, `rgba(255, 100, 20, ${0.08 * remaining})`);
            outerGrad.addColorStop(1, 'transparent');
            ctx.fillStyle = outerGrad;
            ctx.beginPath();
            ctx.ellipse(fx, fy - flameH * 0.3, flameW * 2, flameH * 0.7, 0, 0, Math.PI * 2);
            ctx.fill();

            // Layer 2: Main flame body (orange teardrop)
            ctx.beginPath();
            ctx.moveTo(fx, fy - flameH);  // tip
            ctx.bezierCurveTo(
                fx - flameW * 0.4, fy - flameH * 0.6,  // left control
                fx - flameW, fy - flameH * 0.15,         // left bulge
                fx, fy                                     // base
            );
            ctx.bezierCurveTo(
                fx + flameW, fy - flameH * 0.15,          // right bulge
                fx + flameW * 0.4, fy - flameH * 0.6,    // right control
                fx, fy - flameH                            // tip
            );
            const bodyGrad = ctx.createLinearGradient(fx, fy, fx, fy - flameH);
            bodyGrad.addColorStop(0, `rgba(255, 140, 30, ${0.55 * remaining})`);
            bodyGrad.addColorStop(0.4, `rgba(255, 180, 60, ${0.4 * remaining})`);
            bodyGrad.addColorStop(0.8, `rgba(255, 210, 100, ${0.15 * remaining})`);
            bodyGrad.addColorStop(1, 'transparent');
            ctx.fillStyle = bodyGrad;
            ctx.fill();

            // Layer 1: Inner core (bright yellow-white)
            const coreH = flameH * 0.5;
            const coreW = flameW * 0.45;
            ctx.beginPath();
            ctx.moveTo(fx, fy - coreH);
            ctx.bezierCurveTo(
                fx - coreW * 0.3, fy - coreH * 0.5,
                fx - coreW, fy - coreH * 0.1,
                fx, fy
            );
            ctx.bezierCurveTo(
                fx + coreW, fy - coreH * 0.1,
                fx + coreW * 0.3, fy - coreH * 0.5,
                fx, fy - coreH
            );
            const coreGrad = ctx.createLinearGradient(fx, fy, fx, fy - coreH);
            coreGrad.addColorStop(0, `rgba(255, 255, 220, ${0.7 * remaining})`);
            coreGrad.addColorStop(0.5, `rgba(255, 240, 180, ${0.4 * remaining})`);
            coreGrad.addColorStop(1, 'transparent');
            ctx.fillStyle = coreGrad;
            ctx.fill();

            // ── Smoke wisps ──
            if (Math.random() < 0.08) spawnSmoke(cx, flameTipY - flameH);

            smokeRef.current = smokeRef.current.filter(p => p.opacity > 0.01);
            for (const p of smokeRef.current) {
                p.y -= p.speed;
                p.x += p.drift + Math.sin(now * 0.003 + p.id) * 0.15;
                p.opacity *= 0.985;
                p.size += 0.02;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(180, 170, 160, ${p.opacity * remaining})`;
                ctx.fill();
            }

            // ── Base / holder ──
            ctx.beginPath();
            ctx.ellipse(cx, CANDLE_BOTTOM + 3, CANDLE_W / 2 + 6, 3, 0, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(200, 180, 155, 0.04)';
            ctx.fill();

            rafRef.current = requestAnimationFrame(drawFrame);
        }

        rafRef.current = requestAnimationFrame(drawFrame);
        return () => cancelAnimationFrame(rafRef.current);
    }, []);

    return (
        <div className="proto-frame proto-dark-center candle-bg">
            <canvas ref={canvasRef} className="candle-canvas" />
            <AnimatePresence mode="wait">
                <motion.p key={breathing} className="candle-breath-guide"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 0.35, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 1.2 }}>
                    {breathing === 'inhale' ? 'breathe in' : 'breathe out'}
                </motion.p>
            </AnimatePresence>
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
