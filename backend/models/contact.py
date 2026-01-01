from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func
from ..database import Base

class ContactMessage(Base):
    __tablename__ = "contact_messages"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String)
    email = Column(String)
    category = Column(String)
    subject = Column(String)
    message = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    status = Column(String, default="new")  # new, read, replied
