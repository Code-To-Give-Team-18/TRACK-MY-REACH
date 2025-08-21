from peewee import *
from playhouse.shortcuts import model_to_dict
from datetime import datetime, timedelta, date
import uuid
from apps.webui.internal.db import DB
from apps.webui.models.users import User
from apps.webui.models.regions import Region
from apps.webui.models.donations import Donation


class LeaderboardEntry(Model):
    id = CharField(max_length=255, unique=True, primary_key=True, default=lambda: str(uuid.uuid4()))
    leaderboard_type = CharField(max_length=50)  # 'user', 'region', 'school'
    period = CharField(max_length=20)  # 'daily', 'weekly', 'monthly', 'yearly', 'all_time'
    period_date = DateField()
    entity_id = CharField(max_length=255)  # User ID, Region ID, or School name
    entity_name = CharField(max_length=255)
    entity_type = CharField(max_length=50)  # 'individual', 'region', 'school'
    total_amount = DecimalField(max_digits=15, decimal_places=2)
    donation_count = IntegerField()
    rank = IntegerField()
    rank_change = IntegerField(default=0)  # Change from previous period
    avatar_url = CharField(max_length=500, null=True)
    updated_at = DateTimeField(default=datetime.now)

    class Meta:
        database = DB
        indexes = (
            (('leaderboard_type', 'period', 'period_date', 'entity_id'), True),  # Unique compound index
        )


class LeaderboardTable:
    def __init__(self, db):
        self.db = db
        db.create_tables([LeaderboardEntry], safe=True)

    def update_leaderboards(self):
        """Update all leaderboards with current data"""
        from datetime import date
        
        today = date.today()
        periods = [
            ('daily', today),
            ('weekly', today - timedelta(days=today.weekday())),
            ('monthly', today.replace(day=1)),
            ('yearly', today.replace(month=1, day=1)),
            ('all_time', date(2000, 1, 1))
        ]
        
        for period, period_date in periods:
            self._update_user_leaderboard(period, period_date)
            self._update_region_leaderboard(period, period_date)
            self._update_school_leaderboard(period, period_date)

    def _update_user_leaderboard(self, period: str, period_date: date):
        """Update user/individual donor leaderboard"""
        
        # Get donation data for the period
        query = Donation.select(
            Donation.user,
            fn.SUM(Donation.amount).alias('total_amount'),
            fn.COUNT(Donation.id).alias('donation_count')
        ).where(Donation.status == 'completed')
        
        if period != 'all_time':
            query = query.where(Donation.created_at >= datetime.combine(period_date, datetime.min.time()))
        
        query = query.group_by(Donation.user).order_by(fn.SUM(Donation.amount).desc())
        
        # Get previous rankings for rank change calculation
        previous_rankings = {}
        if period != 'all_time':
            previous_entries = LeaderboardEntry.select().where(
                (LeaderboardEntry.leaderboard_type == 'user') &
                (LeaderboardEntry.period == period) &
                (LeaderboardEntry.period_date < period_date)
            ).order_by(LeaderboardEntry.period_date.desc())
            
            for entry in previous_entries:
                if entry.entity_id not in previous_rankings:
                    previous_rankings[entry.entity_id] = entry.rank
        
        # Update leaderboard entries
        rank = 0
        for row in query:
            rank += 1
            user_data = model_to_dict(row.user)
            
            # Calculate rank change
            previous_rank = previous_rankings.get(str(row.user.id), 0)
            rank_change = previous_rank - rank if previous_rank > 0 else 0
            
            LeaderboardEntry.insert(
                leaderboard_type='user',
                period=period,
                period_date=period_date,
                entity_id=str(row.user.id),
                entity_name=user_data['name'],
                entity_type='individual',
                total_amount=row.total_amount,
                donation_count=row.donation_count,
                rank=rank,
                rank_change=rank_change,
                avatar_url=user_data.get('profile_image_url'),
                updated_at=datetime.now()
            ).on_conflict(
                conflict_target=(LeaderboardEntry.leaderboard_type, LeaderboardEntry.period, 
                               LeaderboardEntry.period_date, LeaderboardEntry.entity_id),
                preserve=[LeaderboardEntry.total_amount, LeaderboardEntry.donation_count, 
                         LeaderboardEntry.rank, LeaderboardEntry.rank_change, 
                         LeaderboardEntry.updated_at]
            ).execute()

    def _update_region_leaderboard(self, period: str, period_date: date):
        """Update region leaderboard"""
        
        # Get donation data by region for the period
        query = Donation.select(
            Donation.region,
            fn.SUM(Donation.amount).alias('total_amount'),
            fn.COUNT(Donation.id).alias('donation_count')
        ).where((Donation.status == 'completed') & (Donation.region.is_null(False)))
        
        if period != 'all_time':
            query = query.where(Donation.created_at >= datetime.combine(period_date, datetime.min.time()))
        
        query = query.group_by(Donation.region).order_by(fn.SUM(Donation.amount).desc())
        
        # Get previous rankings
        previous_rankings = {}
        if period != 'all_time':
            previous_entries = LeaderboardEntry.select().where(
                (LeaderboardEntry.leaderboard_type == 'region') &
                (LeaderboardEntry.period == period) &
                (LeaderboardEntry.period_date < period_date)
            ).order_by(LeaderboardEntry.period_date.desc())
            
            for entry in previous_entries:
                if entry.entity_id not in previous_rankings:
                    previous_rankings[entry.entity_id] = entry.rank
        
        # Update leaderboard entries
        rank = 0
        for row in query:
            rank += 1
            
            # Calculate rank change
            previous_rank = previous_rankings.get(str(row.region.id), 0)
            rank_change = previous_rank - rank if previous_rank > 0 else 0
            
            LeaderboardEntry.insert(
                leaderboard_type='region',
                period=period,
                period_date=period_date,
                entity_id=str(row.region.id),
                entity_name=row.region.name,
                entity_type='region',
                total_amount=row.total_amount,
                donation_count=row.donation_count,
                rank=rank,
                rank_change=rank_change,
                updated_at=datetime.now()
            ).on_conflict(
                conflict_target=(LeaderboardEntry.leaderboard_type, LeaderboardEntry.period, 
                               LeaderboardEntry.period_date, LeaderboardEntry.entity_id),
                preserve=[LeaderboardEntry.total_amount, LeaderboardEntry.donation_count, 
                         LeaderboardEntry.rank, LeaderboardEntry.rank_change, 
                         LeaderboardEntry.updated_at]
            ).execute()

    def _update_school_leaderboard(self, period: str, period_date: date):
        """Update school leaderboard based on children's schools"""
        from apps.webui.models.children import Child
        
        # Get donation data by school for the period
        query = Donation.select(
            Child.school,
            fn.SUM(Donation.amount).alias('total_amount'),
            fn.COUNT(Donation.id).alias('donation_count')
        ).join(Child, on=(Donation.child == Child.id)).where(
            (Donation.status == 'completed') & 
            (Child.school.is_null(False))
        )
        
        if period != 'all_time':
            query = query.where(Donation.created_at >= datetime.combine(period_date, datetime.min.time()))
        
        query = query.group_by(Child.school).order_by(fn.SUM(Donation.amount).desc())
        
        # Get previous rankings
        previous_rankings = {}
        if period != 'all_time':
            previous_entries = LeaderboardEntry.select().where(
                (LeaderboardEntry.leaderboard_type == 'school') &
                (LeaderboardEntry.period == period) &
                (LeaderboardEntry.period_date < period_date)
            ).order_by(LeaderboardEntry.period_date.desc())
            
            for entry in previous_entries:
                if entry.entity_id not in previous_rankings:
                    previous_rankings[entry.entity_id] = entry.rank
        
        # Update leaderboard entries
        rank = 0
        for row in query:
            rank += 1
            school_name = row.school
            
            # Calculate rank change
            previous_rank = previous_rankings.get(school_name, 0)
            rank_change = previous_rank - rank if previous_rank > 0 else 0
            
            LeaderboardEntry.insert(
                leaderboard_type='school',
                period=period,
                period_date=period_date,
                entity_id=school_name,
                entity_name=school_name,
                entity_type='school',
                total_amount=row.total_amount,
                donation_count=row.donation_count,
                rank=rank,
                rank_change=rank_change,
                updated_at=datetime.now()
            ).on_conflict(
                conflict_target=(LeaderboardEntry.leaderboard_type, LeaderboardEntry.period, 
                               LeaderboardEntry.period_date, LeaderboardEntry.entity_id),
                preserve=[LeaderboardEntry.total_amount, LeaderboardEntry.donation_count, 
                         LeaderboardEntry.rank, LeaderboardEntry.rank_change, 
                         LeaderboardEntry.updated_at]
            ).execute()

    def get_leaderboard(
        self,
        leaderboard_type: str = 'user',
        period: str = 'all_time',
        limit: int = 10,
        offset: int = 0
    ) -> dict:
        """Get leaderboard entries for a specific type and period"""
        
        # Get the most recent period date for this period type
        if period == 'all_time':
            period_date = date(2000, 1, 1)
        elif period == 'daily':
            period_date = date.today()
        elif period == 'weekly':
            today = date.today()
            period_date = today - timedelta(days=today.weekday())
        elif period == 'monthly':
            period_date = date.today().replace(day=1)
        elif period == 'yearly':
            period_date = date.today().replace(month=1, day=1)
        else:
            period_date = date.today()
        
        # Get leaderboard entries
        entries = LeaderboardEntry.select().where(
            (LeaderboardEntry.leaderboard_type == leaderboard_type) &
            (LeaderboardEntry.period == period) &
            (LeaderboardEntry.period_date == period_date)
        ).order_by(LeaderboardEntry.rank).limit(limit).offset(offset)
        
        # Get total count
        total_count = LeaderboardEntry.select().where(
            (LeaderboardEntry.leaderboard_type == leaderboard_type) &
            (LeaderboardEntry.period == period) &
            (LeaderboardEntry.period_date == period_date)
        ).count()
        
        return {
            'leaderboard_type': leaderboard_type,
            'period': period,
            'period_date': period_date.isoformat(),
            'total_entries': total_count,
            'entries': [self._entry_to_dict(entry) for entry in entries]
        }

    def get_user_ranking(self, user_id: str, period: str = 'all_time') -> dict:
        """Get a specific user's ranking across different leaderboards"""
        
        # Get the appropriate period date
        if period == 'all_time':
            period_date = date(2000, 1, 1)
        elif period == 'daily':
            period_date = date.today()
        elif period == 'weekly':
            today = date.today()
            period_date = today - timedelta(days=today.weekday())
        elif period == 'monthly':
            period_date = date.today().replace(day=1)
        elif period == 'yearly':
            period_date = date.today().replace(month=1, day=1)
        else:
            period_date = date.today()
        
        entry = LeaderboardEntry.get_or_none(
            (LeaderboardEntry.leaderboard_type == 'user') &
            (LeaderboardEntry.period == period) &
            (LeaderboardEntry.period_date == period_date) &
            (LeaderboardEntry.entity_id == user_id)
        )
        
        if entry:
            return self._entry_to_dict(entry)
        
        return {
            'user_id': user_id,
            'rank': None,
            'total_amount': 0,
            'donation_count': 0,
            'message': 'User not ranked in this period'
        }

    def get_region_ranking(self, region_id: str, period: str = 'all_time') -> dict:
        """Get a specific region's ranking"""
        
        # Get the appropriate period date
        if period == 'all_time':
            period_date = date(2000, 1, 1)
        elif period == 'daily':
            period_date = date.today()
        elif period == 'weekly':
            today = date.today()
            period_date = today - timedelta(days=today.weekday())
        elif period == 'monthly':
            period_date = date.today().replace(day=1)
        elif period == 'yearly':
            period_date = date.today().replace(month=1, day=1)
        else:
            period_date = date.today()
        
        entry = LeaderboardEntry.get_or_none(
            (LeaderboardEntry.leaderboard_type == 'region') &
            (LeaderboardEntry.period == period) &
            (LeaderboardEntry.period_date == period_date) &
            (LeaderboardEntry.entity_id == region_id)
        )
        
        if entry:
            return self._entry_to_dict(entry)
        
        return {
            'region_id': region_id,
            'rank': None,
            'total_amount': 0,
            'donation_count': 0,
            'message': 'Region not ranked in this period'
        }

    def _entry_to_dict(self, entry) -> dict:
        if not entry:
            return None
        
        return {
            'rank': entry.rank,
            'rank_change': entry.rank_change,
            'entity_id': entry.entity_id,
            'entity_name': entry.entity_name,
            'entity_type': entry.entity_type,
            'total_amount': float(entry.total_amount),
            'donation_count': entry.donation_count,
            'avatar_url': entry.avatar_url,
            'updated_at': entry.updated_at.isoformat() if entry.updated_at else None
        }


Leaderboard = LeaderboardTable(DB)