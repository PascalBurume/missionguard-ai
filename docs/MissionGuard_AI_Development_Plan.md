# MissionGuard AI – Detailed Development & Implementation Plan
**Version:** 1.1  
**Date:** April 28, 2026  
**Author:** Pascal Burume Buhendwa (Member 5 – Application & Action)  
**Aligned to:** Group Ethics Presentation – "Follow the Money" Case (Modified Acceptance / Option C)  
**Parent Document:** MissionGuard_AI_PRD.md (v1.0)

---

## 1. Executive Alignment to Our Ethics Decision

This Development Plan translates our **final recommendation** (Modified Acceptance – Option C) into a production-ready SaaS platform:

- **Core Decision Logic**: Never accept a restricted gift that creates an entirely new program without evidence. Instead, structure as **time-limited Pilot Phase** with clear success metrics.
- **Key Safeguards Built-In**:
  1. Mandatory **Pilot Phase Designer** (FR-05)
  2. **One-Click Transparency Disclosure** to Board & staff (FR-06/07)
  3. **Precedent Policy Generator** + historical database (FR-08/09) to prevent "tyranny of the next gift"

The platform makes the **ethically correct choice the easiest choice**.

---

## 2. Project Governance & Team Structure

| Role | Person | Responsibility | Time Commitment (MVP) |
|------|--------|----------------|-----------------------|
| **Product Owner** | Pascal Burume Buhendwa | Vision, backlog prioritization, stakeholder interviews, final ethical scoring model sign-off | 100% |
| **Stakeholder Research Lead** | Oumar Bamba (Member 1) | Nonprofit ED interviews, persona validation, "Lisa" journey mapping | 40% |
| **Ethical AI Model Lead** | Yu Thander (Member 3) | Markkula Framework implementation + lens scoring model, training data labeling, SHAP explainability | 60% |
| **Transparency & Workflow Lead** | Rahim ELSIWI (Member 4) | Disclosure engine, notification workflows, audit trail | 50% |
| **Policy & Negotiation Lead** | Md Jamal Hosen (Member 5 – new) | Precedent Policy templates, donor negotiation script generator, legal review liaison | 50% |
| **Tech Lead / Scrum Master** | TBD (or external contractor) | Architecture, CI/CD, AI integration, sprint facilitation | 80% |

**Decision Rights**: Product Owner has final say on scope; ethical model changes require Yu + Pascal dual approval.

---

## 3. Recommended Tech Stack (MVP → Scale)

| Layer | Choice | Rationale | Cost (MVP) |
|-------|--------|-----------|------------|
| **Frontend** | Next.js 15 (App Router) + Tailwind + shadcn/ui + Recharts | Fast iteration, excellent DX, beautiful dashboards out-of-box | Free |
| **Backend / DB** | Supabase (Postgres + Row Level Security + Storage + Auth) | Zero-ops Postgres, built-in auth/RLS perfect for multi-tenant nonprofit data | ~$25/mo |
| **AI Orchestration** | LangChain.js + Anthropic Claude 3.5 Sonnet (or Groq Llama-3.1-70B for cost) | Best-in-class reasoning for ethical analysis + document understanding | ~$150–400/mo (beta) |
| **Document Parsing** | Unstructured.io or LlamaParse + pdf.js | Handles donor PDFs, strategic plans, 990s | Pay-per-use |
| **Integrations** | Salesforce Nonprofit Cloud API + Gmail/Outlook connectors (via Nylas or native) | Real-world donor offer ingestion | ~$99/mo |
| **Hosting & Monitoring** | Vercel (frontend) + Supabase (backend) + Sentry + PostHog (analytics) | Serverless, global edge, built-in observability | ~$50/mo |
| **Compliance** | SOC 2 Type II roadmap (start with Supabase + Vercel attestations) | Required for nonprofit trust | Deferred to Phase 2 |

**Why not build everything custom?** Speed to market is critical — we need to show value in the same semester we present the ethics case.

---

## 4. Detailed Phased Roadmap with 2-Week Sprints

### Phase 0: Foundation & Validation (Weeks 1–3 | April 28 – May 18, 2026)

**Sprint 0.1 (Week 1)**
- Repo setup (monorepo: apps/web, packages/ai, packages/shared)
- Design system + Figma wireframes for core flows (Gift Intake → Recommendation → Pilot Designer)
- 5 user interviews (Oumar + Pascal) with nonprofit EDs in housing/education sector
- Define success metrics for "Lisa" persona journey

**Sprint 0.2 (Week 2)**
- Data model & Supabase schema (gifts, strategic_plans, decisions, policies, audit_logs)
- Seed 30 synthetic cases based on Markkula + real public 990 + housing outcome data
- Initial prompt library for ethical scoring (Responsibility 30%, Respect 25%, Fairness 25%, Honesty 20%)

**Sprint 0.3 (Week 3)**
- Basic authentication + organization onboarding flow
- Upload strategic plan PDF → parse → store
- Internal alpha with team + 2 friendly nonprofits

**Milestone 0**: Validated problem-solution fit + clickable prototype (Figma + Supabase backend)

### Phase 1: MVP – Core Decision Engine (Weeks 4–12 | May 19 – July 11, 2026)

**Sprint 1.1–1.2 (Weeks 4–5): Gift Intake & NLP**
- FR-01: Drag-and-drop donor offer (PDF/email) → structured JSON extraction
- Flag "strategic control" language ("must expand to X", "veto rights", "naming rights tied to geography")
- Unit tests + 20 golden test cases

**Sprint 1.3–1.4 (Weeks 6–7): Ethical Scoring Engine (FR-02)**
- Implement weighted PMI scorer
- Integration with Claude for natural-language rationale ("Why this score: high Respect risk because...")
- SHAP-style local explanations for every recommendation

**Sprint 1.5–1.6 (Weeks 8–9): Impact Simulator + Option Generator (FR-03/04)**
- Simple Monte-Carlo model (staff hours, cost-per-beneficiary, outcome drift)
- Side-by-side cards: Accept-as-is vs Pilot Phase vs Reject
- **Default recommendation always surfaces Option C (Pilot) with confidence %**

**Sprint 1.7 (Week 10): Pilot Phase Designer (FR-05)**
- 12/18-month pilot builder with success criteria tied to original feasibility metrics
- Auto-generate donor negotiation email/script ("We propose a data-validated 18-month pilot...")

**Sprint 1.8 (Week 11): Disclosure Engine (FR-06/07)**
- One-click Board memo + staff briefing (pre-filled with ethical rationale + precedent warning)
- Email/Slack integration (via Resend or native)

**Sprint 1.9 (Week 12): Precedent Policy Generator MVP (FR-08)**
- Template engine: "Gift Acceptance & Strategic Alignment Policy" customized by org size/sector
- Version control + "Adopt Policy" button that locks it into org settings

**Milestone 1 (July 11)**: Closed beta with 25–40 nonprofits. Target: 70% of decisions follow Pilot recommendation.

### Phase 2: Beta & Policy Intelligence (Weeks 13–20 | July 13 – Sept 4, 2026)

- Full historical precedent database (opt-in, anonymized, with consent)
- Advanced simulation (multi-town resource allocation model)
- Salesforce Nonprofit Cloud + Bloomerang integration
- Mobile-responsive + WCAG 2.2 AA audit
- First paid tier launch (Pro: $49/org/mo)

**Milestone 2**: 150 active organizations, $8k MRR, 82% recommendation acceptance rate.

### Phase 3: Scale & Ecosystem (Weeks 21–36 | Sept 2026 – Dec 2026)

- Public API for ethics consultants & academic researchers
- "Ethics-as-a-Service" white-label for community foundations
- On-prem / VPC deployment option for large orgs (>$50M revenue)
- Partnership with Markkula Center or Nonprofit Quarterly for case library

---

## 5. Data, Training & AI Safety Plan

**Training Data Strategy (Ethical & Legal)**
1. **Seed (Month 1)**: 50 hand-labeled cases (Markkula + similar ethics cases + synthetic)
2. **Week 4–8**: Partner with 3 university nonprofit programs + 2 ethics centers for 200+ labeled decisions
3. **Ongoing**: Opt-in user decisions (explicit consent + differential privacy)

**Model Choices**
- Primary: Claude 3.5 Sonnet (best reasoning + long context for strategic plans)
- Fallback / Cost: Groq-hosted Llama-3.1-70B
- Fine-tuning target (Month 6+): Small LoRA on top of Llama for nonprofit-specific ethical nuance

**Safety Guardrails (Non-Negotiable)**
- Every recommendation shows "This is an AI suggestion — final decision remains with your Board"
- Mandatory human review flag for scores < 65 or high "Fairness" risk
- Full audit log exportable for any ethics investigation or donor dispute

---

## 6. Go-to-Market & Launch Tied to Our Group Work

**Week 1–2**: Internal dogfood + present MissionGuard AI as **live demo** in our ethics class presentation (instead of static slides for Member 5 section).

**Month 2**: Beta invite to all classmates + professors + 10 real nonprofits from Oumar's interviews.

**Month 4 (MVP launch)**: 
- Case study published: "How MissionGuard AI would have helped Lisa at Affordable Housing for All avoid mission creep"
- Webinar with Markkula Center (if partnership secured)
- Product Hunt + LinkedIn launch targeting "Nonprofit Executive Directors" and "Board Chairs"

**Pricing (proposed)**
- Free: 3 decisions/month, basic disclosure
- Pro ($49/mo): Unlimited + Precedent Policy + Integrations
- Enterprise ($299/mo): SSO, audit exports, custom policy templates, on-prem option

---

## 7. Resource & Budget Estimate (MVP 12 weeks)

| Item | Cost (USD) | Notes |
|------|------------|-------|
| AI API (Claude + Groq) | $2,800 | 25k decisions during beta |
| Supabase + Vercel + Sentry | $420 | 4 months |
| Design (Figma Pro + freelance UI polish) | $1,200 | One-time |
| User interview incentives | $500 | 10 × $50 gift cards |
| Legal review (policy templates + ToS) | $1,800 | Nonprofit-specialist lawyer |
| **Total MVP Cash Outlay** | **~$6,720** | Excluding team time |
| **Team Time (opportunity cost)** | 1,200 person-hours | Mostly student / volunteer for first version |

**Funding Path**: Apply to [Fast Forward](https://www.ffwd.org/) or [Google.org AI for Social Good](https://ai.google/social-good/) grants + university innovation fund. Target: $25k seed by end of Phase 1.

---

## 8. Immediate Next Steps (This Week – April 28–May 4)

1. **Today**: Pascal + Yu review ethical scoring prompt library (share in shared drive)
2. **Wed**: Oumar schedules first 3 nonprofit ED interviews (use script from PRD US-01)
3. **Thu**: Jamal drafts first version of "Precedent Policy" template language
4. **Fri**: Full team sync – decide on final tech stack + assign Sprint 0.1 tasks
5. **Weekend**: Pascal creates low-fidelity Figma flows for Gift Intake → Recommendation (share link in PRD Appendix A)

---

## 9. Success Metrics (Tied to PRD Goals)

| Metric | Phase 1 Target (Week 12) | Phase 2 Target (Week 20) |
|--------|---------------------------|---------------------------|
| % of users who accept "Pilot Phase" recommendation | ≥ 65% | ≥ 78% |
| Average time from upload to Board-ready memo | < 8 minutes | < 4 minutes |
| Precedent Policy adoption rate | ≥ 55% | ≥ 75% |
| User NPS | ≥ 45 | ≥ 60 |
| Reduction in self-reported "mission creep" risk (survey) | ≥ 40% | ≥ 55% |

---

## 10. Risks Specific to Development (Beyond PRD)

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Nonprofit staff lack technical comfort uploading strategic plans | High | High | Ultra-simple UX + "upload via email" fallback + 1-click Google Drive import |
| AI gives overly conservative recommendations (always "Reject") | Medium | High | Tunable risk tolerance slider ("Protective" vs "Growth-oriented" mode) + human override |
| Legal liability if AI-generated policy is later challenged | Medium | Very High | Clear disclaimer + "This is a template — have your counsel review" + insurance |
| Team bandwidth during exam period | High | Medium | Async-first, recorded Loom updates, 2-week sprint flexibility |

---

**Document Status**: v1.1 – Ready for team review and Sprint 0 kickoff.  
This plan makes our **Member 5 recommendation actionable** — turning the ethics case into a real product that can protect hundreds of nonprofits from the exact dilemma Lisa faced.

**Let's build it.**  
— Pascal Burume Buhendwa  
Product Owner, MissionGuard AI

---

*Next: After team approval, move to Technical Specification (SRS) + Figma high-fidelity designs.*