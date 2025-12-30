from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

class ContactMessageCreate(BaseModel):
    full_name: str
    email: EmailStr
    category: str
    subject: str
    message: str

class ContactMessage(ContactMessageCreate):
    id: int
    created_at: datetime
    status: str = "new"
    
    class Config:
        from_attributes = True
