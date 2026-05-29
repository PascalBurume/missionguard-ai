# MissionGuard AI

> AI-powered ethical decision-support platform for nonprofits navigating restricted-gift dilemmas.

Operationalises the **Modified Acceptance (Pilot Phase)** framework from the Markkula Center's "Follow the Money" case study, scored against the PMI Code of Ethics.

---

## Overview

Nonprofits frequently receive **restricted gifts** that conflict with their data-driven strategic plans. A major donor might offer transformative funding — but only if the organization immediately expands into an unplanned program or geography. Accepting can trigger *mission creep*; rejecting can mean leaving impact (and money) on the table.

MissionGuard AI turns this ethical tension into a **structured, defensible, and mission-aligned decision**. A leader uploads or pastes a donor offer and, in under two minutes, receives:

- A structured extraction of the offer's terms (amount, restrictions, timeline, veto/naming rights, reporting demands).
- A **0–100 ethical score** with an **Accept / Pilot / Reject** recommendation and confidence level.
- A multi-lens breakdown explaining *why* the score landed where it did.
- Ready-to-use artifacts: a Pilot Phase plan, an internal disclosure memo, and a Precedent Policy to prevent future donor-driven drift.

**Primary goal:** reduce mission-creep risk by 60%+ while maximizing donor-funded impact, and cut the decision cycle from 3–4 weeks to under 5 business days.

### The Case Behind It

The platform is built around the *"Follow the Money"* case from the Markkula Center for Applied Ethics, where an Executive Director ("Lisa") at *Affordable Housing for All* must decide whether to accept a large gift contingent on expanding to an unplanned town. MissionGuard operationalizes the group's **Modified Acceptance (Option C)** conclusion: accept significant funding *only* when it can be structured as a time-limited, evidence-based **Pilot Phase**, with full internal transparency and an enforced Precedent Policy.

---

## Key Features

| Module | Capability |
|--------|------------|
| **Gift Intake & NLP Analysis** | Paste or upload an offer; AI extracts amount, restrictions, timeline, naming/veto rights, and flags strategic-control language. |
| **Ethical Scoring Engine** | Scores 0–100 against the Markkula multi-lens framework fused with PMI Code of Ethics weights. |
| **Recommendation & Options** | Surfaces Accept / Pilot / Reject with pros/cons, an ethical risk heat map, and a confidence score. |
| **Pilot Phase Designer** | Generates a time-bound pilot scope, success/failure criteria, and donor negotiation talking points. |
| **Transparency Engine** | One-click Board memo + staff briefing that frames the gift as a reviewable pilot, not a strategic pivot. |
| **Precedent Policy Generator** | Drafts a customized Gift Acceptance & Strategic Alignment Policy to guard against future drift. |
| **Decision Audit Trail** | Every recommendation, score, and final choice logged for auditors and funders. |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 16 (App Router), React 19, Tailwind CSS, shadcn/ui, Recharts, Three.js |
| **Backend** | FastAPI (async), SQLAlchemy + Alembic, Pydantic |
| **AI / Reasoning** | Anthropic Claude (Sonnet) for document understanding & ethical reasoning |
| **Ethical Scoring** | Custom Python scoring engine (`packages/ai`) |
| **Database** | PostgreSQL / Supabase in production · SQLite for local dev |
| **Monorepo** | Turborepo + npm workspaces (JS) · uv workspaces (Python) |

---

## Repository Layout

```
apps/
  web/        Next.js 16 + Tailwind + shadcn/ui   (frontend)
  api/        FastAPI + SQLAlchemy + Alembic       (backend)
packages/
  ai/         Ethical Scoring Engine (Python)
  shared/     Pydantic & TypeScript shared schemas
docs/         PRD, development plan, ethical framework, screenshots
samples/      Example donor offer letters for testing
```

---

## Quick Start

### Prerequisites
- Node ≥ 20 / npm ≥ 10
- Python 3.12+
- [uv](https://docs.astral.sh/uv/) (`pip install uv`)
- [Turbo](https://turbo.build/) (installed via `npm install`)

### 1. Install JS dependencies
```bash
npm install
```

### 2. Install Python dependencies
```bash
uv sync
```

### 3. Configure environment
```bash
cp apps/web/.env.example apps/web/.env.local
cp apps/api/.env.example apps/api/.env
```
Fill in your Supabase URL/key and Anthropic API key.

### 4. Run development servers
```bash
# Frontend (Next.js on :3000)
npm run dev --workspace=apps/web

# Backend (FastAPI on :8000)
cd apps/api && uv run uvicorn missionguard_api.main:app --reload
```

---

## Ethical Framework

The scoring engine implements the **5-step Markkula Framework** fused with **PMI Code of Ethics** weights:

$$E = 0.6 \cdot M + 0.4 \cdot P$$

where $M$ = Markkula lens score (0–100) and $P$ = PMI values score (0–100).  
**Line-Crossing rule:** if the Justice/Fairness lens ≤ −1 or any lens ≤ −1.5, $E$ is capped at 49 and the recommendation is forced to Pilot Phase or Reject.

The five Markkula lenses applied to every offer are **Rights, Justice/Fairness, Consequences (Utilitarian), Common Good, and Virtue/Care**. The PMI dimensions are weighted **Responsibility 30%, Respect 25%, Fairness 25%, Honesty 20%**.

See [docs/MissionGuard_AI_Ethical_Framework_for_AI_Agents.md](./docs/MissionGuard_AI_Ethical_Framework_for_AI_Agents.md) for the full operational constitution.

---

## Project Status

**Sprint 0 / MVP** — core intake UI, ethical scoring engine, and FastAPI scaffold are in place. Simulation dashboard, integrations (Salesforce, email/Slack), and SOC 2 compliance work are planned for later phases. See the development plan for the full roadmap.

---

## Docs
| Document | Purpose |
|----------|---------|
| [docs/MissionGuard_AI_PRD.md](./docs/MissionGuard_AI_PRD.md) | Product Requirements (v1.0) |
| [docs/MissionGuard_AI_Development_Plan.md](./docs/MissionGuard_AI_Development_Plan.md) | Sprint roadmap & tech stack (v1.1) |
| [docs/MissionGuard_AI_Ethical_Framework_for_AI_Agents.md](./docs/MissionGuard_AI_Ethical_Framework_for_AI_Agents.md) | AI agent ethics constitution (v1.0) |
| [docs/MissionGuard_AI_Repository_Analysis.md](./docs/MissionGuard_AI_Repository_Analysis.md) | Repository analysis |

---

*Sprint 0 — April 28, 2026 | Author: Pascal Burume Buhendwa*
