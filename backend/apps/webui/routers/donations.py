from fastapi import APIRouter, HTTPException, status, Depends, Query
from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from peewee import fn

from utils.utils import get_current_user
from apps.webui.models.donations import Donations, Donation
from apps.webui.models.users import User

from decimal import Decimal, ROUND_DOWN
from pydantic import BaseModel, Field, validator
from typing import List, Optional

router = APIRouter()

# =========================
# Bulk split-donate (equal shares, rounded down)
# =========================

class BulkDonateIn(BaseModel):
    amount: float = Field(..., gt=0)
    child_ids: List[str] = Field(..., min_items=1)
    user_id: Optional[str] = None
    currency: Optional[str] = "HKD"
    payment_method: Optional[str] = None
    transaction_id: Optional[str] = None

    @validator("child_ids")
    def no_duplicates(cls, v):
        if len(v) != len(set(v)):
            raise ValueError("child_ids must not contain duplicates")
        return v

class DonationOut(BaseModel):  # reuse yours if already defined
    id: str
    user_id: Optional[str] = None
    user_name: Optional[str] = None
    child_id: Optional[str] = None
    child_name: Optional[str] = None
    region_id: Optional[str] = None
    region_name: Optional[str] = None
    amount: float
    currency: str
    donation_type: str
    is_anonymous: bool
    referral_code: Optional[str] = None
    transaction_id: Optional[str] = None
    payment_method: Optional[str] = None
    status: str
    created_at: Optional[str] = None

class BulkDonateOut(BaseModel):
    per_child_amount: float
    total_requested: float
    total_allocated: float
    remainder_unallocated: float
    donation_type: str
    donations: List[DonationOut]

# =========================
# Schemas
# =========================
class QuickDonationIn(BaseModel):
    amount: float = Field(..., gt=0)
    currency: Optional[str] = "HKD"
    payment_method: Optional[str] = None
    transaction_id: Optional[str] = None

class GuestDonationIn(BaseModel):
    child_id: str
    amount: float = Field(..., gt=0)
    currency: Optional[str] = "HKD"
    payment_method: Optional[str] = None
    transaction_id: Optional[str] = None

class StandardDonationIn(BaseModel):
    user_id: str
    child_id: str
    amount: float = Field(..., gt=0)
    currency: Optional[str] = "HKD"
    payment_method: Optional[str] = None
    transaction_id: Optional[str] = None
    referral_code: str = None

class DonationOut(BaseModel):
    id: str
    user_id: Optional[str] = None
    user_name: Optional[str] = None
    child_id: Optional[str] = None
    child_name: Optional[str] = None
    region_id: Optional[str] = None
    region_name: Optional[str] = None
    amount: float
    currency: str
    donation_type: str
    is_anonymous: bool
    referral_code: Optional[str] = None
    transaction_id: Optional[str] = None
    payment_method: Optional[str] = None
    status: str
    created_at: Optional[str] = None

class TopDonorOut(BaseModel):
    user_id: str
    user_name: Optional[str] = None
    total_amount: float
    donation_count: int

class TopSingleDonationOut(BaseModel):
    user_id: str
    user_name: Optional[str] = None
    max_amount: float

class ChildTotalsIn(BaseModel):
    child_ids: List[str]

class ChildTotalOut(BaseModel):
    child_id: str
    total_amount: float

class RecentDonorOut(BaseModel):
    user_id: str
    user_name: Optional[str] = None
    amount: float
    created_at: Optional[str] = None

# =========================
# Create Donations
# =========================

@router.post("/quick", response_model=DonationOut, status_code=status.HTTP_201_CREATED)
def create_quick_donation(body: QuickDonationIn):
    """Create a quick donation (amount only; anonymous)."""
    try:
        return Donations.create_donation(
            donation_type="Quick",
            user_id=None,
            child_id=None,
            amount=body.amount,
            currency=body.currency,
            payment_method=body.payment_method,
            transaction_id=body.transaction_id,
        )
    except Exception as e:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail=f"Quick donation failed: {e}")

@router.post("/anonymous", response_model=DonationOut, status_code=status.HTTP_201_CREATED)
def create_anonymous_donation(body: GuestDonationIn):
    """Create an anonymous (guest) donation for a child."""
    try:
        return Donations.create_donation(
            donation_type="Guest",
            user_id=None,
            child_id=body.child_id,
            amount=body.amount,
            currency=body.currency,
            payment_method=body.payment_method,
            transaction_id=body.transaction_id,
        )
    except Exception as e:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail=f"Anonymous donation failed: {e}")
    
@router.post("/standard", response_model=DonationOut, status_code=status.HTTP_201_CREATED)
def create_standard_donation(body: StandardDonationIn):
    """Create a standard donation (logged-in user -> child)."""
    try:
        return Donations.create_donation(
            donation_type="Standard",
            user_id=body.user_id,
            child_id=body.child_id,
            amount=body.amount,
            currency=body.currency,
            payment_method=body.payment_method,
            transaction_id=body.transaction_id,
        )
    except Exception as e:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail=f"Standard donation failed: {e}")

# =========================
# Reports / Analytics
# =========================

@router.get("/top/total", response_model=List[TopDonorOut])
def top_donors_total(k: int = Query(10, gt=0, le=100)):
    """
    Top K users by total donated (all children). Excludes NULL and '0000' sentinel.
    """
    q = (
        Donation
        .select(
            Donation.user_id,
            fn.SUM(Donation.amount).alias("total_amount"),
            fn.COUNT(Donation.id).alias("donation_count"),
        )
        .where(
            (Donation.status == "completed") &
            Donation.user.is_null(False) &
            (Donation.user_id != "0")
        )
        .group_by(Donation.user_id)
        .order_by(fn.SUM(Donation.amount).desc())
        .limit(k)
    )
    out: List[TopDonorOut] = []
    for row in q:
        user_name = None
        try:
            # row.user is a User model thanks to FK; it may be None if dangling
            user_name = row.user.name if row.user else None
        except Exception:
            pass
        out.append(
            TopDonorOut(
                user_id=row.user_id,
                user_name=user_name,
                total_amount=float(row.total_amount or 0),
                donation_count=int(row.donation_count or 0),
            )
        )
    return out

@router.get("/top/total/{child_id}", response_model=List[TopDonorOut])
def top_donors_total_for_child(child_id: str, k: int = Query(10, gt=0, le=100)):
    """
    Top K users by total donated to a specific child.
    """
    q = (
        Donation
        .select(
            Donation.user_id,
            fn.SUM(Donation.amount).alias("total_amount"),
            fn.COUNT(Donation.id).alias("donation_count"),
        )
        .where(
            (Donation.status == "completed") &
            (Donation.child_id == child_id) &
            Donation.user.is_null(False) &
            (Donation.user_id != "0000")
        )
        .group_by(Donation.user_id)
        .order_by(fn.SUM(Donation.amount).desc())
        .limit(k)
    )
    out: List[TopDonorOut] = []
    for row in q:
        user_name = None
        try:
            user_name = row.user.name if row.user else None
        except Exception:
            pass
        out.append(
            TopDonorOut(
                user_id=row.user_id,
                user_name=user_name,
                total_amount=float(row.total_amount or 0),
                donation_count=int(row.donation_count or 0),
            )
        )
    return out

@router.get("/top/single/{child_id}", response_model=List[TopSingleDonationOut])
def top_single_donations_for_child(child_id: str, k: int = Query(10, gt=0, le=100)):
    """
    Top K users by highest single donation to a specific child.
    """
    q = (
        Donation
        .select(
            Donation.user_id,
            fn.MAX(Donation.amount).alias("max_amount"),
        )
        .where(
            (Donation.status == "completed") &
            (Donation.child_id == child_id) &
            Donation.user.is_null(False) &
            (Donation.user_id != "0000")
        )
        .group_by(Donation.user_id)
        .order_by(fn.MAX(Donation.amount).desc())
        .limit(k)
    )
    out: List[TopSingleDonationOut] = []
    for row in q:
        user_name = None
        try:
            user_name = row.user.name if row.user else None
        except Exception:
            pass
        out.append(
            TopSingleDonationOut(
                user_id=row.user_id,
                user_name=user_name,
                max_amount=float(row.max_amount or 0),
            )
        )
    return out

@router.post("/total/by-children", response_model=List[ChildTotalOut])
def total_amount_by_children(body: ChildTotalsIn):
    """
    Total donated amount per child for a given list of child_ids.
    Returns zeros for ids with no donations.
    """
    if not body.child_ids:
        return []
    agg = (
        Donation
        .select(
            Donation.child_id,
            fn.SUM(Donation.amount).alias("total_amount"),
        )
        .where(
            (Donation.status == "completed") &
            (Donation.child_id.in_(body.child_ids))
        )
        .group_by(Donation.child_id)
    )
    totals_map: Dict[str, float] = {cid: 0.0 for cid in body.child_ids}
    for row in agg:
        totals_map[row.child_id] = float(row.total_amount or 0)
    return [ChildTotalOut(child_id=cid, total_amount=totals_map[cid]) for cid in body.child_ids]

@router.get("/recent-donors/{child_id}", response_model=List[RecentDonorOut])
def recent_donors_by_child(child_id: str, k: int = Query(10, gt=0, le=100)):
    """
    Return up to K most recent **unique** donors (excluding NULL and '0000') for a child.
    De-dupes by user_id using recent donations first.
    """
    rows = (
        Donation
        .select()
        .where(
            (Donation.status == "completed") &
            (Donation.child_id == child_id) &
            Donation.user.is_null(False) &
            (Donation.user_id != "0000")
        )
        .order_by(Donation.created_at.desc())
        .limit(200)  # fetch extra to allow de-dupe
    )
    seen = set()
    out: List[RecentDonorOut] = []
    for d in rows:
        if d.user_id in seen:
            continue
        seen.add(d.user_id)
        out.append(
            RecentDonorOut(
                user_id=d.user_id,
                user_name=(d.user.name if d.user else None),
                amount=float(d.amount),
                created_at=d.created_at.isoformat() if d.created_at else None,
            )
        )
        if len(out) >= k:
            break
    return out

@router.post("/bulk/split", response_model=BulkDonateOut, status_code=status.HTTP_201_CREATED)
def donate_to_all(body: BulkDonateIn):
    """
    Split `amount` equally across `child_ids`, each share rounded DOWN to 2dp.
    If `user_id` is provided -> Standard donations; otherwise Guest (anonymous).
    Any leftover remainder (from rounding down) is returned as unallocated.
    """
    try:
        amount = Decimal(str(body.amount))
        n = len(body.child_ids)

        # per-child amount rounded DOWN to 2dp
        raw_share = amount / Decimal(n)
        per = raw_share.quantize(Decimal("0.01"), rounding=ROUND_DOWN)

        if per <= Decimal("0.00"):
            raise HTTPException(status.HTTP_400_BAD_REQUEST, detail="per-child amount is 0.00 after rounding; increase amount")

        total_allocated = per * Decimal(n)
        remainder = (amount - total_allocated).max(Decimal("0.00"))

        donation_type = "Standard" if body.user_id else "Guest"

        created: List[DonationOut] = []
        for cid in body.child_ids:
            d = Donations.create_donation(
                donation_type=donation_type,
                user_id=body.user_id,            # None => Guest path in your model
                child_id=cid,
                amount=float(per),               # model converts to Decimal internally
                currency=body.currency,
                payment_method=body.payment_method,
                transaction_id=body.transaction_id,
            )
            created.append(DonationOut(**d))

        return BulkDonateOut(
            per_child_amount=float(per),
            total_requested=float(amount),
            total_allocated=float(total_allocated),
            remainder_unallocated=float(remainder),
            donation_type=donation_type,
            donations=created,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail=f"Bulk split donation failed: {e}")