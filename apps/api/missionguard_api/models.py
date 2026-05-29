"""SQLAlchemy models: Gift, Decision, AuditLog, Organization."""
import uuid
from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, String, Text, Uuid, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from missionguard_api.core.database import Base


class Organization(Base):
    __tablename__ = "organizations"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    sector: Mapped[str | None] = mapped_column(String(100))
    annual_revenue_usd: Mapped[float | None] = mapped_column(Float)
    # Ethical-score weight override (0.0–1.0 for Markkula portion; PMI = 1 - value)
    markkula_weight: Mapped[float] = mapped_column(Float, default=0.60)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    gifts: Mapped[list["Gift"]] = relationship(back_populates="organization")


class Gift(Base):
    __tablename__ = "gifts"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("organizations.id"), nullable=False)
    donor_name: Mapped[str | None] = mapped_column(String(255))
    amount_usd: Mapped[float | None] = mapped_column(Float)
    raw_offer_text: Mapped[str | None] = mapped_column(Text)
    file_storage_path: Mapped[str | None] = mapped_column(String(512))
    # Extracted JSON from NLP (stored as text; cast to JSONB in Postgres migration)
    extracted_terms_json: Mapped[str | None] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(50), default="pending")  # pending | analyzed | decided
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    organization: Mapped["Organization"] = relationship(back_populates="gifts")
    decisions: Mapped[list["Decision"]] = relationship(back_populates="gift")


class Decision(Base):
    __tablename__ = "decisions"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    gift_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("gifts.id"), nullable=False)
    # Fused ethical score 0–100
    ethical_score: Mapped[float | None] = mapped_column(Float)
    markkula_score: Mapped[float | None] = mapped_column(Float)
    pmi_score: Mapped[float | None] = mapped_column(Float)
    recommendation: Mapped[str | None] = mapped_column(String(50))  # accept | pilot | reject
    line_crossing_triggered: Mapped[bool] = mapped_column(default=False)
    # Full 5-step Markkula trace + PMI rationale (JSON)
    reasoning_trace_json: Mapped[str | None] = mapped_column(Text)
    confidence_pct: Mapped[float | None] = mapped_column(Float)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    decided_by_user_id: Mapped[str | None] = mapped_column(String(255))
    final_human_choice: Mapped[str | None] = mapped_column(String(50))

    gift: Mapped["Gift"] = relationship(back_populates="decisions")
    audit_logs: Mapped[list["AuditLog"]] = relationship(back_populates="decision")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    decision_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("decisions.id"), nullable=False)
    event: Mapped[str] = mapped_column(String(100))  # e.g. "recommendation_generated", "human_override"
    actor: Mapped[str | None] = mapped_column(String(255))
    detail_json: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    decision: Mapped["Decision"] = relationship(back_populates="audit_logs")
