from fastapi import APIRouter, HTTPException, status, Query, Body
from pydantic import BaseModel, Field
from typing import Optional, List, Literal, Any

from apps.webui.models.donations import Donations
from apps.webui.models.milestones import Milestones

router = APIRouter(prefix="/milestones", tags=["Milestones"])


# ==================================
# Pydantic Schemas for API I/O
# ==================================

class MilestoneResponse(BaseModel):
    """Standard response for a single milestone."""
    id: str
    name: str
    amount: float
    type: Literal["user", "region"]
    description: Optional[str] = None
    badge_icon: Optional[str] = None
    badge_color: Optional[str] = None
    order_rank: int
    is_active: bool
    created_at: str
    updated_at: str

class MilestoneProgressResponse(BaseModel):
    """Response for user or region milestone progress."""
    total_donated: float
    achieved_milestones: List[MilestoneResponse]
    current_milestone: Optional[MilestoneResponse] = None
    next_milestone: Optional[dict[str, Any]] = None # Includes 'amount_needed', etc.
    total_milestones: int
    achieved_count: int
    completion_percentage: float


class MilestoneCreateRequest(BaseModel):
    """Request body for creating a new milestone."""
    name: str = Field(..., example="Visionary")
    amount: float = Field(..., gt=0, example=50000.0)
    type: Literal["user", "region"] = Field(..., example="user")
    description: Optional[str] = Field(None, example="Visionary donors transform communities.")
    badge_icon: Optional[str] = None
    badge_color: Optional[str] = Field(None, example="#visionary")
    order_rank: int = Field(0, example=8)


class MilestoneUpdateRequest(BaseModel):
    """Request body for updating an existing milestone."""
    name: Optional[str] = None
    amount: Optional[float] = Field(None, gt=0)
    description: Optional[str] = None
    badge_icon: Optional[str] = None
    badge_color: Optional[str] = None
    order_rank: Optional[int] = None
    is_active: Optional[bool] = None


# ==================================
# Milestone Progress Routes
# ==================================

@router.get("/user/{user_id}/progress", response_model=MilestoneProgressResponse)
def get_user_milestone_details(user_id: str):
    """Get comprehensive milestone progress for a specific user."""
    try:
        user_total = Donations.get_user_total(user_id)
        progress_data = Milestones.get_milestone_progress(user_total, milestone_type='user')
        return progress_data
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.get("/region/{region_id}/progress", response_model=MilestoneProgressResponse)
def get_region_milestone_details(region_id: str):
    """Get comprehensive milestone progress for a specific region."""
    try:
        # Using your existing get_donation_stats method for the region total
        region_stats = Donations.get_donation_stats(region_id=region_id)
        region_total = region_stats.get('total_amount', 0.0)
        
        progress_data = Milestones.get_milestone_progress(region_total, milestone_type='region')
        return progress_data
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.get("/user/{user_id}/achieved", response_model=List[MilestoneResponse])
def get_users_achieved_milestones(user_id: str):
    """Get all milestones a user has achieved."""
    try:
        user_total = Donations.get_user_total(user_id)
        achieved = Milestones.get_achieved_milestones(user_total, milestone_type='user')
        return achieved
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/user/{user_id}/current", response_model=Optional[MilestoneResponse])
def get_users_highest_milestone(user_id: str):
    """Get the current (highest) milestone a user has achieved."""
    try:
        user_total = Donations.get_user_total(user_id)
        current = Milestones.get_current_milestone(user_total, milestone_type='user')
        return current
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


# ==================================
# Milestone CRUD Routes (Admin)
# ==================================

@router.post("", response_model=MilestoneResponse, status_code=status.HTTP_201_CREATED, tags=["Admin: Milestones"])
def create_milestone(payload: MilestoneCreateRequest = Body(...)):
    """Create a new milestone (for admins)."""
    try:
        milestone = Milestones.create_milestone(**payload.dict())
        return milestone
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Failed to create milestone: {e}")

@router.patch("/{milestone_id}", response_model=MilestoneResponse, tags=["Admin: Milestones"])
def update_milestone(milestone_id: str, payload: MilestoneUpdateRequest = Body(...)):
    """Update an existing milestone's fields (for admins)."""
    update_data = payload.dict(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No fields provided for update.")

    try:
        updated_milestone = Milestones.update_milestone(milestone_id, **update_data)
        if not updated_milestone:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Milestone not found.")
        return updated_milestone
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.delete("/{milestone_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["Admin: Milestones"])
def deactivate_milestone(milestone_id: str):
    """Deactivate a milestone, hiding it from progress checks (for admins)."""
    try:
        success = Milestones.deactivate_milestone(milestone_id)
        if not success:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Milestone not found.")
        return None
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))