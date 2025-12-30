from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from .. import models, schemas, auth
from ..database import get_db

router = APIRouter(
    prefix="/register",
    tags=["Recruiters"]
)

@router.post("/recruiter", response_model=schemas.RecruiterProfile)
def register_recruiter(profile: schemas.RecruiterProfileCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == profile.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    hashed_password = auth.get_password_hash(profile.password)
    db_user = models.User(email=profile.email, hashed_password=hashed_password, role="recruiter")
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    db_rec = models.RecruiterProfile(
        user_id=db_user.id,
        org_name=profile.org_name,
        org_type=profile.org_type,
        description=profile.description,
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
    db.add(db_rec)
    db.commit()
    db.refresh(db_rec)
    
    return db_rec
