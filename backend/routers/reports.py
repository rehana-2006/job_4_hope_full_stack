from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .. import models, schemas
from ..database import get_db

router = APIRouter(
    prefix="/reports",
    tags=["Reports"]
)

@router.post("/", response_model=schemas.IncidentReport)
def create_report(report: schemas.IncidentReportCreate, db: Session = Depends(get_db)):
    db_report = models.IncidentReport(
        incident_type=report.incident_type,
        description=report.description,
        location=report.location,
        city=report.city,
        state=report.state,
        date=report.date,
        time=report.time,
        urgency=report.urgency,
        is_anonymous=report.is_anonymous,
        reporter_name=report.reporter_name,
        reporter_contact=report.reporter_contact
    )
    db.add(db_report)
    db.commit()
    db.refresh(db_report)
    return db_report
