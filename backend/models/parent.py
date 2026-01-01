from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from ..database import Base

class ParentProfile(Base):
    __tablename__ = "parent_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    full_name = Column(String)
    phone = Column(String)
    location = Column(String)
    skills = Column(String) 
    experience = Column(Text)
    availability = Column(String)

    user = relationship("User", back_populates="parent_profile")
    children = relationship("Child", back_populates="parent")

class Child(Base):
    __tablename__ = "children"

    id = Column(Integer, primary_key=True, index=True)
    parent_id = Column(Integer, ForeignKey("parent_profiles.id"))
    name = Column(String)
    age = Column(Integer)
    grade = Column(String, nullable=True)
    school_status = Column(String)
    interests = Column(String)

    parent = relationship("ParentProfile", back_populates="children")
