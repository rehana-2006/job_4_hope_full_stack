from pydantic import BaseModel
from typing import Optional
from datetime import date, time

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
    class Config:
        from_attributes = True
