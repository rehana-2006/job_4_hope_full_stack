from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schemas, auth
from ..database import get_db

router = APIRouter(
    prefix="/profile",
    tags=["Profile"]
)

@router.get("/me")
def get_my_profile(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Get current user's profile based on their role"""
    profile_data = {
        "email": current_user.email,
        "role": current_user.role
    }
    
    if current_user.role == "parent":
        parent = db.query(models.ParentProfile).filter(
            models.ParentProfile.user_id == current_user.id
        ).first()
        
        if parent:
            children = db.query(models.Child).filter(
                models.Child.parent_id == parent.id
            ).all()
            
            profile_data["profile"] = {
                "full_name": parent.full_name,
                "phone": parent.phone,
                "location": parent.location,
                "skills": parent.skills.split(",") if parent.skills else [],
                "experience": parent.experience,
                "availability": parent.availability.split(",") if parent.availability else [],
                "children": [
                    {
                        "name": child.name,
                        "age": child.age,
                        "grade": child.grade,
                        "school_status": child.school_status,
                        "interests": child.interests
                    } for child in children
                ]
            }
    
    elif current_user.role == "educator":
        educator = db.query(models.EducatorProfile).filter(
            models.EducatorProfile.user_id == current_user.id
        ).first()
        
        if educator:
            profile_data["profile"] = {
                "org_name": educator.org_name,
                "org_type": educator.org_type,
                "description": educator.description,
                "capacity": educator.capacity,
                "age_range": educator.age_range,
                "specialization": educator.specialization.split(",") if educator.specialization else [],
                "contact_name": educator.contact_name,
                "job_title": educator.job_title,
                "phone": educator.phone,
                "website": educator.website,
                "address": educator.address,
                "city": educator.city,
                "state": educator.state,
                "pincode": educator.pincode,
                "country": educator.country
            }
    
    
    if current_user.role == "recruiter":
        recruiter = db.query(models.RecruiterProfile).filter(
            models.RecruiterProfile.user_id == current_user.id
        ).first()
        
        if recruiter:
            profile_data["profile"] = {
                "org_name": recruiter.org_name,
                "org_type": recruiter.org_type,
                "description": recruiter.description,
                "contact_name": recruiter.contact_name,
                "job_title": recruiter.job_title,
                "phone": recruiter.phone,
                "website": recruiter.website,
                "address": recruiter.address,
                "city": recruiter.city,
                "state": recruiter.state,
                "pincode": recruiter.pincode,
                "country": recruiter.country
            }
    
    return profile_data

@router.put("/educator/me")
def update_educator_profile(
    profile_update: schemas.EducatorProfileUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    if current_user.role != "educator":
        raise HTTPException(status_code=403, detail="Only educators can update this profile")
    
    educator = db.query(models.EducatorProfile).filter(
        models.EducatorProfile.user_id == current_user.id
    ).first()
    
    if not educator:
        raise HTTPException(status_code=404, detail="Profile not found")
        
    # Update fields
    educator.org_name = profile_update.org_name
    educator.org_type = profile_update.org_type
    educator.description = profile_update.description
    educator.capacity = profile_update.capacity
    educator.age_range = profile_update.age_range
    educator.contact_name = profile_update.contact_name
    educator.job_title = profile_update.job_title
    educator.phone = profile_update.phone
    educator.website = profile_update.website
    educator.city = profile_update.city
    educator.state = profile_update.state
    # Handle list to string conversion
    if profile_update.specialization:
        educator.specialization = ",".join(profile_update.specialization)
    
    db.commit()
    db.refresh(educator)
    return {"message": "Profile updated successfully"}
