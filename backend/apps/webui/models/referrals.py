from peewee import *
from playhouse.shortcuts import model_to_dict
from datetime import datetime, timedelta, date
import uuid
from apps.webui.internal.db import DB
from apps.webui.models.users import User
from apps.webui.models.donations import Donation


class ReferralTracking(Model):
    """Track detailed referral activities and conversions"""
    id = CharField(max_length=255, unique=True, primary_key=True, default=lambda: str(uuid.uuid4()))
    referrer = ForeignKeyField(User, backref='referrals_made', on_delete='CASCADE')
    referred_user = ForeignKeyField(User, backref='referral_source', on_delete='CASCADE', null=True)
    referral_code = CharField(max_length=20)
    status = CharField(max_length=50, default='pending')  # 'pending', 'registered', 'donated', 'expired'
    click_count = IntegerField(default=0)
    first_clicked_at = DateTimeField(null=True)
    registered_at = DateTimeField(null=True)
    first_donation_at = DateTimeField(null=True)
    total_donations = DecimalField(max_digits=15, decimal_places=2, default=0.00)
    donation_count = IntegerField(default=0)
    referral_source = CharField(max_length=100, null=True)  # 'email', 'social', 'direct', etc.
    created_at = DateTimeField(default=datetime.now)
    updated_at = DateTimeField(default=datetime.now)

    class Meta:
        database = DB
        indexes = (
            (('referrer', 'referred_user'), True),  # Unique compound index
        )


class ReferralReward(Model):
    """Track rewards given for successful referrals"""
    id = CharField(max_length=255, unique=True, primary_key=True, default=lambda: str(uuid.uuid4()))
    user = ForeignKeyField(User, backref='referral_rewards', on_delete='CASCADE')
    referral_tracking = ForeignKeyField(ReferralTracking, backref='rewards', on_delete='CASCADE')
    reward_type = CharField(max_length=50)  # 'points', 'discount', 'badge', 'cash'
    reward_value = DecimalField(max_digits=15, decimal_places=2)
    reward_description = TextField(null=True)
    status = CharField(max_length=50, default='pending')  # 'pending', 'awarded', 'redeemed', 'expired'
    awarded_at = DateTimeField(null=True)
    redeemed_at = DateTimeField(null=True)
    expires_at = DateTimeField(null=True)
    created_at = DateTimeField(default=datetime.now)

    class Meta:
        database = DB


class ReferralsTable:
    def __init__(self, db):
        self.db = db
        db.create_tables([ReferralTracking, ReferralReward], safe=True)

    def track_referral_click(self, referral_code: str, source: str = None) -> dict:
        """Track when someone clicks on a referral link"""
        from apps.webui.models.users import Users
        
        referrer = Users.get_user_by_referral_code(referral_code)
        if not referrer:
            return {'success': False, 'message': 'Invalid referral code'}
        
        # Check if tracking already exists for this session
        tracking = ReferralTracking.get_or_none(
            (ReferralTracking.referral_code == referral_code) &
            (ReferralTracking.referred_user.is_null())
        )
        
        if tracking:
            # Update existing tracking
            tracking.click_count += 1
            tracking.updated_at = datetime.now()
            tracking.save()
        else:
            # Create new tracking
            tracking = ReferralTracking.create(
                referrer=referrer['id'],
                referral_code=referral_code,
                referral_source=source,
                click_count=1,
                first_clicked_at=datetime.now()
            )
        
        return {
            'success': True,
            'tracking_id': tracking.id,
            'referrer_name': referrer['name']
        }

    def complete_referral_registration(self, referral_code: str, new_user_id: str) -> dict:
        """Mark a referral as successfully registered"""
        from apps.webui.models.users import Users
        
        referrer = Users.get_user_by_referral_code(referral_code)
        if not referrer:
            return {'success': False, 'message': 'Invalid referral code'}
        
        # Check if referral tracking exists
        tracking = ReferralTracking.get_or_none(
            (ReferralTracking.referral_code == referral_code) &
            (ReferralTracking.referred_user.is_null())
        )
        
        if tracking:
            # Update existing tracking
            tracking.referred_user = new_user_id
            tracking.status = 'registered'
            tracking.registered_at = datetime.now()
            tracking.updated_at = datetime.now()
            tracking.save()
        else:
            # Create new tracking
            tracking = ReferralTracking.create(
                referrer=referrer['id'],
                referred_user=new_user_id,
                referral_code=referral_code,
                status='registered',
                registered_at=datetime.now()
            )
        
        # Award registration reward if configured
        self._check_and_award_reward(tracking.id, 'registration')
        
        return {
            'success': True,
            'tracking_id': tracking.id
        }

    def track_referral_donation(self, user_id: str, donation_amount: float) -> dict:
        """Track when a referred user makes a donation"""
        # Find if this user was referred
        tracking = ReferralTracking.get_or_none(
            ReferralTracking.referred_user == user_id
        )
        
        if not tracking:
            return {'success': False, 'message': 'User was not referred'}
        
        # Update tracking
        tracking.total_donations += donation_amount
        tracking.donation_count += 1
        
        if not tracking.first_donation_at:
            tracking.first_donation_at = datetime.now()
            tracking.status = 'donated'
            # Award first donation reward
            self._check_and_award_reward(tracking.id, 'first_donation')
        
        tracking.updated_at = datetime.now()
        tracking.save()
        
        # Check for milestone rewards
        self._check_milestone_rewards(tracking)
        
        return {
            'success': True,
            'tracking_id': tracking.id,
            'total_referral_donations': float(tracking.total_donations)
        }

    def get_user_referral_stats(self, user_id: str) -> dict:
        """Get comprehensive referral statistics for a user"""
        # As a referrer
        referrals_made = ReferralTracking.select().where(
            ReferralTracking.referrer == user_id
        )
        
        total_clicks = sum(r.click_count for r in referrals_made)
        registered_count = referrals_made.where(
            ReferralTracking.status.in_(['registered', 'donated'])
        ).count()
        donated_count = referrals_made.where(
            ReferralTracking.status == 'donated'
        ).count()
        
        total_referral_donations = sum(
            float(r.total_donations) for r in referrals_made
        )
        
        # Recent referrals
        recent_referrals = [
            self._tracking_to_dict(r)
            for r in referrals_made.order_by(ReferralTracking.created_at.desc()).limit(5)
        ]
        
        # Rewards earned
        rewards = ReferralReward.select().where(
            ReferralReward.user == user_id
        )
        
        total_rewards_value = sum(float(r.reward_value) for r in rewards)
        pending_rewards = rewards.where(ReferralReward.status == 'pending').count()
        
        # As referred user
        was_referred = ReferralTracking.get_or_none(
            ReferralTracking.referred_user == user_id
        )
        
        return {
            'as_referrer': {
                'total_clicks': total_clicks,
                'registered_count': registered_count,
                'donated_count': donated_count,
                'total_referral_donations': total_referral_donations,
                'recent_referrals': recent_referrals
            },
            'rewards': {
                'total_value': total_rewards_value,
                'pending_count': pending_rewards,
                'rewards': [self._reward_to_dict(r) for r in rewards.limit(10)]
            },
            'was_referred_by': self._tracking_to_dict(was_referred) if was_referred else None
        }

    def get_referral_leaderboard(self, period: str = 'all_time', limit: int = 10) -> list:
        """Get top referrers by various metrics"""
        query = ReferralTracking.select(
            ReferralTracking.referrer,
            fn.COUNT(ReferralTracking.id).alias('referral_count'),
            fn.SUM(ReferralTracking.total_donations).alias('total_donations'),
            fn.SUM(ReferralTracking.donation_count).alias('donation_count')
        ).where(ReferralTracking.status == 'donated')
        
        if period != 'all_time':
            if period == 'daily':
                since = datetime.now() - timedelta(days=1)
            elif period == 'weekly':
                since = datetime.now() - timedelta(days=7)
            elif period == 'monthly':
                since = datetime.now() - timedelta(days=30)
            else:
                since = datetime.now() - timedelta(days=365)
            
            query = query.where(ReferralTracking.first_donation_at >= since)
        
        query = query.group_by(ReferralTracking.referrer).order_by(
            fn.SUM(ReferralTracking.total_donations).desc()
        ).limit(limit)
        
        results = []
        for row in query:
            user_data = model_to_dict(row.referrer)
            results.append({
                'user': {
                    'id': user_data['id'],
                    'name': user_data['name'],
                    'profile_image_url': user_data.get('profile_image_url')
                },
                'referral_count': row.referral_count,
                'total_donations': float(row.total_donations or 0),
                'donation_count': row.donation_count
            })
        
        return results

    def _check_and_award_reward(self, tracking_id: str, reward_trigger: str):
        """Check and award rewards based on triggers"""
        # Define reward rules (could be configurable)
        reward_rules = {
            'registration': {'type': 'points', 'value': 100, 'description': 'Referral registration bonus'},
            'first_donation': {'type': 'points', 'value': 500, 'description': 'First donation from referral'}
        }
        
        if reward_trigger in reward_rules:
            tracking = ReferralTracking.get(ReferralTracking.id == tracking_id)
            rule = reward_rules[reward_trigger]
            
            # Check if reward already exists
            existing = ReferralReward.get_or_none(
                (ReferralReward.referral_tracking == tracking_id) &
                (ReferralReward.reward_type == rule['type']) &
                (ReferralReward.reward_description == rule['description'])
            )
            
            if not existing:
                ReferralReward.create(
                    user=tracking.referrer,
                    referral_tracking=tracking_id,
                    reward_type=rule['type'],
                    reward_value=rule['value'],
                    reward_description=rule['description'],
                    status='awarded',
                    awarded_at=datetime.now()
                )

    def _check_milestone_rewards(self, tracking):
        """Check for milestone-based rewards"""
        milestones = [
            {'donations': 1000, 'type': 'badge', 'value': 1, 'description': 'Bronze Referrer'},
            {'donations': 5000, 'type': 'badge', 'value': 1, 'description': 'Silver Referrer'},
            {'donations': 10000, 'type': 'badge', 'value': 1, 'description': 'Gold Referrer'},
            {'donations': 25000, 'type': 'badge', 'value': 1, 'description': 'Platinum Referrer'}
        ]
        
        for milestone in milestones:
            if tracking.total_donations >= milestone['donations']:
                # Check if this milestone reward already exists
                existing = ReferralReward.get_or_none(
                    (ReferralReward.referral_tracking == tracking.id) &
                    (ReferralReward.reward_description == milestone['description'])
                )
                
                if not existing:
                    ReferralReward.create(
                        user=tracking.referrer,
                        referral_tracking=tracking.id,
                        reward_type=milestone['type'],
                        reward_value=milestone['value'],
                        reward_description=milestone['description'],
                        status='awarded',
                        awarded_at=datetime.now()
                    )

    def get_referral_donations(self, referral_code: str) -> list:
        """Get all donations made using a specific referral code"""
        donations = Donation.select().where(
            Donation.referral_code == referral_code
        ).order_by(Donation.created_at.desc())
        
        from apps.webui.models.donations import Donations
        return [Donations._donation_to_dict(d) for d in donations]

    def _tracking_to_dict(self, tracking) -> dict:
        if not tracking:
            return None
        
        return {
            'id': tracking.id,
            'referrer_id': tracking.referrer_id,
            'referrer_name': tracking.referrer.name if tracking.referrer else None,
            'referred_user_id': tracking.referred_user_id if tracking.referred_user else None,
            'referred_user_name': tracking.referred_user.name if tracking.referred_user else None,
            'referral_code': tracking.referral_code,
            'status': tracking.status,
            'click_count': tracking.click_count,
            'total_donations': float(tracking.total_donations),
            'donation_count': tracking.donation_count,
            'referral_source': tracking.referral_source,
            'first_clicked_at': tracking.first_clicked_at.isoformat() if tracking.first_clicked_at else None,
            'registered_at': tracking.registered_at.isoformat() if tracking.registered_at else None,
            'first_donation_at': tracking.first_donation_at.isoformat() if tracking.first_donation_at else None,
            'created_at': tracking.created_at.isoformat() if tracking.created_at else None
        }

    def _reward_to_dict(self, reward) -> dict:
        if not reward:
            return None
        
        return {
            'id': reward.id,
            'reward_type': reward.reward_type,
            'reward_value': float(reward.reward_value),
            'reward_description': reward.reward_description,
            'status': reward.status,
            'awarded_at': reward.awarded_at.isoformat() if reward.awarded_at else None,
            'redeemed_at': reward.redeemed_at.isoformat() if reward.redeemed_at else None,
            'expires_at': reward.expires_at.isoformat() if reward.expires_at else None
        }


Referrals = ReferralsTable(DB)