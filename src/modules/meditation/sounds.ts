/**
 * Web Audio API-based ambient sound generator.
 * No external audio files needed — sounds are synthesised in real-time.
 */

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
    if (!audioCtx) audioCtx = new AudioContext();
    return audioCtx;
}

interface SoundInstance {
    gain: GainNode;
    nodes: AudioNode[];
    stop: () => void;
}

/* ── Rain — filtered white noise ── */
function createRain(ctx: AudioContext, gain: GainNode): AudioNode[] {
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 2000;

    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 400;

    noise.connect(lp).connect(hp).connect(gain);
    noise.start();
    return [noise, lp, hp];
}

/* ── Ocean — modulated low noise ── */
function createOcean(ctx: AudioContext, gain: GainNode): AudioNode[] {
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 600;

    // LFO to modulate volume (wave effect)
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.type = 'sine';
    lfo.frequency.value = 0.08; // slow wave cycle
    lfoGain.gain.value = 0.3;
    lfo.connect(lfoGain).connect(gain.gain);
    lfo.start();

    noise.connect(lp).connect(gain);
    noise.start();
    return [noise, lp, lfo, lfoGain];
}

/* ── Singing Bowl — resonant tones ── */
function createSingingBowl(ctx: AudioContext, gain: GainNode): AudioNode[] {
    const nodes: AudioNode[] = [];
    const freqs = [261.6, 523.3, 784.9]; // C4, C5, G5

    function strike() {
        freqs.forEach((freq) => {
            const osc = ctx.createOscillator();
            const oscGain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = freq + (Math.random() - 0.5) * 2;
            oscGain.gain.setValueAtTime(0.15, ctx.currentTime);
            oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 6);
            osc.connect(oscGain).connect(gain);
            osc.start();
            osc.stop(ctx.currentTime + 6);
        });
    }

    strike();
    const intervalId = setInterval(strike, 8000);
    // Store cleanup reference
    const cleanup = { disconnect: () => clearInterval(intervalId) } as unknown as AudioNode;
    nodes.push(cleanup);
    return nodes;
}

/* ── Chime — single bright tone ── */
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

/* ── Public API ── */
type AmbientType = 'rain' | 'ocean' | 'singing-bowl';

const creators: Record<AmbientType, (ctx: AudioContext, gain: GainNode) => AudioNode[]> = {
    rain: createRain,
    ocean: createOcean,
    'singing-bowl': createSingingBowl,
};

export function startAmbient(type: AmbientType): SoundInstance {
    const ctx = getCtx();
    const gain = ctx.createGain();
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 2); // fade in

    const nodes = creators[type](ctx, gain);

    return {
        gain,
        nodes,
        stop() {
            const now = ctx.currentTime;
            gain.gain.linearRampToValueAtTime(0, now + 1);
            setTimeout(() => {
                nodes.forEach((n) => {
                    try { (n as AudioScheduledSourceNode).stop?.(); } catch { /* already stopped */ }
                    try { n.disconnect(); } catch { /* ok */ }
                });
                gain.disconnect();
            }, 1200);
        },
    };
}
