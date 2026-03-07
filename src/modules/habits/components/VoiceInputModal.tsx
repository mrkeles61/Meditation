import { useState, useRef, useCallback } from 'react';
import { parseHabitsFromText, type ParseResult } from '../../../services/gemini';
import { AIConfirmationPanel } from './AIConfirmationPanel';

interface HabitInput {
    id: string;
    name: string;
    category: string;
}

interface Props {
    open: boolean;
    habits: HabitInput[];
    onConfirm: (habitIds: string[]) => void;
    onAddSuggestion: (name: string) => void;
    onClose: () => void;
}

type Stage = 'idle' | 'listening' | 'processing' | 'results';

export function VoiceInputModal({ open, habits, onConfirm, onAddSuggestion, onClose }: Props) {
    const [stage, setStage] = useState<Stage>('idle');
    const [transcript, setTranscript] = useState('');
    const [textInput, setTextInput] = useState('');
    const [error, setError] = useState('');
    const [result, setResult] = useState<ParseResult | null>(null);
    const [useText, setUseText] = useState(false);
    const recognitionRef = useRef<ReturnType<typeof createRecognition> | null>(null);

    const resetState = useCallback(() => {
        setStage('idle');
        setTranscript('');
        setTextInput('');
        setError('');
        setResult(null);
        setUseText(false);
        if (recognitionRef.current) {
            try { recognitionRef.current.stop(); } catch { /* noop */ }
            recognitionRef.current = null;
        }
    }, []);

    const handleClose = () => {
        resetState();
        onClose();
    };

    const startListening = () => {
        setError('');
        setTranscript('');
        const recognition = createRecognition();
        if (!recognition) {
            setError('Speech recognition not supported in this browser. Use text input.');
            setUseText(true);
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
            setStage('idle');
        };

        recognitionRef.current = recognition;
        recognition.start();
        setStage('listening');
    };

    const stopListening = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            recognitionRef.current = null;
        }
        setStage('idle');
    };

    const sendToAI = async () => {
        const text = useText ? textInput : transcript;
        if (!text.trim()) return;

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

    const handleConfirm = (habitIds: string[]) => {
        onConfirm(habitIds);
        handleClose();
    };

    const handleAddSuggestion = (name: string) => {
        onAddSuggestion(name);
    };

    if (!open) return null;

    const currentText = useText ? textInput : transcript;

    return (
        <div className="voice-modal-overlay" onClick={handleClose}>
            <div className="voice-modal" onClick={e => e.stopPropagation()}>
                <button className="voice-modal-close" onClick={handleClose}>✕</button>
                <h2 className="voice-modal-title">
                    {stage === 'results' ? 'Review Results' : 'Log Your Habits'}
                </h2>

                {stage === 'results' && result ? (
                    <AIConfirmationPanel
                        result={result}
                        onConfirm={handleConfirm}
                        onAddSuggestion={handleAddSuggestion}
                        onCancel={() => { setResult(null); setStage('idle'); }}
                    />
                ) : (
                    <>
                        {!useText ? (
                            <div className="voice-modal-mic-area">
                                <button
                                    className={`voice-modal-mic ${stage === 'listening' ? 'active' : ''}`}
                                    onMouseDown={startListening}
                                    onMouseUp={stopListening}
                                    onTouchStart={startListening}
                                    onTouchEnd={stopListening}
                                    disabled={stage === 'processing'}
                                >
                                    <span className="voice-modal-mic-icon">🎤</span>
                                    {stage === 'listening' && (
                                        <>
                                            <span className="voice-modal-pulse" />
                                            <span className="voice-modal-pulse delay" />
                                        </>
                                    )}
                                </button>
                                <p className="voice-modal-hint">
                                    {stage === 'listening'
                                        ? 'Listening...'
                                        : stage === 'processing'
                                            ? 'Analyzing...'
                                            : 'Hold to speak'}
                                </p>
                            </div>
                        ) : (
                            <div className="voice-modal-text-area">
                                <textarea
                                    className="voice-modal-textarea"
                                    placeholder='e.g. "Today I meditated, went to the gym, and read for 30 minutes"'
                                    value={textInput}
                                    onChange={e => setTextInput(e.target.value)}
                                    rows={3}
                                    autoFocus
                                />
                            </div>
                        )}

                        {transcript && !useText && (
                            <div className="voice-modal-transcript">
                                <span className="voice-modal-transcript-label">You said:</span>
                                <p className="voice-modal-transcript-text">{transcript}</p>
                            </div>
                        )}

                        {error && <p className="voice-modal-error">{error}</p>}

                        <div className="voice-modal-actions">
                            <button
                                className="voice-modal-toggle-input"
                                onClick={() => setUseText(!useText)}
                            >
                                {useText ? '🎤 Use voice' : '⌨️ Type instead'}
                            </button>
                            {currentText.trim() && stage !== 'processing' && (
                                <button className="voice-modal-send" onClick={sendToAI}>
                                    Send to AI ✨
                                </button>
                            )}
                        </div>

                        {stage === 'processing' && (
                            <div className="voice-modal-loading">
                                <span className="voice-modal-spinner" />
                                <span>Analyzing with Gemini...</span>
                            </div>
                        )}
                    </>
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
