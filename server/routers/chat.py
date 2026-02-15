import os
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from ..auth import get_current_user, CurrentUser
from ..database import supabase

router = APIRouter(prefix="/api/chat", tags=["chat"])

# Set GEMINI_API_KEY env var so google-genai SDK picks it up automatically
_api_key = os.getenv("GOOGLE_API_KEY", "") or os.getenv("GEMINI_API_KEY", "")
if _api_key:
    os.environ["GEMINI_API_KEY"] = _api_key

_client = None

def get_genai_client():
    global _client
    if _client is None:
        from google import genai
        _client = genai.Client()
    return _client


class ChatRequest(BaseModel):
    message: str
    conversation_id: str | None = None


class ChatResponse(BaseModel):
    reply: str
    conversation_id: str


def build_user_context(user_id: str) -> str:
    """Gather user's habit, meditation, and weight data for the AI system prompt."""
    today = datetime.utcnow().date()
    today_str = today.isoformat()
    week_ago = (today - timedelta(days=7)).isoformat()
    month_ago = (today - timedelta(days=30)).isoformat()

    sections: list[str] = []

    # Profile
    try:
        profile = supabase.table("profiles").select("*").eq("id", user_id).single().execute()
        if profile.data:
            p = profile.data
            name = p.get("display_name") or p.get("full_name") or "User"
            sections.append(f"User: {name}")
            if p.get("weight_goal_kg"):
                sections.append(f"Weight goal: {p['weight_goal_kg']} kg")
    except Exception:
        pass

    # Habits
    try:
        habits_res = supabase.table("habits").select("id, name, icon, category").eq("user_id", user_id).eq("archived", False).execute()
        habits = habits_res.data or []
        if habits:
            logs_res = supabase.table("habit_logs").select("habit_id, logged_at").eq("user_id", user_id).gte("logged_at", month_ago).execute()
            logs = logs_res.data or []

            log_map: dict[str, list[str]] = {}
            for l in logs:
                log_map.setdefault(l["habit_id"], []).append(l["logged_at"])

            habit_lines = []
            for h in habits:
                dates = sorted(log_map.get(h["id"], []), reverse=True)
                done_today = today_str in dates
                done_7d = sum(1 for d in dates if d >= week_ago)
                done_30d = len(dates)

                # Streak
                streak = 0
                check = today
                if not done_today:
                    check = today - timedelta(days=1)
                for i in range(365):
                    if (check - timedelta(days=i)).isoformat() in dates:
                        streak += 1
                    else:
                        break

                habit_lines.append(
                    f"  {h['icon']} {h['name']}: today={'✓' if done_today else '✗'}, "
                    f"7d={done_7d}/7, 30d={done_30d}/30, streak={streak}d"
                )

            sections.append("Habits:\n" + "\n".join(habit_lines))
    except Exception:
        pass

    # Meditation
    try:
        med_res = supabase.table("meditation_sessions").select("completed_seconds, created_at").eq("user_id", user_id).order("created_at", desc=True).limit(30).execute()
        sessions = med_res.data or []
        if sessions:
            total_min = sum(s.get("completed_seconds", 0) for s in sessions) // 60
            this_week = [s for s in sessions if s["created_at"][:10] >= week_ago]
            sections.append(
                f"Meditation: {len(sessions)} sessions (30d), {total_min} total min, "
                f"{len(this_week)} this week"
            )
    except Exception:
        pass

    # Weight
    try:
        weight_res = supabase.table("weight_entries").select("weight_kg, logged_at").eq("user_id", user_id).order("logged_at", desc=True).limit(10).execute()
        entries = weight_res.data or []
        if entries:
            latest = entries[0]
            trend = ""
            if len(entries) >= 2:
                diff = round(entries[0]["weight_kg"] - entries[-1]["weight_kg"], 1)
                trend = f", trend: {'↓' if diff < 0 else '↑'}{abs(diff)}kg over {len(entries)} entries"
            sections.append(f"Weight: {latest['weight_kg']}kg (last: {latest['logged_at']}){trend}")
    except Exception:
        pass

    return "\n".join(sections) if sections else "No data available yet."


SYSTEM_PROMPT = """You are a supportive personal wellness coach for Ultraviolet Perigee, a habit tracking and mindfulness app. Your name is Perigee.

You have access to the user's real data below. Use it to give personalized, actionable advice. Be warm, concise, and encouraging. Use emojis sparingly. Reference specific habit names and numbers when relevant.

When the user asks "how am I doing?" or similar, analyze their actual streaks, completion rates, and trends.

Keep responses focused and under 200 words unless the user asks for detail.

=== USER DATA ===
{context}
=== END DATA ===

Current date: {today}"""


@router.post("", response_model=ChatResponse)
async def chat(body: ChatRequest, user: CurrentUser = Depends(get_current_user)):
    context = build_user_context(user.id)
    today_str = datetime.utcnow().date().isoformat()

    system = SYSTEM_PROMPT.format(context=context, today=today_str)

    # Load conversation history if continuing
    history: list[dict] = []
    conv_id = body.conversation_id
    if conv_id:
        prev = (
            supabase.table("chat_messages")
            .select("role, content")
            .eq("user_id", user.id)
            .eq("conversation_id", conv_id)
            .order("created_at")
            .limit(20)
            .execute()
        )
        for msg in (prev.data or []):
            history.append({"role": msg["role"], "parts": [{"text": msg["content"]}]})

    # Add current message
    history.append({"role": "user", "parts": [{"text": body.message}]})

    # Call Gemini
    from google import genai
    client = get_genai_client()
    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=history,
        config=genai.types.GenerateContentConfig(
            system_instruction=system,
            temperature=0.7,
            max_output_tokens=1024,
        ),
    )

    reply = response.text or "I'm not sure how to respond to that."

    # Save to DB
    if not conv_id:
        import uuid
        conv_id = str(uuid.uuid4())

    supabase.table("chat_messages").insert([
        {"user_id": user.id, "conversation_id": conv_id, "role": "user", "content": body.message},
        {"user_id": user.id, "conversation_id": conv_id, "role": "assistant", "content": reply},
    ]).execute()

    return ChatResponse(reply=reply, conversation_id=conv_id)


@router.get("/conversations")
async def list_conversations(user: CurrentUser = Depends(get_current_user)):
    """List recent conversations with their first message."""
    raw = (
        supabase.table("chat_messages")
        .select("conversation_id, content, created_at")
        .eq("user_id", user.id)
        .eq("role", "user")
        .order("created_at", desc=True)
        .limit(50)
        .execute()
    )
    seen: set[str] = set()
    convs = []
    for msg in (raw.data or []):
        cid = msg["conversation_id"]
        if cid not in seen:
            seen.add(cid)
            convs.append({
                "conversation_id": cid,
                "preview": msg["content"][:80],
                "created_at": msg["created_at"],
            })
    return convs


@router.get("/history/{conversation_id}")
async def get_history(conversation_id: str, user: CurrentUser = Depends(get_current_user)):
    result = (
        supabase.table("chat_messages")
        .select("role, content, created_at")
        .eq("user_id", user.id)
        .eq("conversation_id", conversation_id)
        .order("created_at")
        .execute()
    )
    return result.data or []
