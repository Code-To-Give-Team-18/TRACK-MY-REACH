# apps/webui/internal/migrations/004_slim_regions.py
from playhouse.migrate import *
import peewee as pw
from contextlib import suppress

import peewee as pw
from peewee_migrate import Migrator


with suppress(ImportError):
    import playhouse.postgres_ext as pw_pext

def migrate(migrator: Migrator, database: pw.Database, *, fake: bool=False):
    # Drop old columns if they still exist (SQLite will rebuild table under the hood)
    try:
        migrator.remove_fields('region', 'total_donated', 'created_at', 'updated_at')
    except Exception:
        pass

    # Ensure unique index on name (model also has unique=True)
    try:
        migrator.add_index('region', ('name',), unique=True)
    except Exception:
        pass

def rollback(migrator: Migrator, database: pw.Database, *, fake: bool=False):
    from peewee import DecimalField, DateTimeField
    # Restore columns if you need to roll back
    try:
        migrator.add_fields(
            'region',
            total_donated=DecimalField(max_digits=15, decimal_places=2, default=0.00),
            created_at=DateTimeField(null=True),
            updated_at=DateTimeField(null=True),
        )
    except Exception:
        pass

    # Optionally drop the unique index on name
    try:
        migrator.drop_index('region', 'name')
    except Exception:
        pass
