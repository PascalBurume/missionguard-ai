"""Unit tests for the ethical scoring engine (pure logic, no LLM calls)."""
import pytest
from unittest.mock import AsyncMock, patch

from missionguard_ai.scoring_engine import ScoringEngine


SAMPLE_LLM_RESPONSE = {
    "extracted_terms": {
        "amount_usd": 1500000,
        "restrictions": ["expand to Neighboring Town within 6 months"],
        "timeline": "6 months",
        "naming_rights": True,
        "donor_veto_clauses": ["donor must approve any changes to scope"],
        "strategic_control_flags": ["must expand to X town"],
    },
    "markkula": {
        "step1_ethical_issues": (
            "Tension between maximising beneficiaries and protecting strategic integrity; "
            "donor control clause threatens organisational autonomy."
        ),
        "step2_stakeholders": [
            "Existing Western-town community: risk of diluted services",
            "Neighbouring town residents: potential new beneficiaries",
            "Donor: expectation of geographic expansion",
            "Board: fiduciary duty and reputational risk",
            "Staff: workload and morale",
        ],
        "lens_scores": {
            "rights":       {"score": -1.0, "rationale": "Donor veto clause erodes org autonomy."},
            "justice":      {"score": -1.5, "rationale": "Resources diverted from data-selected high-need area."},
            "consequences": {"score": 0.5,  "rationale": "Net positive IF pilot succeeds; unclear long-term."},
            "common_good":  {"score": -0.5, "rationale": "Precedent risk outweighs short-term gain."},
            "care":         {"score": -0.5, "rationale": "Staff morale and community trust at risk."},
        },
        "step4_recommendation": "pilot",
        "step4_justification": "Accept only as a structured 18-month pilot with Board re-approval required.",
        "step4_sensitivity": "If donor removes veto clause, justice score improves and full acceptance is possible.",
        "step5_next_steps": [
            "Draft 18-month pilot scope with predefined success metrics.",
            "Issue one-click Board disclosure memo.",
            "Generate Precedent Policy clause.",
        ],
    },
    "pmi": {
        "responsibility_score": 55.0,
        "respect_score": 60.0,
        "fairness_score": 40.0,
        "honesty_score": 70.0,
        "rationale": "Fairness score lowered due to diversion from data-selected expansion plan.",
    },
}


def test_line_crossing_triggered_on_justice_threshold():
    """Justice score -1.5 should trigger line-crossing, cap E at 49, force pilot."""
    engine = ScoringEngine.__new__(ScoringEngine)
    report = engine._parse_response(SAMPLE_LLM_RESPONSE)
    assert report.line_crossing_triggered is True
    assert report.ethical_score <= 49.0
    assert report.recommendation in ("pilot", "reject")


def test_pmi_score_weighted_correctly():
    """PMI score should equal weighted sum of four values."""
    engine = ScoringEngine.__new__(ScoringEngine)
    report = engine._parse_response(SAMPLE_LLM_RESPONSE)
    pmi = SAMPLE_LLM_RESPONSE["pmi"]
    expected_pmi = (
        pmi["responsibility_score"] * 0.30
        + pmi["respect_score"] * 0.25
        + pmi["fairness_score"] * 0.25
        + pmi["honesty_score"] * 0.20
    )
    assert abs(report.pmi_score - round(expected_pmi, 2)) < 0.01


def test_fused_score_formula():
    """Fused score = 0.6*M + 0.4*P, capped at 49 due to line-crossing."""
    engine = ScoringEngine.__new__(ScoringEngine)
    report = engine._parse_response(SAMPLE_LLM_RESPONSE)
    # Since line-crossing is triggered, score is capped at 49
    assert report.ethical_score <= 49.0


def test_reasoning_trace_has_all_steps():
    engine = ScoringEngine.__new__(ScoringEngine)
    report = engine._parse_response(SAMPLE_LLM_RESPONSE)
    trace = report.reasoning_trace
    assert "step1" in trace
    assert "step2" in trace
    assert "step3" in trace
    assert "step4" in trace
    assert "step5" in trace
    assert len(trace["step3"]) == 5  # 5 lenses


@pytest.mark.asyncio
async def test_score_calls_llm_and_parses():
    """Integration-style: mock the LLM call, verify full pipeline."""
    engine = ScoringEngine.__new__(ScoringEngine)

    with patch.object(engine, "_call_llm", new=AsyncMock(return_value=SAMPLE_LLM_RESPONSE)):
        report = await engine.score("Some donor offer text here.")

    assert report.recommendation in ("accept", "pilot", "reject")
    assert 0 <= report.ethical_score <= 100
    assert report.confidence_pct >= 0
