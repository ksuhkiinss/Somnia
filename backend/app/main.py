from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from .database import Base, engine
from . import models
from .database import SessionLocal
from .schemas import SleepRecordCreate
from sqlalchemy import desc

app = FastAPI()

Base.metadata.create_all(bind=engine)

BASE_DIR = Path(__file__).resolve().parent.parent.parent
FRONTEND_DIR = BASE_DIR / "frontend"

app.mount("/css", StaticFiles(directory=FRONTEND_DIR / "css"), name="css")
app.mount("/assets", StaticFiles(directory=FRONTEND_DIR / "assets"), name="assets")
app.mount("/js", StaticFiles(directory=FRONTEND_DIR / "js"), name="js")

@app.post("/sleep")

def create_sleep(record: SleepRecordCreate):

    db = SessionLocal()

    sleep = models.SleepRecord(

        start_time=record.start_time,

        end_time=record.end_time,

        duration=record.duration,

        rating=record.rating,

        mood=record.mood,

        note=record.note,

        dream=record.dream

    )

    db.add(sleep)

    db.commit()

    db.refresh(sleep)

    db.close()

    return {

        "message": "Sleep saved!",

        "id": sleep.id

    }

@app.get("/")
def home():
    return FileResponse(FRONTEND_DIR / "index.html")

@app.get("/sleep/latest")
def latest_sleep():

    db = SessionLocal()

    sleep = (
        db.query(models.SleepRecord)
        .order_by(desc(models.SleepRecord.id))
        .first()
    )

    db.close()

    if sleep is None:
        return {}

    return {
        "start_time": sleep.start_time,
        "end_time": sleep.end_time,
        "duration": sleep.duration,
        "rating": sleep.rating,
        "mood": sleep.mood,
        "dream": sleep.dream,
        "note": sleep.note
    }

@app.get("/sleep")
def all_sleep():

    db = SessionLocal()

    records = (
        db.query(models.SleepRecord)
        .order_by(desc(models.SleepRecord.id))
        .all()
    )

    db.close()

    return [
        {
            "id": r.id,
            "start_time": r.start_time,
            "end_time": r.end_time,
            "duration": r.duration,
            "rating": r.rating,
            "mood": r.mood,
            "dream": r.dream,
            "note": r.note
        }
        for r in records
    ] 

@app.get("/sleep/stats")
def sleep_stats():

    db = SessionLocal()

    records = db.query(models.SleepRecord).all()

    db.close()

    if not records:
        return {
            "total_duration": 0,
            "average_duration": 0,
            "sleep_days": 0,
            "goal_days": 0
        }

    total_duration = sum(r.duration for r in records)

    average_duration = round(total_duration / len(records))

    sleep_days = len(records)

    goal_days = sum(
        1 for r in records
        if r.duration >= 8 * 60
    )

    return {
        "total_duration": total_duration,
        "average_duration": average_duration,
        "sleep_days": sleep_days,
        "goal_days": goal_days
    }