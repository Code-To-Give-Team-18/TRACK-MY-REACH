from peewee import *
from datetime import datetime
import uuid
from apps.webui.internal.db import DB


class Region(Model):
    id = CharField(max_length=255, unique=True, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = CharField(max_length=255, unique=True)
    total_donated = DecimalField(max_digits=15, decimal_places=2, default=0.00)
    created_at = DateTimeField(default=datetime.now)
    updated_at = DateTimeField(default=datetime.now)

    class Meta:
        database = DB


class RegionsTable:
    def __init__(self, db):
        self.db = db
        db.create_tables([Region], safe=True)

    def get_all_regions(self) -> list:
        return [
            model_to_dict(region)
            for region in Region.select().order_by(Region.total_donated.desc())
        ]

    def get_region_by_id(self, region_id: str) -> dict:
        region = Region.get_or_none(Region.id == region_id)
        return model_to_dict(region) if region else None

    def get_region_by_name(self, name: str) -> dict:
        region = Region.get_or_none(Region.name == name)
        return model_to_dict(region) if region else None

    def create_region(self, name: str) -> dict:
        region = Region.create(name=name)
        return model_to_dict(region)

    def update_region_donation_total(self, region_id: str, amount: float) -> dict:
        region = Region.get(Region.id == region_id)
        region.total_donated += amount
        region.updated_at = datetime.now()
        region.save()
        return model_to_dict(region)

    def get_top_regions(self, limit: int = 10) -> list:
        return [
            model_to_dict(region)
            for region in Region.select().order_by(Region.total_donated.desc()).limit(limit)
        ]


Regions = RegionsTable(DB)