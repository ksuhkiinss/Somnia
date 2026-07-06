from sqlalchemy import Column, Integer, String, DateTime
from .database import Base


class SleepRecord(Base):
    __tablename__ = "sleep_records"

    id = Column(Integer, primary_key=True, index=True)

    start_time = Column(DateTime)

    end_time = Column(DateTime)

    duration = Column(Integer)

    rating = Column(Integer)

    mood = Column(String)

    note = Column(String)

    dream = Column(String)