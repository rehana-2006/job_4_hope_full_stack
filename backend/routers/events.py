from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from .. import models, schemas, auth
from ..database import get_db

router = APIRouter(
    prefix="/events",
    tags=["Events"]
)

@router.post("/", response_model=schemas.Event)
def create_event(
    event: schemas.EventCreate, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(auth.get_current_user)
):
    if current_user.role != "educator":
        raise HTTPException(status_code=403, detail="Only educators can post events")
    
    educator = db.query(models.EducatorProfile).filter(models.EducatorProfile.user_id == current_user.id).first()
    if not educator:
         raise HTTPException(status_code=404, detail="Educator profile not found")

    db_event = models.Event(
        educator_id=educator.id,
        title=event.title,
        description=event.description,
        location=event.location,
        date=event.date,
        time=event.time,
        category=event.category
    )
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event

@router.get("/", response_model=List[schemas.Event])
def get_events(
    category: Optional[str] = None,
    location: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.Event)
    if location:
        query = query.filter(models.Event.location.ilike(f"%{location}%"))
    if category:
        query = query.filter(models.Event.category == category)
    
    return query.all()

@router.get("/my", response_model=List[schemas.Event])
def get_my_events(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    if current_user.role != "educator":
        raise HTTPException(status_code=403, detail="Only educators can view their events")
    
    educator = db.query(models.EducatorProfile).filter(models.EducatorProfile.user_id == current_user.id).first()
    if not educator:
        return []
    
    events = db.query(models.Event).filter(models.Event.educator_id == educator.id).all()
    
    # Add enrollment count to each event
    for event in events:
        enrollment_count = db.query(models.Enrollment).filter(
            models.Enrollment.event_id == event.id
        ).count()
        event.enrollment_count = enrollment_count
    
    return events

@router.post("/{event_id}/enroll", response_model=schemas.Enrollment)
def enroll_in_event(
    event_id: int,
    child_name: str,
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(auth.get_current_user)
):
    if current_user.role != "parent":
        raise HTTPException(status_code=403, detail="Only parents can enroll children")
        
    parent = db.query(models.ParentProfile).filter(models.ParentProfile.user_id == current_user.id).first()
    
    enrollment = models.Enrollment(
        event_id=event_id,
        parent_id=parent.id,
        child_name=child_name
    )
    db.add(enrollment)
    db.commit()
    db.refresh(enrollment)
    return enrollment

@router.get("/{event_id}/enrollments", response_model=List[schemas.EnrollmentDetail])
def get_event_enrollments(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Get all enrollments for a specific event (Educator only)"""
    if current_user.role != "educator":
        raise HTTPException(status_code=403, detail="Only educators can view enrollments")
    
    # Verify event belongs to this educator
    educator = db.query(models.EducatorProfile).filter(
        models.EducatorProfile.user_id == current_user.id
    ).first()
    
    event = db.query(models.Event).filter(
        models.Event.id == event_id,
        models.Event.educator_id == educator.id
    ).first()
    
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    # Get all enrollments with parent details
    enrollments = db.query(models.Enrollment).filter(
        models.Enrollment.event_id == event_id
    ).all()
    
    result = []
    for enr in enrollments:
        parent = db.query(models.ParentProfile).filter(
            models.ParentProfile.id == enr.parent_id
        ).first()
        
        if parent:
            user = db.query(models.User).filter(models.User.id == parent.user_id).first()
            result.append({
                "enrollment_id": enr.id,
                "child_name": enr.child_name,
                "status": enr.status,
                "enrolled_at": enr.enrolled_at,
                "parent": {
                    "name": parent.full_name,
                    "email": user.email if user else None,
                    "phone": parent.phone,
                    "location": parent.location
                }
            })
    
    return result

@router.put("/enrollments/{enrollment_id}/status")
def update_enrollment_status(
    enrollment_id: int,
    status: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Update enrollment status (Educator only)"""
    if current_user.role != "educator":
        raise HTTPException(status_code=403, detail="Only educators can update status")
    
    if status not in ["pending", "enrolled", "declined"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    enrollment = db.query(models.Enrollment).filter(
        models.Enrollment.id == enrollment_id
    ).first()
    
    if not enrollment:
        raise HTTPException(status_code=404, detail="Enrollment not found")
    
    enrollment.status = status
    db.commit()
    
    return {"message": "Status updated successfully", "status": status}

@router.get("/enrollments/my", response_model=List[schemas.Enrollment])
def get_my_enrollments(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    if current_user.role != "parent":
        raise HTTPException(status_code=403, detail="Only parents can view their enrollments")
    
    parent = db.query(models.ParentProfile).filter(models.ParentProfile.user_id == current_user.id).first()
    if not parent:
        return []
        
    enrollments = db.query(models.Enrollment).filter(models.Enrollment.parent_id == parent.id).all()
    
    # Populate helper fields if schema allows
    for en in enrollments:
        event = db.query(models.Event).filter(models.Event.id == en.event_id).first()
        if event:
            en.event_title = event.title
            en.event_date = str(event.date) if event.date else None
            en.event_time = str(event.time) if event.time else None
            en.location = event.location
            en.event_description = event.description
            en.event_category = event.category
            
    return enrollments
