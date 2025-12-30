from pydantic import BaseModel
from typing import List, Optional

class EducatorProfileBase(BaseModel):
    org_name: str
    org_type: str
    description: str
    capacity: int
    age_range: str
    specialization: Optional[List[str]] = None
    contact_name: str
    job_title: str
    phone: str
    website: Optional[str] = None
    address: Optional[str] = None
    city: str
    state: str
    pincode: Optional[str] = None
    country: str = "India"

class EducatorProfileUpdate(EducatorProfileBase):
    pass

class EducatorProfileCreate(EducatorProfileBase):
    password: str
    email: str

class EducatorProfile(EducatorProfileBase):
    id: int
    user_id: int
    verified: bool = False
    class Config:
        from_attributes = True
