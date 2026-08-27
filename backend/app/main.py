from pathlib import Path

from fastapi import FastAPI, HTTPException
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


# ==========================
# Редагування запису
# ==========================

@app.put("/sleep/{sleep_id}")
def update_sleep(sleep_id: int, record: SleepRecordCreate):

    db = SessionLocal()

    sleep = (
        db.query(models.SleepRecord)
        .filter(models.SleepRecord.id == sleep_id)
        .first()
    )

    if sleep is None:

        db.close()

        raise HTTPException(
            status_code=404,
            detail="Запис не знайдено"
        )

    sleep.start_time = record.start_time
    sleep.end_time = record.end_time
    sleep.duration = record.duration
    sleep.rating = record.rating
    sleep.mood = record.mood
    sleep.note = record.note
    sleep.dream = record.dream

    db.commit()

    db.refresh(sleep)

    db.close()

    return {
        "message": "Sleep updated!",
        "id": sleep.id
    }


# ==========================
# Видалення запису
# ==========================

@app.delete("/sleep/{sleep_id}")
def delete_sleep(sleep_id: int):

    db = SessionLocal()

    sleep = (
        db.query(models.SleepRecord)
        .filter(models.SleepRecord.id == sleep_id)
        .first()
    )

    if sleep is None:

        db.close()

        raise HTTPException(
            status_code=404,
            detail="Запис не знайдено"
        )

    db.delete(sleep)

    db.commit()

    db.close()

    return {
        "message": "Sleep deleted!",
        "id": sleep_id
    }


@app.get("/")
def home():
    return FileResponse(FRONTEND_DIR / "index.html")


@app.get("/history")
def history():
    return FileResponse(FRONTEND_DIR / "pages" / "history.html")


@app.get("/calendar")
def calendar():
    return FileResponse(FRONTEND_DIR / "pages" / "calendar.html")


@app.get("/dreams")
def dreams():
    return FileResponse(FRONTEND_DIR / "pages" / "dreams.html")


@app.get("/goals")
def goals():
    return FileResponse(FRONTEND_DIR / "pages" / "goals.html")


@app.get("/analytics")
def analytics():
    return FileResponse(FRONTEND_DIR / "pages" / "analytics.html")


@app.get("/settings")
def settings():
    return FileResponse(FRONTEND_DIR / "pages" / "settings.html")


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
        .order_by(desc(models.SleepRecord.start_time))
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

    # Загальна тривалість усіх снів
    total_duration = sum(r.duration for r in records)

    # Групуємо сни за датою початку сну
    sleep_by_day = {}

    for r in records:

        sleep_date = r.start_time.date()

        if sleep_date not in sleep_by_day:
            sleep_by_day[sleep_date] = 0

        sleep_by_day[sleep_date] += r.duration

    # Кількість днів, у яких був хоча б один сон
    sleep_days = len(sleep_by_day)

    # Середня тривалість сну за день
    average_duration = round(
        total_duration / sleep_days
    )

    # Кількість днів, коли загальна тривалість сну >= 8 годин
    goal_days = sum(
        1
        for duration in sleep_by_day.values()
        if duration >= 8 * 60
    )

    return {
        "total_duration": total_duration,
        "average_duration": average_duration,
        "sleep_days": sleep_days,
        "goal_days": goal_days
    }