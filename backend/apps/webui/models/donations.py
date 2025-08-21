from peewee import *
from datetime import datetime
import uuid
from apps.webui.internal.db import DB
from apps.webui.models.users import User
from apps.webui.models.children import Child
from apps.webui.models.regions import Region


class Donation(Model):
    id = CharField(max_length=255, unique=True, primary_key=True, default=lambda: str(uuid.uuid4()))
    user = ForeignKeyField(User, backref='donations', on_delete='CASCADE')
    child = ForeignKeyField(Child, backref='donations', on_delete='CASCADE', null=True)
    region = ForeignKeyField(Region, backref='donations', on_delete='CASCADE', null=True)
    amount = DecimalField(max_digits=15, decimal_places=2)
    currency = CharField(max_length=3, default='HKD')
    donation_type = CharField(max_length=50, default='child')  # 'child' or 'region'
    is_anonymous = BooleanField(default=False)
    message = TextField(null=True)
    transaction_id = CharField(max_length=255, null=True)
    payment_method = CharField(max_length=50, null=True)
    status = CharField(max_length=50, default='completed')  # pending, completed, failed
    created_at = DateTimeField(default=datetime.now)

    class Meta:
        database = DB


class DonationSummary(Model):
    id = CharField(max_length=255, unique=True, primary_key=True, default=lambda: str(uuid.uuid4()))
    region = ForeignKeyField(Region, backref='donation_summaries', on_delete='CASCADE')
    period = CharField(max_length=20)  # 'daily', 'weekly', 'monthly', 'yearly', 'all_time'
    period_date = DateField()
    total_amount = DecimalField(max_digits=15, decimal_places=2, default=0.00)
    donation_count = IntegerField(default=0)
    unique_donors = IntegerField(default=0)
    updated_at = DateTimeField(default=datetime.now)

    class Meta:
        database = DB
        indexes = (
            (('region', 'period', 'period_date'), True),  # Unique compound index
        )


class DonationsTable:
    def __init__(self, db):
        self.db = db
        db.create_tables([Donation, DonationSummary], safe=True)

    def create_donation(
        self,
        user_id: str,
        amount: float,
        child_id: str = None,
        region_id: str = None,
        currency: str = 'HKD',
        is_anonymous: bool = False,
        message: str = None,
        transaction_id: str = None,
        payment_method: str = None
    ) -> dict:
        from apps.webui.models.children import Children
        from apps.webui.models.regions import Regions
        
        # Determine donation type and get region if donating to child
        if child_id:
            donation_type = 'child'
            child = Children.get_child_by_id(child_id)
            if child:
                region_id = child['region_id']
        else:
            donation_type = 'region'
        
        # Create donation record
        donation = Donation.create(
            user=user_id,
            child=child_id,
            region=region_id,
            amount=amount,
            currency=currency,
            donation_type=donation_type,
            is_anonymous=is_anonymous,
            message=message,
            transaction_id=transaction_id,
            payment_method=payment_method
        )
        
        # Update totals
        if child_id:
            Children.update_donation_received(child_id, amount)
        
        if region_id:
            Regions.update_region_donation_total(region_id, amount)
            self._update_donation_summary(region_id, amount)
        
        return self._donation_to_dict(donation)

    def get_donations_by_user(self, user_id: str) -> list:
        return [
            self._donation_to_dict(donation)
            for donation in Donation.select().where(Donation.user == user_id).order_by(Donation.created_at.desc())
        ]

    def get_donations_by_child(self, child_id: str) -> list:
        return [
            self._donation_to_dict(donation)
            for donation in Donation.select().where(Donation.child == child_id).order_by(Donation.created_at.desc())
        ]

    def get_donations_by_region(self, region_id: str) -> list:
        return [
            self._donation_to_dict(donation)
            for donation in Donation.select().where(Donation.region == region_id).order_by(Donation.created_at.desc())
        ]

    def get_recent_donations(self, limit: int = 10) -> list:
        return [
            self._donation_to_dict(donation)
            for donation in Donation.select()
            .where(Donation.status == 'completed')
            .order_by(Donation.created_at.desc())
            .limit(limit)
        ]

    def get_top_donors(self, limit: int = 10, period_days: int = None) -> list:
        query = Donation.select(
            Donation.user,
            fn.SUM(Donation.amount).alias('total_amount'),
            fn.COUNT(Donation.id).alias('donation_count')
        ).where(Donation.status == 'completed')
        
        if period_days:
            start_date = datetime.now() - timedelta(days=period_days)
            query = query.where(Donation.created_at >= start_date)
        
        query = query.group_by(Donation.user).order_by(fn.SUM(Donation.amount).desc()).limit(limit)
        
        results = []
        for row in query:
            user_data = model_to_dict(row.user)
            results.append({
                'user': {
                    'id': user_data['id'],
                    'name': user_data['name'],
                    'email': user_data['email'] if not row.user.is_anonymous else None,
                    'profile_image_url': user_data.get('profile_image_url')
                },
                'total_amount': float(row.total_amount),
                'donation_count': row.donation_count
            })
        return results

    def get_donation_stats(self, region_id: str = None, child_id: str = None) -> dict:
        query = Donation.select(
            fn.SUM(Donation.amount).alias('total_amount'),
            fn.COUNT(Donation.id).alias('total_donations'),
            fn.COUNT(fn.DISTINCT(Donation.user)).alias('unique_donors')
        ).where(Donation.status == 'completed')
        
        if region_id:
            query = query.where(Donation.region == region_id)
        if child_id:
            query = query.where(Donation.child == child_id)
        
        result = query.get()
        return {
            'total_amount': float(result.total_amount or 0),
            'total_donations': result.total_donations,
            'unique_donors': result.unique_donors
        }

    def _update_donation_summary(self, region_id: str, amount: float):
        from datetime import date, timedelta
        
        today = date.today()
        periods = [
            ('daily', today),
            ('weekly', today - timedelta(days=today.weekday())),
            ('monthly', today.replace(day=1)),
            ('yearly', today.replace(month=1, day=1)),
            ('all_time', date(2000, 1, 1))
        ]
        
        for period, period_date in periods:
            summary, created = DonationSummary.get_or_create(
                region=region_id,
                period=period,
                period_date=period_date,
                defaults={'total_amount': 0, 'donation_count': 0, 'unique_donors': 0}
            )
            
            summary.total_amount += amount
            summary.donation_count += 1
            
            # Update unique donors count
            unique_donors = Donation.select(fn.COUNT(fn.DISTINCT(Donation.user))).where(
                (Donation.region == region_id) &
                (Donation.status == 'completed') &
                (Donation.created_at >= datetime.combine(period_date, datetime.min.time()))
            ).scalar()
            
            summary.unique_donors = unique_donors
            summary.updated_at = datetime.now()
            summary.save()

    def get_region_summaries(self, period: str = 'all_time') -> list:
        summaries = DonationSummary.select().where(DonationSummary.period == period)
        return [
            {
                'region_id': summary.region_id,
                'region_name': summary.region.name,
                'total_amount': float(summary.total_amount),
                'donation_count': summary.donation_count,
                'unique_donors': summary.unique_donors,
                'updated_at': summary.updated_at.isoformat()
            }
            for summary in summaries
        ]

    def _donation_to_dict(self, donation) -> dict:
        if not donation:
            return None
        return {
            'id': donation.id,
            'user_id': donation.user_id,
            'user_name': donation.user.name if not donation.is_anonymous else 'Anonymous',
            'child_id': donation.child_id if donation.child else None,
            'child_name': donation.child.name if donation.child else None,
            'region_id': donation.region_id if donation.region else None,
            'region_name': donation.region.name if donation.region else None,
            'amount': float(donation.amount),
            'currency': donation.currency,
            'donation_type': donation.donation_type,
            'is_anonymous': donation.is_anonymous,
            'message': donation.message,
            'transaction_id': donation.transaction_id,
            'payment_method': donation.payment_method,
            'status': donation.status,
            'created_at': donation.created_at.isoformat() if donation.created_at else None
        }


Donations = DonationsTable(DB)