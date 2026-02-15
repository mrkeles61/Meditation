import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, animate } from 'framer-motion';
import './StylesPage.css';

/* ⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•
   Component Library Registry
   Tag: USED = currently in production
   ⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱• */

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

/* ⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•
   LOGIN VARIANTS
   ⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱• */

function MockForm() {
    return (
        <div className="mock-form">
            <div className="mock-group"><label>Email</label><input type="email" placeholder="you@example.com" readOnly /></div>
            <div className="mock-group"><label>Password</label><input type="password" placeholder="⏱€¢⏱€¢⏱€¢⏱€¢⏱€¢⏱€¢⏱€¢⏱€¢" readOnly /></div>
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

/* ⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•
   DURATION PICKERS
   ⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱• */

const DURATIONS = [1, 2, 3, 5, 10, 15, 20, 25, 30, 45, 60];
const ITEM_HEIGHT = 56;
const VISIBLE_COUNT = 5;
const CENTER_OFFSET = (VISIBLE_COUNT - 1) / 2 * ITEM_HEIGHT;
const CONTAINER_HEIGHT = ITEM_HEIGHT * VISIBLE_COUNT;

/* ⏱”€⏱”€ Scroll Wheel (USED) ⏱”€⏱”€ */
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

/* ⏱”€⏱”€ Clock Face with Suggestion Cards ⏱”€⏱”€ */
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

                {/* Everything inside one SVG ⏱€” no alignment issues */}
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

                    {/* Duration dot buttons ⏱€” rendered as SVG groups */}
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

/* ⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•
   CANDLE MEDITATION TIMER ⏱€” SVG + rAF
   ⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱• */

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

            // ⏱”€⏱”€ Ambient glow ⏱”€⏱”€
            const glowR = 80 + remaining * 60;
            const glowGrad = ctx.createRadialGradient(cx, candleTop - 20, 0, cx, candleTop - 20, glowR);
            glowGrad.addColorStop(0, `rgba(255, 170, 60, ${0.06 * remaining * breathScale})`);
            glowGrad.addColorStop(0.5, `rgba(255, 140, 40, ${0.02 * remaining})`);
            glowGrad.addColorStop(1, 'transparent');
            ctx.fillStyle = glowGrad;
            ctx.fillRect(0, 0, W, H);

            // ⏱”€⏱”€ Candle body ⏱”€⏱”€
            // Wax ⏱€” subtle gradient, slightly rounded top
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

            // ⏱”€⏱”€ Wax pool at top ⏱”€⏱”€
            ctx.beginPath();
            ctx.ellipse(cx, candleTop + 4, CANDLE_W / 2 - 1, 3, 0, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 220, 170, 0.04)';
            ctx.fill();

            // ⏱”€⏱”€ Wick ⏱”€⏱”€
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

            // ⏱”€⏱”€ Flame ⏱”€⏱”€
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

            // ⏱”€⏱”€ Smoke wisps ⏱”€⏱”€
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

            // ⏱”€⏱”€ Base / holder ⏱”€⏱”€
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

/* ⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•
   WEIGHT VISUALIZATION VARIANTS
   ⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱•⏱• */

// Mock weight data ⏱€” 90 days, realistic fluctuation around 97-100 kg
const MOCK_WEIGHTS: { date: string; kg: number }[] = (() => {
    const data: { date: string; kg: number }[] = [];
    const base = 97.5;
    let val = base;
    const start = new Date();
    start.setDate(start.getDate() - 90);
    for (let i = 0; i < 90; i++) {
        const d = new Date(start);
        d.setDate(d.getDate() + i);
        val += (Math.random() - 0.48) * 1.2; // slight upward drift
        val = Math.max(94, Math.min(102, val));
        if (Math.random() > 0.15) { // ~85% logging rate
            data.push({ date: d.toISOString().split('T')[0], kg: +val.toFixed(1) });
        }
    }
    return data;
})();

const W_MIN = Math.min(...MOCK_WEIGHTS.map(w => w.kg));
const W_MAX = Math.max(...MOCK_WEIGHTS.map(w => w.kg));
const W_RANGE = W_MAX - W_MIN || 1;

/* ⏱”€⏱”€ Variant 1: Horizon Chart ⏱”€⏱”€ */
function WeightHorizonChart() {
    const W = 560, H = 280, PAD = 40;
    const plotW = W - PAD * 2, plotH = H - PAD * 2;
    const points = MOCK_WEIGHTS.map((w, i) => ({
        x: PAD + (i / (MOCK_WEIGHTS.length - 1)) * plotW,
        y: PAD + plotH - ((w.kg - W_MIN) / W_RANGE) * plotH,
    }));
    const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
    const areaPath = `${linePath} L${points[points.length - 1].x},${PAD + plotH} L${points[0].x},${PAD + plotH} Z`;

    // Horizon bands
    const bands = [0.25, 0.5, 0.75, 1.0];
    const bandColors = ['rgba(200,149,108,0.04)', 'rgba(200,149,108,0.06)', 'rgba(200,149,108,0.08)', 'rgba(200,149,108,0.12)'];

    return (
        <div className="proto-frame proto-dark-center">
            <div className="wv-wrap">
                <p className="wv-title">Horizon Chart</p>
                <p className="wv-desc">Layered depth bands show where your weight sits relative to your range</p>
                <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="wv-svg">
                    {/* Horizon bands */}
                    {bands.map((b, i) => (
                        <rect key={i} x={PAD} y={PAD + plotH * (1 - b)} width={plotW} height={plotH * 0.25}
                            fill={bandColors[i]} />
                    ))}
                    {/* Grid lines */}
                    {[0, 0.25, 0.5, 0.75, 1].map((f, i) => (
                        <g key={i}>
                            <line x1={PAD} y1={PAD + plotH * (1 - f)} x2={PAD + plotW} y2={PAD + plotH * (1 - f)}
                                stroke="rgba(255,255,255,0.06)" strokeWidth={0.5} />
                            <text x={PAD - 6} y={PAD + plotH * (1 - f) + 3} textAnchor="end"
                                fill="#5a534d" fontSize={9} fontFamily="var(--font-mono)">
                                {(W_MIN + W_RANGE * f).toFixed(0)}
                            </text>
                        </g>
                    ))}
                    {/* Filled area */}
                    <path d={areaPath} fill="url(#horizonGrad)" />
                    {/* Line */}
                    <path d={linePath} fill="none" stroke="var(--accent)" strokeWidth={1.5} />
                    {/* Current value dot */}
                    <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r={4}
                        fill="var(--accent)" />
                    <defs>
                        <linearGradient id="horizonGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="rgba(200,149,108,0.25)" />
                            <stop offset="100%" stopColor="rgba(200,149,108,0)" />
                        </linearGradient>
                    </defs>
                </svg>
                <div className="wv-stat-row">
                    <span className="wv-stat">{MOCK_WEIGHTS[MOCK_WEIGHTS.length - 1].kg} <small>kg now</small></span>
                    <span className="wv-stat-sep" />
                    <span className="wv-stat">{W_MIN.toFixed(1)} ⏱€“ {W_MAX.toFixed(1)} <small>range</small></span>
                </div>
            </div>
        </div>
    );
}

/* ⏱”€⏱”€ Variant 2: Weekly Bar Range ⏱”€⏱”€ */
function WeightWeeklyBars() {
    // Group into weeks
    const weeks: { label: string; min: number; max: number; avg: number }[] = [];
    for (let i = 0; i < MOCK_WEIGHTS.length; i += 7) {
        const chunk = MOCK_WEIGHTS.slice(i, i + 7);
        const vals = chunk.map(c => c.kg);
        const d = new Date(chunk[0].date);
        weeks.push({
            label: `${d.getMonth() + 1}/${d.getDate()}`,
            min: Math.min(...vals),
            max: Math.max(...vals),
            avg: +(vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1),
        });
    }
    const allMin = Math.min(...weeks.map(w => w.min)) - 0.5;
    const allMax = Math.max(...weeks.map(w => w.max)) + 0.5;
    const range = allMax - allMin;
    const W = 560, H = 280, PAD = 40;
    const plotW = W - PAD * 2, plotH = H - PAD * 2;
    const barW = Math.min(24, plotW / weeks.length * 0.5);
    const gap = (plotW - barW * weeks.length) / (weeks.length + 1);

    return (
        <div className="proto-frame proto-dark-center">
            <div className="wv-wrap">
                <p className="wv-title">Weekly Range Bars</p>
                <p className="wv-desc">Each bar shows your weekly min ⏱†’ max, dot marks the average</p>
                <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="wv-svg">
                    {/* Horizontal grid */}
                    {[0, 0.25, 0.5, 0.75, 1].map((f, i) => (
                        <g key={i}>
                            <line x1={PAD} y1={PAD + plotH * (1 - f)} x2={PAD + plotW} y2={PAD + plotH * (1 - f)}
                                stroke="rgba(255,255,255,0.05)" strokeWidth={0.5} />
                            <text x={PAD - 6} y={PAD + plotH * (1 - f) + 3} textAnchor="end"
                                fill="#5a534d" fontSize={9} fontFamily="var(--font-mono)">
                                {(allMin + range * f).toFixed(0)}
                            </text>
                        </g>
                    ))}
                    {weeks.map((w, i) => {
                        const x = PAD + gap + i * (barW + gap);
                        const yTop = PAD + plotH - ((w.max - allMin) / range) * plotH;
                        const yBot = PAD + plotH - ((w.min - allMin) / range) * plotH;
                        const yAvg = PAD + plotH - ((w.avg - allMin) / range) * plotH;
                        const barH = yBot - yTop;
                        return (
                            <g key={i}>
                                {/* Range bar */}
                                <rect x={x} y={yTop} width={barW} height={Math.max(2, barH)}
                                    rx={barW / 2} fill="rgba(200,149,108,0.15)" />
                                {/* Average dot */}
                                <circle cx={x + barW / 2} cy={yAvg} r={3.5}
                                    fill="var(--accent)" />
                                {/* Week label */}
                                <text x={x + barW / 2} y={PAD + plotH + 14} textAnchor="middle"
                                    fill="#5a534d" fontSize={8} fontFamily="var(--font-mono)">
                                    {w.label}
                                </text>
                            </g>
                        );
                    })}
                </svg>
            </div>
        </div>
    );
}

/* ⏱”€⏱”€ Variant 3: Dot Strip (Minimalist) ⏱”€⏱”€ */
function WeightDotStrip() {
    const W = 560, H = 240, PAD = 40;
    const plotW = W - PAD * 2, plotH = H - PAD * 2;
    const latest = MOCK_WEIGHTS[MOCK_WEIGHTS.length - 1];
    const oldest = MOCK_WEIGHTS[0];
    const change = +(latest.kg - oldest.kg).toFixed(1);

    return (
        <div className="proto-frame proto-dark-center">
            <div className="wv-wrap">
                <p className="wv-title">Dot Strip</p>
                <p className="wv-desc">Minimal daily dots ⏱€” less data ink, more breathing room</p>
                <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="wv-svg">
                    {/* Center reference line */}
                    {(() => {
                        const avg = MOCK_WEIGHTS.reduce((s, w) => s + w.kg, 0) / MOCK_WEIGHTS.length;
                        const y = PAD + plotH - ((avg - W_MIN) / W_RANGE) * plotH;
                        return (
                            <>
                                <line x1={PAD} y1={y} x2={PAD + plotW} y2={y}
                                    stroke="rgba(200,149,108,0.15)" strokeWidth={1} strokeDasharray="4 4" />
                                <text x={PAD + plotW + 6} y={y + 3}
                                    fill="#5a534d" fontSize={9} fontFamily="var(--font-mono)">
                                    {avg.toFixed(1)}
                                </text>
                            </>
                        );
                    })()}
                    {/* Dots */}
                    {MOCK_WEIGHTS.map((w, i) => {
                        const x = PAD + (i / (MOCK_WEIGHTS.length - 1)) * plotW;
                        const y = PAD + plotH - ((w.kg - W_MIN) / W_RANGE) * plotH;
                        const isLast = i === MOCK_WEIGHTS.length - 1;
                        return (
                            <circle key={i} cx={x} cy={y}
                                r={isLast ? 5 : 2.5}
                                fill={isLast ? 'var(--accent)' : 'rgba(200,149,108,0.35)'} />
                        );
                    })}
                </svg>
                <div className="wv-stat-row">
                    <span className="wv-stat">{latest.kg} <small>kg</small></span>
                    <span className="wv-stat-sep" />
                    <span className={`wv-stat ${change > 0 ? 'up' : 'down'}`}>
                        {change > 0 ? '+' : ''}{change} <small>90d</small>
                    </span>
                </div>
            </div>
        </div>
    );
}

/* ⏱”€⏱”€ Variant 4: Rolling Ribbon ⏱”€⏱”€ */
function WeightRollingRibbon() {
    const W = 560, H = 280, PAD = 40;
    const plotW = W - PAD * 2, plotH = H - PAD * 2;

    // Compute 7-day rolling average
    const rolling: { x: number; y: number; raw: number; avg: number }[] = [];
    for (let i = 0; i < MOCK_WEIGHTS.length; i++) {
        const window = MOCK_WEIGHTS.slice(Math.max(0, i - 6), i + 1);
        const avg = window.reduce((s, w) => s + w.kg, 0) / window.length;
        rolling.push({
            x: PAD + (i / (MOCK_WEIGHTS.length - 1)) * plotW,
            y: PAD + plotH - ((avg - W_MIN) / W_RANGE) * plotH,
            raw: MOCK_WEIGHTS[i].kg,
            avg: +avg.toFixed(1),
        });
    }

    // Build ribbon (⏱±0.5 kg around rolling average)
    const bandHalf = (0.8 / W_RANGE) * plotH;
    const upperPath = rolling.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y - bandHalf}`).join(' ');
    const lowerPath = [...rolling].reverse().map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y + bandHalf}`).join(' ');
    const ribbonPath = `${upperPath} L${rolling[rolling.length - 1].x},${rolling[rolling.length - 1].y + bandHalf} ${lowerPath.replace('M', 'L')} Z`;
    const avgLine = rolling.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');

    // Raw data dots
    const rawDots = MOCK_WEIGHTS.map((w, i) => ({
        x: PAD + (i / (MOCK_WEIGHTS.length - 1)) * plotW,
        y: PAD + plotH - ((w.kg - W_MIN) / W_RANGE) * plotH,
    }));

    return (
        <div className="proto-frame proto-dark-center">
            <div className="wv-wrap">
                <p className="wv-title">Rolling Ribbon</p>
                <p className="wv-desc">7-day rolling average with a confidence band ⏱€” raw entries as faint dots</p>
                <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="wv-svg">
                    {/* Grid */}
                    {[0, 0.5, 1].map((f, i) => (
                        <g key={i}>
                            <line x1={PAD} y1={PAD + plotH * (1 - f)} x2={PAD + plotW} y2={PAD + plotH * (1 - f)}
                                stroke="rgba(255,255,255,0.05)" strokeWidth={0.5} />
                            <text x={PAD - 6} y={PAD + plotH * (1 - f) + 3} textAnchor="end"
                                fill="#5a534d" fontSize={9} fontFamily="var(--font-mono)">
                                {(W_MIN + W_RANGE * f).toFixed(0)}
                            </text>
                        </g>
                    ))}
                    {/* Ribbon */}
                    <path d={ribbonPath} fill="rgba(200,149,108,0.08)" />
                    {/* Rolling avg line */}
                    <path d={avgLine} fill="none" stroke="var(--accent)" strokeWidth={2} />
                    {/* Raw dots */}
                    {rawDots.map((p, i) => (
                        <circle key={i} cx={p.x} cy={p.y} r={1.5} fill="rgba(200,149,108,0.25)" />
                    ))}
                    {/* Latest */}
                    <circle cx={rolling[rolling.length - 1].x} cy={rolling[rolling.length - 1].y} r={5}
                        fill="var(--accent)" />
                </svg>
                <div className="wv-stat-row">
                    <span className="wv-stat">{rolling[rolling.length - 1].avg} <small>avg kg</small></span>
                    <span className="wv-stat-sep" />
                    <span className="wv-stat">{MOCK_WEIGHTS[MOCK_WEIGHTS.length - 1].kg} <small>today</small></span>
                </div>
            </div>
        </div>
    );
}

/* ⏱”€⏱”€ Variant 5: Calendar Heatmap Grid ⏱”€⏱”€ */
function WeightCalendarHeatmap() {
    // Build 13-week grid (91 days)
    const today = new Date();
    const grid: { date: string; kg: number | null; weekCol: number; dayRow: number }[] = [];
    const weightMap = new Map(MOCK_WEIGHTS.map(w => [w.date, w.kg]));

    for (let i = 90; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const key = d.toISOString().split('T')[0];
        const dayOfWeek = d.getDay(); // 0=Sun
        const weekCol = Math.floor((90 - i) / 7);
        grid.push({ date: key, kg: weightMap.get(key) ?? null, weekCol, dayRow: dayOfWeek });
    }

    const cellSize = 24, cellGap = 3;
    const totalWeeks = 13;
    const svgW = totalWeeks * (cellSize + cellGap) + 40;
    const svgH = 7 * (cellSize + cellGap) + 50;
    const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    function getColor(kg: number | null): string {
        if (kg === null) return 'rgba(255,255,255,0.03)';
        const t = (kg - W_MIN) / W_RANGE; // 0 = lightest, 1 = heaviest
        const alpha = 0.15 + t * 0.55;
        return `rgba(200,149,108,${alpha.toFixed(2)})`;
    }

    return (
        <div className="proto-frame proto-dark-center">
            <div className="wv-wrap">
                <p className="wv-title">Calendar Heatmap</p>
                <p className="wv-desc">GitHub-style grid ⏱€” darker = heavier, blank = no log</p>
                <svg width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`} className="wv-svg">
                    {/* Day labels */}
                    {dayLabels.map((label, i) => (
                        <text key={i} x={14} y={40 + i * (cellSize + cellGap) + cellSize / 2 + 3}
                            textAnchor="middle" fill="#5a534d" fontSize={9} fontFamily="var(--font-mono)">
                            {label}
                        </text>
                    ))}
                    {/* Cells */}
                    {grid.map((cell, i) => (
                        <rect key={i}
                            x={30 + cell.weekCol * (cellSize + cellGap)}
                            y={32 + cell.dayRow * (cellSize + cellGap)}
                            width={cellSize} height={cellSize}
                            rx={4}
                            fill={getColor(cell.kg)} />
                    ))}
                    {/* Legend */}
                    <text x={30} y={svgH - 4} fill="#5a534d" fontSize={8} fontFamily="var(--font-mono)">lighter</text>
                    {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
                        <rect key={i} x={70 + i * 16} y={svgH - 14} width={12} height={12} rx={2}
                            fill={`rgba(200,149,108,${(0.15 + t * 0.55).toFixed(2)})`} />
                    ))}
                    <text x={155} y={svgH - 4} fill="#5a534d" fontSize={8} fontFamily="var(--font-mono)">heavier</text>
                </svg>
            </div>
        </div>
    );
}

/* ⏱”€⏱”€ Variant 6: Smoothed Trend Line with Subtle Annotations ⏱”€⏱”€ */
function WeightSmoothedTrend() {
    const W = 560, H = 280, PAD = 40;
    const plotW = W - PAD * 2, plotH = H - PAD * 2;

    // 7-day rolling average
    const smoothed = MOCK_WEIGHTS.map((w, i) => {
        const win = MOCK_WEIGHTS.slice(Math.max(0, i - 6), i + 1);
        return { ...w, avg: +(win.reduce((s, v) => s + v.kg, 0) / win.length).toFixed(1) };
    });

    const avgMin = Math.min(...smoothed.map(s => s.avg));
    const avgMax = Math.max(...smoothed.map(s => s.avg));
    const range = avgMax - avgMin || 1;

    const toX = (i: number) => PAD + (i / (smoothed.length - 1)) * plotW;
    const toY = (val: number) => PAD + plotH - ((val - avgMin) / range) * plotH;

    const avgPath = smoothed.map((s, i) => `${i === 0 ? 'M' : 'L'}${toX(i)},${toY(s.avg)}`).join(' ');

    // Annotate weekly values (every 7th point)
    const annotations = smoothed.filter((_, i) => i % 7 === 0 || i === smoothed.length - 1);

    return (
        <div className="proto-frame proto-dark-center">
            <div className="wv-wrap">
                <p className="wv-title">Smoothed Trend</p>
                <p className="wv-desc">7-day average with weekly value labels ⏱€” daily noise filtered out</p>
                <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="wv-svg">
                    {/* Subtle grid */}
                    {[0, 0.5, 1].map((f, i) => (
                        <g key={i}>
                            <line x1={PAD} y1={PAD + plotH * (1 - f)} x2={PAD + plotW} y2={PAD + plotH * (1 - f)}
                                stroke="rgba(255,255,255,0.04)" strokeWidth={0.5} />
                            <text x={PAD - 6} y={PAD + plotH * (1 - f) + 3} textAnchor="end"
                                fill="#3d3832" fontSize={9} fontFamily="var(--font-mono)">
                                {(avgMin + range * f).toFixed(1)}
                            </text>
                        </g>
                    ))}
                    {/* Raw dots ⏱€” very faint */}
                    {MOCK_WEIGHTS.map((w, i) => (
                        <circle key={i} cx={toX(i)} cy={toY(w.kg)} r={1.5}
                            fill="rgba(200,149,108,0.12)" />
                    ))}
                    {/* Smoothed line */}
                    <path d={avgPath} fill="none" stroke="var(--accent)" strokeWidth={2} />
                    {/* Weekly annotations ⏱€” subtle */}
                    {annotations.map((s, i) => {
                        const idx = MOCK_WEIGHTS.indexOf(s);
                        const x = toX(idx);
                        const y = toY(s.avg);
                        return (
                            <g key={i}>
                                <circle cx={x} cy={y} r={3} fill="var(--accent)" />
                                <text x={x} y={y - 10} textAnchor="middle"
                                    fill="rgba(200,149,108,0.5)" fontSize={8} fontFamily="var(--font-mono)">
                                    {s.avg}
                                </text>
                            </g>
                        );
                    })}
                </svg>
                <div className="wv-stat-row">
                    <span className="wv-stat">{smoothed[smoothed.length - 1].avg} <small>avg</small></span>
                    <span className="wv-stat-sep" />
                    <span className="wv-stat">{(smoothed[smoothed.length - 1].avg - smoothed[0].avg) > 0 ? '+' : ''}{(smoothed[smoothed.length - 1].avg - smoothed[0].avg).toFixed(1)} <small>trend</small></span>
                </div>
            </div>
        </div>
    );
}

/* ⏱”€⏱”€ Variant 7: Candlestick (Weekly OHLC) ⏱”€⏱”€ */
function WeightCandlestick() {
    const weeks: { label: string; open: number; close: number; high: number; low: number }[] = [];
    for (let i = 0; i < MOCK_WEIGHTS.length; i += 7) {
        const chunk = MOCK_WEIGHTS.slice(i, i + 7);
        if (chunk.length === 0) continue;
        const d = new Date(chunk[0].date);
        weeks.push({
            label: `${d.getMonth() + 1}/${d.getDate()}`,
            open: chunk[0].kg,
            close: chunk[chunk.length - 1].kg,
            high: Math.max(...chunk.map(c => c.kg)),
            low: Math.min(...chunk.map(c => c.kg)),
        });
    }

    const allMin = Math.min(...weeks.map(w => w.low)) - 0.5;
    const allMax = Math.max(...weeks.map(w => w.high)) + 0.5;
    const range = allMax - allMin;
    const W = 560, H = 280, PAD = 40;
    const plotW = W - PAD * 2, plotH = H - PAD * 2;
    const candleW = Math.min(18, plotW / weeks.length * 0.4);
    const gap = (plotW - candleW * weeks.length) / (weeks.length + 1);
    const toY = (v: number) => PAD + plotH - ((v - allMin) / range) * plotH;

    return (
        <div className="proto-frame proto-dark-center">
            <div className="wv-wrap">
                <p className="wv-title">Candlestick</p>
                <p className="wv-desc">Weekly open⏱†’close candles with high/low wicks ⏱€” gain weeks colored warm</p>
                <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="wv-svg">
                    {[0, 0.5, 1].map((f, i) => (
                        <g key={i}>
                            <line x1={PAD} y1={PAD + plotH * (1 - f)} x2={PAD + plotW} y2={PAD + plotH * (1 - f)}
                                stroke="rgba(255,255,255,0.04)" strokeWidth={0.5} />
                            <text x={PAD - 6} y={PAD + plotH * (1 - f) + 3} textAnchor="end"
                                fill="#3d3832" fontSize={9} fontFamily="var(--font-mono)">
                                {(allMin + range * f).toFixed(0)}
                            </text>
                        </g>
                    ))}
                    {weeks.map((w, i) => {
                        const x = PAD + gap + i * (candleW + gap);
                        const cx = x + candleW / 2;
                        const gained = w.close > w.open;
                        const bodyTop = toY(Math.max(w.open, w.close));
                        const bodyBot = toY(Math.min(w.open, w.close));
                        const bodyH = Math.max(2, bodyBot - bodyTop);
                        const color = gained ? 'rgba(239,83,80,0.6)' : 'rgba(76,175,80,0.6)';
                        return (
                            <g key={i}>
                                {/* Wick */}
                                <line x1={cx} y1={toY(w.high)} x2={cx} y2={toY(w.low)}
                                    stroke={color} strokeWidth={1} />
                                {/* Body */}
                                <rect x={x} y={bodyTop} width={candleW} height={bodyH}
                                    rx={2} fill={color} />
                                {/* Close value ⏱€” subtle */}
                                <text x={cx} y={bodyTop - 5} textAnchor="middle"
                                    fill="rgba(255,255,255,0.2)" fontSize={7} fontFamily="var(--font-mono)">
                                    {w.close.toFixed(1)}
                                </text>
                                {/* Week label */}
                                <text x={cx} y={PAD + plotH + 14} textAnchor="middle"
                                    fill="#3d3832" fontSize={7} fontFamily="var(--font-mono)">
                                    {w.label}
                                </text>
                            </g>
                        );
                    })}
                </svg>
            </div>
        </div>
    );
}

/* ⏱”€⏱”€ Variant 8: Progress Gauge (Radial) ⏱”€⏱”€ */
function WeightProgressGauge() {
    const current = MOCK_WEIGHTS[MOCK_WEIGHTS.length - 1].kg;
    const start = MOCK_WEIGHTS[0].kg;
    const goal = 95; // Example goal weight
    const totalToLose = start - goal;
    const lost = start - current;
    const progress = totalToLose > 0 ? Math.max(0, Math.min(1, lost / totalToLose)) : 0;
    const R = 90, CX = 140, CY = 130;
    const startAngle = -210 * (Math.PI / 180);
    const endAngle = 30 * (Math.PI / 180);
    const arcLength = endAngle - startAngle;
    const filledAngle = startAngle + arcLength * progress;

    function polarToXY(angle: number, r: number) {
        return { x: CX + r * Math.cos(angle), y: CY + r * Math.sin(angle) };
    }

    const bgStart = polarToXY(startAngle, R);
    const bgEnd = polarToXY(endAngle, R);
    const fillEnd = polarToXY(filledAngle, R);
    const largeArc = arcLength > Math.PI ? 1 : 0;
    const filledLarge = (filledAngle - startAngle) > Math.PI ? 1 : 0;

    return (
        <div className="proto-frame proto-dark-center">
            <div className="wv-wrap">
                <p className="wv-title">Progress Gauge</p>
                <p className="wv-desc">Radial progress toward your goal weight ⏱€” numbers shown contextually</p>
                <svg width={280} height={200} viewBox="0 0 280 200" className="wv-svg">
                    {/* Background arc */}
                    <path d={`M${bgStart.x},${bgStart.y} A${R},${R} 0 ${largeArc} 1 ${bgEnd.x},${bgEnd.y}`}
                        fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={14} strokeLinecap="round" />
                    {/* Filled arc */}
                    {progress > 0.01 && (
                        <path d={`M${bgStart.x},${bgStart.y} A${R},${R} 0 ${filledLarge} 1 ${fillEnd.x},${fillEnd.y}`}
                            fill="none" stroke="var(--accent)" strokeWidth={14} strokeLinecap="round" />
                    )}
                    {/* Center value */}
                    <text x={CX} y={CY - 8} textAnchor="middle"
                        fill="var(--text-primary)" fontSize={28} fontFamily="var(--font-mono)" fontWeight="bold">
                        {current.toFixed(1)}
                    </text>
                    <text x={CX} y={CY + 10} textAnchor="middle"
                        fill="var(--text-muted)" fontSize={11} fontFamily="var(--font-mono)">
                        kg
                    </text>
                    {/* Start label */}
                    <text x={bgStart.x - 8} y={bgStart.y + 16} textAnchor="middle"
                        fill="#3d3832" fontSize={9} fontFamily="var(--font-mono)">
                        {start.toFixed(0)}
                    </text>
                    {/* Goal label */}
                    <text x={bgEnd.x + 8} y={bgEnd.y + 16} textAnchor="middle"
                        fill="rgba(76,175,80,0.6)" fontSize={9} fontFamily="var(--font-mono)">
                        {goal}
                    </text>
                    {/* Progress percent */}
                    <text x={CX} y={CY + 32} textAnchor="middle"
                        fill="rgba(200,149,108,0.4)" fontSize={10} fontFamily="var(--font-mono)">
                        {(progress * 100).toFixed(0)}% to goal
                    </text>
                </svg>
            </div>
        </div>
    );
}

/* ⏱”€⏱”€ Variant 9: Monthly Summary Bars ⏱”€⏱”€ */
function WeightMonthlySummary() {
    // Group by month
    const monthMap = new Map<string, number[]>();
    for (const w of MOCK_WEIGHTS) {
        const d = new Date(w.date);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        if (!monthMap.has(key)) monthMap.set(key, []);
        monthMap.get(key)!.push(w.kg);
    }
    const months = Array.from(monthMap.entries()).map(([key, vals]) => {
        const [, m] = key.split('-');
        const avg = +(vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
        const monthNames = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return { label: monthNames[parseInt(m)], avg, count: vals.length };
    });
    const minAvg = Math.min(...months.map(m => m.avg)) - 1;
    const maxAvg = Math.max(...months.map(m => m.avg)) + 1;
    const range = maxAvg - minAvg;

    const W = 400, H = 240, PAD = 40;
    const plotW = W - PAD * 2, plotH = H - PAD * 2;
    const barW = Math.min(40, plotW / months.length * 0.6);
    const gap = (plotW - barW * months.length) / (months.length + 1);

    return (
        <div className="proto-frame proto-dark-center">
            <div className="wv-wrap">
                <p className="wv-title">Monthly Summary</p>
                <p className="wv-desc">Monthly average bars ⏱€” each bar shows the month's mean weight</p>
                <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="wv-svg">
                    {[0, 0.5, 1].map((f, i) => (
                        <g key={i}>
                            <line x1={PAD} y1={PAD + plotH * (1 - f)} x2={PAD + plotW} y2={PAD + plotH * (1 - f)}
                                stroke="rgba(255,255,255,0.04)" strokeWidth={0.5} />
                            <text x={PAD - 6} y={PAD + plotH * (1 - f) + 3} textAnchor="end"
                                fill="#3d3832" fontSize={9} fontFamily="var(--font-mono)">
                                {(minAvg + range * f).toFixed(0)}
                            </text>
                        </g>
                    ))}
                    {months.map((m, i) => {
                        const x = PAD + gap + i * (barW + gap);
                        const barH = ((m.avg - minAvg) / range) * plotH;
                        const y = PAD + plotH - barH;
                        return (
                            <g key={i}>
                                <rect x={x} y={y} width={barW} height={barH}
                                    rx={4} fill="rgba(200,149,108,0.20)" />
                                {/* Value label ⏱€” subtle above bar */}
                                <text x={x + barW / 2} y={y - 6} textAnchor="middle"
                                    fill="rgba(200,149,108,0.45)" fontSize={9} fontFamily="var(--font-mono)" fontWeight="600">
                                    {m.avg}
                                </text>
                                {/* Month label */}
                                <text x={x + barW / 2} y={PAD + plotH + 14} textAnchor="middle"
                                    fill="#3d3832" fontSize={9} fontFamily="var(--font-mono)">
                                    {m.label}
                                </text>
                                {/* Entry count ⏱€” very subtle */}
                                <text x={x + barW / 2} y={PAD + plotH + 24} textAnchor="middle"
                                    fill="rgba(255,255,255,0.12)" fontSize={7} fontFamily="var(--font-mono)">
                                    {m.count}d
                                </text>
                            </g>
                        );
                    })}
                </svg>
            </div>
        </div>
    );
}

/* ⏱”€⏱”€ Variant 10: Stepped Area with Key Annotations ⏱”€⏱”€ */
function WeightSteppedArea() {
    const W = 560, H = 280, PAD = 40;
    const plotW = W - PAD * 2, plotH = H - PAD * 2;
    const toX = (i: number) => PAD + (i / (MOCK_WEIGHTS.length - 1)) * plotW;
    const toY = (v: number) => PAD + plotH - ((v - W_MIN) / W_RANGE) * plotH;

    // Build stepped path
    let steppedLine = '';
    let steppedArea = '';
    MOCK_WEIGHTS.forEach((w, i) => {
        const x = toX(i);
        const y = toY(w.kg);
        if (i === 0) {
            steppedLine = `M${x},${y}`;
            steppedArea = `M${x},${y}`;
        } else {
            steppedLine += ` H${x} V${y}`;
            steppedArea += ` H${x} V${y}`;
        }
    });
    steppedArea += ` V${PAD + plotH} H${PAD} Z`;

    // Find notable points
    const minEntry = MOCK_WEIGHTS.reduce((a, b) => a.kg < b.kg ? a : b);
    const maxEntry = MOCK_WEIGHTS.reduce((a, b) => a.kg > b.kg ? a : b);
    const first = MOCK_WEIGHTS[0];
    const last = MOCK_WEIGHTS[MOCK_WEIGHTS.length - 1];

    const annotations = [
        { entry: first, label: 'Start', idx: 0 },
        { entry: minEntry, label: 'Low', idx: MOCK_WEIGHTS.indexOf(minEntry) },
        { entry: maxEntry, label: 'Peak', idx: MOCK_WEIGHTS.indexOf(maxEntry) },
        { entry: last, label: 'Now', idx: MOCK_WEIGHTS.length - 1 },
    ];

    return (
        <div className="proto-frame proto-dark-center">
            <div className="wv-wrap">
                <p className="wv-title">Stepped Area</p>
                <p className="wv-desc">Stair-step chart ⏱€” key milestones annotated, area fill for visual weight</p>
                <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="wv-svg">
                    {/* Grid */}
                    {[0, 0.5, 1].map((f, i) => (
                        <g key={i}>
                            <line x1={PAD} y1={PAD + plotH * (1 - f)} x2={PAD + plotW} y2={PAD + plotH * (1 - f)}
                                stroke="rgba(255,255,255,0.04)" strokeWidth={0.5} />
                            <text x={PAD - 6} y={PAD + plotH * (1 - f) + 3} textAnchor="end"
                                fill="#3d3832" fontSize={9} fontFamily="var(--font-mono)">
                                {(W_MIN + W_RANGE * f).toFixed(0)}
                            </text>
                        </g>
                    ))}
                    {/* Area */}
                    <path d={steppedArea} fill="rgba(200,149,108,0.06)" />
                    {/* Line */}
                    <path d={steppedLine} fill="none" stroke="var(--accent)" strokeWidth={1.5} />
                    {/* Key annotations */}
                    {annotations.map((a, i) => {
                        const x = toX(a.idx);
                        const y = toY(a.entry.kg);
                        const above = a.label === 'Peak' || a.label === 'Start';
                        return (
                            <g key={i}>
                                <circle cx={x} cy={y} r={4} fill="var(--accent)" />
                                <text x={x} y={above ? y - 14 : y + 18} textAnchor="middle"
                                    fill="rgba(200,149,108,0.5)" fontSize={8} fontFamily="var(--font-mono)">
                                    {a.label}
                                </text>
                                <text x={x} y={above ? y - 5 : y + 27} textAnchor="middle"
                                    fill="rgba(200,149,108,0.35)" fontSize={7} fontFamily="var(--font-mono)">
                                    {a.entry.kg}
                                </text>
                            </g>
                        );
                    })}
                </svg>
            </div>
        </div>
    );
}


/* ===========================================
   CATEGORY REGISTRY
   =========================================== */

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
    {
        id: 'weight-tracker', label: 'Weight Tracker', icon: '⚖',
        variants: [
            { id: 'horizon', label: 'Horizon Chart', tag: 'USED', component: <WeightHorizonChart /> },
            { id: 'weekly-bars', label: 'Weekly Range Bars', component: <WeightWeeklyBars /> },
            { id: 'dot-strip', label: 'Dot Strip', component: <WeightDotStrip /> },
            { id: 'rolling-ribbon', label: 'Rolling Ribbon', component: <WeightRollingRibbon /> },
            { id: 'calendar-heatmap', label: 'Calendar Heatmap', component: <WeightCalendarHeatmap /> },
            { id: 'smoothed-trend', label: 'Smoothed Trend', component: <WeightSmoothedTrend /> },
            { id: 'candlestick', label: 'Candlestick', component: <WeightCandlestick /> },
            { id: 'progress-gauge', label: 'Progress Gauge', component: <WeightProgressGauge /> },
            { id: 'monthly-summary', label: 'Monthly Summary', component: <WeightMonthlySummary /> },
            { id: 'stepped-area', label: 'Stepped Area', component: <WeightSteppedArea /> },
        ],
    },
];

/* ⏱”€⏱”€⏱”€ Page ⏱”€⏱”€⏱”€ */
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
