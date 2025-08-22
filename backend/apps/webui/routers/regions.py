# apps/webui/routers/regions.py
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from typing import List

from apps.webui.models.regions import Regions

router = APIRouter()

class RegionCreate(BaseModel):
    name: str = Field(..., max_length=255)

class RegionUpdate(BaseModel):
    name: str = Field(..., max_length=255)

@router.post("/", status_code=status.HTTP_201_CREATED)
def create_region(body: RegionCreate):
    if Regions.get_region_by_name(body.name):
        raise HTTPException(status_code=400, detail="Region name already exists")
    return Regions.create_region(body.name)

@router.get("/", response_model=List[dict])
def list_regions():
    return Regions.get_all_regions()

@router.patch("/{region_id}")
def update_region_name(region_id: str, body: RegionUpdate):
    existing = Regions.get_region_by_name(body.name)
    if existing and existing["id"] != region_id:
        raise HTTPException(status_code=400, detail="Region name already exists")

    updated = Regions.update_region_name(region_id, body.name)
    if not updated:
        raise HTTPException(status_code=404, detail="Region not found")
    return updated

@router.delete("/{region_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_region(region_id: str):
    ok = Regions.delete_region(region_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Region not found")
    return None
