from peewee import *
from playhouse.shortcuts import model_to_dict
from datetime import datetime
import uuid
from apps.webui.internal.db import DB
from apps.webui.models.users import User
from apps.webui.models.children import Child


class Follower(Model):
    id = CharField(max_length=255, unique=True, primary_key=True, default=lambda: str(uuid.uuid4()))
    user = ForeignKeyField(User, backref='following', on_delete='CASCADE')
    child = ForeignKeyField(Child, backref='followers', on_delete='CASCADE')
    followed_at = DateTimeField(default=datetime.now)
    notifications_enabled = BooleanField(default=True)  # Whether user wants notifications for this child
    
    class Meta:
        database = DB
        indexes = (
            (('user', 'child'), True),  # Unique compound index - user can only follow a child once
        )


class FollowersTable:
    def __init__(self, db):
        self.db = db
        db.create_tables([Follower], safe=True)

    def follow_child(
        self,
        user_id: str,
        child_id: str,
        notifications_enabled: bool = True
    ) -> dict:
        """User follows a child"""
        from apps.webui.models.children import Children
        
        try:
            # Create the follow relationship
            follower = Follower.create(
                user=user_id,
                child=child_id,
                notifications_enabled=notifications_enabled
            )
            
            # Increment the child's follower count
            Children.increment_follower_count(child_id)
            
            return {
                'success': True,
                'follower': self._follower_to_dict(follower),
                'message': 'Successfully followed child'
            }
        except IntegrityError:
            # User already follows this child
            return {
                'success': False,
                'message': 'User already follows this child'
            }

    def unfollow_child(self, user_id: str, child_id: str) -> dict:
        """User unfollows a child"""
        from apps.webui.models.children import Children
        
        follower = Follower.get_or_none(
            (Follower.user == user_id) & (Follower.child == child_id)
        )
        
        if follower:
            follower.delete_instance()
            
            # Decrement the child's follower count using the proper method
            Children.decrement_follower_count(child_id)
            
            return {
                'success': True,
                'message': 'Successfully unfollowed child'
            }
        
        return {
            'success': False,
            'message': 'User was not following this child'
        }

    def is_following(self, user_id: str, child_id: str) -> bool:
        """Check if a user is following a specific child"""
        return Follower.select().where(
            (Follower.user == user_id) & (Follower.child == child_id)
        ).exists()

    def get_user_following(self, user_id: str, limit: int = None) -> list:
        """Get all children that a user is following"""
        query = Follower.select().where(Follower.user == user_id).order_by(Follower.followed_at.desc())
        
        if limit:
            query = query.limit(limit)
        
        return [
            self._follower_with_child_to_dict(follower)
            for follower in query
        ]

    def get_child_followers(self, child_id: str, limit: int = None) -> list:
        """Get all users following a specific child"""
        query = Follower.select().where(Follower.child == child_id).order_by(Follower.followed_at.desc())
        
        if limit:
            query = query.limit(limit)
        
        return [
            self._follower_with_user_to_dict(follower)
            for follower in query
        ]

    def get_following_count(self, user_id: str) -> int:
        """Get the number of children a user is following"""
        return Follower.select().where(Follower.user == user_id).count()

    def get_follower_count(self, child_id: str) -> int:
        """Get the number of followers for a child"""
        return Follower.select().where(Follower.child == child_id).count()

    def update_notifications(self, user_id: str, child_id: str, enabled: bool) -> bool:
        """Update notification preferences for a follow relationship"""
        follower = Follower.get_or_none(
            (Follower.user == user_id) & (Follower.child == child_id)
        )
        
        if follower:
            follower.notifications_enabled = enabled
            follower.save()
            return True
        return False

    def get_users_following_children_in_region(self, region_id: str) -> list:
        """Get all users following children in a specific region"""
        from apps.webui.models.children import Child
        
        followers = (
            Follower.select(Follower, User, Child)
            .join(Child)
            .switch(Follower)
            .join(User)
            .where(Child.region == region_id)
            .group_by(Follower.user)
        )
        
        user_data = {}
        for follower in followers:
            user_id = str(follower.user.id)
            if user_id not in user_data:
                user_data[user_id] = {
                    'user_id': user_id,
                    'user_name': follower.user.name,
                    'user_email': follower.user.email,
                    'children_followed': []
                }
            user_data[user_id]['children_followed'].append({
                'child_id': str(follower.child.id),
                'child_name': follower.child.name,
                'followed_at': follower.followed_at.isoformat()
            })
        
        return list(user_data.values())

    def get_recently_followed(self, limit: int = 10) -> list:
        """Get the most recently followed children across all users"""
        return [
            {
                'user_id': str(follower.user.id),
                'user_name': follower.user.name,
                'child_id': str(follower.child.id),
                'child_name': follower.child.name,
                'followed_at': follower.followed_at.isoformat()
            }
            for follower in Follower.select()
            .order_by(Follower.followed_at.desc())
            .limit(limit)
        ]

    def get_suggested_children(self, user_id: str, limit: int = 5) -> list:
        """Get suggested children to follow based on user's interests"""
        from apps.webui.models.children import Child
        from apps.webui.models.donations import Donation
        
        # Get children the user has donated to but not followed
        donated_children = (
            Child.select(Child)
            .join(Donation, on=(Donation.child == Child.id))
            .where(
                (Donation.user == user_id) &
                (Child.is_active == True)
            )
            .distinct()
        )
        
        # Filter out already followed children
        followed_children_ids = [
            f.child_id for f in Follower.select().where(Follower.user == user_id)
        ]
        
        suggestions = []
        for child in donated_children:
            if str(child.id) not in followed_children_ids:
                suggestions.append({
                    'child_id': str(child.id),
                    'child_name': child.name,
                    'region_name': child.region.name if child.region else None,
                    'follower_count': child.follower_count,
                    'reason': 'You have donated to this child'
                })
        
        # If not enough suggestions, add popular children from same regions
        if len(suggestions) < limit:
            # Get regions where user has followed children
            user_regions = (
                Child.select(Child.region)
                .join(Follower, on=(Follower.child == Child.id))
                .where(Follower.user == user_id)
                .distinct()
            )
            
            region_ids = [r.region_id for r in user_regions]
            
            if region_ids:
                popular_children = (
                    Child.select()
                    .where(
                        (Child.region.in_(region_ids)) &
                        (Child.id.not_in(followed_children_ids)) &
                        (Child.is_active == True)
                    )
                    .order_by(Child.follower_count.desc())
                    .limit(limit - len(suggestions))
                )
                
                for child in popular_children:
                    suggestions.append({
                        'child_id': str(child.id),
                        'child_name': child.name,
                        'region_name': child.region.name if child.region else None,
                        'follower_count': child.follower_count,
                        'reason': 'Popular in regions you follow'
                    })
        
        return suggestions[:limit]

    def sync_follower_counts(self):
        """Sync follower counts - delegates to Children model"""
        from apps.webui.models.children import Children
        
        # Use the sync method from Children model
        Children.sync_all_follower_counts()

    def _follower_to_dict(self, follower) -> dict:
        if not follower:
            return None
        return {
            'id': follower.id,
            'user_id': str(follower.user_id),
            'child_id': str(follower.child_id),
            'followed_at': follower.followed_at.isoformat() if follower.followed_at else None,
            'notifications_enabled': follower.notifications_enabled
        }

    def _follower_with_child_to_dict(self, follower) -> dict:
        if not follower:
            return None
        return {
            'id': follower.id,
            'child': {
                'id': str(follower.child.id),
                'name': follower.child.name,
                'school': follower.child.school,
                'grade': follower.child.grade,
                'picture_link': follower.child.picture_link,
                'region_name': follower.child.region.name if follower.child.region else None,
                'follower_count': follower.child.follower_count
            },
            'followed_at': follower.followed_at.isoformat() if follower.followed_at else None,
            'notifications_enabled': follower.notifications_enabled
        }

    def _follower_with_user_to_dict(self, follower) -> dict:
        if not follower:
            return None
        return {
            'id': follower.id,
            'user': {
                'id': str(follower.user.id),
                'name': follower.user.name,
                'profile_image_url': follower.user.profile_image_url if hasattr(follower.user, 'profile_image_url') else None
            },
            'followed_at': follower.followed_at.isoformat() if follower.followed_at else None,
            'notifications_enabled': follower.notifications_enabled
        }
    def get_followers_by_child(self, child_id: str) -> list:
        """Get all followers for a specific child"""
        return [
            self._follower_with_user_to_dict(follower)
            for follower in Follower.select()
            .join(User)
            .where(Follower.child == child_id)
            .order_by(Follower.followed_at.desc())
        ]

    def get_children_followed_by_user(self, user_id: str) -> list:
        """Get all children followed by a specific user"""
        return [
            self._follower_with_child_to_dict(follower)
            for follower in Follower.select()
            .join(Child)
            .where(Follower.user == user_id)
            .order_by(Follower.followed_at.desc())
        ]

    def create_follower(self, user_id: str, child_id: str, notifications_enabled: bool = True) -> bool:
        """Create a new follower relationship"""
        try:
            Follower.create(
                user=user_id,
                child=child_id,
                notifications_enabled=notifications_enabled
            )
            # Update child's follower count
            child = Child.get(Child.id == child_id)
            child.follower_count += 1
            child.save()
            return True
        except IntegrityError:
            return False

    def delete_follower(self, user_id: str, child_id: str) -> bool:
        """Delete a follower relationship"""
        follower = Follower.get_or_none(
            (Follower.user == user_id) & (Follower.child == child_id)
        )
        if follower:
            follower.delete_instance()
            # Update child's follower count
            child = Child.get(Child.id == child_id)
            child.follower_count = max(0, child.follower_count - 1)
            child.save()
            return True
        return False

    def get_top_k_children_by_followers(self, k: int) -> list:
        """Get top K children by follower count with random tie-breaking"""
        import random
        
        # Get all children with their follower counts
        children = list(Child.select().order_by(Child.follower_count.desc(), fn.Random()))
        
        # Take top K
        top_children = children[:k]
        
        return [
            {
                'child_id': str(child.id),
                'follower_count': child.follower_count
            }
            for child in top_children
        ]

Followers = FollowersTable(DB)