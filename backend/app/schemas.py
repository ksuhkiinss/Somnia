from datetime import datetime

from pydantic import BaseModel


class SleepRecordCreate(BaseModel):

    start_time: datetime

    end_time: datetime

    duration: int

    rating: int

    mood: str

    note: str

    dream: str