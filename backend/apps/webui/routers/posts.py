from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from enum import Enum
from pydantic import BaseModel

from apps.webui.models.posts import Posts
from apps.webui.models.posts_schemas import PostCreateRequest, PostUpdateRequest, PostResponse
from utils.utils import get_current_user
import apps.webui.models.followers as followers_models
from peewee import fn
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
        # video_link should NOT be added to media_urls - it's stored separately

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
# Get posts by region 
############################
@router.get("/region/{region_id}", response_model=PaginatedPosts)
async def get_posts_by_region(
    region_id: str,
    page: int = Query(1, gt=0),
    limit: int = Query(10, gt=0, le=50),
):
    try:
        offset = (page - 1) * limit
        fetch_n = limit + 1  # sentinel fetch to compute has_next

        # Try model methods that might support offset
        try:
            results = Posts.get_posts_by_region(region_id, limit=fetch_n, offset=offset)
        except TypeError:
            # Fallback: fetch more and slice
            bulk = Posts.get_posts_by_region(region_id, limit=offset + fetch_n)
            results = bulk[offset: offset + fetch_n]

        has_next = len(results) > limit
        items = results[:limit]
        return PaginatedPosts(items=items, page=page, limit=limit, has_next=has_next)
    except Exception as e:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail=f"Error retrieving posts: {str(e)}")

############################
# Get Single Post by ID
############################
@router.get("/{post_id}", response_model=PostResponse)
async def get_post_by_id(post_id: str):
    try:
        post = Posts.get_post_by_id(post_id)
        if not post:
            raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Post not found")
        return post
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail=f"Error retrieving post: {str(e)}")

############################
# Update Post 
############################
@router.put("/{post_id}", response_model=PostResponse)
async def update_post(post_id: str, form_data: PostUpdateRequest, user=Depends(get_current_user)):
    try:
        existing_post = Posts.get_post_by_id(post_id)
        if not existing_post:
            raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Post not found")
        
        # Check authorization - only author or admin can update
        if existing_post["author_id"] != user.id and user.role != "admin":
            raise HTTPException(status.HTTP_403_FORBIDDEN, detail="Not authorized to update this post")
        
        # Prepare update data - only include non-None values
        update_data = {}
        
        if form_data.caption is not None:
            update_data["caption"] = form_data.caption
        
        if form_data.post_type is not None:
            update_data["post_type"] = form_data.post_type
            
        if form_data.is_published is not None:
            update_data["is_published"] = form_data.is_published
            
        if form_data.is_featured is not None:
            update_data["is_featured"] = form_data.is_featured
        
        # Handle media URLs - combine picture_link with existing or new media_urls
        media_urls = existing_post.get("media_urls", [])
        if form_data.picture_link is not None:
            # If a new picture link is provided, replace the first media URL or add it
            if media_urls and len(media_urls) > 0:
                media_urls[0] = form_data.picture_link
            else:
                media_urls = [form_data.picture_link]
            update_data["media_urls"] = media_urls
            
        if form_data.video_link is not None:
            update_data["video_link"] = form_data.video_link
        
        # Perform the update
        updated_post = Posts.update_post(post_id, **update_data)
        
        if not updated_post:
            raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to update post")
            
        return updated_post
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail=f"Error updating post: {str(e)}")

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
    
############################
# Get Posts
############################

@router.get("/", response_model=PaginatedPosts, response_model_exclude_none=True)
async def get_posts(
    sort: SortOrder = Query(SortOrder.recent, description="Sort by 'recent' or 'likes'"),
    page: int = Query(1, gt=0),
    limit: int = Query(20, gt=0, le=50, description="Number of posts per page"),
    user_id: Optional[str] = Query(None, alias="userId", description="If provided, include follow_status per post"),
):
    try:
        offset = (page - 1) * limit
        fetch_n = limit + 1

        if sort == SortOrder.recent:
            try:
                results = Posts.get_all_posts(limit=fetch_n, offset=offset)
            except TypeError:
                bulk = Posts.get_all_posts(limit=offset + fetch_n)
                results = bulk[offset: offset + fetch_n]
        elif sort == SortOrder.likes:
            try:
                results = Posts.get_trending_posts(days=365, limit=fetch_n, offset=offset)
            except TypeError:
                bulk = Posts.get_trending_posts(days=365, limit=offset + fetch_n)
                results = bulk[offset: offset + fetch_n]
        else:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, detail="Invalid sort parameter")

        has_next = len(results) > limit
        items = results[:limit]

        # Enrich with follow_status only when userId is supplied
        if user_id:
            uid_norm = str(user_id).strip().lower()
            child_ids = {p.get("child_id") for p in items if p.get("child_id")}
            if child_ids:
                # Normalize DB columns (trim + remove CR/LF + NBSP + ZWSP) and compare lowercase
                norm_user_col = fn.lower(
                    fn.replace(
                        fn.replace(
                            fn.replace(
                                fn.replace(fn.trim(followers_models.Follower.user_id), '\r', ''),
                                '\n', ''
                            ),
                            '\u00A0', ''  # NBSP
                        ),
                        '\u200B', ''    # zero-width space
                    )
                )
                norm_child_col = fn.lower(
                    fn.replace(
                        fn.replace(
                            fn.replace(
                                fn.replace(fn.trim(followers_models.Follower.child_id), '\r', ''),
                                '\n', ''
                            ),
                            '\u00A0', ''
                        ),
                        '\u200B', ''
                    )
                )

                norm_child_ids = [str(cid).strip().lower() for cid in child_ids]

                rows = (
                    followers_models.Follower
                    .select(followers_models.Follower.child_id)
                    .where(
                        (norm_user_col == uid_norm) &
                        (norm_child_col.in_(norm_child_ids))
                    )
                )

                followed_set_norm = {str(r.child_id).strip().lower() for r in rows}

                for p in items:
                    cid = p.get("child_id")
                    if cid is not None:
                        p["follow_status"] = (str(cid).strip().lower() in followed_set_norm)

        return PaginatedPosts(items=items, page=page, limit=limit, has_next=has_next)

    except Exception as e:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail=f"Error retrieving posts: {str(e)}")