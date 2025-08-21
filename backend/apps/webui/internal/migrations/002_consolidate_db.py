"""Peewee migrations -- 002_consolidate_db.py.

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
    
    migrator.add_fields(
        'user',

        referral_code=pw.CharField(index=True, max_length=20, null=True),
        referral_count=pw.IntegerField(default=0, null=True),
        referred_by=pw.CharField(max_length=255, null=True),
        referral_donations_total=pw.DecimalField(auto_round=False, decimal_places=2, default=Decimal('0'), max_digits=15, null=True, rounding=ROUND_HALF_EVEN))

    @migrator.create_model
    class Region(pw.Model):
        id = pw.CharField(max_length=255, primary_key=True)
        name = pw.CharField(max_length=255, unique=True)
        total_donated = pw.DecimalField(auto_round=False, decimal_places=2, default=Decimal('0'), max_digits=15, rounding=ROUND_HALF_EVEN)
        created_at = pw.DateTimeField()
        updated_at = pw.DateTimeField()

        class Meta:
            table_name = "region"

    @migrator.create_model
    class Child(pw.Model):
        id = pw.CharField(max_length=255, primary_key=True)
        region = pw.ForeignKeyField(column_name='region_id', field='id', model=migrator.orm['region'], on_delete='CASCADE')
        name = pw.CharField(max_length=255)
        age = pw.IntegerField(null=True)
        school = pw.CharField(max_length=255, null=True)
        grade = pw.CharField(max_length=50, null=True)
        description = pw.TextField(null=True)
        bio = pw.TextField(null=True)
        video_link = pw.CharField(max_length=500, null=True)
        picture_link = pw.CharField(max_length=500, null=True)
        follower_count = pw.IntegerField(default=0)
        total_received = pw.DecimalField(auto_round=False, decimal_places=2, default=Decimal('0'), max_digits=15, rounding=ROUND_HALF_EVEN)
        is_active = pw.BooleanField(default=True)
        created_at = pw.DateTimeField()
        updated_at = pw.DateTimeField()

        class Meta:
            table_name = "child"

    @migrator.create_model
    class Donation(pw.Model):
        id = pw.CharField(max_length=255, primary_key=True)
        user = pw.ForeignKeyField(column_name='user_id', field='id', model=migrator.orm['user'], on_delete='CASCADE')
        child = pw.ForeignKeyField(column_name='child_id', field='id', model=migrator.orm['child'], null=True, on_delete='CASCADE')
        region = pw.ForeignKeyField(column_name='region_id', field='id', model=migrator.orm['region'], null=True, on_delete='CASCADE')
        amount = pw.DecimalField(auto_round=False, decimal_places=2, max_digits=15, rounding=ROUND_HALF_EVEN)
        currency = pw.CharField(default='HKD', max_length=3)
        donation_type = pw.CharField(default='child', max_length=50)
        is_anonymous = pw.BooleanField(default=False)
        message = pw.TextField(null=True)
        referral_code = pw.CharField(max_length=20, null=True)
        transaction_id = pw.CharField(max_length=255, null=True)
        payment_method = pw.CharField(max_length=50, null=True)
        status = pw.CharField(default='completed', max_length=50)
        created_at = pw.DateTimeField()

        class Meta:
            table_name = "donation"

    @migrator.create_model
    class DonationSummary(pw.Model):
        id = pw.CharField(max_length=255, primary_key=True)
        region = pw.ForeignKeyField(column_name='region_id', field='id', model=migrator.orm['region'], on_delete='CASCADE')
        period = pw.CharField(max_length=20)
        period_date = pw.DateField()
        total_amount = pw.DecimalField(auto_round=False, decimal_places=2, default=Decimal('0'), max_digits=15, rounding=ROUND_HALF_EVEN)
        donation_count = pw.IntegerField(default=0)
        unique_donors = pw.IntegerField(default=0)
        updated_at = pw.DateTimeField()

        class Meta:
            table_name = "donationsummary"
            indexes = [(('region', 'period', 'period_date'), True)]

    @migrator.create_model
    class Follower(pw.Model):
        id = pw.CharField(max_length=255, primary_key=True)
        user = pw.ForeignKeyField(column_name='user_id', field='id', model=migrator.orm['user'], on_delete='CASCADE')
        child = pw.ForeignKeyField(column_name='child_id', field='id', model=migrator.orm['child'], on_delete='CASCADE')
        followed_at = pw.DateTimeField()
        notifications_enabled = pw.BooleanField(default=True)

        class Meta:
            table_name = "follower"
            indexes = [(('user', 'child'), True)]

    @migrator.create_model
    class LeaderboardEntry(pw.Model):
        id = pw.CharField(max_length=255, primary_key=True)
        leaderboard_type = pw.CharField(max_length=50)
        period = pw.CharField(max_length=20)
        period_date = pw.DateField()
        entity_id = pw.CharField(max_length=255)
        entity_name = pw.CharField(max_length=255)
        entity_type = pw.CharField(max_length=50)
        total_amount = pw.DecimalField(auto_round=False, decimal_places=2, max_digits=15, rounding=ROUND_HALF_EVEN)
        donation_count = pw.IntegerField()
        rank = pw.IntegerField()
        rank_change = pw.IntegerField(default=0)
        avatar_url = pw.CharField(max_length=500, null=True)
        updated_at = pw.DateTimeField()

        class Meta:
            table_name = "leaderboardentry"
            indexes = [(('leaderboard_type', 'period', 'period_date', 'entity_id'), True)]

    @migrator.create_model
    class Milestone(pw.Model):
        id = pw.CharField(max_length=255, primary_key=True)
        name = pw.CharField(max_length=255, unique=True)
        amount = pw.DecimalField(auto_round=False, decimal_places=2, max_digits=15, rounding=ROUND_HALF_EVEN)
        description = pw.TextField(null=True)
        badge_icon = pw.CharField(max_length=255, null=True)
        badge_color = pw.CharField(max_length=50, null=True)
        order_rank = pw.IntegerField(default=0)
        is_active = pw.BooleanField(default=True)
        created_at = pw.DateTimeField()
        updated_at = pw.DateTimeField()

        class Meta:
            table_name = "milestone"

    @migrator.create_model
    class Post(pw.Model):
        id = pw.CharField(max_length=255, primary_key=True)
        child = pw.ForeignKeyField(column_name='child_id', field='id', model=migrator.orm['child'], on_delete='CASCADE')
        author = pw.ForeignKeyField(column_name='author_id', field='id', model=migrator.orm['user'], null=True, on_delete='SET NULL')
        title = pw.CharField(max_length=255)
        content = pw.TextField()
        post_type = pw.CharField(default='update', max_length=50)
        media_urls = pw.TextField(null=True)
        video_link = pw.CharField(max_length=500, null=True)
        likes_count = pw.IntegerField(default=0)
        comments_count = pw.IntegerField(default=0)
        is_published = pw.BooleanField(default=True)
        is_featured = pw.BooleanField(default=False)
        created_at = pw.DateTimeField()
        updated_at = pw.DateTimeField()

        class Meta:
            table_name = "post"

    @migrator.create_model
    class PostComment(pw.Model):
        id = pw.CharField(max_length=255, primary_key=True)
        post = pw.ForeignKeyField(column_name='post_id', field='id', model=migrator.orm['post'], on_delete='CASCADE')
        user = pw.ForeignKeyField(column_name='user_id', field='id', model=migrator.orm['user'], on_delete='CASCADE')
        content = pw.TextField()
        is_approved = pw.BooleanField(default=True)
        created_at = pw.DateTimeField()
        updated_at = pw.DateTimeField()

        class Meta:
            table_name = "postcomment"

    @migrator.create_model
    class PostLike(pw.Model):
        id = pw.CharField(max_length=255, primary_key=True)
        post = pw.ForeignKeyField(column_name='post_id', field='id', model=migrator.orm['post'], on_delete='CASCADE')
        user = pw.ForeignKeyField(column_name='user_id', field='id', model=migrator.orm['user'], on_delete='CASCADE')
        created_at = pw.DateTimeField()

        class Meta:
            table_name = "postlike"
            indexes = [(('post', 'user'), True)]

    @migrator.create_model
    class ReferralTracking(pw.Model):
        id = pw.CharField(max_length=255, primary_key=True)
        referrer = pw.ForeignKeyField(column_name='referrer_id', field='id', model=migrator.orm['user'], on_delete='CASCADE')
        referred_user = pw.ForeignKeyField(column_name='referred_user_id', field='id', model=migrator.orm['user'], null=True, on_delete='CASCADE')
        referral_code = pw.CharField(max_length=20)
        status = pw.CharField(default='pending', max_length=50)
        click_count = pw.IntegerField(default=0)
        first_clicked_at = pw.DateTimeField(null=True)
        registered_at = pw.DateTimeField(null=True)
        first_donation_at = pw.DateTimeField(null=True)
        total_donations = pw.DecimalField(auto_round=False, decimal_places=2, default=Decimal('0'), max_digits=15, rounding=ROUND_HALF_EVEN)
        donation_count = pw.IntegerField(default=0)
        referral_source = pw.CharField(max_length=100, null=True)
        created_at = pw.DateTimeField()
        updated_at = pw.DateTimeField()

        class Meta:
            table_name = "referraltracking"
            indexes = [(('referrer', 'referred_user'), True)]

    @migrator.create_model
    class ReferralReward(pw.Model):
        id = pw.CharField(max_length=255, primary_key=True)
        user = pw.ForeignKeyField(column_name='user_id', field='id', model=migrator.orm['user'], on_delete='CASCADE')
        referral_tracking = pw.ForeignKeyField(column_name='referral_tracking_id', field='id', model=migrator.orm['referraltracking'], on_delete='CASCADE')
        reward_type = pw.CharField(max_length=50)
        reward_value = pw.DecimalField(auto_round=False, decimal_places=2, max_digits=15, rounding=ROUND_HALF_EVEN)
        reward_description = pw.TextField(null=True)
        status = pw.CharField(default='pending', max_length=50)
        awarded_at = pw.DateTimeField(null=True)
        redeemed_at = pw.DateTimeField(null=True)
        expires_at = pw.DateTimeField(null=True)
        created_at = pw.DateTimeField()

        class Meta:
            table_name = "referralreward"

    @migrator.create_model
    class Video(pw.Model):
        id = pw.CharField(max_length=255, primary_key=True)
        child = pw.ForeignKeyField(column_name='child_id', field='id', model=migrator.orm['child'], on_delete='CASCADE')
        title = pw.CharField(max_length=255)
        description = pw.TextField(null=True)
        video_url = pw.CharField(max_length=500)
        thumbnail_url = pw.CharField(max_length=500, null=True)
        duration_seconds = pw.IntegerField(null=True)
        video_type = pw.CharField(default='update', max_length=50)
        views_count = pw.IntegerField(default=0)
        likes_count = pw.IntegerField(default=0)
        is_featured = pw.BooleanField(default=False)
        is_published = pw.BooleanField(default=True)
        uploaded_by = pw.CharField(max_length=255, null=True)
        created_at = pw.DateTimeField()
        updated_at = pw.DateTimeField()

        class Meta:
            table_name = "video"

    @migrator.create_model
    class VideoView(pw.Model):
        id = pw.CharField(max_length=255, primary_key=True)
        video = pw.ForeignKeyField(column_name='video_id', field='id', model=migrator.orm['video'], on_delete='CASCADE')
        user_id = pw.CharField(max_length=255, null=True)
        ip_address = pw.CharField(max_length=45, null=True)
        watched_duration = pw.IntegerField(default=0)
        completed = pw.BooleanField(default=False)
        created_at = pw.DateTimeField()

        class Meta:
            table_name = "videoview"


def rollback(migrator: Migrator, database: pw.Database, *, fake=False):
    """Write your rollback migrations here."""
    
    migrator.remove_fields('user', 'referral_code', 'referral_count', 'referred_by', 'referral_donations_total')

    migrator.remove_model('videoview')

    migrator.remove_model('video')

    migrator.remove_model('region')

    migrator.remove_model('referralreward')

    migrator.remove_model('referraltracking')

    migrator.remove_model('postlike')

    migrator.remove_model('postcomment')

    migrator.remove_model('post')

    migrator.remove_model('milestone')

    migrator.remove_model('leaderboardentry')

    migrator.remove_model('follower')

    migrator.remove_model('donationsummary')

    migrator.remove_model('donation')

    migrator.remove_model('child')
