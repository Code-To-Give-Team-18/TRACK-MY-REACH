# apps/webui/models/regions.py
from peewee import *
from playhouse.shortcuts import model_to_dict
import uuid
from apps.webui.internal.db import DB

class Region(Model):
    id = CharField(max_length=255, unique=True, primary_key=True,
                   default=lambda: str(uuid.uuid4()))
    name = CharField(max_length=255, unique=True)

    class Meta:
        database = DB

class RegionsTable:
    def __init__(self, db):
        self.db = db
        db.create_tables([Region], safe=True)

    def get_all_regions(self) -> list:
        return [model_to_dict(r) for r in Region.select().order_by(Region.name.asc())]

    def get_region_by_id(self, region_id: str) -> dict | None:
        r = Region.get_or_none(Region.id == region_id)
        return model_to_dict(r) if r else None

    def get_region_by_name(self, name: str) -> dict | None:
        r = Region.get_or_none(Region.name == name)
        return model_to_dict(r) if r else None

    def create_region(self, name: str) -> dict:
        r = Region.create(name=name)
        return model_to_dict(r)

    def update_region_name(self, region_id: str, new_name: str) -> dict:
        r = Region.get_or_none(Region.id == region_id)
        if not r:
            return None
        r.name = new_name
        r.save()
        return model_to_dict(r)

    def delete_region(self, region_id: str) -> bool:
        return Region.delete().where(Region.id == region_id).execute() == 1

Regions = RegionsTable(DB)
