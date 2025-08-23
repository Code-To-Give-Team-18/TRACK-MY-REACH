from fastapi import APIRouter, Depends, HTTPException, status, Query, Body
from typing import List, Optional
from pydantic import BaseModel

from apps.webui.models.donations import Donations
from utils.utils import get_current_user

router = APIRouter()


############################
# Pydantic Schemas
############################
class QuickDonationRequest(BaseModel):
    amount: float


class AnonymousDonationRequest(BaseModel):
    child_id: str
    amount: float


class StandardDonationRequest(BaseModel):
    user_id: str
    child_id: str
    amount: float
    referral_code: Optional[str] = None
    payment_method: Optional[str] = None


class TotalDonationResponse(BaseModel):
    child_id: str
    total_amount: float


############################
# Create Quick Donation
############################
@router.post("/quick", status_code=status.HTTP_201_CREATED)
def create_quick_donation(body: QuickDonationRequest):
    try:
        donation = Donations.create_donation(
            amount=body.amount,
            donation_type="Quick",
        )
        return donation
    except Exception as e:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail=f"Quick donation failed: {str(e)}")


############################
# Create Anonymous Donation
############################
@router.post("/anonymous", status_code=status.HTTP_201_CREATED)
def create_anonymous_donation(body: AnonymousDonationRequest):
    try:
        donation = Donations.create_donation(
            child_id=body.child_id,
            amount=body.amount,
            donation_type="Guest",
        )
        return donation
    except Exception as e:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail=f"Anonymous donation failed: {str(e)}")


############################
# Create Standard Donation
############################
@router.post("/standard", status_code=status.HTTP_201_CREATED)
def create_standard_donation(body: StandardDonationRequest, user=Depends(get_current_user)):
    try:
        if user.id != body.user_id and user.role != "admin":
            raise HTTPException(status.HTTP_403_FORBIDDEN, detail="Not authorized to donate for this user")

        donation = Donations.create_donation(
            user_id=body.user_id,
            child_id=body.child_id,
            amount=body.amount,
            referral_code=body.referral_code,
            payment_method=body.payment_method,
            donation_type="Standard",
        )
        return donation
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail=f"Standard donation failed: {str(e)}")


############################
# Get Top Donors (overall)
############################
@router.get("/top", status_code=status.HTTP_200_OK)
def get_top_donors(limit: int = Query(10, gt=0, le=50)):
    try:
        return Donations.get_top_donors(limit=limit)
    except Exception as e:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail=f"Error fetching top donors: {str(e)}")


############################
# Get Top Donors by Child (total donation)
############################
@router.get("/top/{child_id}", status_code=status.HTTP_200_OK)
def get_top_donors_by_child(child_id: str, limit: int = Query(10, gt=0, le=50)):
    try:
        donations = Donations.get_donations_by_child(child_id)
        if not donations:
            return []
        # Aggregate totals by user
        totals = {}
        for d in donations:
            uid = d["user_id"]
            totals[uid] = totals.get(uid, 0) + d["amount"]
        ranked = sorted(totals.items(), key=lambda x: x[1], reverse=True)[:limit]
        return [{"user_id": uid, "total_amount": amt} for uid, amt in ranked]
    except Exception as e:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail=f"Error fetching top donors for child: {str(e)}")


############################
# Get Top Single Donors by Child
############################
@router.get("/top_single/{child_id}", status_code=status.HTTP_200_OK)
def get_top_single_donors_by_child(child_id: str, limit: int = Query(10, gt=0, le=50)):
    try:
        donations = Donations.get_donations_by_child(child_id)
        if not donations:
            return []
        ranked = sorted(donations, key=lambda d: d["amount"], reverse=True)[:limit]
        return ranked
    except Exception as e:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail=f"Error fetching top single donations: {str(e)}")


############################
# Get Total Donation for List of Children
############################
@router.post("/total_by_children", response_model=List[TotalDonationResponse])
def get_total_donations_for_children(child_ids: List[str] = Body(...)):
    try:
        results = []
        for cid in child_ids:
            stats = Donations.get_donation_stats(child_id=cid)
            results.append(TotalDonationResponse(child_id=cid, total_amount=stats["total_amount"]))
        return results
    except Exception as e:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail=f"Error calculating totals: {str(e)}")


############################
# Get Recent Donors by Child
############################
@router.get("/recent/{child_id}", status_code=status.HTTP_200_OK)
def get_recent_donors_by_child(child_id: str, limit: int = Query(10, gt=0, le=50)):
    try:
        donations = Donations.get_donations_by_child(child_id)[:limit]
        return donations
    except Exception as e:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail=f"Error fetching recent donors: {str(e)}")
