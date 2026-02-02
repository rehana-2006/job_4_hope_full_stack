from pydantic import BaseModel
from typing import Optional
from datetime import date, time, datetime

class IncidentReportBase(BaseModel):
    incident_type: str
    description: str
    location: str
    city: str
    state: str
    date: Optional[date] = None
    time: Optional[time] = None
    urgency: str
    is_anonymous: bool = False
    reporter_name: Optional[str] = None
    reporter_contact: Optional[str] = None

class IncidentReportCreate(IncidentReportBase):
    pass

class IncidentReport(IncidentReportBase):
    id: int
    created_at: Optional[datetime] = None
    class Config:
        from_attributes = True
