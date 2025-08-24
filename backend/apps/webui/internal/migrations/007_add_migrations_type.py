from contextlib import suppress
import peewee as pw
from peewee_migrate import Migrator

with suppress(ImportError):
    import playhouse.postgres_ext as pw_pext

def migrate(migrator: Migrator, database: pw.Database, *, fake=False):
    """Add the 'type' column with a default value."""
    
    migrator.add_fields(
        'milestone',
        type=pw.CharField(max_length=10, default='user')
    )

def rollback(migrator: Migrator, database: pw.Database, *, fake=False):
    """Remove the 'type' column."""
    migrator.remove_fields('milestone', 'type')