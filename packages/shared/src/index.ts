// Shared TypeScript types — mirrors the Pydantic schemas in apps/api/missionguard_api/schemas.py

export type Recommendation = "accept" | "pilot" | "reject";
export type RiskTolerance = "protective" | "balanced" | "growth";

// --- Gift ---

export interface GiftIntakeRequest {
  organization_id: string;
  donor_name?: string;
  amount_usd?: number;
  raw_offer_text?: string;
}

export interface GiftIntakeResponse {
  gift_id: string;
  message: string;
}

export interface LensScore {
  lens: string;
  score: number;
  rationale: string;
}

export interface GiftAnalysisResponse {
  gift_id: string;
  extracted_terms: Record<string, unknown>;
  ethical_score: number;
  markkula_score: number;
  pmi_score: number;
  recommendation: Recommendation;
  line_crossing_triggered: boolean;
  confidence_pct: number;
  reasoning_trace: {
    step1: string;
    step2: string[];
    step3: LensScore[];
    step4: { recommendation: string; justification: string; sensitivity: string };
    step5: string[];
    pmi: Record<string, unknown>;
    scores: { markkula_normalised: number; pmi: number; fused_ethical: number };
    line_crossing_triggered: boolean;
  };
  disclaimer: string;
}

export interface HumanDecisionRequest {
  final_choice: Recommendation;
  decided_by_user_id: string;
}

export interface HumanDecisionResponse {
  decision_id: string;
  final_choice: Recommendation;
  audit_logged: boolean;
}

// --- Policy ---

export interface PolicyGenerateRequest {
  organization_id: string;
  risk_tolerance?: RiskTolerance;
}

export interface PolicyGenerateResponse {
  organization_id: string;
  policy_markdown: string;
  version: string;
}
