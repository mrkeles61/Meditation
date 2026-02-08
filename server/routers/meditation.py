from fastapi import APIRouter, Depends
from ..auth import get_current_user, CurrentUser
from ..database import supabase
from ..models import MeditationSessionCreate, MeditationSessionResponse, MeditationStats

router = APIRouter(prefix="/api/meditation", tags=["meditation"])


@router.post("/sessions", response_model=MeditationSessionResponse)
async def create_session(
    body: MeditationSessionCreate,
    user: CurrentUser = Depends(get_current_user),
):
    result = (
        supabase.table("meditation_sessions")
        .insert({
            "user_id": user.id,
            "duration_seconds": body.duration_seconds,
            "completed_seconds": body.completed_seconds,
            "sound_type": body.sound_type,
        })
        .execute()
    )
    return result.data[0]


@router.get("/sessions", response_model=list[MeditationSessionResponse])
async def list_sessions(
    limit: int = 20,
    user: CurrentUser = Depends(get_current_user),
):
    result = (
        supabase.table("meditation_sessions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", desc=True)
        .limit(limit)
        .execute()
    )
    return result.data


@router.get("/stats", response_model=MeditationStats)
async def get_stats(user: CurrentUser = Depends(get_current_user)):
    result = (
        supabase.table("meditation_sessions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", desc=True)
        .execute()
    )
    sessions = result.data or []
    total_sessions = len(sessions)
    total_seconds = sum(s.get("completed_seconds", 0) for s in sessions)

    avg_completion = 0.0
    if total_sessions > 0:
        completions = [
            s["completed_seconds"] / s["duration_seconds"]
            for s in sessions
            if s["duration_seconds"] > 0
        ]
        avg_completion = sum(completions) / len(completions) if completions else 0.0

    # Streak: consecutive days with at least one session
    streak = 0
    if sessions:
        from datetime import datetime, timedelta
        dates = sorted(set(
            datetime.fromisoformat(s["created_at"].replace("Z", "+00:00")).date()
            for s in sessions
        ), reverse=True)

        today = dates[0]
        for i, d in enumerate(dates):
            if d == today - timedelta(days=i):
                streak += 1
            else:
                break

    return MeditationStats(
        total_sessions=total_sessions,
        total_minutes=total_seconds // 60,
        average_completion=round(avg_completion * 100, 1),
        current_streak=streak,
    )
