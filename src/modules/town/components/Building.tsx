import { useMemo } from 'react';
import { GRIDS, PALETTES, gridToBoxShadow, type BuildingType } from '../pixel-data';

const PIXEL_SIZE = 4;

interface Props {
    type: BuildingType;
    level: 0 | 1 | 2 | 3 | 4;
    onClick?: () => void;
    loading?: boolean;
}

export function Building({ type, level, onClick, loading }: Props) {
    const grid = GRIDS[type];
    const palette = PALETTES[type][level] ?? PALETTES[type][0];

    const boxShadow = useMemo(
        () => gridToBoxShadow(grid, palette),
        [grid, palette],
    );

    const width = Math.max(...grid.map(r => r.length));
    const height = grid.length;

    const showGlow = level >= 2;
    const showSmoke = level >= 3;
    const showZzz = level === 0;

    return (
        <div
            className={`building level-${level} ${loading ? '' : 'building-pop-in'}`}
            onClick={onClick}
            role="button"
            tabIndex={0}
            aria-label={`${type} building, level ${level}`}
        >
            <div
                className="pixel-art-container"
                style={{
                    width: width * PIXEL_SIZE,
                    height: height * PIXEL_SIZE,
                    position: 'relative',
                }}
            >
                <div
                    className="pixel-art"
                    style={{
                        boxShadow,
                        transform: `scale(${PIXEL_SIZE})`,
                        transformOrigin: 'top left',
                    }}
                />
                {showGlow && <div className="building-glow" />}
            </div>

            {showZzz && (
                <span className="building-zzz">💤</span>
            )}

            {showSmoke && (
                <div className="building-smoke">
                    {[0, 1, 2].map(i => (
                        <div
                            key={i}
                            className="smoke-particle"
                            style={{
                                '--drift': `${(i - 1) * 6}px`,
                                '--smoke-dur': `${2.5 + i * 0.5}s`,
                                '--smoke-delay': `${i * 0.8}s`,
                            } as React.CSSProperties}
                        />
                    ))}
                </div>
            )}

            <span className="building-label">{type}</span>
        </div>
    );
}
