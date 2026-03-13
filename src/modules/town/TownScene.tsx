import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTownStore } from './stores/townStore';
import { SceneManager } from './three/SceneManager';
import { TownHUD } from './components/TownHUD';
import { BuildingPanel } from './components/BuildingPanel';
import { useTownSync } from '../../hooks/useTownSync';
import './Town.css';

export function TownScene() {
    const containerRef  = useRef<HTMLDivElement>(null);
    const canvasRef     = useRef<HTMLCanvasElement>(null);
    const managerRef    = useRef<SceneManager | null>(null);

    const [panelHabitType, setPanelHabitType] = useState<string | null>(null);
    const [levelUpMsg,     setLevelUpMsg]     = useState<string | null>(null);

    const buildings        = useTownStore((s) => s.buildings);
    const clearLevelUpFlag = useTownStore((s) => s.clearLevelUpFlag);

    // Sync Supabase habit_logs → streak calc → townStore
    useTownSync();

    // ── Init Three.js scene ─────────────────────────────────────────────────
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        let destroyed = false;
        const manager = new SceneManager();
        managerRef.current = manager;

        // Wire building tap → show panel (NOT navigate immediately)
        manager.onBuildingTapped = (habitType) => {
            setPanelHabitType(habitType);
        };

        manager
            .init(canvas)
            .then(() => {
                if (destroyed) { manager.destroy(); return; }
                // Seed initial building states before first frame
                manager.updateBuildings(useTownStore.getState().buildings);
                manager.start();
            })
            .catch((err) => console.error('[TownScene] init failed:', err));

        // Track container size → notify SceneManager
        const ro = new ResizeObserver((entries) => {
            const r = entries[0]?.contentRect;
            if (r && !destroyed) manager.resize(r.width, r.height);
        });
        if (containerRef.current) ro.observe(containerRef.current);

        return () => {
            destroyed = true;
            ro.disconnect();
            manager.destroy();
            managerRef.current = null;
        };
    }, []);

    // ── Push store changes into Three.js scene ──────────────────────────────
    useEffect(() => {
        const manager = managerRef.current;
        if (!manager) return;

        manager.updateBuildings(buildings);

        // Check for pending level-ups → show React overlay + clear flag
        for (const [id, state] of Object.entries(buildings)) {
            if (state.pendingLevelUp) {
                const label = id.charAt(0).toUpperCase() + id.slice(1);
                setLevelUpMsg(`${label} Levelled Up!`);
                // Auto-dismiss after 2 s
                const t = setTimeout(() => setLevelUpMsg(null), 2000);
                clearLevelUpFlag(id);
                return () => clearTimeout(t);
            }
        }
    }, [buildings, clearLevelUpFlag]);

    const closePanel = useCallback(() => setPanelHabitType(null), []);

    return (
        <div className="town-scene" ref={containerRef}>
            {/* Three.js renders here */}
            <canvas ref={canvasRef} />

            {/* React overlays ─────────────────── */}
            <TownHUD />

            <BuildingPanel habitType={panelHabitType} onClose={closePanel} />

            {/* Level-up celebration overlay */}
            <AnimatePresence>
                {levelUpMsg && (
                    <>
                        <motion.div
                            key="lvlup-flash"
                            className="level-up-flash"
                            initial={{ opacity: 0.55 }}
                            animate={{ opacity: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.9, ease: 'easeOut' }}
                        />
                        <motion.div
                            key="lvlup-text"
                            className="level-up-text"
                            initial={{ opacity: 0, y: 24, scale: 0.75 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -28, scale: 1.1 }}
                            transition={{ type: 'spring', damping: 14, stiffness: 280 }}
                        >
                            ⭐ {levelUpMsg} ⭐
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
