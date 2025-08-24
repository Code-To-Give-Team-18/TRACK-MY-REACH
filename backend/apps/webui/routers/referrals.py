from fastapi import APIRouter, HTTPException, status, Depends, Query
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Literal
from datetime import datetime, timedelta

from utils.utils import get_current_user
from apps.webui.models.referrals import Referrals, ReferralTracking, ReferralReward
from apps.webui.models.users import Users, User
from apps.webui.models.donations import Donation
from peewee import fn

router = APIRouter()

# =========================
# Schemas
# =========================

class ReferralTier(BaseModel):
    tier: Literal["bronze", "silver", "gold", "platinum", "diamond"]
    name: str
    min_amount: float
    min_referrals: int
    badge_color: str
    perks: List[str]

class ReferralStats(BaseModel):
    user_id: str
    user_name: str
    profile_image_url: Optional[str] = None
    referral_code: str
    total_referrals: int
    active_referrals: int
    total_donations_amount: float
    tier: ReferralTier
    rank: Optional[int] = None
    badges: List[str]
    rewards: List[Dict]
    joined_date: Optional[str] = None

class LeaderboardEntry(BaseModel):
    rank: int
    user_id: str
    user_name: str
    profile_image_url: Optional[str] = None
    referral_code: str
    total_referrals: int
    total_donations: float
    tier: str
    tier_color: str
    badges: List[str]
    monthly_referrals: int
    is_rising: bool  # True if moved up in rankings

class WallOfFameEntry(BaseModel):
    user_id: str
    user_name: str
    profile_image_url: Optional[str] = None
    achievement: str
    achievement_date: str
    tier: str
    impact_message: str

class RewardClaim(BaseModel):
    reward_id: str
    claim_type: Literal["redeem", "activate"]

# =========================
# Tier System Configuration
# =========================

TIER_SYSTEM = {
    "bronze": ReferralTier(
        tier="bronze",
        name="Bronze Advocate",
        min_amount=1000,
        min_referrals=1,
        badge_color="#CD7F32",
        perks=[
            "Monthly impact report",
            "Thank you badge on profile",
            "Name on supporter wall"
        ]
    ),
    "silver": ReferralTier(
        tier="silver",
        name="Silver Champion",
        min_amount=5000,
        min_referrals=3,
        badge_color="#C0C0C0",
        perks=[
            "All Bronze perks",
            "Quarterly video updates from supported children",
            "Early access to impact stories",
            "Silver badge on leaderboard"
        ]
    ),
    "gold": ReferralTier(
        tier="gold",
        name="Gold Ambassador",
        min_amount=10000,
        min_referrals=5,
        badge_color="#FFD700",
        perks=[
            "All Silver perks",
            "Monthly video calls with program coordinators",
            "Behind-the-scenes content",
            "Gold badge and special mention in annual report",
            "Invite to exclusive virtual events"
        ]
    ),
    "platinum": ReferralTier(
        tier="platinum",
        name="Platinum Leader",
        min_amount=25000,
        min_referrals=10,
        badge_color="#E5E4E2",
        perks=[
            "All Gold perks",
            "1-on-1 virtual meet with beneficiary students",
            "Co-create impact initiatives",
            "VIP access to all events",
            "Personal impact coordinator"
        ]
    ),
    "diamond": ReferralTier(
        tier="diamond",
        name="Diamond Visionary",
        min_amount=50000,
        min_referrals=20,
        badge_color="#B9F2FF",
        perks=[
            "All Platinum perks",
            "Annual appreciation ceremony invitation",
            "Naming opportunity for programs",
            "Direct input on organizational strategy",
            "Legacy supporter status"
        ]
    )
}

def calculate_tier(total_amount: float, referral_count: int) -> ReferralTier:
    """Calculate user's tier based on donations and referral count"""
    for tier_key in ["diamond", "platinum", "gold", "silver", "bronze"]:
        tier = TIER_SYSTEM[tier_key]
        if total_amount >= tier.min_amount and referral_count >= tier.min_referrals:
            return tier
    return TIER_SYSTEM["bronze"]

# =========================
# Leaderboard Endpoints
# =========================

@router.get("/leaderboard", response_model=List[LeaderboardEntry])
def get_referral_leaderboard(
    period: Literal["all_time", "monthly", "weekly", "daily"] = Query("all_time"),
    limit: int = Query(20, ge=1, le=100)
):
    """Get the referral leaderboard with tier information"""
    try:
        # Get leaderboard data from referral model
        leaderboard_data = Referrals.get_referral_leaderboard(period=period, limit=limit)
        
        # Return empty list if no data
        if not leaderboard_data:
            return []
        
        entries = []
        for idx, entry in enumerate(leaderboard_data, 1):
            try:
                user_data = entry.get('user', {})
                if not user_data or not user_data.get('id'):
                    continue
                
                # Calculate tier
                tier = calculate_tier(
                    entry.get('total_donations', 0),
                    entry.get('referral_count', 0)
                )
                
                # Check if user is rising (simplified - would need historical data)
                is_rising = idx <= 3 and period == "monthly"
                
                # Get badges (could be expanded)
                badges = []
                if entry.get('referral_count', 0) >= 10:
                    badges.append("Super Referrer")
                if entry.get('total_donations', 0) >= 10000:
                    badges.append("Major Contributor")
                if idx == 1 and leaderboard_data:
                    badges.append("🏆 #1")
                
                # Get referral code safely
                user = Users.get_user_by_id(user_data['id'])
                referral_code = ""
                if user and hasattr(user, 'referral_code'):
                    referral_code = user.referral_code or ""
                
                entries.append(LeaderboardEntry(
                    rank=idx,
                    user_id=user_data['id'],
                    user_name=user_data.get('name', 'Anonymous'),
                    profile_image_url=user_data.get('profile_image_url'),
                    referral_code=referral_code,
                    total_referrals=entry.get('referral_count', 0),
                    total_donations=entry.get('total_donations', 0),
                    tier=tier.name,
                    tier_color=tier.badge_color,
                    badges=badges,
                    monthly_referrals=entry.get('donation_count', 0),
                    is_rising=is_rising
                ))
            except Exception as entry_error:
                print(f"Error processing leaderboard entry: {entry_error}")
                continue
        
        return entries
    except Exception as e:
        print(f"Error in get_referral_leaderboard: {e}")
        import traceback
        traceback.print_exc()
        # Return empty list instead of raising error
        return []

@router.get("/wall-of-fame", response_model=List[WallOfFameEntry])
def get_wall_of_fame(limit: int = Query(10, ge=1, le=50)):
    """Get the Wall of Fame - top achievers with special recognition"""
    try:
        # Get all-time leaderboard
        top_referrers = Referrals.get_referral_leaderboard(period="all_time", limit=limit)
        
        # Return empty list if no data
        if not top_referrers:
            return []
        
        wall_entries = []
        achievements = [
            "🏆 Top Referrer of All Time",
            "🥈 Elite Ambassador",
            "🥉 Distinguished Supporter",
            "⭐ Rising Star",
            "💎 Consistent Champion",
            "🌟 Impact Leader",
            "🎯 Goal Crusher",
            "🚀 Growth Driver",
            "❤️ Heart of Gold",
            "🌍 Community Builder"
        ]
        
        for idx, entry in enumerate(top_referrers):
            try:
                user_data = entry.get('user', {})
                if not user_data or not user_data.get('id'):
                    continue
                    
                tier = calculate_tier(
                    entry.get('total_donations', 0), 
                    entry.get('referral_count', 0)
                )
                
                # Create impact message based on donations
                total_donations = entry.get('total_donations', 0)
                referral_count = entry.get('referral_count', 0)
                meals_provided = int(total_donations / 30) if total_donations > 0 else 0
                school_kits = int(total_donations / 200) if total_donations > 0 else 0
                
                impact_message = f"Enabled {meals_provided:,} meals and {school_kits} school kits through {referral_count} successful referrals"
                
                wall_entries.append(WallOfFameEntry(
                    user_id=user_data['id'],
                    user_name=user_data.get('name', 'Anonymous'),
                    profile_image_url=user_data.get('profile_image_url'),
                    achievement=achievements[idx] if idx < len(achievements) else "🌟 Outstanding Supporter",
                    achievement_date=datetime.now().isoformat(),
                    tier=tier.name,
                    impact_message=impact_message
                ))
            except Exception as entry_error:
                print(f"Error processing wall entry: {entry_error}")
                continue
        
        return wall_entries
    except Exception as e:
        print(f"Error in get_wall_of_fame: {e}")
        import traceback
        traceback.print_exc()
        # Return empty list instead of raising error
        return []

# =========================
# Summary Statistics
# =========================

@router.get("/summary-stats")
def get_referral_summary_stats():
    """Get aggregate referral statistics for the dashboard"""
    try:
        from datetime import datetime, timedelta
        
        # Get total unique referrers (users who have made at least one referral)
        total_referrers = ReferralTracking.select(
            fn.COUNT(fn.DISTINCT(ReferralTracking.referrer))
        ).scalar() or 0
        
        # Get referrals this month
        start_of_month = datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        monthly_referrals = ReferralTracking.select().where(
            ReferralTracking.created_at >= start_of_month
        ).count()
        
        # Get total impact (sum of all referral donations)
        total_impact = ReferralTracking.select(
            fn.SUM(ReferralTracking.total_donations)
        ).scalar() or 0
        
        # Get top tier achieved (find highest tier among users)
        top_tier = "Bronze"  # Default
        if total_referrers > 0:
            # Get the user with highest donations
            top_referrer = ReferralTracking.select(
                ReferralTracking.referrer,
                fn.SUM(ReferralTracking.total_donations).alias('total_donations'),
                fn.COUNT(ReferralTracking.id).alias('referral_count')
            ).group_by(ReferralTracking.referrer).order_by(
                fn.SUM(ReferralTracking.total_donations).desc()
            ).first()
            
            if top_referrer:
                tier = calculate_tier(
                    float(top_referrer.total_donations or 0),
                    top_referrer.referral_count or 0
                )
                top_tier = tier.name.split()[0]  # Get just the tier name without "Advocate", etc.
        
        return {
            "total_referrers": total_referrers,
            "monthly_referrals": monthly_referrals,
            "total_impact": float(total_impact),
            "top_tier": top_tier
        }
    except Exception as e:
        print(f"Error in get_referral_summary_stats: {e}")
        import traceback
        traceback.print_exc()
        # Return default values on error
        return {
            "total_referrers": 0,
            "monthly_referrals": 0,
            "total_impact": 0,
            "top_tier": "Ready!"
        }

# =========================
# User Referral Stats
# =========================

@router.get("/stats/{user_id}", response_model=ReferralStats)
def get_user_referral_stats(user_id: str, user=Depends(get_current_user)):
    """Get detailed referral statistics for a user"""
    try:
        # Get user data
        user_data = Users.get_user_by_id(user_id)
        if not user_data:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Get referral stats
        stats = Referrals.get_user_referral_stats(user_id)
        
        # Calculate tier
        total_amount = stats['as_referrer']['total_referral_donations']
        total_referrals = stats['as_referrer']['donated_count']
        tier = calculate_tier(total_amount, total_referrals)
        
        # Get badges
        badges = []
        if total_referrals >= 1:
            badges.append("First Referral")
        if total_referrals >= 5:
            badges.append("Referral Pro")
        if total_referrals >= 10:
            badges.append("Super Referrer")
        if total_amount >= 10000:
            badges.append("Impact Maker")
        if total_amount >= 50000:
            badges.append("Visionary")
        
        # Get leaderboard rank
        leaderboard = Referrals.get_referral_leaderboard(period="all_time", limit=100)
        rank = None
        for idx, entry in enumerate(leaderboard, 1):
            if entry['user']['id'] == user_id:
                rank = idx
                break
        
        return ReferralStats(
            user_id=user_id,
            user_name=user_data.name,
            profile_image_url=user_data.profile_image_url,
            referral_code=user_data.referral_code or "",
            total_referrals=stats['as_referrer']['registered_count'],
            active_referrals=stats['as_referrer']['donated_count'],
            total_donations_amount=total_amount,
            tier=tier,
            rank=rank,
            badges=badges,
            rewards=stats['rewards']['rewards'],
            joined_date=user_data.created_at
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch user stats: {str(e)}"
        )

# =========================
# Rewards Management
# =========================

@router.get("/rewards/available/{user_id}")
def get_available_rewards(user_id: str, user=Depends(get_current_user)):
    """Get available rewards and perks for a user based on their tier"""
    try:
        # Get user stats to determine tier
        stats = Referrals.get_user_referral_stats(user_id)
        total_amount = stats['as_referrer']['total_referral_donations']
        total_referrals = stats['as_referrer']['donated_count']
        tier = calculate_tier(total_amount, total_referrals)
        
        # Get all rewards for user
        rewards = stats['rewards']['rewards']
        
        # Determine available perks based on tier
        available_perks = []
        for tier_key in ["bronze", "silver", "gold", "platinum", "diamond"]:
            if tier.tier in ["diamond", "platinum", "gold", "silver", "bronze"]:
                available_perks.extend(TIER_SYSTEM[tier_key].perks)
                if tier_key == tier.tier:
                    break
        
        return {
            "current_tier": tier.dict(),
            "available_perks": available_perks,
            "earned_rewards": rewards,
            "next_tier": get_next_tier_requirements(tier.tier, total_amount, total_referrals)
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch rewards: {str(e)}"
        )

@router.post("/rewards/claim")
def claim_reward(claim: RewardClaim, user=Depends(get_current_user)):
    """Claim or activate a reward"""
    try:
        # Here you would implement the actual reward claiming logic
        # For now, we'll return a success response
        return {
            "success": True,
            "message": f"Reward {claim.reward_id} has been {claim.claim_type}d",
            "reward_id": claim.reward_id
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to claim reward: {str(e)}"
        )

# =========================
# Helper Functions
# =========================

def get_next_tier_requirements(current_tier: str, current_amount: float, current_referrals: int) -> Optional[Dict]:
    """Calculate what's needed to reach the next tier"""
    tier_order = ["bronze", "silver", "gold", "platinum", "diamond"]
    
    if current_tier == "diamond":
        return None
    
    current_idx = tier_order.index(current_tier)
    next_tier = TIER_SYSTEM[tier_order[current_idx + 1]]
    
    return {
        "next_tier": next_tier.name,
        "amount_needed": max(0, next_tier.min_amount - current_amount),
        "referrals_needed": max(0, next_tier.min_referrals - current_referrals),
        "perks_to_unlock": next_tier.perks
    }

@router.get("/share-link/{user_id}")
def get_referral_share_link(user_id: str, user=Depends(get_current_user)):
    """Generate shareable referral links for social media"""
    try:
        user_data = Users.get_user_by_id(user_id)
        if not user_data:
            raise HTTPException(status_code=404, detail="User not found")
        
        base_url = "https://commit-to-kids.org"  # Would come from config
        referral_code = user_data.referral_code
        
        return {
            "referral_code": referral_code,
            "share_links": {
                "direct": f"{base_url}/donate?ref={referral_code}",
                "facebook": f"https://www.facebook.com/sharer/sharer.php?u={base_url}/donate?ref={referral_code}",
                "twitter": f"https://twitter.com/intent/tweet?url={base_url}/donate?ref={referral_code}&text=Help%20support%20children%20in%20need!",
                "whatsapp": f"https://wa.me/?text=Help%20support%20children%20in%20need!%20{base_url}/donate?ref={referral_code}",
                "email": f"mailto:?subject=Support%20Children%20in%20Need&body=Join%20me%20in%20supporting%20this%20cause:%20{base_url}/donate?ref={referral_code}"
            },
            "message_templates": {
                "short": f"Help children in need! Use my code: {referral_code}",
                "medium": f"I'm supporting Commit to Kids to help underprivileged children. Join me using referral code {referral_code} at checkout!",
                "long": f"I've been supporting Commit to Kids, an amazing organization helping underprivileged K3 students in Hong Kong. Every donation makes a real difference in these children's lives. Join me in making an impact - use my referral code {referral_code} when you donate!"
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate share links: {str(e)}"
        )