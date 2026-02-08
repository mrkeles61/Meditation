import { motion } from 'framer-motion';
import './BreathingCircle.css';

export function BreathingCircle() {
    return (
        <div className="breathing-container">
            {/* Outer glow ring */}
            <motion.div
                className="breathing-glow"
                animate={{
                    scale: [1, 1.4, 1],
                    opacity: [0.1, 0.3, 0.1],
                }}
                transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
            />

            {/* Main breathing circle */}
            <motion.div
                className="breathing-circle"
                animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.3, 0.7, 0.3],
                }}
                transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
                style={{ willChange: 'transform, opacity' }}
            />
        </div>
    );
}
