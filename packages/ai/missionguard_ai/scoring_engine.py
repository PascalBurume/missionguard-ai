"""MissionGuard AI – Ethical Scoring Engine.

Implements the 5-step Markkula Framework + PMI Code of Ethics fusion scoring
as specified in MissionGuard_AI_Ethical_Framework_for_AI_Agents.md.

Fused score formula:  E = 0.6·M + 0.4·P
Line-Crossing rule:   if Justice lens ≤ −1 OR any lens ≤ −1.5 → cap E at 49
                      and force recommendation to 'pilot' or 'reject'.
"""
from __future__ import annotations

import json
from dataclasses import dataclass, field
from typing import Any

from langchain_anthropic import ChatAnthropic
from langchain_core.messages import HumanMessage, SystemMessage
from pydantic import BaseModel, Field

from missionguard_ai.prompts import SYSTEM_PROMPT, build_user_prompt


# ---------------------------------------------------------------------------
# Data structures
# ---------------------------------------------------------------------------

class LensScore(BaseModel):
    lens: str
    score: float = Field(..., ge=-2, le=2)
    rationale: str


class MarkkulaTrace(BaseModel):
    step1_ethical_issues: str
    step2_stakeholders: list[str]
    step3_lens_scores: list[LensScore]
    step4_recommendation: str
    step4_justification: str
    step4_sensitivity: str
    step5_next_steps: list[str]


class PMITrace(BaseModel):
    responsibility_score: float = Field(..., ge=0, le=100)
    respect_score: float = Field(..., ge=0, le=100)
    fairness_score: float = Field(..., ge=0, le=100)
    honesty_score: float = Field(..., ge=0, le=100)
    rationale: str


@dataclass
class ScoringReport:
    extracted_terms: dict[str, Any]
    markkula_score: float          # 0–100
    pmi_score: float               # 0–100
    ethical_score: float           # fused 0–100
    recommendation: str            # "accept" | "pilot" | "reject"
    line_crossing_triggered: bool
    confidence_pct: float
    reasoning_trace: dict[str, Any]


# ---------------------------------------------------------------------------
# Lens weights (Markkula)
# ---------------------------------------------------------------------------
LENS_WEIGHTS: dict[str, float] = {
    "rights": 0.20,
    "justice": 0.25,
    "consequences": 0.25,
    "common_good": 0.20,
    "care": 0.10,
}

# PMI value weights
PMI_WEIGHTS: dict[str, float] = {
    "responsibility": 0.30,
    "respect": 0.25,
    "fairness": 0.25,
    "honesty": 0.20,
}

MARKKULA_WEIGHT = 0.60
PMI_WEIGHT = 0.40

LINE_CROSSING_JUSTICE_THRESHOLD = -1.0
LINE_CROSSING_ANY_LENS_THRESHOLD = -1.5
LINE_CROSSING_SCORE_CAP = 49.0


# ---------------------------------------------------------------------------
# Scoring Engine
# ---------------------------------------------------------------------------

class ScoringEngine:
    """Orchestrates the full ethical scoring pipeline using LangChain + Claude."""

    def __init__(self, model: str = "claude-sonnet-4-5", temperature: float = 0.0, api_key: str | None = None):
        kwargs: dict = {"model": model, "temperature": temperature}
        if api_key:
            kwargs["api_key"] = api_key
        self._llm = ChatAnthropic(**kwargs)

    async def score(self, offer_text: str) -> ScoringReport:
        """Run the full pipeline on a donor offer text and return a ScoringReport."""
        raw_response = await self._call_llm(offer_text)
        return self._parse_response(raw_response)

    async def _call_llm(self, offer_text: str) -> dict[str, Any]:
        messages = [
            SystemMessage(content=SYSTEM_PROMPT),
            HumanMessage(content=build_user_prompt(offer_text)),
        ]
        response = await self._llm.ainvoke(messages)
        # The model is prompted to return structured JSON
        text = response.content if isinstance(response.content, str) else str(response.content)
        # Strip markdown fences if present
        if text.strip().startswith("```"):
            text = text.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
        try:
            return json.loads(text)
        except json.JSONDecodeError as exc:
            raise ValueError(
                f"LLM returned non-JSON response (first 200 chars): {text[:200]!r}"
            ) from exc

    def _parse_response(self, data: dict[str, Any]) -> ScoringReport:
        extracted_terms: dict[str, Any] = data.get("extracted_terms", {})
        markkula_raw: dict = data.get("markkula", {})
        pmi_raw: dict = data.get("pmi", {})

        # ---- Markkula lens scoring ----------------------------------------
        lens_scores: list[LensScore] = []
        weighted_sum = 0.0
        for lens_key, weight in LENS_WEIGHTS.items():
            entry = markkula_raw.get("lens_scores", {}).get(lens_key, {})
            raw_score = float(entry.get("score", 0))
            raw_score = max(-2.0, min(2.0, raw_score))
            lens_scores.append(LensScore(
                lens=lens_key,
                score=raw_score,
                rationale=entry.get("rationale", ""),
            ))
            weighted_sum += raw_score * weight

        # Normalise from [-2, 2] → [0, 100]
        markkula_score = (weighted_sum + 2) / 4 * 100

        # ---- PMI scoring --------------------------------------------------
        pmi_score = (
            float(pmi_raw.get("responsibility_score", 50)) * PMI_WEIGHTS["responsibility"]
            + float(pmi_raw.get("respect_score", 50)) * PMI_WEIGHTS["respect"]
            + float(pmi_raw.get("fairness_score", 50)) * PMI_WEIGHTS["fairness"]
            + float(pmi_raw.get("honesty_score", 50)) * PMI_WEIGHTS["honesty"]
        )

        # ---- Fused score --------------------------------------------------
        ethical_score = MARKKULA_WEIGHT * markkula_score + PMI_WEIGHT * pmi_score

        # ---- Line-Crossing rule ------------------------------------------
        line_crossing = False
        justice_score = next((ls.score for ls in lens_scores if ls.lens == "justice"), 0.0)
        if justice_score <= LINE_CROSSING_JUSTICE_THRESHOLD or any(
            ls.score <= LINE_CROSSING_ANY_LENS_THRESHOLD for ls in lens_scores
        ):
            line_crossing = True
            ethical_score = min(ethical_score, LINE_CROSSING_SCORE_CAP)

        # ---- Recommendation -----------------------------------------------
        if line_crossing or ethical_score < 50:
            recommendation = "pilot" if ethical_score >= 35 else "reject"
        elif ethical_score < 75:
            recommendation = "pilot"
        else:
            recommendation = "accept"

        confidence_pct = min(abs(ethical_score - 50) * 2, 100)

        reasoning_trace = {
            "step1": markkula_raw.get("step1_ethical_issues", ""),
            "step2": markkula_raw.get("step2_stakeholders", []),
            "step3": [ls.model_dump() for ls in lens_scores],
            "step4": {
                "recommendation": markkula_raw.get("step4_recommendation", ""),
                "justification": markkula_raw.get("step4_justification", ""),
                "sensitivity": markkula_raw.get("step4_sensitivity", ""),
            },
            "step5": markkula_raw.get("step5_next_steps", []),
            "pmi": pmi_raw,
            "scores": {
                "markkula_normalised": round(markkula_score, 2),
                "pmi": round(pmi_score, 2),
                "fused_ethical": round(ethical_score, 2),
            },
            "line_crossing_triggered": line_crossing,
        }

        return ScoringReport(
            extracted_terms=extracted_terms,
            markkula_score=round(markkula_score, 2),
            pmi_score=round(pmi_score, 2),
            ethical_score=round(ethical_score, 2),
            recommendation=recommendation,
            line_crossing_triggered=line_crossing,
            confidence_pct=round(confidence_pct, 2),
            reasoning_trace=reasoning_trace,
        )
