from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from enum import Enum

from apps.webui.models.posts import Posts
from apps.webui.models.posts_schemas import PostCreateRequest, PostResponse
from utils.utils import get_current_user

router = APIRouter()

class SortOrder(str, Enum):
    recent = "recent"
    likes = "likes"

############################
# Create Post
############################

@router.post("/", response_model=PostResponse, status_code=status.HTTP_201_CREATED)
async def create_post(form_data: PostCreateRequest, user=Depends(get_current_user)):
    try:
        # Prepare media URLs from picture and video links
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
            is_featured=False
        )
        
        if post:
            return post
        else:
            raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to create post")
    except Exception as e:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail=f"Error creating post: {str(e)}")

############################
# Get Most Recent Post by Child
############################

@router.get("/child/{child_id}/recent", response_model=PostResponse)
async def get_most_recent_post_by_child(child_id: str):
    try:
        posts = Posts.get_posts_by_child(child_id, limit=1)
        if posts and len(posts) > 0:
            return posts[0]
        else:
            raise HTTPException(status.HTTP_404_NOT_FOUND, detail="No posts found for this child")
    except Exception as e:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail=f"Error retrieving post: {str(e)}")

############################
# Get Up to 10 Posts by Child
############################

@router.get("/child/{child_id}", response_model=List[PostResponse])
async def get_posts_by_child(child_id: str, limit: int = Query(10, gt=0, le=10)):
    try:
        posts = Posts.get_posts_by_child(child_id, limit=limit)
        return posts
    except Exception as e:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail=f"Error retrieving posts: {str(e)}")

############################
# Get Posts (Recent or Most Liked)
############################

@router.get("/", response_model=List[PostResponse])
async def get_posts(
    sort: SortOrder = Query(SortOrder.recent, description="Sort by 'recent' or 'likes'"),
    limit: int = Query(20, gt=0, le=50, description="Number of posts to return")
):
    try:
        if sort == SortOrder.recent:
            # Get posts sorted by most recent (default behavior)
            posts = Posts.get_all_posts(limit=limit)
            return posts
        elif sort == SortOrder.likes:
            # Get posts sorted by most likes (using trending logic but without time filter)
            posts = Posts.get_trending_posts(days=365, limit=limit)  # Large days value to include all posts
            return posts
        else:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, detail="Invalid sort parameter")
    except Exception as e:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail=f"Error retrieving posts: {str(e)}")

############################
# Delete Post
############################

@router.delete("/{post_id}", response_model=bool)
async def delete_post(post_id: str, user=Depends(get_current_user)):
    try:
        # Check if post exists
        existing_post = Posts.get_post_by_id(post_id)
        if not existing_post:
            raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Post not found")
        
        # Check if user has permission to delete (only author or admin)
        if existing_post['author_id'] != user.id and user.role != 'admin':
            raise HTTPException(status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this post")
        
        # Delete the post
        success = Posts.delete_post(post_id)
        if not success:
            raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to delete post")
        
        return success
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail=f"Error deleting post: {str(e)}")