"""Peewee migrations -- 003_fix_comments_field.py.

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
    
    migrator.add_index('region', 'id', unique=True)

    migrator.add_index('child', 'id', unique=True)

    migrator.add_index('donation', 'id', unique=True)

    migrator.add_index('donationsummary', 'id', unique=True)

    migrator.add_index('follower', 'id', unique=True)

    migrator.add_index('leaderboardentry', 'id', unique=True)

    migrator.add_index('milestone', 'id', unique=True)

    migrator.add_fields(
        'post',

        caption=pw.TextField(null=True),
        comments=pw.TextField(default='', null=True),
        likes=pw.IntegerField(default=0))

    migrator.remove_fields('post', 'content', 'likes_count')

    migrator.add_index('post', 'id', unique=True)

    migrator.add_index('postcomment', 'id', unique=True)

    migrator.add_index('postlike', 'id', unique=True)

    migrator.add_index('referraltracking', 'id', unique=True)

    migrator.add_index('referralreward', 'id', unique=True)

    migrator.add_index('video', 'id', unique=True)

    migrator.add_index('videoview', 'id', unique=True)


def rollback(migrator: Migrator, database: pw.Database, *, fake=False):
    """Write your rollback migrations here."""
    
    migrator.drop_index('videoview', 'id')

    migrator.drop_index('video', 'id')

    migrator.drop_index('referralreward', 'id')

    migrator.drop_index('referraltracking', 'id')

    migrator.drop_index('postlike', 'id')

    migrator.drop_index('postcomment', 'id')

    migrator.add_fields(
        'post',

        content=pw.TextField(),
        likes_count=pw.IntegerField(default=0))

    migrator.remove_fields('post', 'caption', 'comments', 'likes')

    migrator.drop_index('post', 'id')

    migrator.drop_index('milestone', 'id')

    migrator.drop_index('leaderboardentry', 'id')

    migrator.drop_index('follower', 'id')

    migrator.drop_index('donationsummary', 'id')

    migrator.drop_index('donation', 'id')

    migrator.drop_index('child', 'id')

    migrator.drop_index('region', 'id')
