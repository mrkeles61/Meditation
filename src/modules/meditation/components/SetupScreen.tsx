import { useMeditationStore, type SoundType } from '../store';
import './SetupScreen.css';

const PRESETS = [
    { label: '5 min', seconds: 300 },
    { label: '10 min', seconds: 600 },
    { label: '15 min', seconds: 900 },
    { label: '20 min', seconds: 1200 },
    { label: '30 min', seconds: 1800 },
];

const SOUNDS: { id: SoundType; label: string }[] = [
    { id: 'rain', label: '🌧 Rain' },
    { id: 'ocean', label: '🌊 Ocean' },
    { id: 'singing-bowl', label: '🔔 Singing Bowl' },
    { id: 'silence', label: '🤫 Silence' },
];

export function SetupScreen() {
    const { duration, selectedSound, setDuration, setSelectedSound, startSession } = useMeditationStore();

    const customMinutes = Math.round(duration / 60);

    return (
        <div className="setup-screen">
            <h1 className="setup-title">Meditation</h1>
            <p className="setup-subtitle">Find your calm</p>

            <div className="setup-section">
                <label className="setup-label">Duration</label>
                <div className="preset-pills">
                    {PRESETS.map((preset) => (
                        <button
                            key={preset.seconds}
                            className={`preset-pill ${duration === preset.seconds ? 'active' : ''}`}
                            onClick={() => setDuration(preset.seconds)}
                        >
                            {preset.label}
                        </button>
                    ))}
                </div>
                <div className="slider-row">
                    <input
                        type="range"
                        min={60}
                        max={3600}
                        step={60}
                        value={duration}
                        onChange={(e) => setDuration(Number(e.target.value))}
                        className="duration-slider"
                    />
                    <span className="slider-value">{customMinutes} min</span>
                </div>
            </div>

            <div className="setup-section">
                <label className="setup-label">Ambient Sound</label>
                <div className="sound-options">
                    {SOUNDS.map((sound) => (
                        <button
                            key={sound.id}
                            className={`sound-option ${selectedSound === sound.id ? 'active' : ''}`}
                            onClick={() => setSelectedSound(sound.id)}
                        >
                            {sound.label}
                        </button>
                    ))}
                </div>
            </div>

            <button className="begin-button" onClick={startSession}>
                Begin
            </button>
        </div>
    );
}
