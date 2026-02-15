/**
 * Pixel art grids and color palettes for Town View buildings + character.
 *
 * Grid format: array of strings, each char maps to a palette color.
 * ' ' = transparent pixel.
 */

export type Palette = Record<string, string>;

// ── Meditation Temple ──────────────────────
// Pagoda-style, 12 wide × 14 tall
const TEMPLE_GRID = [
    '     AA     ',
    '    RRRR    ',
    '   RRRRRR   ',
    '  RRRRRRRR  ',
    '    WWWW    ',
    '    WDDW    ',
    '    WWWW    ',
    '   RRRRRR   ',
    '  RRRRRRRR  ',
    '   WWWWWW   ',
    '   WDWWDW   ',
    '   WWDDWW   ',
    '   WWWWWW   ',
    '  BBBBBBBB  ',
];

// ── Steps Path (Milestone) ─────────────────
// Trail marker obelisk on a receding path, 12 wide × 12 tall
const PATH_GRID = [
    '     TT     ',
    '     TT     ',
    '    SSSS    ',
    '    SMMS    ',
    '    SMMS    ',
    '    SSSS    ',
    '  PPPPPPPP  ',
    '   PPPPPP   ',
    '   PMMMPP   ',
    '    PPPP    ',
    '    PPPP    ',
    '     PP     ',
];

// ── Gym ────────────────────────────────────
// Flat-roofed gym building, 12 wide × 12 tall
const GYM_GRID = [
    '    XXXX    ',
    '   RRRRRR   ',
    '  RRRRRRRR  ',
    '  WW    WW  ',
    '  WW GG WW  ',
    '  WW GG WW  ',
    '  WW    WW  ',
    '  WW    WW  ',
    '  WWDDDDWW  ',
    '  WWDDDDWW  ',
    '  BBBBBBBB  ',
    ' BBBBBBBBBB ',
];

// ── Character ──────────────────────────────
// Simple 8-bit figure, 6 wide × 10 tall
export const CHARACTER_GRID = [
    '  HH  ',
    ' HHHH ',
    ' HEEH ',
    '  SS  ',
    ' SSSS ',
    ' SSSS ',
    '  LL  ',
    ' L  L ',
    ' L  L ',
    'FF  FF',
];

export const CHARACTER_PALETTE: Palette = {
    H: '#c8956c',   // hair/skin (amber)
    E: '#0a0a0f',   // eyes
    S: '#e0d5c7',   // shirt (light)
    L: '#4a4a5a',   // pants
    F: '#6B5B4F',   // feet/shoes
};

// ── Building Palettes (per level) ──────────

const TEMPLE_PALETTES: Palette[] = [
    // Level 0 — dusty/sleeping
    { A: '#4a4a50', R: '#3a3a42', W: '#454550', D: '#3a3a40', B: '#353540' },
    // Level 1 — basic brown
    { A: '#6B5B4F', R: '#7a5a3a', W: '#6a5a4a', D: '#4a3a2e', B: '#5D4E37' },
    // Level 2 — warm brown + amber glow
    { A: '#c8956c', R: '#8B5E3C', W: '#8B7355', D: '#E8C47C', B: '#5D4E37' },
    // Level 3 — amber + gold accents
    { A: '#d4a67d', R: '#c8956c', W: '#9B8365', D: '#FFD700', B: '#6D5E47' },
    // Level 4 — legendary gold
    { A: '#FFD700', R: '#DAA520', W: '#c8956c', D: '#FFE44D', B: '#8B7355' },
];

const PATH_PALETTES: Palette[] = [
    // Level 0
    { T: '#3a3a42', S: '#4a4a50', M: '#3a3a40', P: '#353540' },
    // Level 1
    { T: '#7a5a3a', S: '#6B5B4F', M: '#5D4E37', P: '#5a4a3e' },
    // Level 2
    { T: '#E8C47C', S: '#8B7355', M: '#c8956c', P: '#6B5B4F' },
    // Level 3
    { T: '#FFD700', S: '#c8956c', M: '#d4a67d', P: '#8B7355' },
    // Level 4
    { T: '#FFE44D', S: '#DAA520', M: '#FFD700', P: '#c8956c' },
];

const GYM_PALETTES: Palette[] = [
    // Level 0
    { X: '#3a3a42', R: '#3a3a42', W: '#454550', G: '#3a3a40', D: '#353540', B: '#353540' },
    // Level 1
    { X: '#5D4E37', R: '#7a5a3a', W: '#6a5a4a', G: '#5a4a3e', D: '#4a3a2e', B: '#5D4E37' },
    // Level 2
    { X: '#c8956c', R: '#8B5E3C', W: '#8B7355', G: '#6B8B5F', D: '#E8C47C', B: '#5D4E37' },
    // Level 3
    { X: '#d4a67d', R: '#c8956c', W: '#9B8365', G: '#7CB87C', D: '#FFD700', B: '#6D5E47' },
    // Level 4
    { X: '#FFD700', R: '#DAA520', W: '#c8956c', G: '#90EE90', D: '#FFE44D', B: '#8B7355' },
];

// ── Exports ────────────────────────────────

export type BuildingType = 'temple' | 'path' | 'gym';

export const GRIDS: Record<BuildingType, string[]> = {
    temple: TEMPLE_GRID,
    path: PATH_GRID,
    gym: GYM_GRID,
};

export const PALETTES: Record<BuildingType, Palette[]> = {
    temple: TEMPLE_PALETTES,
    path: PATH_PALETTES,
    gym: GYM_PALETTES,
};

// ── Box-Shadow Generator ───────────────────

export function gridToBoxShadow(grid: string[], palette: Palette): string {
    const shadows: string[] = [];
    for (let y = 0; y < grid.length; y++) {
        const row = grid[y];
        for (let x = 0; x < row.length; x++) {
            const ch = row[x];
            if (ch !== ' ' && palette[ch]) {
                shadows.push(`${x}px ${y}px 0 ${palette[ch]}`);
            }
        }
    }
    return shadows.join(',');
}
