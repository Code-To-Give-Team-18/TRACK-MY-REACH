from pydantic import BaseModel, ConfigDict
from peewee import *
from playhouse.shortcuts import model_to_dict
from typing import List, Union, Optional
import time
import uuid
import random
import string

from apps.webui.internal.db import DB, JSONField

####################
# User DB Schema
####################


class User(Model):
    id = CharField(unique=True)
    name = CharField()
    email = CharField()
    role = CharField()
    profile_image_url = TextField()
    
    # Referral fields - removed unique constraint to avoid migration issues
    referral_code = CharField(max_length=20, null=True, index=True)  # User's own referral code
    referred_by = CharField(max_length=255, null=True)  # ID of user who referred this user
    referral_count = IntegerField(default=0, null=True)  # Number of successful referrals
    referral_donations_total = DecimalField(max_digits=15, decimal_places=2, default=0.00, null=True)  # Total donations from referrals

    last_active_at = BigIntegerField()
    updated_at = BigIntegerField()
    created_at = BigIntegerField()

    api_key = CharField(null=True, unique=True)
    settings = JSONField(null=True)
    info = JSONField(null=True)

    oauth_sub = TextField(null=True, unique=True)

    class Meta:
        database = DB


class UserSettings(BaseModel):
    ui: Optional[dict] = {}
    model_config = ConfigDict(extra="allow")
    pass


class UserModel(BaseModel):
    id: str
    name: str
    email: str
    role: str = "user"
    profile_image_url: str
    
    referral_code: Optional[str] = None

    last_active_at: int  # timestamp in epoch
    updated_at: int  # timestamp in epoch
    created_at: int  # timestamp in epoch

    api_key: Optional[str] = None
    settings: Optional[UserSettings] = None
    info: Optional[dict] = None

    oauth_sub: Optional[str] = None


####################
# Forms
####################


class UserRoleUpdateForm(BaseModel):
    id: str
    role: str


class UserUpdateForm(BaseModel):
    name: str
    email: str
    profile_image_url: str
    password: Optional[str] = None


class UsersTable:
    def __init__(self, db):
        self.db = db
        self.db.create_tables([User], safe=True)
        # Populate referral codes for existing users without them
        self._ensure_referral_codes()

    def generate_referral_code(self, name: str = None) -> str:
        """Generate a unique referral code"""
        # Try to create a readable code first using name
        if name:
            # Use first 3 letters of name + random digits
            prefix = ''.join(filter(str.isalpha, name.upper()))[:3]
            if prefix:
                for _ in range(5):  # Try 5 times with name prefix
                    code = prefix + ''.join(random.choices(string.digits, k=5))
                    if not User.select().where(User.referral_code == code).exists():
                        return code
        
        # Fallback to random code
        for _ in range(10):  # Try 10 times
            code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
            if not User.select().where(User.referral_code == code).exists():
                return code
        
        # Last resort: use UUID
        return str(uuid.uuid4())[:8].upper()

    def insert_new_user(
        self,
        id: str,
        name: str,
        email: str,
        profile_image_url: str = "/user.png",
        role: str = "user",
        oauth_sub: Optional[str] = None,
        referred_by_code: Optional[str] = None,
    ) -> Optional[UserModel]:
        # Generate unique referral code for new user
        referral_code = self.generate_referral_code(name)
        
        # Find referrer if referral code provided
        referred_by_id = None
        if referred_by_code:
            referrer = User.get_or_none(User.referral_code == referred_by_code)
            if referrer:
                referred_by_id = referrer.id
                # Increment referrer's referral count
                referrer.referral_count += 1
                referrer.save()
        
        user = UserModel(
            **{
                "id": id,
                "name": name,
                "email": email,
                "role": role,
                "profile_image_url": profile_image_url,
                "last_active_at": int(time.time()),
                "created_at": int(time.time()),
                "updated_at": int(time.time()),
                "oauth_sub": oauth_sub,
            }
        )
        
        # Add referral fields to the database creation
        user_dict = user.model_dump()
        user_dict['referral_code'] = referral_code
        user_dict['referred_by'] = referred_by_id
        
        result = User.create(**user_dict)
        if result:
            return user
        else:
            return None

    def get_user_by_id(self, id: str) -> Optional[UserModel]:
        try:
            user = User.get(User.id == id)
            return UserModel(**model_to_dict(user))
        except:
            return None

    def get_user_by_api_key(self, api_key: str) -> Optional[UserModel]:
        try:
            user = User.get(User.api_key == api_key)
            return UserModel(**model_to_dict(user))
        except:
            return None

    def get_user_by_email(self, email: str) -> Optional[UserModel]:
        try:
            user = User.get(User.email == email)
            return UserModel(**model_to_dict(user))
        except:
            return None

    def get_user_by_oauth_sub(self, sub: str) -> Optional[UserModel]:
        try:
            user = User.get(User.oauth_sub == sub)
            return UserModel(**model_to_dict(user))
        except:
            return None

    def get_users(self, skip: int = 0, limit: int = 50) -> List[UserModel]:
        return [
            UserModel(**model_to_dict(user))
            for user in User.select()
            # .limit(limit).offset(skip)
        ]

    def get_num_users(self) -> Optional[int]:
        return User.select().count()

    def get_first_user(self) -> UserModel:
        try:
            user = User.select().order_by(User.created_at).first()
            return UserModel(**model_to_dict(user))
        except:
            return None

    def update_user_role_by_id(self, id: str, role: str) -> Optional[UserModel]:
        try:
            query = User.update(role=role).where(User.id == id)
            query.execute()

            user = User.get(User.id == id)
            return UserModel(**model_to_dict(user))
        except:
            return None

    def update_user_profile_image_url_by_id(
        self, id: str, profile_image_url: str
    ) -> Optional[UserModel]:
        try:
            query = User.update(profile_image_url=profile_image_url).where(
                User.id == id
            )
            query.execute()

            user = User.get(User.id == id)
            return UserModel(**model_to_dict(user))
        except:
            return None

    def update_user_last_active_by_id(self, id: str) -> Optional[UserModel]:
        try:
            query = User.update(last_active_at=int(time.time())).where(User.id == id)
            query.execute()

            user = User.get(User.id == id)
            return UserModel(**model_to_dict(user))
        except:
            return None

    def update_user_oauth_sub_by_id(
        self, id: str, oauth_sub: str
    ) -> Optional[UserModel]:
        try:
            query = User.update(oauth_sub=oauth_sub).where(User.id == id)
            query.execute()

            user = User.get(User.id == id)
            return UserModel(**model_to_dict(user))
        except:
            return None

    def update_user_by_id(self, id: str, updated: dict) -> Optional[UserModel]:
        try:
            query = User.update(**updated).where(User.id == id)
            query.execute()

            user = User.get(User.id == id)
            return UserModel(**model_to_dict(user))
        except:
            return None

    def delete_user_by_id(self, id: str) -> bool:
        try:
            # Delete User
            query = User.delete().where(User.id == id)
            query.execute()  # Remove the rows, return number of rows removed.

            return True

        except:
            return False

    def update_user_api_key_by_id(self, id: str, api_key: str) -> str:
        try:
            query = User.update(api_key=api_key).where(User.id == id)
            result = query.execute()

            return True if result == 1 else False
        except:
            return False

    def get_user_api_key_by_id(self, id: str) -> Optional[str]:
        try:
            user = User.get(User.id == id)
            return user.api_key
        except:
            return None
    
    def get_user_by_referral_code(self, referral_code: str) -> Optional[dict]:
        """Get user by their referral code"""
        try:
            user = User.get(User.referral_code == referral_code)
            return model_to_dict(user)
        except:
            return None
    
    def get_user_referrals(self, user_id: str) -> list:
        """Get all users referred by a specific user"""
        try:
            referrals = User.select().where(User.referred_by == user_id)
            return [model_to_dict(user) for user in referrals]
        except:
            return []
    
    def update_referral_donation_total(self, referrer_id: str, amount: float):
        """Update the total donations from referrals for a user"""
        try:
            user = User.get(User.id == referrer_id)
            user.referral_donations_total += amount
            user.save()
            return True
        except:
            return False
    
    def get_referral_stats(self, user_id: str) -> dict:
        """Get referral statistics for a user"""
        try:
            user = User.get(User.id == user_id)
            referrals = self.get_user_referrals(user_id)
            
            return {
                'referral_code': user.referral_code,
                'referral_count': user.referral_count,
                'referral_donations_total': float(user.referral_donations_total),
                'referred_by': user.referred_by,
                'referrals': referrals
            }
        except:
            return {
                'referral_code': None,
                'referral_count': 0,
                'referral_donations_total': 0,
                'referred_by': None,
                'referrals': []
            }
    
    def regenerate_referral_code(self, user_id: str) -> Optional[str]:
        """Regenerate a user's referral code"""
        try:
            user = User.get(User.id == user_id)
            new_code = self.generate_referral_code(user.name)
            user.referral_code = new_code
            user.save()
            return new_code
        except:
            return None
    
    def _ensure_referral_codes(self):
        """Ensure all existing users have referral codes"""
        try:
            users_without_codes = User.select().where(
                (User.referral_code.is_null()) | (User.referral_code == '')
            )
            for user in users_without_codes:
                if not user.referral_code:
                    user.referral_code = self.generate_referral_code(user.name)
                    user.save()
        except Exception as e:
            # Table might not exist yet during initial migration
            pass


Users = UsersTable(DB)
