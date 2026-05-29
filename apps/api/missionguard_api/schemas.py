"""Pydantic schemas for request/response validation."""
import uuid
from typing import Any

from pydantic import BaseModel, Field


# ---- Gift ------------------------------------------------------------------

class GiftIntakeRequest(BaseModel):
    organization_id: uuid.UUID
    donor_name: str | None = None
    amount_usd: float | None = Field(None, ge=0)
    raw_offer_text: str | None = Field(None, max_length=50_000)


class GiftIntakeResponse(BaseModel):
    gift_id: uuid.UUID
    message: str


class GiftAnalysisResponse(BaseModel):
    gift_id: uuid.UUID
    extracted_terms: dict[str, Any]
    ethical_score: float
    markkula_score: float
    pmi_score: float
    recommendation: str          # "accept" | "pilot" | "reject"
    line_crossing_triggered: bool
    confidence_pct: float
    reasoning_trace: dict[str, Any]
    disclaimer: str = (
        "This is an AI-generated analysis to support human judgment, not replace it."
    )


# ---- Decision --------------------------------------------------------------

class HumanDecisionRequest(BaseModel):
    final_choice: str = Field(..., pattern="^(accept|pilot|reject)$")
    decided_by_user_id: str


class HumanDecisionResponse(BaseModel):
    decision_id: uuid.UUID
    final_choice: str
    audit_logged: bool


# ---- Policy ----------------------------------------------------------------

class PolicyGenerateRequest(BaseModel):
    organization_id: uuid.UUID
    risk_tolerance: str = Field("balanced", pattern="^(protective|balanced|growth)$")


class PolicyGenerateResponse(BaseModel):
    organization_id: uuid.UUID
    policy_markdown: str
    version: str = "1.0"
