from peewee import *
from playhouse.shortcuts import model_to_dict
from datetime import datetime
import uuid
from apps.webui.internal.db import DB


class Milestone(Model):
    id = CharField(max_length=255, unique=True, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = CharField(max_length=255, unique=True)
    amount = DecimalField(max_digits=15, decimal_places=2)
    description = TextField(null=True)
    badge_icon = CharField(max_length=255, null=True)  # Icon or badge image URL
    badge_color = CharField(max_length=50, null=True)  # Color code for the milestone badge
    order_rank = IntegerField(default=0)  # For ordering milestones
    
    # New 'type' column: must be either "user" or "region"
    type = CharField(max_length=10, constraints=[Check("type IN ('user', 'region')")], default='user')
    
    is_active = BooleanField(default=True)
    created_at = DateTimeField(default=datetime.now)
    updated_at = DateTimeField(default=datetime.now)

    class Meta:
        database = DB


class MilestonesTable:
    def __init__(self, db):
        self.db = db
        db.create_tables([Milestone], safe=True)
        if Milestone.select().count() == 0:
            self._create_default_milestones()

    def _create_default_milestones(self):
        default_milestones = [
            {
                'name': 'First Step',
                'amount': 100,
                'description': 'Your first donation makes a difference!',
                'badge_color': '#bronze',
                'order_rank': 1,
                'type': 'user',
            },
            {
                'name': 'Supporter',
                'amount': 500,
                'description': 'Thank you for your continued support',
                'badge_color': '#silver',
                'order_rank': 2,
                'type': 'user',
            },
            {
                'name': 'Contributor',
                'amount': 1000,
                'description': 'Your generosity helps children thrive',
                'badge_color': '#gold',
                'order_rank': 3,
                'type': 'user',
            },
            {
                'name': 'Benefactor',
                'amount': 2500,
                'description': 'Making a significant impact on education',
                'badge_color': '#platinum',
                'order_rank': 4,
                'type': 'user',
            },
            {
                'name': 'Champion',
                'amount': 5000,
                'description': 'A true champion for children\'s education',
                'badge_color': '#diamond',
                'order_rank': 5,
                'type': 'user',
            },
            {
                'name': 'Hero',
                'amount': 10000,
                'description': 'Heroes change lives and futures',
                'badge_color': '#rainbow',
                'order_rank': 6,
                'type': 'user',
            },
            {
                'name': 'Legend',
                'amount': 25000,
                'description': 'Legendary support for the next generation',
                'badge_color': '#legendary',
                'order_rank': 7,
                'type': 'user',
            },
            {
                'name': 'Visionary',
                'amount': 50000,
                'description': 'Visionary donors transform communities',
                'badge_color': '#visionary',
                'order_rank': 8,
                'type': 'user',
            },
            # Example region milestone, add more as needed
            {
                'name': 'Central Region Milestone',
                'amount': 100000,
                'description': 'Milestone for Central region donations',
                'badge_color': '#regioncolor',
                'order_rank': 1,
                'type': 'region',
            },
        ]
        for milestone_data in default_milestones:
            Milestone.create(**milestone_data)

    def get_all_milestones(self, milestone_type: str = None) -> list:
        query = Milestone.select().where(Milestone.is_active == True)
        if milestone_type in ('user', 'region'):
            query = query.where(Milestone.type == milestone_type)
        return [model_to_dict(m) for m in query.order_by(Milestone.order_rank, Milestone.amount)]

    def get_milestone_by_id(self, milestone_id: str, milestone_type: str = None) -> dict:
        query = Milestone.select()
        if milestone_type in ('user', 'region'):
            query = query.where(Milestone.type == milestone_type)
        milestone = query.where(Milestone.id == milestone_id).first()
        return model_to_dict(milestone) if milestone else None

    def get_milestone_by_name(self, name: str, milestone_type: str = None) -> dict:
        query = Milestone.select()
        if milestone_type in ('user', 'region'):
            query = query.where(Milestone.type == milestone_type)
        milestone = query.where(Milestone.name == name).first()
        return model_to_dict(milestone) if milestone else None

    def get_milestone_by_amount(self, amount: float, milestone_type: str = None) -> dict:
        query = Milestone.select().where(
            (Milestone.amount == amount) & (Milestone.is_active == True)
        )
        if milestone_type in ('user', 'region'):
            query = query.where(Milestone.type == milestone_type)
        milestone = query.first()
        return model_to_dict(milestone) if milestone else None

    def get_achieved_milestones(self, total_amount: float, milestone_type: str = None) -> list:
        query = Milestone.select().where(
            (Milestone.amount <= total_amount) & (Milestone.is_active == True)
        )
        if milestone_type in ('user', 'region'):
            query = query.where(Milestone.type == milestone_type)
        return [model_to_dict(m) for m in query.order_by(Milestone.amount.desc())]

    def get_next_milestone(self, current_amount: float, milestone_type: str = None) -> dict:
        query = Milestone.select().where(
            (Milestone.amount > current_amount) & (Milestone.is_active == True)
        )
        if milestone_type in ('user', 'region'):
            query = query.where(Milestone.type == milestone_type)
        milestone = query.order_by(Milestone.amount).first()
        if milestone:
            milestone_dict = model_to_dict(milestone)
            milestone_dict['amount_needed'] = float(milestone.amount) - current_amount
            milestone_dict['progress_percentage'] = min(100, (current_amount / float(milestone.amount)) * 100)
            return milestone_dict
        return None

    def get_current_milestone(self, total_amount: float, milestone_type: str = None) -> dict:
        query = Milestone.select().where(
            (Milestone.amount <= total_amount) & (Milestone.is_active == True)
        )
        if milestone_type in ('user', 'region'):
            query = query.where(Milestone.type == milestone_type)
        milestone = query.order_by(Milestone.amount.desc()).first()
        return model_to_dict(milestone) if milestone else None

    def create_milestone(
        self,
        name: str,
        amount: float,
        milestone_type: str,
        description: str = None,
        badge_icon: str = None,
        badge_color: str = None,
        order_rank: int = 0
    ) -> dict:
        if milestone_type not in ('user', 'region'):
            raise ValueError("milestone_type must be either 'user' or 'region'")
        milestone = Milestone.create(
            name=name,
            amount=amount,
            type=milestone_type,
            description=description,
            badge_icon=badge_icon,
            badge_color=badge_color,
            order_rank=order_rank
        )
        return model_to_dict(milestone)

    def update_milestone(self, milestone_id: str, **kwargs) -> dict:
        milestone = Milestone.get(Milestone.id == milestone_id)
        for key, value in kwargs.items():
            if hasattr(milestone, key):
                setattr(milestone, key, value)
        milestone.updated_at = datetime.now()
        milestone.save()
        return model_to_dict(milestone)

    def deactivate_milestone(self, milestone_id: str) -> bool:
        milestone = Milestone.get_or_none(Milestone.id == milestone_id)
        if milestone:
            milestone.is_active = False
            milestone.updated_at = datetime.now()
            milestone.save()
            return True
        return False

    def get_milestone_progress(self, user_total: float, milestone_type: str = None) -> dict:
        achieved = self.get_achieved_milestones(user_total, milestone_type)
        current = self.get_current_milestone(user_total, milestone_type)
        next_milestone = self.get_next_milestone(user_total, milestone_type)
        all_milestones = self.get_all_milestones(milestone_type)
        return {
            'total_donated': user_total,
            'achieved_milestones': achieved,
            'current_milestone': current,
            'next_milestone': next_milestone,
            'total_milestones': len(all_milestones),
            'achieved_count': len(achieved),
            'completion_percentage': (len(achieved) / len(all_milestones) * 100) if all_milestones else 0
        }


Milestones = MilestonesTable(DB)