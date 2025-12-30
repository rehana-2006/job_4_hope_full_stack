from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from backend.database import Base

class EducatorProfile(Base):
    __tablename__ = "educator_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    org_name = Column(String)
    org_type = Column(String)
    description = Column(Text)
    
    capacity = Column(Integer)
    age_range = Column(String)
    specialization = Column(String)
    
    contact_name = Column(String)
    job_title = Column(String)
    phone = Column(String)
    website = Column(String, nullable=True)
    
    address = Column(Text)
    city = Column(String)
    state = Column(String)
    pincode = Column(String)
    country = Column(String, default="India")
    
    user = relationship("User", back_populates="educator_profile")
    events = relationship("Event", back_populates="educator")
