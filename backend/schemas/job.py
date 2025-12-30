from pydantic import BaseModel, field_validator
from typing import List, Optional
from datetime import datetime

class JobBase(BaseModel):
    title: str
    description: str
    location: str
    wage: str
    frequency: str
    skills_required: List[str]

class JobCreate(JobBase):
    pass

class Job(JobBase):
    id: int
    recruiter_id: int
    created_at: datetime
    skills_required_list: List[str] = [] # Helper

    @field_validator("skills_required", mode="before")
    @classmethod
    def parse_skills(cls, v):
        if isinstance(v, str):
            return v.split(",") if v else []
        return v

    class Config:
        from_attributes = True

class ApplicationBase(BaseModel):
    job_id: int

class ApplicationCreate(ApplicationBase):
    pass

class Application(ApplicationBase):
    id: int
    parent_id: int
    status: str
    applied_at: datetime
    
    # Helper fields for UI
    job_title: Optional[str] = None
    recruiter_name: Optional[str] = None
    location: Optional[str] = None
    
    class Config:
        from_attributes = True
