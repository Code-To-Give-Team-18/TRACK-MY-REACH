from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from enum import Enum
from pydantic import BaseModel

from apps.webui.models.posts import Posts
from apps.webui.models.posts_schemas import PostCreateRequest, PostResponse
from utils.utils import get_current_user

router = APIRouter()

class SortOrder(str, Enum):
    recent = "recent"
    likes = "likes"

class PaginatedPosts(BaseModel):
    items: List[PostResponse]
    page: int
    limit: int
    has_next: bool

############################
# Create Post 
############################
@router.post("/", response_model=PostResponse, status_code=status.HTTP_201_CREATED)
async def create_post(form_data: PostCreateRequest, user=Depends(get_current_user)):
    try:
        media_urls = []
        if form_data.picture_link:
            media_urls.append(form_data.picture_link)
        if form_data.video_link:
            media_urls.append(form_data.video_link)

        post = Posts.create_post(
            child_id=form_data.child_id,
            title="",
            comments="",
            author_id=user.id,
            caption=form_data.caption,
            post_type="update",
            media_urls=media_urls if media_urls else None,
            video_link=form_data.video_link,
            is_featured=False,
        )

        if post:
            return post
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to create post")
    except Exception as e:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail=f"Error creating post: {str(e)}")

############################
# Most recent post by child
############################
@router.get("/child/{child_id}/recent", response_model=PostResponse)
async def get_most_recent_post_by_child(child_id: str):
    try:
        posts = Posts.get_posts_by_child(child_id, limit=1)
        if posts:
            return posts[0]
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="No posts found for this child")
    except Exception as e:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail=f"Error retrieving post: {str(e)}")

############################
# Get posts by child 
############################
@router.get("/child/{child_id}", response_model=PaginatedPosts)
async def get_posts_by_child(
    child_id: str,
    page: int = Query(1, gt=0),
    limit: int = Query(10, gt=0, le=50),
):
    try:
        offset = (page - 1) * limit
        fetch_n = limit + 1  # sentinel fetch to compute has_next

        # Try model methods that might support offset
        try:
            results = Posts.get_posts_by_child(child_id, limit=fetch_n, offset=offset)
        except TypeError:
            # Fallback: fetch more and slice
            bulk = Posts.get_posts_by_child(child_id, limit=offset + fetch_n)
            results = bulk[offset: offset + fetch_n]

        has_next = len(results) > limit
        items = results[:limit]
        return PaginatedPosts(items=items, page=page, limit=limit, has_next=has_next)
    except Exception as e:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail=f"Error retrieving posts: {str(e)}")

############################
# Get posts 
############################
@router.get("/", response_model=PaginatedPosts)
async def get_posts(
    sort: SortOrder = Query(SortOrder.recent, description="Sort by 'recent' or 'likes'"),
    page: int = Query(1, gt=0),
    limit: int = Query(20, gt=0, le=50, description="Number of posts per page"),
):
    try:
        offset = (page - 1) * limit
        fetch_n = limit + 1

        if sort == SortOrder.recent:
            # Try offset-aware call first
            try:
                results = Posts.get_all_posts(limit=fetch_n, offset=offset)
            except TypeError:
                # Fallback: fetch & slice
                bulk = Posts.get_all_posts(limit=offset + fetch_n)
                results = bulk[offset: offset + fetch_n]

        elif sort == SortOrder.likes:
            # Try offset-aware trending
            try:
                results = Posts.get_trending_posts(days=365, limit=fetch_n, offset=offset)
            except TypeError:
                bulk = Posts.get_trending_posts(days=365, limit=offset + fetch_n)
                results = bulk[offset: offset + fetch_n]
        else:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, detail="Invalid sort parameter")

        has_next = len(results) > limit
        items = results[:limit]
        return PaginatedPosts(items=items, page=page, limit=limit, has_next=has_next)
    except Exception as e:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail=f"Error retrieving posts: {str(e)}")

############################
# Delete Post 
############################
@router.delete("/{post_id}", response_model=bool)
async def delete_post(post_id: str, user=Depends(get_current_user)):
    try:
        existing_post = Posts.get_post_by_id(post_id)
        if not existing_post:
            raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Post not found")

        if existing_post["author_id"] != user.id and user.role != "admin":
            raise HTTPException(status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this post")

        success = Posts.delete_post(post_id)
        if not success:
            raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to delete post")
        return success
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail=f"Error deleting post: {str(e)}")
