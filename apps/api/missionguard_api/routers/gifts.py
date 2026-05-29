"""Gift intake, NLP extraction, and ethical scoring router (FR-01 → FR-04)."""
import json
import uuid
from functools import lru_cache

from fastapi import APIRouter, Depends, HTTPException, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from missionguard_api.core.database import get_db
from missionguard_api.core.security import get_current_user
from missionguard_api.models import AuditLog, Decision, Gift
from missionguard_api.schemas import (
    GiftAnalysisResponse,
    GiftIntakeRequest,
    GiftIntakeResponse,
    HumanDecisionRequest,
    HumanDecisionResponse,
)
from missionguard_ai.scoring_engine import ScoringEngine

router = APIRouter()


@lru_cache(maxsize=1)
def get_scoring_engine() -> ScoringEngine:
    """Lazily construct the ScoringEngine singleton (avoids import-time API key check)."""
    from missionguard_api.core.config import settings as _settings
    return ScoringEngine(
        model=_settings.AI_MODEL,
        temperature=_settings.AI_TEMPERATURE,
        api_key=_settings.ANTHROPIC_API_KEY or None,
    )


# ---------------------------------------------------------------------------
# FR-01: Gift Intake
# ---------------------------------------------------------------------------

@router.post("", response_model=GiftIntakeResponse, status_code=status.HTTP_201_CREATED)
async def intake_gift(
    body: GiftIntakeRequest,
    db: AsyncSession = Depends(get_db),
    _user: dict = Depends(get_current_user),
):
    """Persist a new donor offer and return the gift ID for async analysis."""
    gift = Gift(
        organization_id=body.organization_id,
        donor_name=body.donor_name,
        amount_usd=body.amount_usd,
        raw_offer_text=body.raw_offer_text,
        status="pending",
    )
    db.add(gift)
    await db.commit()
    await db.refresh(gift)
    return GiftIntakeResponse(gift_id=gift.id, message="Gift received. Trigger /analyze to score.")


@router.post("/{gift_id}/upload")
async def upload_gift_document(
    gift_id: uuid.UUID,
    file: UploadFile,
    db: AsyncSession = Depends(get_db),
    _user: dict = Depends(get_current_user),
):
    """Accept a PDF/text donor offer document and store the extracted text (FR-01)."""
    if file.content_type not in {"application/pdf", "text/plain"}:
        raise HTTPException(status_code=415, detail="Only PDF or plain text files accepted.")
    content = await file.read()
    # In production: upload to Supabase Storage and parse with Unstructured.io
    # For MVP: treat uploaded text/bytes as raw offer text
    raw_text = content.decode("utf-8", errors="replace") if file.content_type == "text/plain" else f"[PDF: {file.filename}]"
    result = await db.execute(select(Gift).where(Gift.id == gift_id))
    gift = result.scalar_one_or_none()
    if gift is None:
        raise HTTPException(status_code=404, detail="Gift not found.")
    gift.raw_offer_text = raw_text
    await db.commit()
    return {"gift_id": gift_id, "message": "Document stored. Ready for /analyze."}


# ---------------------------------------------------------------------------
# FR-02 → FR-04: Ethical Scoring + Option Generation
# ---------------------------------------------------------------------------

@router.post("/{gift_id}/analyze", response_model=GiftAnalysisResponse)
async def analyze_gift(
    gift_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _user: dict = Depends(get_current_user),
    engine: ScoringEngine = Depends(get_scoring_engine),
):
    """
    Run the full ethical scoring pipeline on the donor offer:
    1. NLP extraction (FR-01)
    2. Markkula 5-lens scoring (FR-02)
    3. PMI 4-value scoring (FR-02)
    4. Fused ethical score + line-crossing check (FR-02a)
    5. Option generation with recommendation (FR-04)
    """
    result = await db.execute(select(Gift).where(Gift.id == gift_id))
    gift = result.scalar_one_or_none()
    if gift is None:
        raise HTTPException(status_code=404, detail="Gift not found.")
    if not gift.raw_offer_text:
        raise HTTPException(status_code=422, detail="No offer text available. Upload a document first.")

    report = await engine.score(gift.raw_offer_text)

    # Persist decision record
    decision = Decision(
        gift_id=gift.id,
        ethical_score=report.ethical_score,
        markkula_score=report.markkula_score,
        pmi_score=report.pmi_score,
        recommendation=report.recommendation,
        line_crossing_triggered=report.line_crossing_triggered,
        reasoning_trace_json=json.dumps(report.reasoning_trace),
        confidence_pct=report.confidence_pct,
    )
    db.add(decision)
    gift.extracted_terms_json = json.dumps(report.extracted_terms)
    gift.status = "analyzed"
    await db.commit()
    await db.refresh(decision)

    # Audit log
    log = AuditLog(
        decision_id=decision.id,
        event="recommendation_generated",
        detail_json=json.dumps({"recommendation": report.recommendation, "score": report.ethical_score}),
    )
    db.add(log)
    await db.commit()

    return GiftAnalysisResponse(
        gift_id=gift.id,
        extracted_terms=report.extracted_terms,
        ethical_score=report.ethical_score,
        markkula_score=report.markkula_score,
        pmi_score=report.pmi_score,
        recommendation=report.recommendation,
        line_crossing_triggered=report.line_crossing_triggered,
        confidence_pct=report.confidence_pct,
        reasoning_trace=report.reasoning_trace,
    )


# ---------------------------------------------------------------------------
# Human decision override (FR-10 Audit Trail)
# ---------------------------------------------------------------------------

@router.post("/{gift_id}/decide", response_model=HumanDecisionResponse)
async def record_human_decision(
    gift_id: uuid.UUID,
    body: HumanDecisionRequest,
    db: AsyncSession = Depends(get_db),
    _user: dict = Depends(get_current_user),
):
    """Record the human's final choice and append to audit trail (FR-10)."""
    result = await db.execute(
        select(Decision).where(Decision.gift_id == gift_id).order_by(Decision.created_at.desc())
    )
    decision = result.scalars().first()
    if decision is None:
        raise HTTPException(status_code=404, detail="No analysis found for this gift. Run /analyze first.")

    decision.final_human_choice = body.final_choice
    decision.decided_by_user_id = body.decided_by_user_id

    log = AuditLog(
        decision_id=decision.id,
        event="human_decision_recorded",
        actor=body.decided_by_user_id,
        detail_json=json.dumps({"final_choice": body.final_choice}),
    )
    db.add(log)
    await db.commit()

    return HumanDecisionResponse(
        decision_id=decision.id,
        final_choice=body.final_choice,
        audit_logged=True,
    )
