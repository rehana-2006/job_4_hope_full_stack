from pydantic import BaseModel
from typing import Optional

class RecruiterProfileBase(BaseModel):
    org_name: str
    org_type: str
    description: str
    contact_name: str
    job_title: str
    phone: str
    website: Optional[str] = None
    address: str
    city: str
    state: str
    pincode: str
    country: str = "India"

class RecruiterProfileCreate(RecruiterProfileBase):
    password: str
    email: str

class RecruiterProfile(RecruiterProfileBase):
    id: int
    user_id: int
    class Config:
        from_attributes = True
