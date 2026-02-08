import { useEffect, useRef, useCallback, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useMeditationStore } from '../store';
import { startAmbient, playChime, type SoundInstance } from '../sounds';
import './SessionScreen.css';

/* ─── Config ─── */
const BREATH_CYCLE = 8; // 4s inhale + 4s exhale
const HOLD_DURATION = 1500; // ms to hold for exit

interface SmokeP {
    x: number; y: number; opacity: number; size: number; drift: number; speed: number; id: number;
}

export function SessionScreen() {
    const { duration, elapsed, selectedSound, showTimer, tick, endSession } = useMeditationStore();
    const intervalRef = useRef<number | null>(null);
    const soundRef = useRef<SoundInstance | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const rafRef = useRef<number>(0);
    const smokeRef = useRef<SmokeP[]>([]);
    const smokeIdRef = useRef(0);
    const startTimeRef = useRef(0);
    const wakeLockRef = useRef<WakeLockSentinel | null>(null);

    // Long-press state
    const [holdProgress, setHoldProgress] = useState(0);
    const holdStartRef = useRef(0);
    const holdRafRef = useRef<number>(0);
    const isHoldingRef = useRef(false);

    const remaining = duration - elapsed;
    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;

    const handleEnd = useCallback(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        soundRef.current?.stop();

        // Haptic feedback (#1)
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);

        // Background notification (#8)
        if (document.hidden && 'Notification' in window && Notification.permission === 'granted') {
            new Notification('Meditation Complete', {
                body: `Your ${Math.round(duration / 60)}-minute session is done.`,
                icon: '/favicon.ico',
            });
        }

        playChime();
        setTimeout(() => endSession(), 1500);
    }, [endSession, duration]);

    // Start audio + timer + wake lock
    useEffect(() => {
        // Audio (#11 — uses new MP3 playback)
        if (selectedSound !== 'silence') {
            soundRef.current = startAmbient(selectedSound);
        }

        // Timer
        intervalRef.current = window.setInterval(() => tick(), 1000);

        // Wake Lock (#2)
        (async () => {
            try {
                if ('wakeLock' in navigator) {
                    wakeLockRef.current = await navigator.wakeLock.request('screen');
                }
            } catch { /* wake lock not supported or denied */ }
        })();

        // Request notification permission (#8)
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            soundRef.current?.stop();
            wakeLockRef.current?.release();
        };
    }, [selectedSound, tick]);

    // Check completion
    useEffect(() => {
        if (elapsed >= duration) handleEnd();
    }, [elapsed, duration, handleEnd]);

    // Long-press handlers (#12)
    function handlePointerDown() {
        isHoldingRef.current = true;
        holdStartRef.current = Date.now();
        setHoldProgress(0);

        function updateProgress() {
            if (!isHoldingRef.current) return;
            const elapsed = Date.now() - holdStartRef.current;
            const progress = Math.min(1, elapsed / HOLD_DURATION);
            setHoldProgress(progress);

            if (progress >= 1) {
                // Completed hold — exit
                isHoldingRef.current = false;
                if (intervalRef.current) clearInterval(intervalRef.current);
                soundRef.current?.stop();
                wakeLockRef.current?.release();
                setTimeout(() => endSession(), 300);
                return;
            }
            holdRafRef.current = requestAnimationFrame(updateProgress);
        }
        holdRafRef.current = requestAnimationFrame(updateProgress);
    }

    function handlePointerUp() {
        isHoldingRef.current = false;
        cancelAnimationFrame(holdRafRef.current);
        setHoldProgress(0);
    }

    // ─── Canvas candle ───
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d')!;
        const dpr = window.devicePixelRatio || 1;
        const W = canvas.clientWidth;
        const H = canvas.clientHeight;
        canvas.width = W * dpr;
        canvas.height = H * dpr;
        ctx.scale(dpr, dpr);

        startTimeRef.current = performance.now();

        const CANDLE_W = 40;
        const CANDLE_MAX_H = Math.min(260, H * 0.45);
        const CANDLE_MIN_H = 30;
        const CANDLE_BOTTOM = H * 0.55 + CANDLE_MAX_H / 2;

        function spawnSmoke(cx: number, tipY: number) {
            smokeRef.current.push({
                id: smokeIdRef.current++,
                x: cx + (Math.random() - 0.5) * 6,
                y: tipY - 4,
                opacity: 0.12 + Math.random() * 0.08,
                size: 1.5 + Math.random() * 2.5,
                drift: (Math.random() - 0.5) * 0.35,
                speed: 0.25 + Math.random() * 0.35,
            });
            if (smokeRef.current.length > 20) smokeRef.current.shift();
        }

        function drawFrame(now: number) {
            const elapsedMs = now - startTimeRef.current;
            const progress = Math.min(1, elapsedMs / (duration * 1000));
            const rem = 1 - progress;

            ctx.clearRect(0, 0, W, H);

            const candleH = CANDLE_MIN_H + rem * (CANDLE_MAX_H - CANDLE_MIN_H);
            const candleTop = CANDLE_BOTTOM - candleH;
            const cx = W / 2;
            const WICK_H = 12;

            // Breathing sine wave
            const cyclePos = ((now / 1000) % BREATH_CYCLE) / BREATH_CYCLE;
            const breathPhase = Math.sin(cyclePos * Math.PI * 2);
            const breathScale = 1 + breathPhase * 0.25;

            // Ambient glow
            const glowR = 100 + rem * 80;
            const glowGrad = ctx.createRadialGradient(cx, candleTop - 30, 0, cx, candleTop - 30, glowR);
            glowGrad.addColorStop(0, `rgba(255, 170, 60, ${0.08 * rem * breathScale})`);
            glowGrad.addColorStop(0.4, `rgba(255, 140, 40, ${0.03 * rem})`);
            glowGrad.addColorStop(1, 'transparent');
            ctx.fillStyle = glowGrad;
            ctx.fillRect(0, 0, W, H);

            // Candle wax body
            const waxGrad = ctx.createLinearGradient(cx, candleTop, cx, CANDLE_BOTTOM);
            waxGrad.addColorStop(0, 'rgba(235, 220, 195, 0.12)');
            waxGrad.addColorStop(0.4, 'rgba(225, 208, 180, 0.09)');
            waxGrad.addColorStop(1, 'rgba(200, 180, 155, 0.05)');
            ctx.fillStyle = waxGrad;

            ctx.beginPath();
            const poolDepth = 4;
            ctx.moveTo(cx - CANDLE_W / 2, candleTop + 5);
            ctx.quadraticCurveTo(cx, candleTop + poolDepth + 5, cx + CANDLE_W / 2, candleTop + 5);
            ctx.lineTo(cx + CANDLE_W / 2, CANDLE_BOTTOM);
            ctx.quadraticCurveTo(cx + CANDLE_W / 2, CANDLE_BOTTOM + 4, cx + CANDLE_W / 2 - 3, CANDLE_BOTTOM + 4);
            ctx.lineTo(cx - CANDLE_W / 2 + 3, CANDLE_BOTTOM + 4);
            ctx.quadraticCurveTo(cx - CANDLE_W / 2, CANDLE_BOTTOM + 4, cx - CANDLE_W / 2, CANDLE_BOTTOM);
            ctx.closePath();
            ctx.fill();

            ctx.strokeStyle = 'rgba(200, 180, 155, 0.06)';
            ctx.lineWidth = 0.5;
            ctx.stroke();

            // Wax pool ellipse
            ctx.beginPath();
            ctx.ellipse(cx, candleTop + 5, CANDLE_W / 2 - 2, 3, 0, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 220, 170, 0.05)';
            ctx.fill();

            // Wick
            const wickTop = candleTop + 3 - WICK_H;
            ctx.beginPath();
            ctx.moveTo(cx - 0.8, candleTop + 5);
            ctx.lineTo(cx - 0.3, wickTop);
            ctx.lineTo(cx + 0.3, wickTop);
            ctx.lineTo(cx + 0.8, candleTop + 5);
            ctx.fillStyle = 'rgba(80, 60, 40, 0.65)';
            ctx.fill();

            // Wick ember
            ctx.beginPath();
            ctx.arc(cx, wickTop + 1.5, 2, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 200, 100, ${0.5 * rem})`;
            ctx.fill();

            // Flame
            const flameH = (35 + rem * 25) * breathScale;
            const flameW = (9 + rem * 4) * (1.15 - breathScale * 0.12);

            const jitterX = Math.sin(now * 0.004) * 1.2 + Math.sin(now * 0.011) * 0.6 + Math.sin(now * 0.023) * 0.3;
            const jitterY = Math.sin(now * 0.006) * 0.5;
            const fx = cx + jitterX;
            const fy = wickTop + 2 + jitterY;

            // Outer halo
            const outerGrad = ctx.createRadialGradient(fx, fy - flameH * 0.35, 0, fx, fy - flameH * 0.35, flameH * 0.8);
            outerGrad.addColorStop(0, `rgba(255, 100, 20, ${0.1 * rem})`);
            outerGrad.addColorStop(1, 'transparent');
            ctx.fillStyle = outerGrad;
            ctx.beginPath();
            ctx.ellipse(fx, fy - flameH * 0.35, flameW * 2.5, flameH * 0.8, 0, 0, Math.PI * 2);
            ctx.fill();

            // Main flame body
            ctx.beginPath();
            ctx.moveTo(fx, fy - flameH);
            ctx.bezierCurveTo(fx - flameW * 0.5, fy - flameH * 0.55, fx - flameW, fy - flameH * 0.15, fx, fy);
            ctx.bezierCurveTo(fx + flameW, fy - flameH * 0.15, fx + flameW * 0.5, fy - flameH * 0.55, fx, fy - flameH);
            const bodyGrad = ctx.createLinearGradient(fx, fy, fx, fy - flameH);
            bodyGrad.addColorStop(0, `rgba(255, 130, 20, ${0.65 * rem})`);
            bodyGrad.addColorStop(0.3, `rgba(255, 180, 50, ${0.5 * rem})`);
            bodyGrad.addColorStop(0.7, `rgba(255, 210, 90, ${0.2 * rem})`);
            bodyGrad.addColorStop(1, 'transparent');
            ctx.fillStyle = bodyGrad;
            ctx.fill();

            // Bright core
            const coreH = flameH * 0.45;
            const coreW = flameW * 0.4;
            ctx.beginPath();
            ctx.moveTo(fx, fy - coreH);
            ctx.bezierCurveTo(fx - coreW * 0.3, fy - coreH * 0.45, fx - coreW, fy - coreH * 0.08, fx, fy);
            ctx.bezierCurveTo(fx + coreW, fy - coreH * 0.08, fx + coreW * 0.3, fy - coreH * 0.45, fx, fy - coreH);
            const coreGrad = ctx.createLinearGradient(fx, fy, fx, fy - coreH);
            coreGrad.addColorStop(0, `rgba(255, 255, 220, ${0.8 * rem})`);
            coreGrad.addColorStop(0.4, `rgba(255, 245, 190, ${0.5 * rem})`);
            coreGrad.addColorStop(1, 'transparent');
            ctx.fillStyle = coreGrad;
            ctx.fill();

            // Smoke wisps
            if (Math.random() < 0.06) spawnSmoke(cx, fy - flameH);
            smokeRef.current = smokeRef.current.filter(p => p.opacity > 0.005);
            for (const p of smokeRef.current) {
                p.y -= p.speed;
                p.x += p.drift + Math.sin(now * 0.002 + p.id) * 0.12;
                p.opacity *= 0.983;
                p.size += 0.025;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(180, 170, 160, ${p.opacity * rem})`;
                ctx.fill();
            }

            // Base holder
            ctx.beginPath();
            ctx.ellipse(cx, CANDLE_BOTTOM + 4, CANDLE_W / 2 + 8, 3.5, 0, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(200, 180, 155, 0.04)';
            ctx.fill();

            rafRef.current = requestAnimationFrame(drawFrame);
        }

        rafRef.current = requestAnimationFrame(drawFrame);
        return () => cancelAnimationFrame(rafRef.current);
    }, [duration]);

    return (
        <div className="session-screen"
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            onPointerCancel={handlePointerUp}>

            <canvas ref={canvasRef} className="session-candle-canvas" />

            {/* Hold-to-exit indicator (#12) */}
            <AnimatePresence>
                {holdProgress > 0 && (
                    <motion.div className="hold-exit-indicator"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <svg width={52} height={52} viewBox="0 0 52 52">
                            <circle cx={26} cy={26} r={22} fill="none"
                                stroke="rgba(200,149,108,0.15)" strokeWidth={2} />
                            <circle cx={26} cy={26} r={22} fill="none"
                                stroke="var(--accent)" strokeWidth={2}
                                strokeDasharray={138.23}
                                strokeDashoffset={138.23 * (1 - holdProgress)}
                                strokeLinecap="round"
                                transform="rotate(-90 26 26)" />
                        </svg>
                        <span className="hold-exit-x">✕</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Optional timer overlay */}
            <AnimatePresence>
                {showTimer && (
                    <motion.div className="session-timer"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        {minutes}:{seconds.toString().padStart(2, '0')}
                    </motion.div>
                )}
            </AnimatePresence>

            <p className="session-hint">hold anywhere to end</p>
        </div>
    );
}
