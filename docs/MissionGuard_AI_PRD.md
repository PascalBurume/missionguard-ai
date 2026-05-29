# Product Requirements Document (PRD)
## MissionGuard AI  
**AI-Powered Ethical Decision-Making Platform for Nonprofits**

**Version:** 1.0  
**Date:** April 28, 2026  
**Author:** Pascal Burume Buhendwa (Group Member – Application & Action)  
**Project Context:** Social Sector Ethics Case Study – "Follow the Money" (Markkula Center)  
**Related Presentation:** Group Ethics Analysis using PMI Code of Ethics

---

### 1. Executive Summary

**MissionGuard AI** is an AI-empowered decision-support platform designed to help nonprofit leaders (Executive Directors, Boards, and ethics committees) navigate complex restricted-gift dilemmas like the one faced by Lisa at Affordable Housing for All.

The platform operationalizes the **Modified Acceptance (Option C)** decision from our ethics analysis:
- Accept significant donor funding **only** when it can be structured as a time-limited, evidence-based **Pilot Phase**.
- Enforce full **transparency** with internal stakeholders.
- Automatically generate and enforce a **Precedent Policy** to prevent future donor-driven strategic drift.

By combining natural language processing, predictive impact modeling, and ethical scoring aligned with the **PMI Code of Ethics** (Responsibility, Respect, Fairness, Honesty) **plus the Markkula Center Framework for Ethical Decision Making** (multi-lens analysis: Rights, Justice, Consequences, Common Good/Virtue, Care), MissionGuard AI turns ethical tension into structured, defensible, and mission-aligned decisions. See the companion document *MissionGuard_AI_Ethical_Framework_for_AI_Agents.md* for the full operational constitution used by all AI agents.

**Primary Goal:** Reduce "mission creep" risk by 60%+ while maximizing donor-funded impact within 18 months of launch.

---

### 2. Problem Statement

Nonprofits frequently receive restricted gifts that conflict with data-driven strategic plans. Current challenges include:

- **No systematic framework** for evaluating whether a donor demand "crosses the line" (new program creation vs. support of existing work).
- **Lack of transparency tools** — decisions are often made ad-hoc without full Board/staff disclosure.
- **Precedent blindness** — accepting one off-strategy gift makes it harder to reject future ones ("tyranny of the next gift").
- **Resource overextension risk** — accepting without feasibility data can compromise effectiveness in existing communities.
- **Manual, slow processes** — weeks of meetings and legal review instead of rapid, evidence-based decisions.

**Real-world trigger (case):** A major donor offers funding large enough to cover both the planned Western-town expansion **and** an unplanned neighboring town — but only if the unplanned town is added immediately.

---

### 3. Goals & Objectives

**Strategic Objectives (12-month horizon)**
1. **Decision Quality** — 85% of users report the platform’s recommendation aligned with their final decision.
2. **Risk Reduction** — Decrease instances of mission-creep acceptance by ≥50% (measured via user-reported outcomes + follow-up surveys).
3. **Time Efficiency** — Reduce average decision cycle from 3–4 weeks to <5 business days.
4. **Transparency Adoption** — 100% of accepted gifts generate automatic internal disclosure reports.
5. **Policy Institutionalization** — 70% of organizations using the platform adopt a formal Precedent Policy within 90 days.

**Product Vision**  
"Every nonprofit leader should be able to answer in minutes: *Does this gift strengthen or erode our mission integrity?* — with AI providing the evidence, ethical scoring, and ready-to-use action plans."

---

### 4. Target Users & Personas

| Persona | Role | Pain Points | Key Needs |
|---------|------|-------------|---------|
| **Lisa (Primary)** | Executive Director | Time pressure, donor relationship vs. mission | Fast, defensible recommendation + negotiation script |
| **Board Chair** | Governance | Fiduciary & reputational risk | Clear ethical scoring + precedent impact forecast |
| **Program Director** | Operations | Effectiveness dilution | Pilot-phase feasibility model + success metrics |
| **Ethics/Compliance Officer** | Oversight | Policy gaps | Automated Precedent Policy generator + audit trail |
| **Major Gifts Officer** | Fundraising | "How do I say no (or negotiate) gracefully?" | Donor communication templates + impact framing |

---

### 5. Core Features & Functional Requirements

#### 5.1 AI-Powered Decision Engine (Core Module)

**FR-01: Gift Intake & NLP Analysis**  
- Upload or paste donor offer letter/email/agreement.  
- AI extracts: amount, restrictions, timeline, naming rights, veto powers, reporting requirements.  
- Flags language indicating strategic control (e.g., "must expand to X town").

**FR-02: Strategic Alignment Scoring (0–100)**  
AI model scores the offer against:
- Current 3-year strategic plan (user-uploaded PDF or text)
- Data-driven expansion criteria (need + feasibility scores)
- PMI ethical values (weighted: Responsibility 30%, Respect 25%, Fairness 25%, Honesty 20%)

**FR-03: Impact & Risk Simulator**  
- Monte-Carlo style simulation: "What happens to service quality in existing communities if we add the new town?"
- Predicts: staff bandwidth, cost per beneficiary, outcome metrics drift over 24 months.
- Visual dashboard: "Accept as-is" vs. "Pilot Phase" vs. "Reject" scenarios.

**FR-04: Option Generator & Recommendation**  
Automatically surfaces the three options (A/B/C) with:
- Pros/cons summary
- Ethical risk heat map
- **Recommended path: Modified Acceptance (Pilot Phase)** with confidence score

#### 5.2 Pilot Phase Designer (Action Plan Module)

**FR-05: Pilot Scope Builder**  
- Define time-bound pilot (e.g., 12–18 months)
- Set success/failure criteria tied to original feasibility study metrics
- Generate budget, staffing, and evaluation plan
- Auto-create donor negotiation talking points ("We propose a data-validated pilot before full commitment")

#### 5.3 Transparency & Disclosure Engine

**FR-06: One-Click Internal Disclosure Report**  
- Auto-generates Board memo + staff briefing document
- Clearly states: "This expansion is donor-supported pilot under strategic review — not a permanent strategic pivot"
- Includes ethical rationale and precedent risk warning

**FR-07: Stakeholder Notification Workflow**  
- Email/Slack/Teams integration for automatic distribution to Board, senior staff, and program leads
- Read-receipt tracking + comment collection

#### 5.4 Precedent Policy Generator (Exit Strategy)

**FR-08: Policy Template Engine**  
- AI drafts a customized "Gift Acceptance & Strategic Alignment Policy" based on organization size, sector, and risk tolerance
- Includes: threshold amounts requiring Board vote, mandatory feasibility study for any new geography, 3-year look-back on all restricted gifts
- Version control + annual review reminder

**FR-09: Historical Precedent Database** (opt-in anonymized)  
- Learn from other nonprofits’ past decisions (with consent)
- "Similar offers accepted by 23 peer organizations — 68% later reported mission drift"

#### 5.5 Continuous Learning & Audit

**FR-10: Decision Audit Trail**  
- Every recommendation, simulation, and final choice logged with timestamp and user
- Exportable for auditors, funders, or future ethics reviews

---

### 6. Non-Functional Requirements

| Category | Requirement |
|----------|-------------|
| **Security & Privacy** | SOC 2 Type II, GDPR/CCPA compliant, end-to-end encryption, role-based access (ED vs. Board read-only) |
| **AI Explainability** | Every score/recommendation must include "Why this score" (SHAP values or natural-language explanation) |
| **Integration** | API for Salesforce Nonprofit Cloud, Bloomerang, Little Green Light; SSO (Okta, Azure AD) |
| **Performance** | <3 seconds for full analysis on standard documents |
| **Accessibility** | WCAG 2.2 AA compliant |
| **Scalability** | Support 50,000+ concurrent users (multi-tenant SaaS) |

---

### 7. User Stories (Selected)

**US-01 (Lisa – ED)**  
"As an Executive Director, I want to upload a donor offer and receive a clear 'Accept / Pilot / Reject' recommendation with ethical scores within 2 minutes so I can prepare for the donor meeting confidently."

**US-02 (Board Chair)**  
"As Board Chair, I want to see a 24-month forecast of service effectiveness under each option so I can fulfill my fiduciary duty and protect the organization’s reputation."

**US-03 (Ethics Officer)**  
"As Ethics Officer, I want the platform to auto-generate a Precedent Policy tailored to our risk profile so we never again face an ad-hoc decision like the one in the Affordable Housing case."

**US-04 (Fundraiser)**  
"As Major Gifts Officer, I want ready-to-send negotiation language that honors the donor’s generosity while protecting our strategic boundaries."

---

### 8. AI / Machine Learning Components

- **Fine-tuned LLM** (based on Claude 3.5 / GPT-4o class) for document understanding and ethical reasoning
- **Impact Prediction Model** – trained on anonymized nonprofit outcome data (housing stability, cost-per-outcome, staff utilization)
- **Ethical Scoring Model** – supervised learning on 500+ historical nonprofit gift decisions labeled by ethics experts using PMI framework
- **Negotiation Script Generator** – few-shot prompting with successful real-world negotiation examples

**Data Sources (initial training):**  
- Public 990 filings + program outcome reports  
- Markkula Center cases + similar ethics repositories  
- User-contributed (anonymized) decisions (with explicit consent)

---

### 9. Success Metrics & KPIs

| Metric | Target (Month 12) | Measurement Method |
|--------|-------------------|--------------------|
| User NPS | ≥ 55 | Quarterly survey |
| % of decisions using Pilot Phase recommendation | ≥ 65% | Platform analytics |
| Average decision time | < 4 business days | Timestamp logs |
| Precedent Policy adoption rate | ≥ 70% | Policy upload + annual review flag |
| Reduction in reported mission-creep incidents | ≥ 50% | 6-month follow-up survey |
| Recommendation acceptance rate | ≥ 80% | "Did you follow the AI suggestion?" |

---

### 10. High-Level Roadmap

**Phase 1 – MVP (Months 1–4)**  
- Core intake + scoring engine  
- Basic Pilot Phase designer  
- One-click disclosure report  
- 50 beta users (nonprofits < $10M revenue)

**Phase 2 – Beta (Months 5–8)**  
- Full simulation dashboard  
- Precedent Policy generator  
- Integrations (Salesforce, email)
- 300 users

**Phase 3 – Launch (Months 9–12)**  
- Historical precedent database (opt-in)  
- Advanced audit & compliance module  
- Public pricing tiers (Free / Pro / Enterprise)

---

### 11. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| AI hallucination on ethical scoring | Medium | High | Human-in-the-loop + mandatory "explain why" + expert review panel for first 1,000 decisions |
| Low adoption by small nonprofits (cost) | High | Medium | Generous free tier + foundation sponsorships |
| Data privacy concerns | Medium | High | Zero-data-retention option + on-prem deployment for large orgs |
| Over-reliance on AI ("black box") | Medium | Medium | Strong explainability layer + "this is a tool, not a replacement for judgment" messaging |

---

### 12. Assumptions & Dependencies

- Nonprofits are willing to upload sensitive strategic documents (mitigated by strong privacy controls)
- Donor offers are increasingly digital (email/PDF) — validated by 2025–2026 trends
- PMI Code of Ethics remains stable reference framework
- Access to outcome datasets via partnerships (e.g., with Nonprofit Quarterly, Candid, or academic centers)

---

### 13. Appendices (To Be Developed in v1.1)

- A. Low-fidelity wireframes (Figma link)
- B. Sample AI prompt library
- C. Competitive landscape (e.g., vs. general ethics tools or donor CRM add-ons)
- D. Legal review checklist for AI-generated policy language

---

**Next Steps for Pascal & Team**  
1. Review this PRD and add any missing requirements from your Member 5 perspective.  
2. Share with Oumar (Member 1) for stakeholder validation.  
3. Decide on tech stack (recommend: Next.js + Supabase + LangChain + fine-tuned Llama-3.1-70B or Claude).  
4. Prepare 2–3 user interviews with real nonprofit EDs before MVP scoping.

This PRD directly translates our ethics presentation’s **Modified Acceptance (Option C)** recommendation into a scalable, AI-powered product that can help hundreds of organizations avoid the exact dilemma Lisa faced.

Ready for your feedback and iteration!  
— Pascal Burume Buhendwa

---

*Document Status: Draft v1.0 – Awaiting team review before technical specification (SRS) phase.*