import { useState, useRef, useEffect, useCallback } from 'react';
import { useAppStore } from '../../stores/appStore';
import { supabase } from '../../services/supabase';
import './chat.css';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

interface Conversation {
    conversation_id: string;
    preview: string;
    created_at: string;
}

const API_BASE = 'http://localhost:8000';

export function ChatPage() {
    const { user } = useAppStore();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [showHistory, setShowHistory] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const scrollToBottom = useCallback(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, []);

    useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

    // Load conversations list
    useEffect(() => {
        if (!user) return;
        loadConversations();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    async function getAuthToken() {
        const { data } = await supabase.auth.getSession();
        return data.session?.access_token || '';
    }

    async function loadConversations() {
        try {
            const token = await getAuthToken();
            const res = await fetch(`${API_BASE}/api/chat/conversations`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setConversations(data);
            }
        } catch {
            // Silently fail
        }
    }

    async function loadHistory(convId: string) {
        try {
            const token = await getAuthToken();
            const res = await fetch(`${API_BASE}/api/chat/history/${convId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setMessages(data.map((m: { role: string; content: string }) => ({
                    role: m.role as 'user' | 'assistant',
                    content: m.content,
                })));
                setConversationId(convId);
                setShowHistory(false);
            }
        } catch {
            // Silently fail
        }
    }

    async function sendMessage() {
        const text = input.trim();
        if (!text || loading || !user) return;

        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: text }]);
        setLoading(true);

        try {
            const token = await getAuthToken();
            const res = await fetch(`${API_BASE}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    message: text,
                    conversation_id: conversationId,
                }),
            });

            if (res.ok) {
                const data = await res.json();
                setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
                setConversationId(data.conversation_id);
                loadConversations(); // Refresh sidebar
            } else {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: 'Sorry, something went wrong. Please try again.',
                }]);
            }
        } catch {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Unable to connect. Make sure the server is running.',
            }]);
        } finally {
            setLoading(false);
        }
    }

    function handleKeyDown(e: React.KeyboardEvent) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    }

    function startNewConversation() {
        setMessages([]);
        setConversationId(null);
        setShowHistory(false);
        inputRef.current?.focus();
    }

    if (!user) {
        return <div className="chat-page"><p className="chat-empty">Sign in to chat with your coach.</p></div>;
    }

    return (
        <div className="chat-page">
            {/* Conversation sidebar */}
            <div className={`chat-sidebar ${showHistory ? 'open' : ''}`}>
                <div className="chat-sidebar-header">
                    <h3>Conversations</h3>
                    <button className="chat-new-btn" onClick={startNewConversation}>+ New</button>
                </div>
                <div className="chat-conv-list">
                    {conversations.length === 0 ? (
                        <p className="chat-conv-empty">No conversations yet</p>
                    ) : conversations.map(c => (
                        <button
                            key={c.conversation_id}
                            className={`chat-conv-item ${conversationId === c.conversation_id ? 'active' : ''}`}
                            onClick={() => loadHistory(c.conversation_id)}
                        >
                            <span className="chat-conv-preview">{c.preview}</span>
                            <span className="chat-conv-date">
                                {new Date(c.created_at).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Main chat area */}
            <div className="chat-main">
                <div className="chat-header">
                    <button className="chat-history-toggle" onClick={() => setShowHistory(v => !v)}>
                        ☰
                    </button>
                    <div className="chat-header-info">
                        <span className="chat-header-name">Perigee</span>
                        <span className="chat-header-subtitle">Your wellness coach</span>
                    </div>
                    <button className="chat-new-btn-mobile" onClick={startNewConversation}>+</button>
                </div>

                <div className="chat-messages" ref={scrollRef}>
                    {messages.length === 0 && (
                        <div className="chat-welcome">
                            <span className="chat-welcome-icon">◎</span>
                            <h3>Hey there 👋</h3>
                            <p>I'm Perigee, your personal wellness coach. I can see your habits, meditation sessions, and health data.</p>
                            <div className="chat-suggestions">
                                <button onClick={() => { setInput('How am I doing this week?'); }}>
                                    How am I doing?
                                </button>
                                <button onClick={() => { setInput('What habits should I focus on?'); }}>
                                    What should I focus on?
                                </button>
                                <button onClick={() => { setInput('Give me a motivation boost'); }}>
                                    Motivate me
                                </button>
                            </div>
                        </div>
                    )}

                    {messages.map((msg, i) => (
                        <div key={i} className={`chat-bubble ${msg.role}`}>
                            {msg.role === 'assistant' && <span className="chat-avatar">◎</span>}
                            <div className="chat-bubble-content">
                                {msg.content.split('\n').map((line, li) => (
                                    <p key={li}>{line}</p>
                                ))}
                            </div>
                        </div>
                    ))}

                    {loading && (
                        <div className="chat-bubble assistant">
                            <span className="chat-avatar">◎</span>
                            <div className="chat-bubble-content">
                                <div className="chat-typing">
                                    <span /><span /><span />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="chat-input-bar">
                    <textarea
                        ref={inputRef}
                        className="chat-input"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask about your habits, goals, or wellness..."
                        rows={1}
                        disabled={loading}
                    />
                    <button className="chat-send" onClick={sendMessage} disabled={loading || !input.trim()}>
                        →
                    </button>
                </div>
            </div>
        </div>
    );
}
