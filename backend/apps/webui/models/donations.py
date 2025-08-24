from peewee import *
from playhouse.shortcuts import model_to_dict
from datetime import datetime, timedelta, date
import uuid
from decimal import Decimal, InvalidOperation 

from apps.webui.internal.db import DB
from apps.webui.models.users import User
from apps.webui.models.children import Child
from apps.webui.models.regions import Region


class Donation(Model):
    id = CharField(max_length=255, unique=True, primary_key=True, default=lambda: str(uuid.uuid4()))
    user = ForeignKeyField(User, backref='donations', on_delete='CASCADE', null=True)  # for quick donate
    child = ForeignKeyField(Child, backref='donations', on_delete='CASCADE', null=True)
    region = ForeignKeyField(Region, backref='donations', on_delete='CASCADE', null=True)
    amount = DecimalField(max_digits=15, decimal_places=2)
    currency = CharField(max_length=3, default='HKD')


    donation_type = CharField(
        max_length=20,
        default='Standard',
        constraints=[Check("donation_type IN ('Quick','Guest','Standard')")]
    )


    is_anonymous = BooleanField(default=False)
    referral_code = CharField(max_length=20, null=True)  # Referral code for tracking who referred the donor
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
    total_amount = DecimalField(max_digits=15, decimal_places=2, default=Decimal("0.00"))
    donation_count = IntegerField(default=0)
    unique_donors = IntegerField(default=0)
    updated_at = DateTimeField(default=datetime.now)


    class Meta:
        database = DB
        indexes = (
            (('region', 'period', 'period_date'), True),
        )



class DonationsTable:
    def __init__(self, db):
        self.db = db
        db.create_tables([Donation, DonationSummary], safe=True)
        # Seed default donations for demo
        self.seed_default_donations()


    def create_donation(
        self,
        user_id: str = None,
        amount: float = None,
        child_id: str = None,
        region_id: str = None,
        currency: str = 'HKD',
        donation_type: str = 'Standard',  # 'Quick' | 'Guest' | 'Standard'
        is_anonymous: bool = False,
        referral_code: str = None,
        transaction_id: str = None,
        payment_method: str = None,
    ) -> dict:
        """
        Business rules:
        - Quick: amount only; user=None, child=None, is_anonymous=True, referral_code accepted.
        - Guest: child_id + amount; no user id required.
                 If a sentinel user '0000' exists, use it; otherwise user=None.
                 is_anonymous=True; referral_code accepted.
        - Standard: user_id + child_id + amount required; is_anonymous=False; referral_code accepted.
        """
        from apps.webui.models.children import Children
        from apps.webui.models.regions import Regions
        from apps.webui.models.users import Users


        # Normalize donation_type
        donation_type = (donation_type or 'Standard').title()
        if donation_type not in ('Quick', 'Guest', 'Standard'):
            raise ValueError("donation_type must be one of: Quick, Guest, Standard")


        # Validate & normalize inputs based on type
        if donation_type == 'Quick':
            if amount is None:
                raise ValueError("Quick donation requires 'amount'")
            user_id = None
            child_id = None
            is_anonymous = True
            # Quick donations can now have referral codes


        elif donation_type == 'Guest':
            if not child_id or amount is None:
                raise ValueError("Guest donation requires 'child_id' and 'amount'")
            # Use sentinel user '0000' if present; otherwise store NULL
            try:
                sentinel = Users.get_user_by_id("0000")
                user_id = "0000" if sentinel else None
            except Exception:
                user_id = None
            is_anonymous = True
            # Guest donations can now have referral codes


        else:  # Standard
            if not user_id or not child_id or amount is None:
                raise ValueError("Standard donation requires 'user_id', 'child_id', and 'amount'")
            is_anonymous = False


        if child_id:
            child = Children.get_child_by_id(child_id)
            if not child:
                raise ValueError("Child not found")
            region_id = child.get('region_id')


        try:
            amount = Decimal(str(amount)) if amount is not None else None
        except (InvalidOperation, TypeError):
            raise ValueError("Invalid amount")


        # Create donation
        donation = Donation.create(
            user=user_id,
            child=child_id,
            region=region_id,
            amount=amount,  # Decimal now
            currency=currency,
            donation_type=donation_type,
            is_anonymous=is_anonymous,
            referral_code=referral_code,
            transaction_id=transaction_id,
            payment_method=payment_method,
            status='completed',
        )


        # Side effects
        if child_id:
            Children.update_donation_received(child_id, amount)
        
        # Track referral if referral code is provided (for all donation types)
        if referral_code:
            self._track_referral_donation(referral_code, user_id, float(amount))


        return self._donation_to_dict(donation)


    def get_donations_by_user(self, user_id: str) -> list:
        return [
            self._donation_to_dict(d)
            for d in Donation.select()
            .where(Donation.user == user_id)
            .order_by(Donation.created_at.desc())
        ]


    def get_donations_by_child(self, child_id: str) -> list:
        return [
            self._donation_to_dict(d)
            for d in Donation.select()
            .where(Donation.child == child_id)
            .order_by(Donation.created_at.desc())
        ]


    def get_donations_by_region(self, region_id: str) -> list:
        return [
            self._donation_to_dict(d)
            for d in Donation.select()
            .where(Donation.region == region_id)
            .order_by(Donation.created_at.desc())
        ]


    def get_recent_donations(self, limit: int = 10) -> list:
        return [
            self._donation_to_dict(d)
            for d in (
                Donation.select()
                .where(Donation.status == 'completed')
                .order_by(Donation.created_at.desc())
                .limit(limit)
            )
        ]


    def get_top_donors(self, limit: int = 10, period_days: int = None) -> list:
        q = Donation.select(
            Donation.user,
            fn.SUM(Donation.amount).alias('total_amount'),
            fn.COUNT(Donation.id).alias('donation_count'),
        ).where(Donation.status == 'completed')


        if period_days:
            start_dt = datetime.now() - timedelta(days=period_days)
            q = q.where(Donation.created_at >= start_dt)


        q = q.group_by(Donation.user).order_by(fn.SUM(Donation.amount).desc()).limit(limit)


        results = []
        for row in q:
            if row.user is None:
                results.append({
                    'user': {
                        'id': None,
                        'name': 'Anonymous',
                        'email': None,
                        'profile_image_url': None,
                    },
                    'total_amount': float(row.total_amount or 0),
                    'donation_count': row.donation_count,
                })
            else:
                u = model_to_dict(row.user)
                results.append({
                    'user': {
                        'id': u.get('id'),
                        'name': u.get('name'),
                        'email': u.get('email'),
                        'profile_image_url': u.get('profile_image_url'),
                    },
                    'total_amount': float(row.total_amount or 0),
                    'donation_count': row.donation_count,
                })
        return results


    def get_donation_stats(self, region_id: str = None, child_id: str = None) -> dict:
        q = Donation.select(
            fn.SUM(Donation.amount).alias('total_amount'),
            fn.COUNT(Donation.id).alias('total_donations'),
            fn.COUNT(fn.DISTINCT(Donation.user)).alias('unique_donors'),
        ).where(Donation.status == 'completed')


        if region_id:
            q = q.where(Donation.region == region_id)
        if child_id:
            q = q.where(Donation.child == child_id)


        r = q.get()
        return {
            'total_amount': float(r.total_amount or 0),
            'total_donations': r.total_donations or 0,
            'unique_donors': r.unique_donors or 0,
        }


    def _update_donation_summary(self, region_id: str, amount: Decimal):
        today = date.today()
        periods = [
            ('daily', today),
            ('weekly', today - timedelta(days=today.weekday())),
            ('monthly', today.replace(day=1)),
            ('yearly', today.replace(month=1, day=1)),
            ('all_time', date(2000, 1, 1)),
        ]


        for period, period_date in periods:
            summary, _ = DonationSummary.get_or_create(
                region=region_id,
                period=period,
                period_date=period_date,
                defaults={'total_amount': Decimal("0.00"), 'donation_count': 0, 'unique_donors': 0},
            )


            current_total = summary.total_amount
            if not isinstance(current_total, Decimal):
                current_total = Decimal(str(current_total or "0.00"))
            summary.total_amount = current_total + amount


            summary.donation_count = (summary.donation_count or 0) + 1


            # recompute unique donors in the window (using >= period start)
            start_dt = datetime.combine(period_date, datetime.min.time())
            unique = Donation.select(fn.COUNT(fn.DISTINCT(Donation.user))).where(
                (Donation.region == region_id)
                & (Donation.status == 'completed')
                & (Donation.created_at >= start_dt)
            ).scalar()


            summary.unique_donors = unique or 0
            summary.updated_at = datetime.now()
            summary.save()
    
    def get_user_total(user_id: str) -> float:
        from peewee import fn
        total = (
            Donation.select(fn.SUM(Donation.amount))
            .where(
                (Donation.user_id == user_id) &
                (Donation.status == "completed")
            ).scalar()
        )
        return float(total) if total else 0.0


    def get_region_summaries(self, period: str = 'all_time') -> list:
        summaries = DonationSummary.select().where(DonationSummary.period == period)
        return [
            {
                'region_id': s.region_id,
                'region_name': s.region.name,
                'total_amount': float(s.total_amount),
                'donation_count': s.donation_count,
                'unique_donors': s.unique_donors,
                'updated_at': s.updated_at.isoformat(),
            }
            for s in summaries
        ]


    def _track_referral_donation(self, referral_code: str, donor_user_id: str, amount: float):
        """Track referral donation in the referral system"""
        try:
            from apps.webui.models.referrals import Referrals, ReferralTracking
            from apps.webui.models.users import Users
            
            # Validate referral code exists
            referrer = Users.get_user_by_referral_code(referral_code)
            if not referrer:
                print(f"Invalid referral code: {referral_code}")
                return  # Invalid referral code, skip tracking
            
            # Don't track self-referrals
            if donor_user_id and donor_user_id == referrer['id']:
                print(f"Self-referral attempted for user {donor_user_id}")
                return
            
            referrer_id = referrer['id']
            
            # Create or update referral tracking
            if donor_user_id:
                # For logged-in users, track the referral properly
                # First check if this user was already tracked as referred
                existing = ReferralTracking.get_or_none(
                    ReferralTracking.referred_user == donor_user_id
                )
                
                if not existing:
                    # Create new tracking record
                    ReferralTracking.create(
                        referrer=referrer_id,
                        referred_user=donor_user_id,
                        referral_code=referral_code,
                        status='donated',
                        first_donation_at=datetime.now(),
                        total_donations=amount,
                        donation_count=1
                    )
                    print(f"Created new referral tracking for user {donor_user_id} referred by {referrer_id}")
                else:
                    # Update existing tracking
                    existing.total_donations += amount
                    existing.donation_count += 1
                    existing.updated_at = datetime.now()
                    existing.save()
                    print(f"Updated referral tracking for user {donor_user_id}")
            else:
                # For anonymous/guest donations, still track them
                ReferralTracking.create(
                    referrer=referrer_id,
                    referred_user=None,  # Anonymous
                    referral_code=referral_code,
                    status='donated',
                    first_donation_at=datetime.now(),
                    total_donations=amount,
                    donation_count=1
                )
                print(f"Created anonymous referral tracking for referrer {referrer_id}")
            
            # Update referrer's total in the users table
            Users.update_referral_donation_total(referrer_id, amount)
            
            # Check for milestone rewards (simplified for now)
            # This would normally be handled by the referral system's reward logic
            
            print(f"Successfully tracked referral donation: {referral_code} -> {amount}")
            
        except Exception as e:
            # Log error but don't fail the donation
            print(f"Error tracking referral donation: {e}")
            import traceback
            traceback.print_exc()

    def seed_default_donations(self):
        """Seed default donations data for demo purposes"""
        import random
        random.seed(42)  # For reproducibility
        default_donations = [
            # Standard donations from users to children with referral codes
            {
                'id': 'donation-001',
                'user_id': 'user-001',  # John Smith
                'child_id': 'child-001',  # Amy Wong
                'amount': 5500.00,
                'donation_type': 'Standard',
                'payment_method': 'credit_card',
                'referral_code': None,  # Direct donation
                'year': 2024
            },
            {
                'id': 'donation-002',
                'user_id': 'user-002',  # Sarah Johnson
                'child_id': 'child-003',  # Sophie Lee
                'amount': 3750.00,
                'donation_type': 'Standard',
                'payment_method': 'paypal',
                'referral_code': 'JOHN123'  # Referred by John Smith (user-001)
            },
            {
                'id': 'donation-003',
                'user_id': 'user-003',  # Michael Chen (admin)
                'child_id': 'child-005',  # Emily Tam
                'amount': 1000.00,
                'donation_type': 'Standard',
                'payment_method': 'credit_card',
                'referral_code': None  # Direct donation
            },
            {
                'id': 'donation-004',
                'user_id': 'user-004',  # Emily Davis
                'child_id': 'child-002',  # Kevin Chan
                'amount': 300.00,
                'donation_type': 'Standard',
                'payment_method': 'bank_transfer',
                'referral_code': 'SARAH456'  # Referred by Sarah Johnson (user-002)
            },
            {
                'id': 'donation-005',
                'user_id': 'user-005',  # David Lee
                'child_id': 'child-007',  # Lily Chen
                'amount': 600.00,
                'donation_type': 'Standard',
                'payment_method': 'credit_card',
                'referral_code': 'JOHN123'  # Also referred by John Smith
            },
            {
                'id': 'donation-006',
                'user_id': 'user-006',  # Jessica Wong
                'child_id': 'child-009',  # Jessica Ng
                'amount': 450.00,
                'donation_type': 'Standard',
                'payment_method': 'paypal',
                'referral_code': 'MIKE789'  # Referred by Michael Chen (user-003)
            },
            {
                'id': 'donation-007',
                'user_id': 'user-007',  # Robert Taylor
                'child_id': 'child-004',  # Tommy Liu
                'amount': 200.00,
                'donation_type': 'Standard',
                'payment_method': 'credit_card',
                'referral_code': 'EMILY321'  # Referred by Emily Davis (user-004)
            },
            {
                'id': 'donation-008',
                'user_id': 'user-008',  # Amanda Liu
                'child_id': 'child-011',  # Grace Wong
                'amount': 800.00,
                'donation_type': 'Standard',
                'payment_method': 'bank_transfer',
                'referral_code': 'DAVID654'  # Referred by David Lee (user-005)
            },
            {
                'id': 'donation-009',
                'user_id': 'user-009',  # Kevin Park
                'child_id': 'child-006',  # Michael Cheung
                'amount': 350.00,
                'donation_type': 'Standard',
                'payment_method': 'credit_card',
                'referral_code': 'SARAH456'  # Also referred by Sarah
            },
            {
                'id': 'donation-010',
                'user_id': 'user-010',  # Lisa Thompson
                'child_id': 'child-015',  # Maya Wong
                'amount': 1200.00,
                'donation_type': 'Standard',
                'payment_method': 'paypal',
                'referral_code': 'JESS987'  # Referred by Jessica Wong (user-006)
            },
            # Guest donations (no user account) with referral codes
            {
                'id': 'donation-011',
                'user_id': None,
                'child_id': 'child-008',  # Ryan Ho
                'amount': 250.00,
                'donation_type': 'Guest',
                'payment_method': 'credit_card',
                'referral_code': 'LISA741'  # Referred by Lisa Thompson (user-010)
            },
            {
                'id': 'donation-012',
                'user_id': None,
                'child_id': 'child-010',  # Daniel Lam
                'amount': 150.00,
                'donation_type': 'Guest',
                'payment_method': 'paypal',
                'referral_code': 'ROB147'  # Referred by Robert Taylor (user-007)
            },
            {
                'id': 'donation-013',
                'user_id': None,
                'child_id': 'child-012',  # Peter Yip
                'amount': 300.00,
                'donation_type': 'Guest',
                'payment_method': 'credit_card',
                'referral_code': 'AMANDA258'  # Referred by Amanda Liu (user-008)
            },
            # Quick donations (no specific child) with referral codes
            {
                'id': 'donation-014',
                'user_id': None,
                'child_id': None,
                'amount': 100.00,
                'donation_type': 'Quick',
                'payment_method': 'credit_card',
                'referral_code': 'KEVIN369'  # Referred by Kevin Park (user-009)
            },
            {
                'id': 'donation-015',
                'user_id': None,
                'child_id': None,
                'amount': 200.00,
                'donation_type': 'Quick',
                'payment_method': 'paypal',
                'referral_code': 'MIKE789'  # Referred by Michael Chen
            },
            {
                'id': 'donation-016',
                'user_id': None,
                'child_id': None,
                'amount': 500.00,
                'donation_type': 'Quick',
                'payment_method': 'bank_transfer',
                'referral_code': 'JAMES852'  # Referred by James Wilson (user-011)
            },
            # More standard donations with various referral codes
            {
                'id': 'donation-017',
                'user_id': 'user-011',  # James Wilson
                'child_id': 'child-013',  # Sarah Ma
                'amount': 400.00,
                'donation_type': 'Standard',
                'payment_method': 'credit_card',
                'referral_code': 'JOHN123'  # Referred by John Smith
            },
            {
                'id': 'donation-018',
                'user_id': 'user-012',  # Michelle Chang
                'child_id': 'child-014',  # Alex Fung
                'amount': 550.00,
                'donation_type': 'Standard',
                'payment_method': 'paypal',
                'referral_code': 'LISA741'  # Referred by Lisa Thompson
            },
            {
                'id': 'donation-019',
                'user_id': 'user-013',  # Christopher Brown
                'child_id': 'child-016',  # Oliver Tse
                'amount': 650.00,
                'donation_type': 'Standard',
                'payment_method': 'credit_card',
                'referral_code': 'MICH963'  # Referred by Michelle Chang (user-012)
            },
            {
                'id': 'donation-020',
                'user_id': 'user-014',  # Rachel Zhang
                'child_id': 'child-017',  # Chloe Yeung
                'amount': 700.00,
                'donation_type': 'Standard',
                'payment_method': 'bank_transfer',
                'referral_code': 'CHRIS159'  # Referred by Christopher Brown (user-013)
            },
            {
                'id': 'donation-021',
                'user_id': 'user-015',  # Daniel Martinez
                'child_id': 'child-018',  # Nathan Kwok
                'amount': 450.00,
                'donation_type': 'Standard',
                'payment_method': 'paypal',
                'referral_code': 'RACHEL357'  # Referred by Rachel Zhang (user-014)
            },
            {
                'id': 'donation-022',
                'user_id': 'user-001',  # John Smith (2nd donation)
                'child_id': 'child-019',  # Isabella Chu
                'amount': 800.00,
                'donation_type': 'Standard',
                'payment_method': 'credit_card',
                'referral_code': None  # Direct donation
            },
            {
                'id': 'donation-023',
                'user_id': 'user-002',  # Sarah Johnson (2nd donation)
                'child_id': 'child-020',  # Jason Leung
                'amount': 350.00,
                'donation_type': 'Standard',
                'payment_method': 'paypal',
                'referral_code': 'DAN486'  # Referred by Daniel Martinez (user-015)
            },
            {
                'id': 'donation-024',
                'user_id': 'user-003',  # Michael Chen (2nd donation)
                'child_id': 'child-021',  # Zoe Pang
                'amount': 900.00,
                'donation_type': 'Standard',
                'payment_method': 'bank_transfer',
                'referral_code': None  # Direct donation
            },
            {
                'id': 'donation-025',
                'user_id': 'user-010',  # Lisa Thompson (2nd donation)
                'child_id': 'child-023',  # Luna Hui
                'amount': 1100.00,
                'donation_type': 'Standard',
                'payment_method': 'credit_card',
                'referral_code': None  # Direct donation
            },
            # Additional donations to show more referral activity
            {
                'id': 'donation-026',
                'user_id': None,
                'child_id': 'child-022',  # Ethan Siu
                'amount': 200.00,
                'donation_type': 'Guest',
                'payment_method': 'paypal',
                'referral_code': 'JOHN123'  # John has many referrals
            },
            {
                'id': 'donation-027',
                'user_id': None,
                'child_id': None,
                'amount': 300.00,
                'donation_type': 'Quick',
                'payment_method': 'credit_card',
                'referral_code': 'SARAH456'  # Sarah also has multiple referrals
            },
            {
                'id': 'donation-028',
                'user_id': 'user-011',  # James Wilson (2nd donation)
                'child_id': 'child-024',  # Marcus Lo
                'amount': 250.00,
                'donation_type': 'Standard',
                'payment_method': 'bank_transfer',
                'referral_code': 'MIKE789'  # Michael has good referral network
            },
            # Additional donations for child-001 (Amy Wong) in 2024
            {
                'id': 'donation-029',
                'user_id': 'user-004',  # Emily Davis
                'child_id': 'child-001',  # Amy Wong
                'amount': 1500.00,
                'donation_type': 'Standard',
                'payment_method': 'credit_card',
                'referral_code': None,
                'year': 2024
            },
            {
                'id': 'donation-030',
                'user_id': 'user-007',  # Robert Taylor
                'child_id': 'child-001',  # Amy Wong
                'amount': 2000.00,
                'donation_type': 'Standard',
                'payment_method': 'paypal',
                'referral_code': 'EMILY321',  # Referred by Emily Davis
                'year': 2024
            },
            {
                'id': 'donation-031',
                'user_id': None,  # Guest donation
                'child_id': 'child-001',  # Amy Wong
                'amount': 750.00,
                'donation_type': 'Guest',
                'payment_method': 'credit_card',
                'referral_code': 'JOHN123',  # Referred by John Smith
                'year': 2024
            },
            {
                'id': 'donation-032',
                'user_id': 'user-012',  # Michelle Chang
                'child_id': 'child-001',  # Amy Wong
                'amount': 3000.00,
                'donation_type': 'Standard',
                'payment_method': 'bank_transfer',
                'referral_code': None,
                'year': 2024
            },
            {
                'id': 'donation-033',
                'user_id': 'user-008',  # Amanda Liu
                'child_id': 'child-001',  # Amy Wong
                'amount': 1200.00,
                'donation_type': 'Standard',
                'payment_method': 'paypal',
                'referral_code': 'SARAH456',  # Referred by Sarah Johnson
                'year': 2024
            },
            {
                'id': 'donation-034',
                'user_id': 'user-015',  # Daniel Martinez
                'child_id': 'child-001',  # Amy Wong
                'amount': 500.00,
                'donation_type': 'Standard',
                'payment_method': 'credit_card',
                'referral_code': 'MICH963',  # Referred by Michelle Chang
                'year': 2024
            },
            {
                'id': 'donation-035',
                'user_id': None,  # Another guest donation
                'child_id': 'child-001',  # Amy Wong
                'amount': 1800.00,
                'donation_type': 'Guest',
                'payment_method': 'paypal',
                'referral_code': 'LISA741',  # Referred by Lisa Thompson
                'year': 2024
            },
            {
                'id': 'donation-036',
                'user_id': 'user-009',  # Kevin Park
                'child_id': 'child-001',  # Amy Wong
                'amount': 2500.00,
                'donation_type': 'Standard',
                'payment_method': 'credit_card',
                'referral_code': None,
                'year': 2024
            }
        ]
        
        for donation_data in default_donations:
            existing = Donation.get_or_none(Donation.id == donation_data['id'])
            if not existing:
                donation_id = donation_data.pop('id')
                user_id = donation_data.pop('user_id')
                child_id = donation_data.pop('child_id')
                amount = donation_data.pop('amount')
                donation_type = donation_data.pop('donation_type')
                payment_method = donation_data.pop('payment_method')
                referral_code = donation_data.pop('referral_code')
                specific_year = donation_data.pop('year', None)  # Get specific year if provided
                
                # Determine region from child if child_id exists
                region_id = None
                if child_id:
                    try:
                        child = Child.get(Child.id == child_id)
                        region_id = child.region_id
                    except:
                        continue  # Skip if child not found
                
                # Create donation with proper handling of anonymous/guest donations
                is_anonymous = donation_type in ['Quick', 'Guest']
                
                # Generate more random dates
                if specific_year:
                    # For specific year donations (e.g., 2024)
                    from datetime import date
                    year_start = datetime(specific_year, 1, 1)
                    year_end = datetime(specific_year, 12, 31)
                    
                    # Random day within the specified year
                    days_in_year = (year_end - year_start).days
                    random_day = random.randint(0, days_in_year)
                    
                    # Add time of day variation
                    hours = random.choices(
                        [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22],
                        weights=[2, 3, 3, 4, 3, 3, 4, 5, 5, 6, 6, 5, 4, 3]  # Peak in evening
                    )[0]
                    minutes = random.randint(0, 59)
                    seconds = random.randint(0, 59)
                    
                    donation_time = year_start + timedelta(
                        days=random_day,
                        hours=hours,
                        minutes=minutes,
                        seconds=seconds
                    )
                else:
                    # Original logic for donations without specific year
                    # Spread donations over the past 365 days with clustering around certain periods
                    base_days_ago = random.randint(1, 365)
                    
                    # Add some clustering - 30% chance to be within last 30 days
                    if random.random() < 0.3:
                        base_days_ago = random.randint(1, 30)
                    # 20% chance to be within last 60-90 days
                    elif random.random() < 0.2:
                        base_days_ago = random.randint(60, 90)
                    
                    # Add time of day variation (realistic donation times)
                    hours = random.choices(
                        [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22],
                        weights=[2, 3, 3, 4, 3, 3, 4, 5, 5, 6, 6, 5, 4, 3]  # Peak in evening
                    )[0]
                    minutes = random.randint(0, 59)
                    seconds = random.randint(0, 59)
                    
                    donation_time = datetime.now() - timedelta(
                        days=base_days_ago,
                        hours=datetime.now().hour - hours,
                        minutes=datetime.now().minute - minutes,
                        seconds=datetime.now().second - seconds
                    )
                
                Donation.create(
                    id=donation_id,
                    user=user_id,
                    child=child_id,
                    region=region_id,
                    amount=Decimal(str(amount)),
                    currency='HKD',
                    donation_type=donation_type,
                    is_anonymous=is_anonymous,
                    referral_code=referral_code,
                    transaction_id=f'TXN-{donation_id}',
                    payment_method=payment_method,
                    status='completed',
                    created_at=donation_time
                )

    def _donation_to_dict(self, d: Donation) -> dict:
        if not d:
            return None
        return {
            'id': d.id,
            'user_id': d.user_id if d.user else None,
            'user_name': d.user.name if d.user else ('Anonymous' if d.is_anonymous else None),
            'child_id': d.child_id if d.child else None,
            'child_name': d.child.name if d.child else None,
            'region_id': d.region_id if d.region else None,
            'region_name': d.region.name if d.region else None,
            'amount': float(d.amount),
            'currency': d.currency,
            'donation_type': d.donation_type,
            'is_anonymous': d.is_anonymous,
            'referral_code': d.referral_code,
            'transaction_id': d.transaction_id,
            'payment_method': d.payment_method,
            'status': d.status,
            'created_at': d.created_at.isoformat() if d.created_at else None,
        }



Donations = DonationsTable(DB)