from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select, text
from sqlalchemy.orm import Session

import models
import schemas
from database import engine, get_db

app = FastAPI(title="Link Saver API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception as exc:
        db_status = f"error: {exc}"

    return {"status": "ok", "database": db_status}


@app.post("/links", response_model=schemas.LinkOut, status_code=201)
def create_link(link: schemas.LinkCreate, db: Session = Depends(get_db)):
    db_link = models.Link(**link.model_dump())
    db.add(db_link)
    db.commit()
    db.refresh(db_link)
    return db_link


@app.get("/links", response_model=list[schemas.LinkOut])
def list_links(db: Session = Depends(get_db)):
    return db.scalars(select(models.Link).order_by(models.Link.created_at.desc())).all()


@app.get("/links/{link_id}", response_model=schemas.LinkOut)
def get_link(link_id: int, db: Session = Depends(get_db)):
    link = db.get(models.Link, link_id)
    if link is None:
        raise HTTPException(status_code=404, detail="Link not found")
    return link


@app.patch("/links/{link_id}", response_model=schemas.LinkOut)
def update_link(link_id: int, update: schemas.LinkUpdate, db: Session = Depends(get_db)):
    link = db.get(models.Link, link_id)
    if link is None:
        raise HTTPException(status_code=404, detail="Link not found")

    for field, value in update.model_dump(exclude_unset=True).items():
        setattr(link, field, value)

    db.commit()
    db.refresh(link)
    return link


@app.delete("/links/{link_id}", status_code=204)
def delete_link(link_id: int, db: Session = Depends(get_db)):
    link = db.get(models.Link, link_id)
    if link is None:
        raise HTTPException(status_code=404, detail="Link not found")

    db.delete(link)
    db.commit()
