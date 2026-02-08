from pydantic import BaseModel
from typing import Optional


class MeditationSessionCreate(BaseModel):
    duration_seconds: int
    completed_seconds: int
    sound_type: str = "silence"


class MeditationSessionResponse(BaseModel):
    id: str
    user_id: str
    duration_seconds: int
    completed_seconds: int
    sound_type: str
    created_at: str


class MeditationStats(BaseModel):
    total_sessions: int
    total_minutes: int
    average_completion: float
    current_streak: int


class UpdateProfile(BaseModel):
    display_name: Optional[str] = None
