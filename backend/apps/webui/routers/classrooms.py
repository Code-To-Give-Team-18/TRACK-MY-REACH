from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel
from apps.webui.models.users import Users
from apps.webui.utils.auth import get_current_user
from apps.webui.utils.misc import get_gravatar_url
from apps.webui.internal.db import DB
import json
import uuid

router = APIRouter()

class ClassroomItem(BaseModel):
    id: str
    name: str
    type: str
    state: str
    funded_by: Optional[str] = None
    funded_date: Optional[datetime] = None
    cost: Optional[float] = None

class Classroom(BaseModel):
    id: str
    name: str
    school: str
    district: str
    students_count: int
    funding_progress: float
    needs_level: str
    total_donations: float
    items: List[ClassroomItem]
    created_at: datetime
    updated_at: datetime

class DonationImpact(BaseModel):
    id: str
    user_id: str
    classroom_id: str
    amount: float
    date: datetime
    title: str
    description: str
    impact: str
    items_funded: List[str]

class ClassroomVisit(BaseModel):
    id: str
    user_id: str
    classroom_id: str
    visit_date: datetime
    duration_seconds: int
    interactions: List[str]

CLASSROOMS_DB = {}
DONATIONS_DB = {}
VISITS_DB = {}

def init_mock_data():
    classroom1 = {
        "id": "cls-1",
        "name": "Sunshine K3-A",
        "school": "Wan Chai Primary",
        "district": "Wan Chai",
        "students_count": 25,
        "funding_progress": 65,
        "needs_level": "high",
        "total_donations": 15000,
        "items": [
            {
                "id": "item-1",
                "name": "Smart Board",
                "type": "technology",
                "state": "funded",
                "funded_by": "Tech Corp",
                "funded_date": datetime.now().isoformat(),
                "cost": 3500
            },
            {
                "id": "item-2",
                "name": "Bookshelf",
                "type": "furniture",
                "state": "funded",
                "funded_by": "Community Donors",
                "funded_date": datetime.now().isoformat(),
                "cost": 800
            },
            {
                "id": "item-3",
                "name": "Art Supplies",
                "type": "supplies",
                "state": "needed",
                "cost": 500
            }
        ],
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat()
    }
    CLASSROOMS_DB["cls-1"] = classroom1

init_mock_data()

@router.get("/api/v1/classrooms", response_model=List[Classroom])
async def get_classrooms(
    user=Depends(get_current_user)
):
    return list(CLASSROOMS_DB.values())

@router.get("/api/v1/classrooms/{classroom_id}", response_model=Classroom)
async def get_classroom(
    classroom_id: str,
    user=Depends(get_current_user)
):
    if classroom_id not in CLASSROOMS_DB:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Classroom not found"
        )
    return CLASSROOMS_DB[classroom_id]

@router.get("/api/v1/classrooms/{classroom_id}/items", response_model=List[ClassroomItem])
async def get_classroom_items(
    classroom_id: str,
    state: Optional[str] = None,
    user=Depends(get_current_user)
):
    if classroom_id not in CLASSROOMS_DB:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Classroom not found"
        )
    
    items = CLASSROOMS_DB[classroom_id]["items"]
    if state:
        items = [item for item in items if item["state"] == state]
    
    return items

@router.post("/api/v1/classrooms/{classroom_id}/donate")
async def donate_to_classroom(
    classroom_id: str,
    amount: float,
    item_ids: List[str],
    message: Optional[str] = None,
    user=Depends(get_current_user)
):
    if classroom_id not in CLASSROOMS_DB:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Classroom not found"
        )
    
    donation_id = str(uuid.uuid4())
    donation = {
        "id": donation_id,
        "user_id": user.id,
        "classroom_id": classroom_id,
        "amount": amount,
        "date": datetime.now().isoformat(),
        "title": f"Donation to {CLASSROOMS_DB[classroom_id]['name']}",
        "description": message or "Thank you for your support!",
        "impact": f"Your donation will help {CLASSROOMS_DB[classroom_id]['students_count']} students",
        "items_funded": item_ids
    }
    
    DONATIONS_DB[donation_id] = donation
    
    classroom = CLASSROOMS_DB[classroom_id]
    classroom["total_donations"] += amount
    classroom["funding_progress"] = min(100, classroom["funding_progress"] + (amount / 20000 * 100))
    
    for item in classroom["items"]:
        if item["id"] in item_ids and item["state"] == "needed":
            item["state"] = "funded"
            item["funded_by"] = user.name
            item["funded_date"] = datetime.now().isoformat()
    
    classroom["updated_at"] = datetime.now().isoformat()
    
    return {"message": "Donation successful", "donation_id": donation_id}

@router.get("/api/v1/donations/user/{user_id}", response_model=List[DonationImpact])
async def get_user_donations(
    user_id: str,
    user=Depends(get_current_user)
):
    if user.id != user_id and user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view these donations"
        )
    
    user_donations = [d for d in DONATIONS_DB.values() if d["user_id"] == user_id]
    return sorted(user_donations, key=lambda x: x["date"], reverse=True)

@router.post("/api/v1/classrooms/{classroom_id}/visit")
async def track_classroom_visit(
    classroom_id: str,
    duration_seconds: int,
    interactions: List[str],
    user=Depends(get_current_user)
):
    if classroom_id not in CLASSROOMS_DB:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Classroom not found"
        )
    
    visit_id = str(uuid.uuid4())
    visit = {
        "id": visit_id,
        "user_id": user.id,
        "classroom_id": classroom_id,
        "visit_date": datetime.now().isoformat(),
        "duration_seconds": duration_seconds,
        "interactions": interactions
    }
    
    VISITS_DB[visit_id] = visit
    
    return {"message": "Visit tracked", "visit_id": visit_id}

@router.get("/api/v1/impact/summary/{user_id}")
async def get_impact_summary(
    user_id: str,
    user=Depends(get_current_user)
):
    if user.id != user_id and user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this summary"
        )
    
    user_donations = [d for d in DONATIONS_DB.values() if d["user_id"] == user_id]
    user_visits = [v for v in VISITS_DB.values() if v["user_id"] == user_id]
    
    total_donated = sum(d["amount"] for d in user_donations)
    classrooms_supported = len(set(d["classroom_id"] for d in user_donations))
    total_items_funded = sum(len(d["items_funded"]) for d in user_donations)
    
    students_impacted = 0
    for donation in user_donations:
        if donation["classroom_id"] in CLASSROOMS_DB:
            students_impacted += CLASSROOMS_DB[donation["classroom_id"]]["students_count"]
    
    return {
        "total_donated": total_donated,
        "classrooms_supported": classrooms_supported,
        "students_impacted": students_impacted,
        "items_funded": total_items_funded,
        "total_visits": len(user_visits),
        "total_visit_time": sum(v["duration_seconds"] for v in user_visits),
        "recent_donations": user_donations[:5],
        "impact_score": min(10, total_donated / 1000)
    }