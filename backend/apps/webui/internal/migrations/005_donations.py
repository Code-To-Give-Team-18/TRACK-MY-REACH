# apps/webui/internal/migrations/005_donations_restructure.py
from playhouse.migrate import *
import peewee as pw
from peewee_migrate import Migrator

def migrate(migrator: Migrator, database: pw.Database, *, fake: bool = False):
    # 1) Make user_id NULLable
    try:
        # SQLite path: drop NOT NULL
        if isinstance(migrator, SqliteMigrator):
            migrator.drop_not_null('donation', 'user_id')
        else:
            # Postgres/MySQL path
            migrator.sql('ALTER TABLE donation ALTER COLUMN user_id DROP NOT NULL')
    except Exception as e:
        print(f"[WARN] Could not make user_id nullable: {e}")

    # 2) Drop 'message' column if it exists
    try:
        # Works cross-db; SQLite will rebuild table behind the scenes
        migrator.drop_column('donation', 'message')
    except Exception as e:
        print(f"[WARN] Could not drop 'message': {e}")

    # 3) Donation type constraint
    # SQLite cannot add a table-level CHECK via ALTER TABLE. Enforce in app code.
    # For Postgres, we can add a constraint:
    try:
        if not isinstance(migrator, SqliteMigrator):
            migrator.sql(
                "ALTER TABLE donation "
                "ADD CONSTRAINT donation_type_check "
                "CHECK (donation_type IN ('Quick','Guest','Standard'))"
            )
        else:
            print("[INFO] Skipping CHECK constraint on SQLite; enforced at application layer.")
    except Exception as e:
        print(f"[WARN] Could not add donation_type CHECK constraint: {e}")

def rollback(migrator: Migrator, database: pw.Database, *, fake: bool = False):
    # 1) Re-add 'message' column (nullable)
    try:
        migrator.add_column('donation', 'message', pw.TextField(null=True))
    except Exception as e:
        print(f"[WARN] Could not re-add 'message': {e}")

    # 2) Drop donation_type check (non-SQLite only)
    try:
        if not isinstance(migrator, SqliteMigrator):
            migrator.sql("ALTER TABLE donation DROP CONSTRAINT donation_type_check")
        else:
            print("[INFO] No CHECK constraint to drop on SQLite.")
    except Exception as e:
        print(f"[WARN] Could not drop donation_type CHECK constraint: {e}")

    # Note: restoring NOT NULL on user_id is risky if NULLs exist; skipping here.
