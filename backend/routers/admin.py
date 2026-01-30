from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from datetime import datetime, timedelta
from .. import models, schemas, auth
from ..database import get_db

router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)

# Helper to verify admin role
def verify_admin(current_user: models.User = Depends(auth.get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

@router.get("/reports")
def get_all_reports(
    db: Session = Depends(get_db),
    admin: models.User = Depends(verify_admin)
):
    """Get all incident reports"""
    reports = db.query(models.IncidentReport).order_by(models.IncidentReport.id.desc()).all()
    return reports

@router.get("/statistics")
def get_statistics(
    db: Session = Depends(get_db),
    admin: models.User = Depends(verify_admin)
):
    """Get platform statistics"""
    total_users = db.query(models.User).count()
    total_parents = db.query(models.User).filter(models.User.role == "parent").count()
    total_educators = db.query(models.User).filter(models.User.role == "educator").count()
    total_recruiters = db.query(models.User).filter(models.User.role == "recruiter").count()
    
    total_jobs = db.query(models.Job).count()
    total_applications = db.query(models.Application).count()
    total_events = db.query(models.Event).count()
    total_reports = db.query(models.IncidentReport).count()
    
    # Recent activity (last 7 days)
    week_ago = datetime.utcnow() - timedelta(days=7)
    recent_jobs = db.query(models.Job).filter(models.Job.created_at >= week_ago).count()
    recent_applications = db.query(models.Application).filter(models.Application.applied_at >= week_ago).count()
    
    return {
        "users": {
            "total": total_users,
            "parents": total_parents,
            "educators": total_educators,
            "recruiters": total_recruiters
        },
        "jobs": {
            "total": total_jobs,
            "recent": recent_jobs
        },
        "applications": {
            "total": total_applications,
            "recent": recent_applications
        },
        "events": {
            "total": total_events
        },
        "reports": {
            "total": total_reports
        }
    }

@router.get("/users")
def get_all_users(
    db: Session = Depends(get_db),
    admin: models.User = Depends(verify_admin)
):
    """Get all users with their profiles"""
    users = db.query(models.User).all()
    result = []
    
    for user in users:
        user_data = {
            "id": user.id,
            "email": user.email,
            "role": user.role,
            "profile": None
        }
        
        if user.role == "parent":
            profile = db.query(models.ParentProfile).filter(models.ParentProfile.user_id == user.id).first()
            if profile:
                user_data["profile"] = {
                    "full_name": profile.full_name,
                    "phone": profile.phone,
                    "location": profile.location
                }
        elif user.role == "educator":
            profile = db.query(models.EducatorProfile).filter(models.EducatorProfile.user_id == user.id).first()
            if profile:
                user_data["profile"] = {
                    "org_name": profile.org_name,
                    "contact_name": profile.contact_name,
                    "phone": profile.phone
                }
        elif user.role == "recruiter":
            profile = db.query(models.RecruiterProfile).filter(models.RecruiterProfile.user_id == user.id).first()
            if profile:
                user_data["profile"] = {
                    "org_name": profile.org_name,
                    "contact_name": profile.contact_name,
                    "phone": profile.phone
                }
        
        result.append(user_data)
    
    return result

@router.get("/jobs")
def get_all_jobs(
    db: Session = Depends(get_db),
    admin: models.User = Depends(verify_admin)
):
    """Get all job postings"""
    jobs = db.query(models.Job).all()
    for j in jobs:
        j.skills_required_list = j.skills_required.split(",") if j.skills_required else []
        j.applicants_count = len(j.applications)
    return jobs

@router.get("/events")
def get_all_events(
    db: Session = Depends(get_db),
    admin: models.User = Depends(verify_admin)
):
    """Get all events"""
    return db.query(models.Event).all()

@router.get("/enrollments")
def get_all_enrollments(
    db: Session = Depends(get_db),
    admin: models.User = Depends(verify_admin)
):
    """Get all enrollments with related details"""
    enrollments = db.query(models.Enrollment).all()
    result = []
    
    for enroll in enrollments:
        # Fetch related data manually or via ORM if lazy loading allows
        # Accessing relationships: enroll.event, enroll.parent (ParentProfile)
        
        child_name = enroll.child_name
        program_name = enroll.event.title if enroll.event else "Unknown Event"
        partner_name = "Unknown Partner"
        
        if enroll.event:
            # Event -> Educator -> Org Name
            educator = db.query(models.EducatorProfile).filter(models.EducatorProfile.id == enroll.event.educator_id).first()
            if educator:
                partner_name = educator.org_name
        
        result.append({
            "id": enroll.id,
            "child_name": child_name,
            "program_name": program_name,
            "partner_name": partner_name,
            "status": enroll.status,
            "enrolled_at": enroll.enrolled_at
        })
        
    return result

@router.get("/users/partners")
def get_pending_partners(
    db: Session = Depends(get_db),
    admin: models.User = Depends(verify_admin)
):
    """Get all educators and recruiters (simulating pending verification)"""
    # In a real app, we'd filter by `is_verified=False`. 
    # For now, we return all so the Admin has something to see.
    users = db.query(models.User).filter(models.User.role.in_(["educator", "recruiter"])).all()
    result = []
    
    for user in users:
        profile_data = {}
        if user.role == "educator":
            p = db.query(models.EducatorProfile).filter(models.EducatorProfile.user_id == user.id).first()
            if p: profile_data = {"org_name": p.org_name, "contact_name": p.contact_name}
        elif user.role == "recruiter":
            p = db.query(models.RecruiterProfile).filter(models.RecruiterProfile.user_id == user.id).first()
            if p: profile_data = {"org_name": p.org_name, "contact_name": p.contact_name}
            
        result.append({
            "id": user.id,
            "email": user.email,
            "role": user.role,
            "created_at": user.created_at,
            "profile": profile_data
        })
    return result

@router.get("/users/parents_detailed")
def get_parents_detailed(
    db: Session = Depends(get_db),
    admin: models.User = Depends(verify_admin)
):
    """Get parents with children for education review"""
    parents = db.query(models.ParentProfile).all()
    result = []
    
    for p in parents:
        children = db.query(models.Child).filter(models.Child.parent_id == p.id).all()
        children_data = [{"name": c.name, "age": c.age, "status": c.school_status} for c in children]
        
        result.append({
            "id": p.id,
            "name": p.full_name,
            "skills": p.skills,
            "children": children_data
        })
    return result
@router.put("/reports/{report_id}/status")
def update_report_status(
    report_id: int,
    status: str,
    db: Session = Depends(get_db),
    admin: models.User = Depends(verify_admin)
):
    """Update status of an incident report"""
    report = db.query(models.IncidentReport).filter(models.IncidentReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    report.status = status
    db.commit()
    return {"message": f"Report status updated to {status}"}
