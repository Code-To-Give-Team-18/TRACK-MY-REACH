# apps/webui/internal/migrations/006_donation_rebuild_nullable_user.py
from playhouse.migrate import *
import peewee as pw
from peewee_migrate import Migrator

def migrate(migrator: Migrator, database: pw.Database, *, fake: bool = False):
    is_sqlite = isinstance(database, pw.SqliteDatabase)

    if is_sqlite:
        database.execute_sql("PRAGMA foreign_keys=OFF;")
        database.execute_sql("""
            CREATE TABLE donation_new (
                id TEXT PRIMARY KEY,
                user_id TEXT NULL,
                child_id TEXT NULL,
                region_id TEXT NULL,
                amount NUMERIC NOT NULL,
                currency TEXT DEFAULT 'HKD',
                donation_type TEXT DEFAULT 'Standard',
                is_anonymous INTEGER DEFAULT 0,
                referral_code TEXT NULL,
                transaction_id TEXT NULL,
                payment_method TEXT NULL,
                status TEXT DEFAULT 'completed',
                created_at DATETIME
            );
        """)
        database.execute_sql("""
            INSERT INTO donation_new (
                id, user_id, child_id, region_id, amount, currency,
                donation_type, is_anonymous, referral_code, transaction_id,
                payment_method, status, created_at
            )
            SELECT
                id,
                user_id,
                child_id,
                region_id,
                amount,
                COALESCE(currency, 'HKD'),
                CASE
                    WHEN donation_type IN ('Quick','Guest','Standard') THEN donation_type
                    ELSE 'Standard'
                END,
                COALESCE(is_anonymous, 0),
                referral_code,
                transaction_id,
                payment_method,
                COALESCE(status, 'completed'),
                created_at
            FROM donation;
        """)
        database.execute_sql("DROP TABLE donation;")
        database.execute_sql("ALTER TABLE donation_new RENAME TO donation;")
        database.execute_sql("PRAGMA foreign_keys=ON;")
    else:
        try:
            migrator.remove_fields('donation', 'message')
        except Exception:
            pass
        try:
            migrator.drop_not_null('donation', 'user_id')
        except Exception:
            pass

def rollback(migrator: Migrator, database: pw.Database, *, fake: bool = False):
    # Minimal rollback: re-add message if needed; we don’t force NOT NULL back on user_id
    try:
        migrator.add_fields('donation', message=pw.TextField(null=True))
    except Exception:
        pass