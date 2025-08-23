from pydantic import BaseModel
from typing import List, Optional

class PostCreateRequest(BaseModel):
    child_id: str
    caption: str
    video_link: Optional[str] = None
    picture_link: Optional[str] = None

class PostResponse(BaseModel):
    id: str
    child_id: str
    child_name: Optional[str]
    author_id: Optional[str]
    author_name: Optional[str]
    title: str
    caption: Optional[str]
    comments: str
    post_type: str
    media_urls: Optional[List[str]]
    video_link: Optional[str]
    likes: int
    comments_count: int
    is_published: bool
    is_featured: bool
    created_at: Optional[str]
    updated_at: Optional[str]
    follow_status: Optional[bool] = None  # Added field to indicate follow status
