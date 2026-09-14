# PiePlan — AI-Powered Budgeting Visualization
*(working title for the client's "AI-Powered Budgeting App" project — rename freely)*

**Status:** Draft v2 — supersedes v1, now grounded in the actual client brief
**Last updated:** September 13, 2026

> **What changed from v1:** the original draft assumed a self-directed personal finance app. The uploaded brief reveals this is actually a **client project for a financial institution focused on financial literacy education**, with an **AI layer** (OpenAI API), a **literacy-accessible visual plan output**, and a second milestone that **overlays Government-of-Canada-style recommended budgeting ratios**. Sections below are rewritten around that reality; anything reused from v1 (category taxonomy, core data model, most edge cases) is called out as carried over.

---

## 1. Overview

### 1.1 Client Context
Client is a North American financial institution focused on improving Canadians' financial literacy and accessibility to financial tools. This is not a general-audience consumer app — it's built to serve people the institution is actively trying to educate, which changes the design bar from "nice visualization" to "comprehensible to someone with limited financial or reading literacy."

### 1.2 Problem Statement
Financial literacy tools generally assume the user is already numerate and comfortable with financial vocabulary (contribution room, liquidity, amortization, etc.). For people early in their financial literacy journey, a table of numbers or a jargon-heavy budgeting app isn't just unhelpful — it can be actively alienating. The client needs a tool that takes the same income/expense/savings data most budgeting apps use, but explains it back to the user in plain, visual, low-jargon terms, and tells them how their spending compares to a recognized benchmark — without requiring them to already understand what "recommended ratio" means.

### 1.3 What is the app?
**One-liner:** An AI-assisted budgeting tool that turns a person's monthly income, expenses, and savings into a plain-language, visual financial snapshot — a pie chart plus a short AI-written explanation — and shows how their spending compares to recommended Canadian budgeting benchmarks, adapted to their literacy level.

**Elevator pitch:** Enter (or upload) your monthly numbers across a fixed set of categories. The app generates a pie chart of where your money went, and — because the target user may not read a percentage breakdown fluently — an AI-generated plain-language summary sits right next to it ("You spent the most on groceries and rent this month; you saved about 8% of your income"). A second layer compares your actual spending to recommended budgeting ranges, so users get an answer to "is this normal?" without needing outside financial knowledge to interpret it themselves.

### 1.4 Goals
- Deliver Milestone 1 (Overall Financial Snapshot): AI-generated pie chart visualization of income minus expenses and savings.
- Deliver Milestone 2 (Contextual Customization): overlay recommended Canadian budgeting benchmarks, adapted to the user's literacy/education level.
- Make the output comprehensible without prior financial literacy — visuals and plain language carry the meaning, not just numbers.
- Keep the AI layer additive, not load-bearing: the chart and numbers must always work even if the AI narrative fails.
- Keep scope appropriately sized (client-rated Easy–Medium) — narrowly-scoped AI calls over an open-ended assistant.

### 1.5 Non-Goals (v1)
- **No live bank-account linking** (no Plaid/Flinks-style integration). Manual entry and structured spreadsheet upload only.
- **No shared/family/household budgets** — each account is single-user.
- **No budget caps, alerts, or overspend notifications** beyond the benchmark comparison itself.
- **No native mobile app** — responsive web only.
- **No full net-worth or investment-performance tracking** — savings categories track contributions, not portfolio value.
- **No multi-currency conversion engine** — foreign spending goes through the single "Foreign Currency Transactions" bucket, entered in home-currency equivalent.
- **No general-purpose bank-statement parsing** — spreadsheet upload targets a defined template/format, not arbitrary bank export formats (see §9).

---

## 2. Target Audience

### 2.1 Primary Persona — "The Financial Literacy Learner"
Someone the client institution is actively trying to reach through financial literacy programming — this may include newcomers to Canada, young adults managing their own money for the first time, or anyone with limited prior exposure to formal financial education. Comfortable enough with a phone or computer to use a web app, but not necessarily comfortable with financial vocabulary or dense numeric tables.

**Wants:** to understand, in plain terms, where their money went and whether that's "normal" — without needing to already know what a budgeting ratio is.
**Needs from the app:** visuals that carry meaning on their own, short plain-language explanations, no unexplained jargon, a non-judgmental tone when spending is outside recommended ranges.

### 2.2 Secondary Persona — "The Financial Educator"
A counselor or advisor at the client institution who may walk through the tool *with* a client during a literacy coaching session — meaning the interface should also work well as something a second person can read over someone's shoulder or project on a screen, and the exportable visual plan (see §4.1) can double as a printed takeaway from that session.

---

## 3. How Users Use the App (Core Flows)

### Flow A — Monthly Entry
1. User logs in (cloud account, multi-device).
2. On the Monthly Dashboard, enters income, then values across the 11 expense and 4 savings subcategories — **or** uploads a spreadsheet (see §4.0) to pre-fill most fields.
3. Chart updates live as values are entered or imported.
4. Remaining Balance is shown prominently.

### Flow B — Milestone 1: AI Snapshot
1. Once a month has enough data entered, the app generates a short AI-written plain-language summary alongside the chart (e.g., biggest category, savings rate, one plain observation).
2. User can optionally export this as a visual plan (image/PDF) combining chart + summary + icons — useful to print, share, or bring to a literacy coaching session.

### Flow C — Milestone 2: Benchmark Comparison
1. On first use (or in settings), user selects a literacy/presentation level — e.g., "Simple" vs. "Standard."
2. The dashboard shows the user's actual % allocation per bucket next to a recommended benchmark range, with a plain-language flag when something's notably outside range — framed informationally, not as a pass/fail grade.
3. AI-generated tips adjust tone and complexity to match the selected literacy level.

### Flow D — Annual Snapshot
*(Carried over from v1 — see Open Question #2: this isn't explicitly named in the client's two milestones, so confirm whether it's in scope or a proposed addition.)*
1. User opens the Annual page for a given year; sees a consolidated chart and month-by-month trend aggregated from logged months.

---

## 4. Functional Requirements

### 4.0 Foundational — Entry, Categories, Data
- FR-1: Auth + per-user cloud data, synced across devices.
- FR-2: Manual entry across income + the fixed 15 subcategories (same taxonomy as v1 — table below).
- FR-3: **Spreadsheet upload** as an alternative to manual entry: user uploads a CSV/XLSX against a defined template (date, description, amount); rows are categorized into the 15 subcategories, using the OpenAI API to classify ambiguous line-item descriptions where a category isn't obvious from a simple keyword match. Rows below a confidence threshold are flagged for the user to confirm rather than silently guessed (see Edge Cases, §8).
- FR-4: Remaining Balance = Income − Σ(Expenses) − Σ(Savings), live-updating.

**Category taxonomy (unchanged from v1):**

| Expenses (11) | Savings (4) |
|---|---|
| Restaurants | Savings *(rename to "General Savings" — see §8)* |
| Groceries | TFSA |
| Transportation | FHSA |
| Healthcare | RRSP |
| Education | |
| Household Expenses | |
| Personal Expenses | |
| Retail | |
| Entertainment & Recreation | |
| Travel | |
| Foreign Currency Transactions | |

### 4.1 Milestone 1 — Overall Financial Snapshot
- FR-5: Nested donut chart (inner ring: Expenses / Savings / Remaining; outer ring: 15 subcategories) — same visualization pattern as v1.
- FR-6: **AI-generated plain-language narrative** (OpenAI API): 2–4 sentences summarizing the month — largest category, savings rate, one plain observation. Kept short deliberately; this is a comprehension aid, not a report.
- FR-7: **Exportable visual plan**: a static image or PDF combining the chart, the AI narrative, and simple icons per category — generated client-side or server-side from the existing chart/data rather than via generative image AI (simpler and more reliable — see §9, and confirm against Open Question #5 on what "Image Processing" was meant to cover).
- FR-8: If the AI call fails or times out, the chart and all numbers must still render normally — the narrative is additive, never a blocker.

### 4.2 Milestone 2 — Contextual Customization
- FR-9: Literacy/presentation-level setting, at least two tiers (e.g., **Simple**: larger icons, minimal numeric detail, shortest possible language; **Standard**: full numeric breakdown alongside the same visuals).
- FR-10: Benchmark overlay comparing the user's actual % allocation per category/bucket to a recommended range, sourced from Government-of-Canada-aligned guidance (see §9 and Open Question #4 — this needs a concrete data source decision before build).
- FR-11: Out-of-range categories are flagged with plain, non-judgmental language (e.g., "Groceries is a bit higher than typical this month" rather than "over budget").
- FR-12: AI-generated tips adapt tone/complexity to the selected literacy tier — same underlying insight, different presentation, not different content.

### 4.3 Annual Snapshot *(carried from v1, scope tbc — see Open Question #2)*
- FR-13: Aggregates all MonthlyEntry records for a year into one chart + summary stats (Total Income, Expenses, Savings, Net Remaining, Savings Rate).
- FR-14: Labeled "Year to Date" if fewer than 12 months are logged; never pads missing months as $0.

---

## 5. Data Model

Extends the v1 model with AI/import/literacy fields:

```
User
 - id
 - email
 - display_name
 - home_currency (default: CAD)
 - literacy_level (enum: simple | standard)
 - created_at

MonthlyEntry
 - id
 - user_id (FK)
 - year, month
 - income (numeric)
 - created_at / updated_at

ExpenseLineItem / SavingsLineItem
 - (unchanged from v1 — see prior draft)

SpreadsheetImportRow  [NEW]
 - id
 - monthly_entry_id (FK)
 - raw_description (text, as uploaded)
 - suggested_category (enum, from AI classification)
 - confidence_score (numeric)
 - confirmed (boolean — user has reviewed/accepted)

AIGeneratedSummary  [NEW]
 - id
 - monthly_entry_id (FK)
 - literacy_level_used (enum)
 - narrative_text
 - generated_at
```

`AIGeneratedSummary` is cached per month + literacy level and regenerated only when underlying data or the literacy setting changes — avoids an API call on every page view.

---

## 6. Design Patterns Behind the App

Carried over from v1 (still fully applicable): **residual budgeting** (Income = Expenses + Savings + Remaining), **hierarchical drill-down** (nested donut), **single-source-of-truth roll-up** (annual is computed, not stored), **live-feedback** (chart updates as you type), **consistent visual identity** (one color per category everywhere), **progressive/optional entry** (empty = $0, never blocking), **comparison-over-snapshot** (trends matter more than one point in time).

**New patterns introduced by the AI/literacy layer:**

8. **AI-as-translator, not AI-as-oracle.** The AI's job is to restate what the data already shows in plain language — never to introduce information the numbers don't support. This keeps the narrative trustworthy and keeps the feature additive rather than a black box.
9. **Benchmark-comparison pattern.** Every actual figure (Milestone 2) is shown *next to* a reference range, never in isolation — this is what turns a snapshot into something the user can act on, and it's the actual product answer to "is this normal?"
10. **Literacy-tiered progressive disclosure.** One dataset, two presentation modes (Simple/Standard) — not two separate apps. Same chart, same underlying numbers; only density of text and numeric detail changes.

---

## 7. Making It Most Useful for the Target Audience

Since the actual target audience is people the client is trying to reach through financial literacy education — not general budget-app users — accessibility choices matter more here than feature count:

- **Plain language by default, jargon only when explained.** Terms like "contribution room" or "liquidity" either get a one-line explanation inline or get avoided entirely in Simple mode.
- **Icons carry meaning alongside color.** Category color-coding (pattern #6 above) should be paired with a simple icon per category (plate/fork for Restaurants, cart for Groceries, etc.) — color alone isn't accessible to everyone, and icons help users who read numbers/text less fluently.
- **Keep the AI narrative short on purpose.** 2–4 sentences, not a report. For this audience, cognitive load is a bigger risk than incompleteness.
- **Frame benchmark comparisons encouragingly, not as a grade.** Matches the tone the Financial Consumer Agency of Canada itself uses in its own public budgeting tool — informational and supportive rather than pass/fail (see §9 for the actual FCAC reference).
- **Design for a "someone else is walking me through this" context, not just self-serve.** Given the secondary persona (financial educator), a layout that reads clearly over someone's shoulder or on a shared screen — and a printable visual plan (FR-7) — matters as much as solo usability.
- **Flag bilingual/multilingual support as a real open question, not an afterthought.** Canada's financial literacy programming often serves newcomers and non-native English speakers; French (at minimum) is worth scoping even if it lands in v2 (see Open Questions).

---

## 8. Edge Cases & Validation Rules

*(Carried from v1: negative Remaining Balance / overspend display, empty state, editing past months, partial-year annual handling, multi-device last-write-wins, and the "Savings" parent/subcategory naming collision — all still apply unchanged.)*

**New for this version:**
- **Low-confidence spreadsheet categorization:** rows the AI can't classify with reasonable confidence must be surfaced for user confirmation, never silently assigned — a wrong auto-categorization actively undermines trust with a literacy-focused audience more than it would with a power user.
- **AI narrative failure/timeout:** the app must degrade gracefully — chart and numbers always render; only the narrative text/tip is skipped, with a neutral fallback state, not an error message.
- **Benchmark data gaps:** if no recommended range exists for a category, omit that comparison rather than showing a broken or misleading one.
- **Switching literacy level mid-session:** must not lose entered data; narrative simply regenerates for the new tier.

---

## 9. Technical Recommendations

Matches the client's stated skill set directly (TypeScript, spreadsheet processing, OpenAI API, image processing, UI dev), and keeps scope aligned with the client's own "Easy–Medium" complexity rating:

- **Frontend:** React + TypeScript, Tailwind for styling.
- **Charting:** Recharts or Chart.js for the nested donut and trend views.
- **AI (OpenAI API):** use narrowly-scoped, structured-output calls rather than an open-ended chat interface — one call type for narrative generation, one for spreadsheet-row categorization. Structured/JSON output keeps this reliable and keeps costs and failure modes predictable, which matters more than flexibility at this scope.
- **Spreadsheet processing:** a parser like SheetJS against a defined CSV/XLSX template (date, description, amount) — general bank-statement parsing is a much larger problem than this scope calls for; start with a template the client can distribute, not universal format detection.
- **"Visual plan" image export:** render the existing chart + AI narrative to a static image/PDF client-side (canvas/SVG export) or server-side — this reads as the more reliable interpretation of "Image Processing" than generative image AI, but it's worth confirming directly with the client (Open Question #5).
- **Benchmark data source:** the real Government of Canada resource here is the **Financial Consumer Agency of Canada's Budget Planner** (a live tool at canada.ca) — it compares a user's budget to people in similar situations and provides guideline ranges per category rather than publishing one single fixed universal ratio. The commonly-cited "50/30/20" split is a popular guideline used across many finance sites, but it did not originate from and isn't an official FCAC-published ratio — worth not hardcoding it as if it were "the" government number without confirming the intended source with the client (Open Question #4).
- **Backend/Auth/DB:** Supabase (Postgres + Auth + Row-Level Security) — still fits given per-user cloud data.
- **Hosting:** Vercel/Netlify.

---

## 10. Success Metrics

*(Carried from v1: completion rate on first session, month-over-month retention, average consecutive months logged.)*

**New for Milestones 1–2:**
- % of users who engage with the AI narrative (expand/read it, not just view the chart).
- % of users who use the spreadsheet upload path vs. manual entry.
- % of users who view/use the benchmark comparison.
- Distribution of literacy-tier selection (Simple vs. Standard) — validates whether the tiering is actually being used as intended.
- % of exported visual plans downloaded/shared — signals whether the offline/printable use case is landing with the secondary persona (educators).

---

## 11. MVP Prioritization

Reframed around the client's own two milestones rather than a generic MoSCoW list:

**Milestone 1 (must-have):**
- Manual entry + spreadsheet upload, full 15-category taxonomy
- Live nested donut chart + Remaining Balance
- AI-generated plain-language monthly narrative
- Exportable visual plan (image/PDF)
- Graceful degradation if the AI call fails

**Milestone 2 (must-have):**
- Literacy/presentation-level setting (Simple/Standard)
- Government-of-Canada-aligned benchmark overlay per category
- Literacy-adapted AI tips/tone

**Should have (fast follow, confirm scope with client):**
- Annual Snapshot page
- "Copy last month" quick-start for manual entry
- CSV export of raw data

**Could have (v2+):**
- Multilingual support (French at minimum)
- Read-aloud/audio accessibility option
- Contribution-room tracking for TFSA/RRSP/FHSA
- Shareable year-in-review recap

**Won't have (v1):**
- Bank-account linking, shared/family budgets, native mobile app, multi-currency conversion engine

---

## 12. Open Questions

1. **Naming collision:** rename the "Savings" subcategory (e.g., to "General Savings") to avoid clashing with its parent "Savings" category.
2. **Is the Annual Snapshot in scope?** It's not named in the client's two stated milestones — confirm whether it's expected as a Milestone 3 or was a reasonable addition on top of the brief.
3. **What does "limited literacy" mean here** — reading/language literacy, financial-jargon literacy, numeracy, or some mix? This changes whether read-aloud/translation is actually needed versus just plainer English copy.
4. **What exactly counts as the "recommended budgeting ratio" from the Government of Canada?** There isn't one single official fixed ratio published by a federal source — the closest real match is FCAC's Budget Planner, which benchmarks against comparable Canadians rather than a universal split. Worth confirming directly with the client whether they have a specific published benchmark in mind (e.g., a partnership data source) or want the FCAC-style comparative approach.
5. **Does "Image Processing" mean generating outbound visual plan images (assumed here), or processing inbound images** (e.g., photographed receipts/statements as an entry method)? Meaningfully different scope — worth a direct confirmation.
6. **Foreign Currency Transactions:** does this mean all foreign spending, or specifically travel/cross-border purchases distinct from the "Travel" category?
7. **Multiple income sources:** single field, or itemized (salary + side income)?

---

*v1 (manual-entry-only, no AI layer) is preserved separately for reference — this version supersedes it based on the uploaded client brief.*
