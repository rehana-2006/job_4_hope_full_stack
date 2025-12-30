from sqlalchemy import Column, Integer, String, Text, Date, Time, Boolean
from backend.database import Base

class IncidentReport(Base):
    __tablename__ = "incident_reports"

    id = Column(Integer, primary_key=True, index=True)
    incident_type = Column(String)
    description = Column(Text)
    location = Column(String)
    city = Column(String)
    state = Column(String)
    date = Column(Date, nullable=True)
    time = Column(Time, nullable=True)
    urgency = Column(String)
    is_anonymous = Column(Boolean, default=False)
    reporter_name = Column(String, nullable=True)
    reporter_contact = Column(String, nullable=True)
    status = Column(String, default="pending")
    reporter_role = Column(String, nullable=True)
