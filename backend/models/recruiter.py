from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from ..database import Base

class RecruiterProfile(Base):
    __tablename__ = "recruiter_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    org_name = Column(String)
    org_type = Column(String)
    description = Column(Text)
    
    contact_name = Column(String)
    job_title = Column(String)
    phone = Column(String)
    website = Column(String, nullable=True)
    
    address = Column(Text)
    city = Column(String)
    state = Column(String)
    pincode = Column(String)
    country = Column(String, default="India")
    
    user = relationship("User", back_populates="recruiter_profile")
    jobs = relationship("Job", back_populates="recruiter")
