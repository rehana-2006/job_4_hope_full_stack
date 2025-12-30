from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas
from ..database import get_db

router = APIRouter(
    prefix="/contact",
    tags=["Contact"]
)

@router.post("/", response_model=schemas.ContactMessage)
def submit_contact_message(
    message: schemas.ContactMessageCreate,
    db: Session = Depends(get_db)
):
    """Submit a contact form message"""
    db_message = models.ContactMessage(
        full_name=message.full_name,
        email=message.email,
        category=message.category,
        subject=message.subject,
        message=message.message
    )
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    return db_message

@router.get("/", response_model=List[schemas.ContactMessage])
def get_contact_messages(db: Session = Depends(get_db)):
    """Get all contact messages (admin only - add auth later)"""
    return db.query(models.ContactMessage).order_by(models.ContactMessage.created_at.desc()).all()
