import { useState, useRef, useCallback, useEffect } from 'react';
import { parseHabitsFromText, type ParseResult } from '../../services/gemini';
import { AIConfirmationPanel } from '../../modules/habits/components/AIConfirmationPanel';
import { useAppStore } from '../../stores/appStore';
import { supabase } from '../../services/supabase';
import './VoicePill.css';

interface HabitInput {
    id: string;
    name: string;
    category: string;
}

type Stage = 'idle' | 'listening' | 'reviewing' | 'processing' | 'results';

export function VoicePill() {
    const { user } = useAppStore();
    const [stage, setStage] = useState<Stage>('idle');
    const [transcript, setTranscript] = useState('');
    const [error, setError] = useState('');
    const [result, setResult] = useState<ParseResult | null>(null);
    const recognitionRef = useRef<ReturnType<typeof createRecognition> | null>(null);
    const [habits, setHabits] = useState<HabitInput[]>([]);

    const fetchHabits = useCallback(async () => {
        if (!user) return;
        const { data } = await supabase
            .from('habits')
            .select('id, name, category')
            .eq('user_id', user.id)
            .eq('archived', false);
        if (data) setHabits(data);
    }, [user]);

    useEffect(() => {
        if (user) fetchHabits();
    }, [user, fetchHabits]);

    const resetState = useCallback(() => {
        setStage('idle');
        setTranscript('');
        setError('');
        setResult(null);
        if (recognitionRef.current) {
            try { recognitionRef.current.stop(); } catch { /* noop */ }
            recognitionRef.current = null;
        }
    }, []);

    const startListening = () => {
        setError('');
        setTranscript('');

        // Ensure we have latest habits right before dictation
        fetchHabits();

        const recognition = createRecognition();
        if (!recognition) {
            setError('Speech recognition not supported in this browser.');
            return;
        }

        recognition.onresult = (event: SpeechRecognitionEvent) => {
            let text = '';
            for (let i = 0; i < event.results.length; i++) {
                text += event.results[i][0].transcript;
            }
            setTranscript(text);
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
            if (event.error === 'not-allowed') {
                setError('Microphone access denied. Please allow microphone access.');
            } else {
                setError(`Speech error: ${event.error}`);
            }
            setStage('idle');
        };

        recognition.onend = () => {
            setStage(current => {
                // Only transition to reviewing if we were actively listening
                if (current === 'listening') {
                    // Check transcript in a functional state update?
                    // Actually, the easiest way is just to set reviewing.
                    // If transcript is empty, maybe go back to idle.
                    return 'reviewing';
                }
                return current;
            });
        };

        recognitionRef.current = recognition;
        recognition.start();
        setStage('listening');
    };

    const stopListening = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop(); // Triggers onend which triggers sendToAI
        }
    };

    const sendToAI = async () => {
        if (!transcript.trim()) {
            setStage('idle');
            return;
        }
        processTranscript(transcript);
    };

    const processTranscript = async (text: string) => {
        setStage('processing');
        setError('');
        try {
            const parsed = await parseHabitsFromText(text, habits);
            setResult(parsed);
            setStage('results');
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to parse habits');
            setStage('idle');
        }
    };

    const handleConfirm = async (habitIds: string[]) => {
        if (!user) return;
        setStage('processing'); // show loading while writing to db
        try {
            const todayStr = new Date().toISOString().split('T')[0];
            const inserts = habitIds.map(id => ({
                habit_id: id,
                user_id: user.id,
                logged_at: todayStr
            }));

            // Just insert logs directly
            await supabase.from('habit_logs').upsert(inserts, { onConflict: 'habit_id, logged_at', ignoreDuplicates: true });
        } catch (e) {
            console.error(e);
        }
        resetState();
    };

    const handleAddSuggestion = async (name: string) => {
        // Just create the habit and log it for today
        if (!user) return;
        setStage('processing');
        try {
            const { data } = await supabase.from('habits').insert({
                user_id: user.id,
                name: name,
                icon: '✨',
                category: 'custom',
                sort_order: habits.length
            }).select('id').single();

            if (data?.id) {
                const todayStr = new Date().toISOString().split('T')[0];
                await supabase.from('habit_logs').insert({ habit_id: data.id, user_id: user.id, logged_at: todayStr });
            }
        } catch (e) {
            console.error(e);
        }
        resetState();
    };

    if (!user) return null;

    return (
        <div className="voice-pill-container">
            {stage === 'reviewing' && (
                <div className="voice-pill-review-panel">
                    <textarea
                        className="voice-pill-textarea"
                        value={transcript}
                        onChange={(e) => setTranscript(e.target.value)}
                        placeholder="Edit your dictated habits..."
                        autoFocus
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                sendToAI();
                            }
                        }}
                    />
                    <div className="voice-pill-review-actions">
                        <button className="voice-pill-action-btn cancel" onClick={resetState}>Cancel</button>
                        <button className="voice-pill-action-btn send" onClick={sendToAI} disabled={!transcript.trim()}>Send ✨</button>
                    </div>
                </div>
            )}

            {stage === 'results' && result && (
                <div className="voice-pill-results-panel">
                    <AIConfirmationPanel
                        result={result}
                        onConfirm={handleConfirm}
                        onAddSuggestion={handleAddSuggestion}
                        onCancel={resetState}
                    />
                </div>
            )}

            {error && (
                <div className="voice-pill-error" onClick={() => setError('')}>
                    {error}
                </div>
            )}

            <div className={`voice-pill ${stage !== 'idle' ? 'expanded' : ''}`}>
                <button
                    className={`voice-pill-button ${stage === 'listening' ? 'active' : ''}`}
                    onMouseDown={startListening}
                    onMouseUp={stopListening}
                    onTouchStart={startListening}
                    onTouchEnd={stopListening}
                    disabled={stage === 'processing'}
                    title="Hold to dictate habits"
                >
                    <span className="voice-pill-icon">✨ Ask Perigee...</span>
                    {stage === 'listening' && (
                        <>
                            <span className="voice-pill-pulse" />
                            <span className="voice-pill-pulse delay" />
                        </>
                    )}
                </button>

                {stage === 'listening' && (
                    <div className="voice-pill-status listening">
                        <span className="status-dot"></span> Listening...
                    </div>
                )}
                {stage === 'reviewing' && (
                    <div className="voice-pill-status reviewing">
                        Reviewing...
                    </div>
                )}
                {stage === 'processing' && (
                    <div className="voice-pill-status processing">
                        <span className="status-spinner"></span> Analyzing...
                    </div>
                )}
            </div>
        </div>
    );
}

function createRecognition() {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return null;
    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    return recognition;
}

// Type declarations for Web Speech API
interface SpeechRecognitionEvent extends Event {
    results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
    error: string;
}
