const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

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

    const habitList = existingHabits.map(h => `- "${h.name}" (id: ${h.id}, category: ${h.category})`).join('\n');

    const prompt = `You are a habit tracking assistant. The user has spoken or typed a message about their day. Your job is to:

1. Match which of their existing habits were completed based on what they said.
2. Suggest any NEW habits they mentioned but don't currently track.

EXISTING HABITS:
${habitList}

USER MESSAGE:
"${text}"

Respond ONLY with valid JSON in this exact format, no markdown or explanation:
{
  "matched": [
    { "habitId": "uuid-here", "habitName": "Meditation", "confidence": 0.95 }
  ],
  "suggestions": ["Journaling", "Stretching"]
}

Rules:
- confidence should be 0.0-1.0 based on how certain you are the user completed that habit
- Only include matches with confidence >= 0.5
- suggestions should be activity names the user mentioned that aren't in their existing habits list
- If nothing matches, return empty arrays
- Do NOT invent habits the user didn't mention`;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.1,
                maxOutputTokens: 1024,
            },
        }),
    });

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`Gemini API error: ${response.status} - ${err}`);
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Extract JSON from response (handle markdown code fences)
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
        return { matched: [], suggestions: [] };
    }

    const parsed = JSON.parse(jsonMatch[0]) as ParseResult;

    // Validate matched habit IDs exist
    const validIds = new Set(existingHabits.map(h => h.id));
    parsed.matched = parsed.matched.filter(m => validIds.has(m.habitId));

    return parsed;
}
