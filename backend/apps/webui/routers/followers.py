from fastapi import APIRouter, Depends, HTTPException, status, Path, Query
from typing import List, Optional
from pydantic import BaseModel

from apps.webui.models.followers import Followers
from utils.utils import get_current_user

router = APIRouter()

class FollowerResponse(BaseModel):
    id: str
    user: dict
    followed_at: str
    notifications_enabled: bool

class FollowedChildResponse(BaseModel):
    id: str
    child: dict
    followed_at: str
    notifications_enabled: bool

class TopChildResponse(BaseModel):
    child_id: str
    follower_count: int

############################
# Get followers by childId
############################
@router.get("/child/{child_id}/followers", response_model=List[FollowerResponse])
async def get_followers_by_child(child_id: str):
    try:
        followers = Followers.get_followers_by_child(child_id)
        return followers
    except Exception as e:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail=f"Error retrieving followers: {str(e)}")

############################
# Get children followed by userId
############################
@router.get("/user/{user_id}/following", response_model=List[FollowedChildResponse])
async def get_children_followed_by_user(user_id: str):
    try:
        following = Followers.get_children_followed_by_user(user_id)
        return following
    except Exception as e:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail=f"Error retrieving following: {str(e)}")

############################
# Create follower relationship
############################
@router.post("/follow", status_code=status.HTTP_201_CREATED)
async def follow_child(
    child_id: str = Query(..., alias="childId"),
    user_id: str = Query(..., alias="userId"),
):
    try:
        success = Followers.create_follower(user_id, child_id)
        if not success:
            raise HTTPException(
                status.HTTP_409_CONFLICT,
                detail="Already following this child"
            )
        return {"message": "Successfully followed child"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            detail=f"Error creating follower relationship: {str(e)}"
        )

############################
# Delete follower relationship
############################
@router.delete("/unfollow", status_code=status.HTTP_200_OK)
async def unfollow_child(
    child_id: str = Query(..., alias="childId"),
    user_id: str = Query(..., alias="userId"),
):
    try:
        success = Followers.delete_follower(user_id, child_id)
        if not success:
            raise HTTPException(
                status.HTTP_404_NOT_FOUND,
                detail="Follower relationship not found"
            )
        return {"message": "Successfully unfollowed child"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            detail=f"Error deleting follower relationship: {str(e)}"
        )

############################
# Get top K children by follower count
############################
@router.get("/top/{k}", response_model=List[TopChildResponse])
async def get_top_children_by_followers(k: int = Path(gt=0, description="Number of top children to return")):
    try:
        top_children = Followers.get_top_k_children_by_followers(k)
        return top_children
    except Exception as e:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail=f"Error retrieving top children: {str(e)}")

class IsFollowingResponse(BaseModel):
    user_id: str
    child_id: str
    is_following: bool

@router.get("/is-following", response_model=IsFollowingResponse)
async def is_user_following_child(
    user_id: str = Query(..., alias="userId"),
    child_id: str = Query(..., alias="childId"),
):
    """
    Returns whether the user is following the child.
    Example: GET /followers/is-following?userId=USER123&childId=CHILD456
    """
    try:
        following = Followers.is_following(user_id, child_id)
        return IsFollowingResponse(user_id=user_id, child_id=child_id, is_following=following)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error checking follow status: {str(e)}"
        )