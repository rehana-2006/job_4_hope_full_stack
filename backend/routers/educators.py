from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from .. import models, schemas, auth
from ..database import get_db

router = APIRouter(
    prefix="/register",
    tags=["Educators"]
)

@router.post("/educator", response_model=schemas.EducatorProfile)
def register_educator(profile: schemas.EducatorProfileCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == profile.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    hashed_password = auth.get_password_hash(profile.password)
    db_user = models.User(email=profile.email, hashed_password=hashed_password, role="educator")
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    db_edu = models.EducatorProfile(
        user_id=db_user.id,
        org_name=profile.org_name,
        org_type=profile.org_type,
        description=profile.description,
        capacity=profile.capacity,
        age_range=profile.age_range,
        specialization=",".join(profile.specialization),
        contact_name=profile.contact_name,
        job_title=profile.job_title,
        phone=profile.phone,
        website=profile.website,
        address=profile.address,
        city=profile.city,
        state=profile.state,
        pincode=profile.pincode,
        country=profile.country
    )
    db.add(db_edu)
    db.commit()
    db.refresh(db_edu)
    
    return {
        "id": db_edu.id,
        "user_id": db_edu.user_id,
        "org_name": db_edu.org_name,
        "org_type": db_edu.org_type,
        "description": db_edu.description,
        "capacity": db_edu.capacity,
        "age_range": db_edu.age_range,
        "specialization": db_edu.specialization.split(",") if db_edu.specialization else [],
        "contact_name": db_edu.contact_name,
        "job_title": db_edu.job_title,
        "phone": db_edu.phone,
        "website": db_edu.website,
        "address": db_edu.address,
        "city": db_edu.city,
        "state": db_edu.state,
        "pincode": db_edu.pincode,
        "country": db_edu.country
    }
