import type { ParseResult } from '../../../services/gemini';

interface Props {
    result: ParseResult;
    onConfirm: (habitIds: string[]) => void;
    onAddSuggestion: (name: string) => void;
    onCancel: () => void;
}

export function AIConfirmationPanel({ result, onConfirm, onAddSuggestion, onCancel }: Props) {
    const handleConfirm = () => {
        const ids = result.matched.map(m => m.habitId);
        onConfirm(ids);
    };

    return (
        <div className="ai-confirm">
            <h3 className="ai-confirm-title">AI Detected Habits</h3>

            {result.matched.length > 0 ? (
                <div className="ai-confirm-matches">
                    {result.matched.map(m => (
                        <div key={m.habitId} className="ai-confirm-match">
                            <span className="ai-confirm-check">✓</span>
                            <span className="ai-confirm-name">{m.habitName}</span>
                            <span className="ai-confirm-conf">
                                {Math.round(m.confidence * 100)}%
                            </span>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="ai-confirm-empty">No habits detected from your message.</p>
            )}

            {result.suggestions.length > 0 && (
                <div className="ai-confirm-suggestions">
                    <h4 className="ai-confirm-subtitle">Track these too?</h4>
                    {result.suggestions.map(s => (
                        <div key={s} className="ai-confirm-suggestion">
                            <span className="ai-confirm-sug-name">{s}</span>
                            <button
                                className="ai-confirm-sug-add"
                                onClick={() => onAddSuggestion(s)}
                            >
                                + Add
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <div className="ai-confirm-actions">
                <button className="ai-confirm-cancel" onClick={onCancel}>Cancel</button>
                {result.matched.length > 0 && (
                    <button className="ai-confirm-save" onClick={handleConfirm}>
                        Mark {result.matched.length} Complete
                    </button>
                )}
            </div>
        </div>
    );
}
