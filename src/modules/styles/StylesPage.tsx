import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './StylesPage.css';

const STYLES = [
    { id: 'glass', label: '1. Glassmorphism' },
    { id: 'split', label: '2. Split Layout' },
    { id: 'cosmic', label: '3. Cosmic Floating' },
    { id: 'ambient', label: '4. Full-Screen Ambient' },
    { id: 'micro', label: '5. Micro-Animations' },
];

/* ─── Shared mock form ─── */
function MockForm({ accent = 'var(--accent)' }: { accent?: string }) {
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
            <button className="mock-btn" style={{ background: accent }}>
                Sign In
            </button>
            <p className="mock-toggle">Don't have an account? <span>Sign up</span></p>
        </div>
    );
}

/* ─── 1. Glassmorphism ─── */
function GlassLogin() {
    return (
        <div className="proto-frame glass-bg">
            <div className="glass-orb glass-orb-1" />
            <div className="glass-orb glass-orb-2" />
            <div className="glass-card">
                <h2>Welcome Back</h2>
                <p className="glass-sub">Your journey continues</p>
                <MockForm />
            </div>
        </div>
    );
}

/* ─── 2. Split Layout ─── */
function SplitLogin() {
    return (
        <div className="proto-frame split-layout">
            <div className="split-left">
                <div className="split-circle-container">
                    <motion.div
                        className="split-circle"
                        animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.7, 0.3] }}
                        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                    />
                </div>
                <h2 className="split-brand">Ultraviolet<br />Perigee</h2>
                <p className="split-tagline">Find your calm</p>
            </div>
            <div className="split-right">
                <h2>Welcome Back</h2>
                <p className="split-sub">Sign in to save your progress</p>
                <MockForm />
            </div>
        </div>
    );
}

/* ─── 3. Cosmic Floating ─── */
function CosmicLogin() {
    const stars = Array.from({ length: 40 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 1,
        delay: Math.random() * 3,
        duration: Math.random() * 2 + 2,
    }));

    return (
        <div className="proto-frame cosmic-bg">
            {stars.map((s) => (
                <motion.div
                    key={s.id}
                    className="star"
                    style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.size, height: s.size }}
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: s.duration, repeat: Infinity, delay: s.delay }}
                />
            ))}
            <div className="cosmic-card">
                <h2>Welcome Back</h2>
                <p className="cosmic-sub">Journey through the stars</p>
                <MockForm accent="linear-gradient(135deg, #c8956c, #d4a67d)" />
            </div>
        </div>
    );
}

/* ─── 4. Full-Screen Ambient ─── */
function AmbientLogin() {
    return (
        <div className="proto-frame ambient-bg">
            <svg className="ambient-wave" viewBox="0 0 1440 320" preserveAspectRatio="none">
                <motion.path
                    d="M0,224L48,213.3C96,203,192,181,288,186.7C384,192,480,224,576,234.7C672,245,768,235,864,208C960,181,1056,139,1152,128C1248,117,1344,139,1392,149.3L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                    fill="rgba(200, 149, 108, 0.08)"
                    animate={{
                        d: [
                            "M0,224L48,213.3C96,203,192,181,288,186.7C384,192,480,224,576,234.7C672,245,768,235,864,208C960,181,1056,139,1152,128C1248,117,1344,139,1392,149.3L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
                            "M0,160L48,181.3C96,203,192,245,288,250.7C384,256,480,224,576,208C672,192,768,192,864,202.7C960,213,1056,235,1152,234.7C1248,235,1344,213,1392,202.7L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
                            "M0,224L48,213.3C96,203,192,181,288,186.7C384,192,480,224,576,234.7C672,245,768,235,864,208C960,181,1056,139,1152,128C1248,117,1344,139,1392,149.3L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
                        ],
                    }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                />
            </svg>
            <div className="ambient-form">
                <h2>Welcome Back</h2>
                <p className="ambient-sub">Breathe in. Breathe out.</p>
                <MockForm />
            </div>
        </div>
    );
}

/* ─── 5. Micro-Animations ─── */
function MicroLogin() {
    const [mode, setMode] = useState<'signin' | 'signup'>('signin');

    return (
        <div className="proto-frame micro-bg">
            <motion.div
                className="micro-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <motion.div
                    className="micro-logo"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
                >
                    UP
                </motion.div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={mode}
                        initial={{ opacity: 0, x: mode === 'signup' ? 30 : -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: mode === 'signup' ? -30 : 30 }}
                        transition={{ duration: 0.25 }}
                    >
                        <h2>{mode === 'signin' ? 'Welcome Back' : 'Create Account'}</h2>
                        <p className="micro-sub">
                            {mode === 'signin' ? 'Sign in to continue' : 'Start your journey'}
                        </p>
                        <MockForm />
                    </motion.div>
                </AnimatePresence>

                <button className="micro-toggle" onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}>
                    {mode === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
                </button>
            </motion.div>
        </div>
    );
}

/* ─── Page ─── */
export function StylesPage() {
    const [active, setActive] = useState('glass');

    const components: Record<string, React.ReactNode> = {
        glass: <GlassLogin />,
        split: <SplitLogin />,
        cosmic: <CosmicLogin />,
        ambient: <AmbientLogin />,
        micro: <MicroLogin />,
    };

    return (
        <div className="styles-page">
            <h1 className="styles-title">Login Page Styles</h1>
            <p className="styles-subtitle">Pick the one that feels right</p>

            <div className="style-tabs">
                {STYLES.map((s) => (
                    <button
                        key={s.id}
                        className={`style-tab ${active === s.id ? 'active' : ''}`}
                        onClick={() => setActive(s.id)}
                    >
                        {s.label}
                    </button>
                ))}
            </div>

            <div className="proto-viewport">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={active}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{ height: '100%' }}
                    >
                        {components[active]}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
