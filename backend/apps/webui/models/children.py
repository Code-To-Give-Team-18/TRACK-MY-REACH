from peewee import *
from datetime import datetime
import uuid
from apps.webui.internal.db import DB
from apps.webui.models.regions import Region


class Child(Model):
    id = CharField(max_length=255, unique=True, primary_key=True, default=lambda: str(uuid.uuid4()))
    region = ForeignKeyField(Region, backref='children', on_delete='CASCADE')
    name = CharField(max_length=255)
    age = IntegerField(null=True)
    school = CharField(max_length=255, null=True)
    grade = CharField(max_length=50, null=True)
    description = TextField(null=True)  # New field for child's description
    bio = TextField(null=True)
    video_link = CharField(max_length=500, null=True)
    picture_link = CharField(max_length=500, null=True)
    follower_count = IntegerField(default=0)
    total_received = DecimalField(max_digits=15, decimal_places=2, default=0.00)
    is_active = BooleanField(default=True)
    created_at = DateTimeField(default=datetime.now)
    updated_at = DateTimeField(default=datetime.now)

    class Meta:
        database = DB


class ChildrenTable:
    def __init__(self, db):
        self.db = db
        db.create_tables([Child], safe=True)

    def get_all_children(self) -> list:
        return [
            self._child_to_dict(child)
            for child in Child.select().where(Child.is_active == True)
        ]

    def get_children_by_region(self, region_id: str) -> list:
        return [
            self._child_to_dict(child)
            for child in Child.select().where(
                (Child.region == region_id) & (Child.is_active == True)
            )
        ]

    def get_child_by_id(self, child_id: str) -> dict:
        child = Child.get_or_none(Child.id == child_id)
        return self._child_to_dict(child) if child else None

    def create_child(
        self,
        region_id: str,
        name: str,
        age: int = None,
        school: str = None,
        grade: str = None,
        description: str = None,
        bio: str = None,
        video_link: str = None,
        picture_link: str = None
    ) -> dict:
        child = Child.create(
            region=region_id,
            name=name,
            age=age,
            school=school,
            grade=grade,
            description=description,
            bio=bio,
            video_link=video_link,
            picture_link=picture_link
        )
        return self._child_to_dict(child)

    def update_child(self, child_id: str, **kwargs) -> dict:
        child = Child.get(Child.id == child_id)
        for key, value in kwargs.items():
            if hasattr(child, key):
                setattr(child, key, value)
        child.updated_at = datetime.now()
        child.save()
        return self._child_to_dict(child)

    def increment_follower_count(self, child_id: str) -> dict:
        """Increment follower count - called when a new follower is added"""
        child = Child.get(Child.id == child_id)
        child.follower_count += 1
        child.updated_at = datetime.now()
        child.save()
        return self._child_to_dict(child)
    
    def decrement_follower_count(self, child_id: str) -> dict:
        """Decrement follower count - called when a follower is removed"""
        child = Child.get(Child.id == child_id)
        child.follower_count = max(0, child.follower_count - 1)
        child.updated_at = datetime.now()
        child.save()
        return self._child_to_dict(child)
    
    def sync_follower_count(self, child_id: str) -> dict:
        """Sync follower count with actual followers in Follower table"""
        from apps.webui.models.followers import Follower
        
        child = Child.get(Child.id == child_id)
        actual_count = Follower.select().where(Follower.child == child_id).count()
        child.follower_count = actual_count
        child.updated_at = datetime.now()
        child.save()
        return self._child_to_dict(child)
    
    def sync_all_follower_counts(self):
        """Sync all children's follower counts with Follower table"""
        from apps.webui.models.followers import Follower
        
        # Get all follower counts from Follower table
        follower_counts = (
            Follower.select(
                Follower.child,
                fn.COUNT(Follower.id).alias('count')
            )
            .group_by(Follower.child)
        )
        
        # Update each child's follower count
        for record in follower_counts:
            child = Child.get(Child.id == record.child_id)
            child.follower_count = record.count
            child.updated_at = datetime.now()
            child.save()
        
        # Reset counts for children with no followers
        Child.update(follower_count=0, updated_at=datetime.now()).where(
            Child.id.not_in([r.child_id for r in follower_counts])
        ).execute()

    def update_donation_received(self, child_id: str, amount: float) -> dict:
        child = Child.get(Child.id == child_id)
        child.total_received += amount
        child.updated_at = datetime.now()
        child.save()
        return self._child_to_dict(child)

    def get_popular_children(self, limit: int = 10) -> list:
        """Get most popular children by follower count"""
        return [
            self._child_to_dict(child)
            for child in Child.select()
            .where(Child.is_active == True)
            .order_by(Child.follower_count.desc())
            .limit(limit)
        ]
    
    def get_child_with_followers(self, child_id: str) -> dict:
        """Get child details with actual follower information"""
        from apps.webui.models.followers import Follower
        
        child = Child.get_or_none(Child.id == child_id)
        if not child:
            return None
        
        # Get actual follower count from Follower table
        actual_follower_count = Follower.select().where(Follower.child == child_id).count()
        
        # Get recent followers
        recent_followers = (
            Follower.select()
            .where(Follower.child == child_id)
            .order_by(Follower.followed_at.desc())
            .limit(5)
        )
        
        child_dict = self._child_to_dict(child)
        child_dict['actual_follower_count'] = actual_follower_count
        child_dict['recent_followers'] = [
            {
                'user_id': str(f.user_id),
                'user_name': f.user.name,
                'followed_at': f.followed_at.isoformat()
            }
            for f in recent_followers
        ]
        
        # Sync count if mismatch
        if actual_follower_count != child.follower_count:
            self.sync_follower_count(child_id)
        
        return child_dict

    def _child_to_dict(self, child) -> dict:
        if not child:
            return None
        return {
            'id': child.id,
            'region_id': child.region_id,
            'region_name': child.region.name if child.region else None,
            'name': child.name,
            'age': child.age,
            'school': child.school,
            'grade': child.grade,
            'description': child.description,
            'bio': child.bio,
            'video_link': child.video_link,
            'picture_link': child.picture_link,
            'follower_count': child.follower_count,
            'total_received': float(child.total_received),
            'is_active': child.is_active,
            'created_at': child.created_at.isoformat() if child.created_at else None,
            'updated_at': child.updated_at.isoformat() if child.updated_at else None
        }


Children = ChildrenTable(DB)