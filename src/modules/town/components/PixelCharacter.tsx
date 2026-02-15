import { useMemo } from 'react';
import { CHARACTER_GRID, CHARACTER_PALETTE, gridToBoxShadow } from '../pixel-data';

const PIXEL_SIZE = 4;

export function PixelCharacter() {
    const boxShadow = useMemo(
        () => gridToBoxShadow(CHARACTER_GRID, CHARACTER_PALETTE),
        [],
    );

    const width = Math.max(...CHARACTER_GRID.map(r => r.length));
    const height = CHARACTER_GRID.length;

    return (
        <div className="pixel-character">
            <div
                className="pixel-art-container"
                style={{
                    width: width * PIXEL_SIZE,
                    height: height * PIXEL_SIZE,
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
            </div>
        </div>
    );
}
