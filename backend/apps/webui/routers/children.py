# add imports near the top of your file
import logging

from fastapi import Request, UploadFile, File
from fastapi import Depends, HTTPException, status
from fastapi.responses import Response

from fastapi import APIRouter
from pydantic import BaseModel
import re
import uuid
import csv
from typing import Optional
from pydantic import BaseModel, Field
from utils.utils import get_admin_user  # add this
from apps.webui.models.regions import Region  # for region existence check
from fastapi import APIRouter, HTTPException, Depends
from typing import List
import random

from apps.webui.models.children import Children
from apps.webui.models.users import Users
from utils.utils import get_verified_user  # to require login

from fastapi import Response, Request
from fastapi import Depends, FastAPI, HTTPException, status
from datetime import datetime, timedelta
from typing import List, Union, Optional

from fastapi import APIRouter
from pydantic import BaseModel
import time
import uuid
import logging

router = APIRouter()

############################
# Get top 3 popular children
############################
@router.get("/popular")
def get_popular_children(limit: int = 3):
    popular = Children.get_popular_children(limit=10)  # fetch top 10
    if not popular:
        return []
    # pick top 3, break ties randomly if follower_count matches
    top_sorted = sorted(popular, key=lambda c: (c["follower_count"], random.random()), reverse=True)
    return top_sorted[:limit]


############################
# Follow a child
############################
@router.post("/{child_id}/follow")
def follow_child(child_id: str, user_id: str, user=Depends(get_verified_user)):
    """Make a user follow a child. Expects user_id in query/body"""
    # Check child exists
    child = Children.get_child_by_id(child_id)
    if not child:
        raise HTTPException(status_code=404, detail="Child not found")

    # Check user exists
    user = Users.get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Increment follower count
    updated = Children.increment_follower_count(child_id)
    return {"message": f"{user.name} is now following {child['name']}", "child": updated}


############################
# Get all children
############################
@router.get("/", response_model=List[dict])
def get_all_children():
    return Children.get_all_children()


############################
# Get specific child description
############################
@router.get("/{child_id}/description")
def get_child_description(child_id: str):
    child = Children.get_child_by_id(child_id)
    if not child:
        raise HTTPException(status_code=404, detail="Child not found")
    return {"id": child_id, "description": child["description"]}


############################
# Get specific child profile picture
############################
@router.get("/{child_id}/picture")
def get_child_picture(child_id: str):
    child = Children.get_child_by_id(child_id)
    if not child:
        raise HTTPException(status_code=404, detail="Child not found")
    return {"id": child_id, "picture_link": child["picture_link"]}


############################
# Get child by ID
############################
@router.get("/{child_id}")
def get_child_by_id(child_id: str):
    child = Children.get_child_by_id(child_id)
    if not child:
        raise HTTPException(status_code=404, detail="Child not found")
    return child


# put this below your existing routes

class ChildCreate(BaseModel):
    region_id: str = Field(..., description="Region UUID")
    name: str = Field(..., max_length=255)
    age: Optional[int] = None
    school: Optional[str] = None
    grade: Optional[str] = None
    description: Optional[str] = None
    bio: Optional[str] = None
    video_link: Optional[str] = None
    picture_link: Optional[str] = None

@router.post("/", status_code=201)
def create_child(body: ChildCreate, user=Depends(get_admin_user)):
    # ensure region exists
    if not Region.get_or_none(Region.id == body.region_id):
        raise HTTPException(status_code=404, detail="Region not found")

    created = Children.create_child(
        region_id=body.region_id,
        name=body.name,
        age=body.age,
        school=body.school,
        grade=body.grade,
        description=body.description,
        bio=body.bio,
        video_link=body.video_link,
        picture_link=body.picture_link,
    )
    return created

