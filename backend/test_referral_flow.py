#!/usr/bin/env python3
"""
Test script to verify referral flow is working correctly
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from apps.webui.models.users import Users
from apps.webui.models.donations import Donations
from apps.webui.models.referrals import Referrals, ReferralTracking
from apps.webui.internal.db import DB
import uuid

def test_referral_flow():
    print("Testing Referral Flow...")
    print("=" * 50)
    
    # Step 1: Get or create test users
    print("\n1. Setting up test users...")
    
    # Get existing users or use test data
    all_users = Users.get_users()
    
    if len(all_users) >= 2:
        referrer = all_users[0]
        donor = all_users[1] if len(all_users) > 1 else None
        print(f"   Using existing users:")
        print(f"   - Referrer: {referrer.name} (Code: {referrer.referral_code})")
        if donor:
            print(f"   - Donor: {donor.name}")
    else:
        print("   Not enough users in database. Please create at least one user first.")
        return
    
    # Step 2: Show referrer's referral code
    referrer_code = referrer.referral_code
    print(f"\n2. Referrer's code: {referrer_code}")
    
    # Step 3: Check current referral tracking count
    print("\n3. Current referral tracking records:")
    current_count = ReferralTracking.select().count()
    print(f"   Total records: {current_count}")
    
    # Step 4: Simulate a donation with referral code
    print(f"\n4. Creating test donation with referral code '{referrer_code}'...")
    
    try:
        # Create a guest donation with referral code
        donation_result = Donations.create_donation(
            donation_type="Guest",
            user_id=None,  # Guest donation
            child_id=None,  # Will be set to None for quick donation
            amount=100.00,
            currency="HKD",
            referral_code=referrer_code,
            transaction_id=f"TEST_{uuid.uuid4().hex[:8]}",
            payment_method="test"
        )
        print(f"   ✓ Donation created: ID={donation_result['id']}, Amount={donation_result['amount']}")
        print(f"   ✓ Referral code attached: {donation_result.get('referral_code')}")
    except Exception as e:
        print(f"   ✗ Error creating donation: {e}")
        import traceback
        traceback.print_exc()
        return
    
    # Step 5: Check if referral tracking was created
    print("\n5. Checking referral tracking...")
    new_count = ReferralTracking.select().count()
    print(f"   Total records now: {new_count}")
    
    if new_count > current_count:
        print(f"   ✓ New referral tracking record created!")
        
        # Get the latest tracking record
        latest_tracking = ReferralTracking.select().order_by(
            ReferralTracking.created_at.desc()
        ).first()
        
        if latest_tracking:
            print(f"   - Referrer ID: {latest_tracking.referrer_id}")
            print(f"   - Total donations: {latest_tracking.total_donations}")
            print(f"   - Status: {latest_tracking.status}")
    else:
        print(f"   ✗ No new referral tracking record created")
    
    # Step 6: Test leaderboard
    print("\n6. Testing leaderboard...")
    try:
        leaderboard = Referrals.get_referral_leaderboard(period="all_time", limit=10)
        if leaderboard:
            print(f"   ✓ Leaderboard has {len(leaderboard)} entries")
            for idx, entry in enumerate(leaderboard[:3], 1):
                print(f"   #{idx}: {entry['user']['name']} - {entry['total_donations']} HKD ({entry['referral_count']} referrals)")
        else:
            print("   - Leaderboard is empty")
    except Exception as e:
        print(f"   ✗ Error fetching leaderboard: {e}")
    
    # Step 7: Check user's referral stats
    print(f"\n7. Checking {referrer.name}'s referral stats...")
    try:
        stats = Referrals.get_user_referral_stats(referrer.id)
        print(f"   - Total referral donations: {stats['as_referrer']['total_referral_donations']}")
        print(f"   - Registered referrals: {stats['as_referrer']['registered_count']}")
        print(f"   - Donated referrals: {stats['as_referrer']['donated_count']}")
    except Exception as e:
        print(f"   ✗ Error fetching stats: {e}")
    
    print("\n" + "=" * 50)
    print("Test complete!")

if __name__ == "__main__":
    test_referral_flow()