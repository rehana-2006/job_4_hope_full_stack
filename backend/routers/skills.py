from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models.skill import Skill
from ..schemas.skill import SkillCreate, SkillResponse

router = APIRouter(prefix="/skills", tags=["Skills"])

@router.get("/", response_model=List[SkillResponse])
def get_skills(db: Session = Depends(get_db)):
    return db.query(Skill).all()

@router.post("/", response_model=SkillResponse)
def create_skill(skill: SkillCreate, db: Session = Depends(get_db)):
    existing_skill = db.query(Skill).filter(Skill.name == skill.name).first()
    if existing_skill:
        raise HTTPException(status_code=400, detail="Skill already exists")
    
    new_skill = Skill(name=skill.name, category=skill.category)
    db.add(new_skill)
    db.commit()
    db.refresh(new_skill)
    return new_skill

@router.delete("/{skill_id}")
def delete_skill(skill_id: int, db: Session = Depends(get_db)):
    skill = db.query(Skill).filter(Skill.id == skill_id).first()
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")
    
    db.delete(skill)
    db.commit()
    return {"message": "Skill deleted"}
