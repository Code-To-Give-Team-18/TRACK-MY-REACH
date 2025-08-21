from peewee import *
from datetime import datetime
import uuid
from apps.webui.internal.db import DB
from apps.webui.models.children import Child



class Video(Model):
    id = CharField(max_length=255, unique=True, primary_key=True, default=lambda: str(uuid.uuid4()))
    child = ForeignKeyField(Child, backref='videos', on_delete='CASCADE')
    title = CharField(max_length=255)
    description = TextField(null=True)
    video_url = CharField(max_length=500)
    thumbnail_url = CharField(max_length=500, null=True)
    duration_seconds = IntegerField(null=True)
    video_type = CharField(max_length=50, default='update')  # 'update', 'thank_you', 'story', 'activity'
    views_count = IntegerField(default=0)
    likes_count = IntegerField(default=0)
    is_featured = BooleanField(default=False)
    is_published = BooleanField(default=True)
    uploaded_by = CharField(max_length=255, null=True)  # Could be teacher, parent, or admin
    created_at = DateTimeField(default=datetime.now)
    updated_at = DateTimeField(default=datetime.now)

    class Meta:
        database = DB


class VideoView(Model):
    id = CharField(max_length=255, unique=True, primary_key=True, default=lambda: str(uuid.uuid4()))
    video = ForeignKeyField(Video, backref='video_views', on_delete='CASCADE')
    user_id = CharField(max_length=255, null=True)  # Can track anonymous views
    ip_address = CharField(max_length=45, null=True)
    watched_duration = IntegerField(default=0)  # Seconds watched
    completed = BooleanField(default=False)  # Did they watch to completion
    created_at = DateTimeField(default=datetime.now)

    class Meta:
        database = DB


class VideosTable:
    def __init__(self, db):
        self.db = db
        db.create_tables([Video, VideoView], safe=True)

    def create_video(
        self,
        child_id: str,
        title: str,
        video_url: str,
        description: str = None,
        thumbnail_url: str = None,
        duration_seconds: int = None,
        video_type: str = 'update',
        uploaded_by: str = None,
        is_featured: bool = False
    ) -> dict:
        video = Video.create(
            child=child_id,
            title=title,
            video_url=video_url,
            description=description,
            thumbnail_url=thumbnail_url,
            duration_seconds=duration_seconds,
            video_type=video_type,
            uploaded_by=uploaded_by,
            is_featured=is_featured
        )
        return self._video_to_dict(video)

    def get_video_by_id(self, video_id: str) -> dict:
        video = Video.get_or_none(Video.id == video_id)
        return self._video_to_dict(video) if video else None

    def get_videos_by_child(self, child_id: str, limit: int = 20) -> list:
        return [
            self._video_to_dict(video)
            for video in Video.select()
            .where((Video.child == child_id) & (Video.is_published == True))
            .order_by(Video.created_at.desc())
            .limit(limit)
        ]

    def get_all_videos(
        self,
        video_type: str = None,
        featured_only: bool = False,
        limit: int = 20
    ) -> list:
        query = Video.select().where(Video.is_published == True)
        
        if video_type:
            query = query.where(Video.video_type == video_type)
        
        if featured_only:
            query = query.where(Video.is_featured == True)
        
        return [
            self._video_to_dict(video)
            for video in query.order_by(Video.created_at.desc()).limit(limit)
        ]

    def get_videos_by_region(self, region_id: str, limit: int = 20) -> list:
        from apps.webui.models.children import Child
        
        return [
            self._video_to_dict(video)
            for video in Video.select()
            .join(Child)
            .where((Child.region == region_id) & (Video.is_published == True))
            .order_by(Video.created_at.desc())
            .limit(limit)
        ]

    def update_video(self, video_id: str, **kwargs) -> dict:
        video = Video.get(Video.id == video_id)
        
        for key, value in kwargs.items():
            if hasattr(video, key):
                setattr(video, key, value)
        
        video.updated_at = datetime.now()
        video.save()
        return self._video_to_dict(video)

    def record_video_view(
        self,
        video_id: str,
        user_id: str = None,
        ip_address: str = None,
        watched_duration: int = 0,
        completed: bool = False
    ) -> dict:
        # Record the view
        view = VideoView.create(
            video=video_id,
            user_id=user_id,
            ip_address=ip_address,
            watched_duration=watched_duration,
            completed=completed
        )
        
        # Update view count on video
        video = Video.get(Video.id == video_id)
        video.views_count += 1
        video.save()
        
        return {
            'view_id': view.id,
            'video_id': video_id,
            'views_count': video.views_count
        }

    def update_video_view(
        self,
        view_id: str,
        watched_duration: int,
        completed: bool = None
    ) -> bool:
        view = VideoView.get_or_none(VideoView.id == view_id)
        if view:
            view.watched_duration = watched_duration
            if completed is not None:
                view.completed = completed
            view.save()
            return True
        return False

    def increment_video_likes(self, video_id: str) -> dict:
        video = Video.get(Video.id == video_id)
        video.likes_count += 1
        video.save()
        return self._video_to_dict(video)

    def get_popular_videos(self, limit: int = 10, days: int = 30) -> list:
        from datetime import timedelta
        
        since_date = datetime.now() - timedelta(days=days)
        
        return [
            self._video_to_dict(video)
            for video in Video.select()
            .where(
                (Video.is_published == True) &
                (Video.created_at >= since_date)
            )
            .order_by((Video.views_count * 1 + Video.likes_count * 3).desc())
            .limit(limit)
        ]

    def get_video_stats(self, video_id: str) -> dict:
        video = Video.get_or_none(Video.id == video_id)
        if not video:
            return None
        
        # Get view statistics
        total_views = video.views_count
        completed_views = VideoView.select().where(
            (VideoView.video == video_id) & (VideoView.completed == True)
        ).count()
        
        avg_watch_duration = VideoView.select(
            fn.AVG(VideoView.watched_duration)
        ).where(VideoView.video == video_id).scalar() or 0
        
        completion_rate = (completed_views / total_views * 100) if total_views > 0 else 0
        
        return {
            'video_id': video_id,
            'total_views': total_views,
            'completed_views': completed_views,
            'likes_count': video.likes_count,
            'average_watch_duration': round(avg_watch_duration, 2),
            'completion_rate': round(completion_rate, 2),
            'duration_seconds': video.duration_seconds
        }

    def get_thank_you_videos(self, child_id: str = None, limit: int = 10) -> list:
        query = Video.select().where(
            (Video.video_type == 'thank_you') &
            (Video.is_published == True)
        )
        
        if child_id:
            query = query.where(Video.child == child_id)
        
        return [
            self._video_to_dict(video)
            for video in query.order_by(Video.created_at.desc()).limit(limit)
        ]

    def _video_to_dict(self, video) -> dict:
        if not video:
            return None
        
        return {
            'id': video.id,
            'child_id': video.child_id,
            'child_name': video.child.name if video.child else None,
            'title': video.title,
            'description': video.description,
            'video_url': video.video_url,
            'thumbnail_url': video.thumbnail_url,
            'duration_seconds': video.duration_seconds,
            'video_type': video.video_type,
            'views_count': video.views_count,
            'likes_count': video.likes_count,
            'is_featured': video.is_featured,
            'is_published': video.is_published,
            'uploaded_by': video.uploaded_by,
            'created_at': video.created_at.isoformat() if video.created_at else None,
            'updated_at': video.updated_at.isoformat() if video.updated_at else None
        }


Videos = VideosTable(DB)