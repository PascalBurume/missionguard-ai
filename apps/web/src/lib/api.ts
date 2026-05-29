/**
 * MissionGuard AI – typed API client for the FastAPI backend.
 * All calls go through the NEXT_PUBLIC_API_URL env var.
 */
import type {
  GiftIntakeRequest,
  GiftIntakeResponse,
  GiftAnalysisResponse,
  HumanDecisionRequest,
  HumanDecisionResponse,
  PolicyGenerateRequest,
  PolicyGenerateResponse,
} from "@missionguard/shared";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...init?.headers },
    ...init,
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => res.statusText);
    throw new Error(`API ${res.status}: ${detail}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  // FR-01
  intakeGift: (body: GiftIntakeRequest) =>
    request<GiftIntakeResponse>("/api/v1/gifts", { method: "POST", body: JSON.stringify(body) }),

  // FR-01 upload
  uploadGiftDocument: (giftId: string, file: File) => {
    const form = new FormData();
    form.append("file", file);
    return request<{ gift_id: string; message: string }>(`/api/v1/gifts/${giftId}/upload`, {
      method: "POST",
      headers: {},           // let the browser set multipart boundary
      body: form,
    });
  },

  // FR-02 → FR-04
  analyzeGift: (giftId: string) =>
    request<GiftAnalysisResponse>(`/api/v1/gifts/${giftId}/analyze`, { method: "POST" }),

  // FR-10
  recordDecision: (giftId: string, body: HumanDecisionRequest) =>
    request<HumanDecisionResponse>(`/api/v1/gifts/${giftId}/decide`, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  // FR-08
  generatePolicy: (body: PolicyGenerateRequest) =>
    request<PolicyGenerateResponse>("/api/v1/policies", { method: "POST", body: JSON.stringify(body) }),
};
