from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, date, time

class EventBase(BaseModel):
    title: str
    description: str
    location: str
    date: date
    time: time
    category: str
    capacity: int

class EventCreate(EventBase):
    pass

class Event(EventBase):
    id: int
    educator_id: int
    created_at: datetime
    enrollment_count: Optional[int] = 0
    capacity: int

    class Config:
        from_attributes = True

class EnrollmentBase(BaseModel):
    event_id: int
    child_name: str

class EnrollmentCreate(EnrollmentBase):
    pass

class Enrollment(EnrollmentBase):
    id: int
    parent_id: int
    status: str
    enrolled_at: datetime
    
    # Helpers
    event_title: Optional[str] = None
    event_date: Optional[str] = None
    event_time: Optional[str] = None
    location: Optional[str] = None
    event_description: Optional[str] = None
    event_category: Optional[str] = None
    
    
    class Config:
        from_attributes = True

class ParentBasicInfo(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None

class EnrollmentDetail(BaseModel):
    enrollment_id: int
    child_name: str
    status: str
    enrolled_at: datetime
    parent: ParentBasicInfo
