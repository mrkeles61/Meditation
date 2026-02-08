/**
 * Ambient sound playback using real MP3 files.
 * Supports crossfade between sounds and a synthesised chime for session end.
 */

/* ── Sound file map ── */
const SOUND_FILES: Record<string, string> = {
    rain: '/sounds/rain.mp3',
    ocean: '/sounds/ocean.mp3',
    'singing-bowl': '/sounds/singing-bowl.mp3',
    fireplace: '/sounds/fireplace.mp3',
    forest: '/sounds/forest.mp3',
};

export interface SoundInstance {
    audio: HTMLAudioElement;
    stop: () => void;
    fadeOut: (durationMs?: number) => Promise<void>;
}

/**
 * Start ambient sound with fade-in.
 * Audio loops automatically. Returns a handle to stop or fade out.
 */
export function startAmbient(type: string): SoundInstance {
    const src = SOUND_FILES[type];
    if (!src) throw new Error(`Unknown sound type: ${type}`);

    const audio = new Audio(src);
    audio.loop = true;
    audio.volume = 0;
    audio.play().catch(() => { /* autoplay blocked — user will interact first */ });

    // Fade in over 2 seconds
    fadeVolume(audio, 0, 0.6, 2000);

    return {
        audio,
        stop() {
            fadeVolume(audio, audio.volume, 0, 800).then(() => {
                audio.pause();
                audio.src = '';
            });
        },
        fadeOut(durationMs = 1000) {
            return fadeVolume(audio, audio.volume, 0, durationMs).then(() => {
                audio.pause();
                audio.src = '';
            });
        },
    };
}

/**
 * Crossfade from one sound instance to a new sound type.
 * Old sound fades out while new sound fades in over the duration.
 */
export function crossfade(
    from: SoundInstance | null,
    toType: string,
    durationMs = 1500,
): SoundInstance {
    // Fade out old
    if (from) {
        fadeVolume(from.audio, from.audio.volume, 0, durationMs).then(() => {
            from.audio.pause();
            from.audio.src = '';
        });
    }

    // Fade in new
    const src = SOUND_FILES[toType];
    if (!src) throw new Error(`Unknown sound type: ${toType}`);

    const audio = new Audio(src);
    audio.loop = true;
    audio.volume = 0;
    audio.play().catch(() => { });
    fadeVolume(audio, 0, 0.6, durationMs);

    return {
        audio,
        stop() {
            fadeVolume(audio, audio.volume, 0, 800).then(() => {
                audio.pause();
                audio.src = '';
            });
        },
        fadeOut(durationMs = 1000) {
            return fadeVolume(audio, audio.volume, 0, durationMs).then(() => {
                audio.pause();
                audio.src = '';
            });
        },
    };
}

/* ── Volume fade utility ── */
function fadeVolume(
    audio: HTMLAudioElement,
    from: number,
    to: number,
    durationMs: number,
): Promise<void> {
    return new Promise((resolve) => {
        const steps = Math.max(1, Math.round(durationMs / 50));
        const stepMs = durationMs / steps;
        const delta = (to - from) / steps;
        let current = from;
        let step = 0;

        const interval = setInterval(() => {
            step++;
            current += delta;
            audio.volume = Math.max(0, Math.min(1, current));
            if (step >= steps) {
                clearInterval(interval);
                audio.volume = Math.max(0, Math.min(1, to));
                resolve();
            }
        }, stepMs);
    });
}

/* ── Chime (synthesised — works well as short tone) ── */
let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
    if (!audioCtx) audioCtx = new AudioContext();
    return audioCtx;
}

export function playChime(): void {
    const ctx = getCtx();
    const gain = ctx.createGain();
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 3);

    [880, 1318.5, 1760].forEach((freq) => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = freq;
        osc.connect(gain);
        osc.start();
        osc.stop(ctx.currentTime + 3);
    });
}

/** Play a single gentle bell strike (for countdown). */
export function playBell(): void {
    const ctx = getCtx();
    const gain = ctx.createGain();
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2);

    // Warm bell harmonics
    [440, 880, 1320].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = freq;
        const oscGain = ctx.createGain();
        oscGain.gain.value = 0.3 / (i + 1); // higher harmonics quieter
        osc.connect(oscGain).connect(gain);
        osc.start();
        osc.stop(ctx.currentTime + 2);
    });
}
