"""Peewee migrations -- 001_initial_migration.py.

Some examples (model - class or model name)::

    > Model = migrator.orm['table_name']            # Return model in current state by name
    > Model = migrator.ModelClass                   # Return model in current state by name

    > migrator.sql(sql)                             # Run custom SQL
    > migrator.run(func, *args, **kwargs)           # Run python function with the given args
    > migrator.create_model(Model)                  # Create a model (could be used as decorator)
    > migrator.remove_model(model, cascade=True)    # Remove a model
    > migrator.add_fields(model, **fields)          # Add fields to a model
    > migrator.change_fields(model, **fields)       # Change fields
    > migrator.remove_fields(model, *field_names, cascade=True)
    > migrator.rename_field(model, old_field_name, new_field_name)
    > migrator.rename_table(model, new_table_name)
    > migrator.add_index(model, *col_names, unique=False)
    > migrator.add_not_null(model, *field_names)
    > migrator.add_default(model, field_name, default)
    > migrator.add_constraint(model, name, sql)
    > migrator.drop_index(model, *col_names)
    > migrator.drop_not_null(model, *field_names)
    > migrator.drop_constraints(model, *constraints)

"""

from contextlib import suppress

import peewee as pw
from peewee_migrate import Migrator


with suppress(ImportError):
    import playhouse.postgres_ext as pw_pext


def migrate(migrator: Migrator, database: pw.Database, *, fake=False):
    """Write your migrations here."""
    
    @migrator.create_model
    class Auth(pw.Model):
        id = pw.CharField(max_length=255, unique=True)
        email = pw.CharField(max_length=255)
        password = pw.TextField()
        active = pw.BooleanField()

        class Meta:
            table_name = "auth"

    @migrator.create_model
    class File(pw.Model):
        id = pw.CharField(max_length=255, unique=True)
        user_id = pw.CharField(max_length=255)
        filename = pw.TextField()
        meta = pw.TextField()
        created_at = pw.BigIntegerField()
        file_type = pw.CharField(default='default', max_length=255)

        class Meta:
            table_name = "file"

    @migrator.create_model
    class User(pw.Model):
        id = pw.CharField(max_length=255, unique=True)
        name = pw.CharField(max_length=255)
        email = pw.CharField(max_length=255)
        role = pw.CharField(max_length=255)
        profile_image_url = pw.TextField()
        last_active_at = pw.BigIntegerField()
        updated_at = pw.BigIntegerField()
        created_at = pw.BigIntegerField()
        api_key = pw.CharField(max_length=255, null=True, unique=True)
        settings = pw.TextField(null=True)
        info = pw.TextField(null=True)
        oauth_sub = pw.TextField(null=True, unique=True)

        class Meta:
            table_name = "user"


def rollback(migrator: Migrator, database: pw.Database, *, fake=False):
    """Write your rollback migrations here."""
    
    migrator.remove_model('user')

    migrator.remove_model('file')

    migrator.remove_model('auth')
