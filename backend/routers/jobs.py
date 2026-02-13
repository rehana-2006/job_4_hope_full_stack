from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from .. import models, schemas, auth
from ..database import get_db

router = APIRouter(
    prefix="/jobs",
    tags=["Jobs"]
)

@router.post("/", response_model=schemas.Job)
def create_job(
    job: schemas.JobCreate, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(auth.get_current_user)
):
    if current_user.role != "recruiter":
        raise HTTPException(status_code=403, detail="Only recruiters can post jobs")
    
    # Needs to fetch RecruiterProfile ID from User
    recruiter = db.query(models.RecruiterProfile).filter(models.RecruiterProfile.user_id == current_user.id).first()
    if not recruiter:
         raise HTTPException(status_code=404, detail="Recruiter profile not found")

    db_job = models.Job(
        recruiter_id=recruiter.id,
        title=job.title,
        description=job.description,
        location=job.location,
        wage=job.wage,
        frequency=job.frequency,
        skills_required=",".join(job.skills_required)
    )
    db.add(db_job)
    db.commit()
    db.refresh(db_job)
    
    # Populate helper for response
    db_job.skills_required_list = db_job.skills_required.split(",") if db_job.skills_required else []
    
    return db_job

@router.get("/", response_model=List[schemas.Job])
def get_jobs(
    skill: Optional[str] = None, 
    location: Optional[str] = None, 
    frequency: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.Job)
    if location:
        query = query.filter(models.Job.location.ilike(f"%{location}%"))
    if frequency:
        query = query.filter(models.Job.frequency.ilike(f"%{frequency}%"))
    
    jobs = query.all()
    
    # Filter by skill in python (since CSV storage) or improved query
    if skill:
        jobs = [j for j in jobs if skill.lower() in (j.skills_required or "").lower()]
        
    for j in jobs:
        j.skills_required_list = j.skills_required.split(",") if j.skills_required else []
        
    return jobs

@router.post("/{job_id}/apply", response_model=schemas.Application)
def apply_for_job(
    job_id: int, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(auth.get_current_user)
):
    if current_user.role != "parent":
        raise HTTPException(status_code=403, detail="Only parents can apply for jobs")
        
    parent = db.query(models.ParentProfile).filter(models.ParentProfile.user_id == current_user.id).first()
    
    # Check if already applied
    existing = db.query(models.Application).filter(models.Application.job_id == job_id, models.Application.parent_id == parent.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already applied to this job")
        
    application = models.Application(
        job_id=job_id,
        parent_id=parent.id
    )
    db.add(application)
    db.commit()
    db.refresh(application)
    return application

@router.get("/my", response_model=List[schemas.Job])
def get_my_jobs(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    if current_user.role != "recruiter":
        raise HTTPException(status_code=403, detail="Only recruiters can view their jobs")
    
    recruiter = db.query(models.RecruiterProfile).filter(models.RecruiterProfile.user_id == current_user.id).first()
    if not recruiter:
        return []
        
    jobs = db.query(models.Job).filter(models.Job.recruiter_id == recruiter.id).all()
    for j in jobs:
        j.skills_required_list = j.skills_required.split(",") if j.skills_required else []
    return jobs

@router.get("/applications/my", response_model=List[schemas.Application])
def get_my_applications(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    if current_user.role != "parent":
        raise HTTPException(status_code=403, detail="Only parents have applications")
    
    parent = db.query(models.ParentProfile).filter(models.ParentProfile.user_id == current_user.id).first()
    if not parent:
        return []
        
    applications = db.query(models.Application).filter(
        models.Application.parent_id == parent.id,
        models.Application.job_id.isnot(None)
    ).all()
    
    for app in applications:
        job = db.query(models.Job).filter(models.Job.id == app.job_id).first()
        if job:
            app.job_title = job.title
            app.location = job.location
            app.wage = job.wage
            app.frequency = job.frequency
            recruiter = db.query(models.RecruiterProfile).filter(models.RecruiterProfile.id == job.recruiter_id).first()
            if recruiter:
                app.recruiter_name = recruiter.org_name
            app.description = job.description
                
    return applications

@router.get("/{job_id}/applicants")
def get_job_applicants(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Get all applicants for a specific job (Recruiter only)"""
    if current_user.role != "recruiter":
        raise HTTPException(status_code=403, detail="Only recruiters can view applicants")
    
    # Verify job belongs to this recruiter
    recruiter = db.query(models.RecruiterProfile).filter(
        models.RecruiterProfile.user_id == current_user.id
    ).first()
    
    job = db.query(models.Job).filter(
        models.Job.id == job_id,
        models.Job.recruiter_id == recruiter.id
    ).first()
    
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Get all applications with parent details
    applications = db.query(models.Application).filter(
        models.Application.job_id == job_id
    ).all()
    
    result = []
    for app in applications:
        parent = db.query(models.ParentProfile).filter(
            models.ParentProfile.id == app.parent_id
        ).first()
        
        if parent:
            user = db.query(models.User).filter(models.User.id == parent.user_id).first()
            result.append({
                "application_id": app.id,
                "status": app.status,
                "applied_at": app.applied_at,
                "parent": {
                    "name": parent.full_name,
                    "email": user.email if user else None,
                    "phone": parent.phone,
                    "location": parent.location,
                    "skills": parent.skills.split(",") if parent.skills else [],
                    "experience": parent.experience,
                    "availability": parent.availability.split(",") if parent.availability else []
                }
            })
    
    return result

@router.put("/applications/{application_id}/status")
def update_application_status(
    application_id: int,
    status: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Update application status (Recruiter only)"""
    if current_user.role != "recruiter":
        raise HTTPException(status_code=403, detail="Only recruiters can update status")
    
    if status not in ["pending", "accepted", "rejected"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    application = db.query(models.Application).filter(
        models.Application.id == application_id
    ).first()
    
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    application.status = status
    db.commit()
    
@router.delete("/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_job(
    job_id: int, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(auth.get_current_user)
):
    if current_user.role != "recruiter":
        raise HTTPException(status_code=403, detail="Only recruiters can delete jobs")
    
    recruiter = db.query(models.RecruiterProfile).filter(models.RecruiterProfile.user_id == current_user.id).first()
    if not recruiter:
        raise HTTPException(status_code=404, detail="Recruiter profile not found")

    job = db.query(models.Job).filter(models.Job.id == job_id, models.Job.recruiter_id == recruiter.id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    db.delete(job)
    db.commit()
    return None
