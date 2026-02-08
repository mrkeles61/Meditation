import { useMeditationStore } from '../store';
import { supabase } from '../../../services/supabase';
import { useAppStore } from '../../../stores/appStore';
import './CompletionScreen.css';

export function CompletionScreen() {
    const { duration, elapsed, selectedSound, reset } = useMeditationStore();
    const { user } = useAppStore();

    const completedMinutes = Math.floor(elapsed / 60);
    const completedSeconds = elapsed % 60;
    const isFullSession = elapsed >= duration;

    async function saveAndReturn() {
        if (user) {
            await supabase.from('meditation_sessions').insert({
                user_id: user.id,
                duration_seconds: duration,
                completed_seconds: elapsed,
                sound_type: selectedSound,
            });
        }
        reset();
    }

    return (
        <div className="completion-screen">
            <div className="completion-card">
                <div className="completion-icon">{isFullSession ? '✨' : '🌿'}</div>
                <h1 className="completion-title">
                    {isFullSession ? 'Session Complete' : 'Session Ended'}
                </h1>
                <p className="completion-duration">
                    {completedMinutes}:{completedSeconds.toString().padStart(2, '0')}
                </p>
                <p className="completion-message">
                    {isFullSession
                        ? 'Well done. Every moment of stillness counts.'
                        : 'Even a short pause makes a difference.'}
                </p>
                <button className="completion-button" onClick={saveAndReturn}>
                    Back to Dashboard
                </button>
            </div>
        </div>
    );
}
