from sqlalchemy import Column, Integer, String, DateTime
from .database import Base

class SleepRecord(Base):

    __tablename__ = "sleep_records"

    id = Column(Integer, primary_key=True, index=True)

    start_time = Column(DateTime(timezone=True))

    end_time = Column(DateTime(timezone=True))

    duration = Column(Integer)

    rating = Column(Integer)

    mood = Column(String)

    note = Column(String)

    dream = Column(String)