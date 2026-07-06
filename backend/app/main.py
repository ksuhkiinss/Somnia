from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from .database import Base, engine
from . import models
from .database import SessionLocal
from .schemas import SleepRecordCreate

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