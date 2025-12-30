from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from .. import models, schemas, auth
from ..database import get_db

router = APIRouter(
    prefix="/register",
    tags=["Parents"]
)

@router.post("/parent", response_model=schemas.ParentProfile)
def register_parent(profile: schemas.ParentProfileCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == profile.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = auth.get_password_hash(profile.password)
    db_user = models.User(email=profile.email, hashed_password=hashed_password, role="parent")
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    db_parent = models.ParentProfile(
        user_id=db_user.id,
        full_name=profile.full_name,
        phone=profile.phone,
        location=profile.location,
        skills=",".join(profile.skills),
        experience=profile.experience,
        availability=",".join(profile.availability)
    )
    db.add(db_parent)
    db.commit()
    db.refresh(db_parent)
    
    for child in profile.children:
        db_child = models.Child(
            parent_id=db_parent.id,
            name=child.name,
            age=child.age,
            grade=child.grade,
            school_status=child.school_status,
            interests=child.interests
        )
        db.add(db_child)
    
    db.commit()
    db.refresh(db_parent)
    
    return {
        "id": db_parent.id,
        "user_id": db_parent.user_id,
        "full_name": db_parent.full_name,
        "phone": db_parent.phone,
        "location": db_parent.location,
        "skills": db_parent.skills.split(",") if db_parent.skills else [],
        "experience": db_parent.experience,
        "availability": db_parent.availability.split(",") if db_parent.availability else [],
        "children": db_parent.children
    }

@router.put("/me", response_model=schemas.ParentProfile)
def update_profile(
    profile_update: schemas.ParentProfileCreate, # Reusing Create schema for simplicity
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    if current_user.role != "parent":
        raise HTTPException(status_code=403, detail="Only parents can update their profile")
        
    db_parent = db.query(models.ParentProfile).filter(models.ParentProfile.user_id == current_user.id).first()
    if not db_parent:
         raise HTTPException(status_code=404, detail="Profile not found")
         
    # Update fields
    db_parent.full_name = profile_update.full_name
    db_parent.phone = profile_update.phone
    db_parent.location = profile_update.location
    db_parent.skills = ",".join(profile_update.skills)
    db_parent.experience = profile_update.experience
    
    # Update Children - Replace all strategy (simple)
    # First delete existing
    db.query(models.Child).filter(models.Child.parent_id == db_parent.id).delete()
    
    # Add new
    for child in profile_update.children:
        db_child = models.Child(
            parent_id=db_parent.id,
            name=child.name,
            age=child.age,
            grade=child.grade,
            school_status=child.school_status,
            interests=child.interests
        )
        db.add(db_child)
        
    db.commit()
    db.refresh(db_parent)
    
    return {
        "id": db_parent.id,
        "user_id": db_parent.user_id,
        "full_name": db_parent.full_name,
        "phone": db_parent.phone,
        "location": db_parent.location,
        "skills": db_parent.skills.split(",") if db_parent.skills else [],
        "experience": db_parent.experience,
        "availability": db_parent.availability.split(",") if db_parent.availability else [],
        "children": db_parent.children
    }
