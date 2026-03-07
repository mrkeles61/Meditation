import { describe, it, expect, vi, beforeEach } from 'vitest';
import { parseHabitsFromText } from './gemini';

// Provide a mock API key
vi.stubEnv('VITE_GEMINI_API_KEY', 'test_api_key');

// Mock the global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('Gemini Habit Parsing Service', () => {
    beforeEach(() => {
        mockFetch.mockClear();
    });

    it('parses spoken text and matches existing habits', async () => {
        const mockApiResponse = {
            candidates: [{
                content: {
                    parts: [{
                        text: JSON.stringify({
                            matched: [
                                { habitId: 'h1', habitName: 'Meditate', confidence: 0.95 }
                            ],
                            suggestions: ['Drink more water']
                        })
                    }]
                }
            }]
        };

        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockApiResponse
        });

        const existingHabits = [
            { id: 'h1', name: 'Meditate', category: 'meditation' },
            { id: 'h2', name: 'Go for a run', category: 'exercise' }
        ];

        const result = await parseHabitsFromText('I meditated for 10 minutes today.', existingHabits);

        expect(mockFetch).toHaveBeenCalledTimes(1);
        expect(result.matched).toHaveLength(1);
        expect(result.matched[0].habitId).toBe('h1');
        expect(result.suggestions).toContain('Drink more water');
    });

    it('handles empty matched arrays properly', async () => {
        const mockApiResponse = {
            candidates: [{
                content: {
                    parts: [{
                        text: JSON.stringify({
                            matched: [],
                            suggestions: ['Read a book']
                        })
                    }]
                }
            }]
        };

        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockApiResponse
        });

        const result = await parseHabitsFromText('I did absolutely nothing.', [{ id: 'h1', name: 'Meditate', category: 'meditation' }]);

        expect(result.matched).toHaveLength(0);
        expect(result.suggestions).toContain('Read a book');
    });

    it('filters out low confidence matches', async () => {
        const mockApiResponse = {
            candidates: [{
                content: {
                    parts: [{
                        text: JSON.stringify({
                            matched: [
                                { habitId: 'h1', habitName: 'Meditate', confidence: 0.2 } // too low
                            ],
                            suggestions: []
                        })
                    }]
                }
            }]
        };

        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockApiResponse
        });

        const result = await parseHabitsFromText('Maybe I meditated?', [{ id: 'h1', name: 'Meditate', category: 'meditation' }]);

        expect(result.matched).toHaveLength(0); // Should be filtered out by confidence >= 0.5 rules in our code
    });

    it('filters out invalid IDs', async () => {
        const mockApiResponse = {
            candidates: [{
                content: {
                    parts: [{
                        text: JSON.stringify({
                            matched: [
                                { habitId: 'h999', habitName: 'Fake Habit', confidence: 0.99 }
                            ],
                            suggestions: []
                        })
                    }]
                }
            }]
        };

        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockApiResponse
        });

        const result = await parseHabitsFromText('I did fake habit', [{ id: 'h1', name: 'Meditate', category: 'meditation' }]);

        expect(result.matched).toHaveLength(0); // Should be filtered out
    });
});
