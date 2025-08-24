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
        # Seed default users for demo
        self.seed_default_users()

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

    def seed_default_users(self):
        """Seed default users data for demo purposes"""
        default_users = [
            {
                'id': 'user-001',
                'name': 'Tingxiao Shi',
                'email': 'tingxiao@example.com',
                'role': 'user',
                'profile_image_url': 'https://lh3.googleusercontent.com/ogw/AF2bZyh1h5PPERMFg2qEk_qHp4Qtlkx-cZhH1dmVeJb8B_rPuw=s64-c-mo',
                'referral_code': 'JOHN123',
                'referral_count': 3,
                'referral_donations_total': 1500.00,
                'api_key': None,
                'oauth_sub': None
            },
            {
                'id': 'user-002',
                'name': 'Sarah Johnson',
                'email': 'sarah.johnson@example.com',
                'role': 'user',
                'profile_image_url': 'https://picsum.photos/seed/sarah/200/200',
                'referral_code': 'SARAH456',
                'referral_count': 5,
                'referral_donations_total': 2750.00,
                'api_key': None,
                'oauth_sub': None
            },
            {
                'id': 'user-003',
                'name': 'Michael Chen',
                'email': 'michael.chen@example.com',
                'role': 'admin',
                'profile_image_url': 'https://picsum.photos/seed/michael/200/200',
                'referral_code': 'MIKE789',
                'referral_count': 8,
                'referral_donations_total': 4200.00,
                'api_key': None,
                'oauth_sub': None
            },
            {
                'id': 'user-004',
                'name': 'Emily Davis',
                'email': 'emily.davis@example.com',
                'role': 'user',
                'profile_image_url': 'https://picsum.photos/seed/emily/200/200',
                'referral_code': 'EMILY321',
                'referral_count': 2,
                'referral_donations_total': 800.00,
                'api_key': None,
                'oauth_sub': None
            },
            {
                'id': 'user-005',
                'name': 'David Lee',
                'email': 'david.lee@example.com',
                'role': 'user',
                'profile_image_url': 'https://picsum.photos/seed/david/200/200',
                'referral_code': 'DAVID654',
                'referral_count': 6,
                'referral_donations_total': 3100.00,
                'api_key': None,
                'oauth_sub': None
            },
            {
                'id': 'user-006',
                'name': 'Jessica Wong',
                'email': 'jessica.wong@example.com',
                'role': 'user',
                'profile_image_url': 'https://picsum.photos/seed/jessica/200/200',
                'referral_code': 'JESS987',
                'referral_count': 4,
                'referral_donations_total': 1900.00,
                'api_key': None,
                'oauth_sub': None
            },
            {
                'id': 'user-007',
                'name': 'Robert Taylor',
                'email': 'robert.taylor@example.com',
                'role': 'user',
                'profile_image_url': 'https://picsum.photos/seed/robert/200/200',
                'referral_code': 'ROB147',
                'referral_count': 1,
                'referral_donations_total': 450.00,
                'api_key': None,
                'oauth_sub': None
            },
            {
                'id': 'user-008',
                'name': 'Amanda Liu',
                'email': 'amanda.liu@example.com',
                'role': 'user',
                'profile_image_url': 'https://picsum.photos/seed/amanda/200/200',
                'referral_code': 'AMANDA258',
                'referral_count': 7,
                'referral_donations_total': 3650.00,
                'api_key': None,
                'oauth_sub': None
            },
            {
                'id': 'user-009',
                'name': 'Kevin Park',
                'email': 'kevin.park@example.com',
                'role': 'user',
                'profile_image_url': 'https://picsum.photos/seed/kevin/200/200',
                'referral_code': 'KEVIN369',
                'referral_count': 3,
                'referral_donations_total': 1250.00,
                'api_key': None,
                'oauth_sub': None
            },
            {
                'id': 'user-010',
                'name': 'Lisa Thompson',
                'email': 'lisa.thompson@example.com',
                'role': 'user',
                'profile_image_url': 'https://picsum.photos/seed/lisa/200/200',
                'referral_code': 'LISA741',
                'referral_count': 9,
                'referral_donations_total': 5100.00,
                'api_key': None,
                'oauth_sub': None
            },
            {
                'id': 'user-011',
                'name': 'James Wilson',
                'email': 'james.wilson@example.com',
                'role': 'user',
                'profile_image_url': 'https://picsum.photos/seed/james/200/200',
                'referral_code': 'JAMES852',
                'referral_count': 2,
                'referral_donations_total': 900.00,
                'api_key': None,
                'oauth_sub': None
            },
            {
                'id': 'user-012',
                'name': 'Michelle Chang',
                'email': 'michelle.chang@example.com',
                'role': 'user',
                'profile_image_url': 'https://picsum.photos/seed/michelle/200/200',
                'referral_code': 'MICH963',
                'referral_count': 5,
                'referral_donations_total': 2400.00,
                'api_key': None,
                'oauth_sub': None
            },
            {
                'id': 'user-013',
                'name': 'Christopher Brown',
                'email': 'chris.brown@example.com',
                'role': 'user',
                'profile_image_url': 'https://picsum.photos/seed/chris/200/200',
                'referral_code': 'CHRIS159',
                'referral_count': 4,
                'referral_donations_total': 1750.00,
                'api_key': None,
                'oauth_sub': None
            },
            {
                'id': 'user-014',
                'name': 'Rachel Zhang',
                'email': 'rachel.zhang@example.com',
                'role': 'user',
                'profile_image_url': 'https://picsum.photos/seed/rachel/200/200',
                'referral_code': 'RACHEL357',
                'referral_count': 6,
                'referral_donations_total': 2900.00,
                'api_key': None,
                'oauth_sub': None
            },
            {
                'id': 'user-015',
                'name': 'Daniel Martinez',
                'email': 'daniel.martinez@example.com',
                'role': 'user',
                'profile_image_url': 'https://picsum.photos/seed/daniel/200/200',
                'referral_code': 'DAN486',
                'referral_count': 3,
                'referral_donations_total': 1600.00,
                'api_key': None,
                'oauth_sub': None
            }
        ]
        
        for user_data in default_users:
            existing = User.get_or_none(User.id == user_data['id'])
            if not existing:
                # Set timestamps
                user_data['last_active_at'] = int(time.time())
                user_data['created_at'] = int(time.time())
                user_data['updated_at'] = int(time.time())
                User.create(**user_data)


Users = UsersTable(DB)
