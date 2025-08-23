from peewee import *
from datetime import datetime, timedelta
import uuid
from apps.webui.internal.db import DB
from apps.webui.models.children import Child
from apps.webui.models.users import User

class Post(Model):
    id = CharField(max_length=255, unique=True, primary_key=True, default=lambda: str(uuid.uuid4()))
    child = ForeignKeyField(Child, backref='posts', on_delete='CASCADE')
    author = ForeignKeyField(User, backref='authored_posts', on_delete='SET NULL', null=True)
    title = CharField(max_length=255)
    caption = TextField(null=True)
    comments = TextField(null= True, default="")
    post_type = CharField(max_length=50, default='update')
    media_urls = TextField(null=True)
    video_link = CharField(max_length=500, null=True)
    youtube_url = CharField(max_length=500, null=True)
    likes = IntegerField(default=0)
    comments_count = IntegerField(default=0)
    is_published = BooleanField(default=True)
    is_featured = BooleanField(default=False)
    created_at = DateTimeField(default=datetime.now)
    updated_at = DateTimeField(default=datetime.now)

    class Meta:
        database = DB

class PostLike(Model):
    id = CharField(max_length=255, unique=True, primary_key=True, default=lambda: str(uuid.uuid4()))
    post = ForeignKeyField(Post, backref='post_likes', on_delete='CASCADE')
    user = ForeignKeyField(User, backref='liked_posts', on_delete='CASCADE')
    created_at = DateTimeField(default=datetime.now)

    class Meta:
        database = DB
        indexes = (
            (('post', 'user'), True),
        )

class PostComment(Model):
    id = CharField(max_length=255, unique=True, primary_key=True, default=lambda: str(uuid.uuid4()))
    post = ForeignKeyField(Post, backref='post_comments', on_delete='CASCADE')
    user = ForeignKeyField(User, backref='user_comments', on_delete='CASCADE')
    content = TextField()
    is_approved = BooleanField(default=True)
    created_at = DateTimeField(default=datetime.now)
    updated_at = DateTimeField(default=datetime.now)

    class Meta:
        database = DB

class PostsTable:
    def __init__(self, db):
        self.db = db
        db.create_tables([Post, PostLike, PostComment], safe=True)

    # CREATE
    def create_post(self, child_id: str, title: str, comments: str, author_id: str = None, caption: str = None, post_type: str = 'update', media_urls: list = None, video_link: str = None, is_featured: bool = False) -> dict:
        import json
        post = Post.create(
            child=child_id,
            author=author_id,
            title=title,
            caption=caption,
            comments=comments,
            post_type=post_type,
            media_urls=json.dumps(media_urls) if media_urls else None,
            video_link=video_link,
            is_featured=is_featured
        )
        return self._post_to_dict(post)

    # READ
    def get_post_by_id(self, post_id: str) -> dict:
        post = Post.get_or_none(Post.id == post_id)
        return self._post_to_dict(post) if post else None

    def get_posts_by_child(self, child_id: str, limit: int = 20) -> list:
        return [
            self._post_to_dict(post)
            for post in Post.select()
            .where((Post.child == child_id) & (Post.is_published == True))
            .order_by(Post.created_at.desc())
            .limit(limit)
        ]

    def get_all_posts(self, post_type: str = None, featured_only: bool = False, limit: int = 20) -> list:
        query = Post.select().where(Post.is_published == True)
        if post_type:
            query = query.where(Post.post_type == post_type)
        if featured_only:
            query = query.where(Post.is_featured == True)
        return [
            self._post_to_dict(post)
            for post in query.order_by(Post.created_at.desc()).limit(limit)
        ]

    def get_posts_by_region(self, region_id: str, limit: int = 20) -> list:
        return [
            self._post_to_dict(post)
            for post in Post.select()
            .join(Child)
            .where((Child.region == region_id) & (Post.is_published == True))
            .order_by(Post.created_at.desc())
            .limit(limit)
        ]

    # UPDATE
    def update_post(self, post_id: str, **kwargs) -> dict:
        import json
        post = Post.get(Post.id == post_id)
        if 'media_urls' in kwargs and isinstance(kwargs['media_urls'], list):
            kwargs['media_urls'] = json.dumps(kwargs['media_urls'])
        for key, value in kwargs.items():
            if hasattr(post, key):
                setattr(post, key, value)
        post.updated_at = datetime.now()
        post.save()
        return self._post_to_dict(post)

    # DELETE
    def delete_post(self, post_id: str) -> bool:
        """Delete a post and all its related data (likes and comments)"""
        try:
            post = Post.get_or_none(Post.id == post_id)
            if not post:
                return False
            
            # Delete all related likes
            PostLike.delete().where(PostLike.post == post_id).execute()
            
            # Delete all related comments
            PostComment.delete().where(PostComment.post == post_id).execute()
            
            # Delete the post itself
            post.delete_instance()
            
            return True
        except Exception:
            return False

    # LIKE/UNLIKE functions
    def like_post(self, post_id: str, user_id: str) -> bool:
        try:
            PostLike.create(post=post_id, user=user_id)
            post = Post.get(Post.id == post_id)
            post.likes += 1
            post.save()
            return True
        except IntegrityError:
            return False

    def unlike_post(self, post_id: str, user_id: str) -> bool:
        like = PostLike.get_or_none((PostLike.post == post_id) & (PostLike.user == user_id))
        if like:
            like.delete_instance()
            post = Post.get(Post.id == post_id)
            post.likes = max(0, post.likes - 1)
            post.save()
            return True
        return False

    def has_user_liked_post(self, post_id: str, user_id: str) -> bool:
        return PostLike.select().where(
            (PostLike.post == post_id) & (PostLike.user == user_id)
        ).exists()

    # COMMENT functions
    def add_comment(self, post_id: str, user_id: str, content: str, is_approved: bool = True) -> dict:
        comment = PostComment.create(
            post=post_id,
            user=user_id,
            content=content,
            is_approved=is_approved
        )
        post = Post.get(Post.id == post_id)
        post.comments_count += 1
        post.save()
        return self._comment_to_dict(comment)

    def get_post_comments(self, post_id: str, approved_only: bool = True) -> list:
        query = PostComment.select().where(PostComment.post == post_id)
        if approved_only:
            query = query.where(PostComment.is_approved == True)
        return [
            self._comment_to_dict(comment)
            for comment in query.order_by(PostComment.created_at.desc())
        ]

    def delete_comment(self, comment_id: str) -> bool:
        comment = PostComment.get_or_none(PostComment.id == comment_id)
        if comment:
            post = Post.get(Post.id == comment.post_id)
            post.comments_count = max(0, post.comments_count - 1)
            post.save()
            comment.delete_instance()
            return True
        return False

    # UTILITY functions
    def get_trending_posts(self, days: int = 7, limit: int = 10) -> list:
        since_date = datetime.now() - timedelta(days=days)
        return [
            self._post_to_dict(post)
            for post in Post.select()
            .where(
                (Post.is_published == True) &
                (Post.created_at >= since_date)
            )
            .order_by((Post.likes + Post.comments_count * 2).desc())
            .limit(limit)
        ]

    def _post_to_dict(self, post) -> dict:
        import json
        if not post:
            return None
        media_urls = []
        if post.media_urls:
            try:
                media_urls = json.loads(post.media_urls)
            except:
                pass
        return {
            'id': post.id,
            'child_id': post.child_id,
            'child_name': post.child.name if post.child else None,
            'author_id': post.author_id if post.author else None,
            'author_name': post.author.name if post.author else None,
            'title': post.title,
            'caption': post.caption,
            'comments': post.comments,
            'post_type': post.post_type,
            'media_urls': media_urls,
            'video_link': post.video_link,
            'youtube_url': post.youtube_url,
            'likes': post.likes,
            'comments_count': post.comments_count,
            'is_published': post.is_published,
            'is_featured': post.is_featured,
            'created_at': post.created_at.isoformat() if post.created_at else None,
            'updated_at': post.updated_at.isoformat() if post.updated_at else None
        }

    def _comment_to_dict(self, comment) -> dict:
        if not comment:
            return None
        return {
            'id': comment.id,
            'post_id': comment.post_id,
            'user_id': comment.user_id,
            'user_name': comment.user.name if comment.user else None,
            'content': comment.content,
            'is_approved': comment.is_approved,
            'created_at': comment.created_at.isoformat() if comment.created_at else None,
            'updated_at': comment.updated_at.isoformat() if comment.updated_at else None
        }

Posts = PostsTable(DB)