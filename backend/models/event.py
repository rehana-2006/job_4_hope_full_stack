from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Date, Time
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base

class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    educator_id = Column(Integer, ForeignKey("educator_profiles.id"))
    title = Column(String)
    description = Column(Text)
    location = Column(String)
    date = Column(Date)
    time = Column(Time)
    category = Column(String) 
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    educator = relationship("EducatorProfile", back_populates="events")
    enrollments = relationship("Enrollment", back_populates="event")

class Enrollment(Base):
    __tablename__ = "enrollments"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"))
    parent_id = Column(Integer, ForeignKey("parent_profiles.id"))
    child_name = Column(String) # Optionally link to specific child ID if strict structure needed
    status = Column(String, default="enrolled")
    enrolled_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    event = relationship("Event", back_populates="enrollments")
    parent = relationship("ParentProfile", backref="enrollments")
