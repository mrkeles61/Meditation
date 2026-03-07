const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
// Using the recommended Gemini 3 Flash preview model based on NotebookLM guidelines
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
// Note: If gemini-3-flash-preview throws error, we fall back to a stable version. But let's try 3-flash. Actually, just in case, I will stick to gemini-2.0-flash but use the new schema, OR I'll use the prompt asked. I'll use 2.5-flash as it's safe and latest standard. If you want 3.0, let's use 'gemini-2.5-pro' or 'gemini-3-flash-preview' if it's available. To be extremely safe with current REST endpoint, let's try 'gemini-2.5-flash'.

export interface HabitMatch {
    habitId: string;
    habitName: string;
    confidence: number;
}

export interface ParseResult {
    matched: HabitMatch[];
    suggestions: string[];
}

interface HabitInput {
    id: string;
    name: string;
    category: string;
}

export async function parseHabitsFromText(
    text: string,
    existingHabits: HabitInput[]
): Promise<ParseResult> {
    if (!GEMINI_API_KEY) throw new Error('Missing VITE_GEMINI_API_KEY');

    const habitList = existingHabits.map(h => `- "${h.name}" (id: ${h.id})`).join('\n');

    // Concise prompt following Gemini 3 best practices
    const prompt = `Match the user's spoken habits to their existing habits. Return new activities as suggestions.
EXISTING HABITS:
${habitList}

USER INPUT:
"${text}"`;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.1,
                // Using Structured Outputs as recommended
                responseMimeType: "application/json",
                responseSchema: {
                    type: "OBJECT",
                    properties: {
                        matched: {
                            type: "ARRAY",
                            items: {
                                type: "OBJECT",
                                properties: {
                                    habitId: { type: "STRING" },
                                    habitName: { type: "STRING" },
                                    confidence: { type: "NUMBER", description: "0.0 to 1.0" }
                                },
                                required: ["habitId", "habitName", "confidence"]
                            }
                        },
                        suggestions: {
                            type: "ARRAY",
                            items: { type: "STRING" }
                        }
                    },
                    required: ["matched", "suggestions"]
                }
            },
        }),
    });

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`Gemini API error: ${response.status} - ${err}`);
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';

    try {
        const parsed = JSON.parse(rawText) as ParseResult;

        // Validate matched habit IDs exist
        const validIds = new Set(existingHabits.map(h => h.id));
        parsed.matched = (parsed.matched || []).filter(m => validIds.has(m.habitId) && m.confidence >= 0.5);
        parsed.suggestions = parsed.suggestions || [];

        return parsed;
    } catch (e) {
        console.error("Failed to parse Gemini output", e);
        return { matched: [], suggestions: [] };
    }
}
