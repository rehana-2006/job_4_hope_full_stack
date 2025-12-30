from pydantic import BaseModel
from typing import List, Optional

class ChildBase(BaseModel):
    name: str
    age: int
    grade: Optional[str] = None
    school_status: str
    interests: Optional[str] = None

class ChildCreate(ChildBase):
    pass

class Child(ChildBase):
    id: int
    parent_id: int
    class Config:
        from_attributes = True

class ParentProfileBase(BaseModel):
    full_name: str
    phone: str
    location: str
    skills: List[str]
    experience: Optional[str] = None
    availability: List[str]

class ParentProfileCreate(ParentProfileBase):
    password: str
    email: str
    children: List[ChildCreate] = []

class ParentProfile(ParentProfileBase):
    id: int
    user_id: int
    children: List[Child] = []
    class Config:
        from_attributes = True
