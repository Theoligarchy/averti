# Product Case Study: Averti (Civic Public-Safety Atlas for India)

**Document Type:** Product Strategy, Operations & Business Analysis Case Study  
**Author / Evaluator:** Product Strategy & Operations Reviewer  
**Subject Product:** Averti — Independent Public-Safety Information Prototype  
**Baseline Dataset:** National Crime Records Bureau (NCRB) *Crime in India 2024*  
**Date:** March 2026  
**Status:** Independent Prototype Showcase (Portfolio Artifact)

---

## Executive Summary

Averti is an independent civic intelligence prototype designed to make India’s public safety statistics, emergency infrastructure, and statutory notices structured, population-normalized, and transparently verifiable. 

Rather than functioning as a police dashboard, emergency dispatcher, or predictive surveillance tool, Averti acts as an **editorial civic atlas**. It bridges the gap between dense administrative compendiums (e.g., the 1,500-page annual NCRB reports) and the practical information needs of citizens, researchers, and policy analysts.

This case study evaluates the prototype from a **Product Operations, Business Analysis, and Strategic Governance** perspective, distinguishing verified technical implementation from unvalidated product hypotheses.

---

## 1. Problem Hypothesis

Users seeking verified civic safety data in India face four compounding structural bottlenecks:

1. **Severe Information Fragmentation:**
   Public-safety intelligence is dispersed across 36 State and Union Territory police commissionerates, central investigative agencies (CBI, NIA), ministerial portals (MHA, MWCD), and state gazettes. There is no unified, neutral repository where a citizen or researcher can evaluate verified administrative data alongside official emergency infrastructure.
2. **The "Registration Distortion" Fallacy:**
   Administrative crime data in India is routinely misinterpreted by both media and the public. Raw case counts heavily distort reality: high-population states appear excessively dangerous, while regions with streamlined e-FIR registration and proactive police logging are penalized compared to areas with severe under-reporting. Without systematic **population normalization** and explicit reporting caveats, administrative data creates unwarranted panic or false complacency.
3. **Emergency Routing Friction in Non-Standard Scenarios:**
   While India has unified national response under **112 (ERSS)**, awareness of specialized sub-channels—such as the **1930 National Cyber Financial Fraud Helpline** (crucial for freezing money in the "golden hour") or the **1098 Childline**—remains uneven. During high-stress or preparatory moments, citizens struggle to locate verified direct-dial contacts.
4. **Information Decay and Privacy Risks in Public Lookouts:**
   Missing-person bulletins and wanted notices published in PDFs or local newspaper circulars often persist indefinitely on informal social media forums long after a missing child is recovered or criminal charges are quashed by a High Court. There is a lack of structured, verified civic tools with strict depublication protocols.

*Hypothesis Classification:* **Unvalidated Product Hypothesis.** Derived from observation of Indian administrative publishing practices; requires targeted qualitative field validation.

---

## 2. Target User Segments

*Methodological Note:* **No user interviews, survey panels, or ethnographic studies have been conducted to date.** The segments below represent plausible behavioral archetypes formulated for prototype testing.

```
+-----------------------------------------------------------------------------------+
|                           PLAUSIBLE USER SEGMENTS                                  |
+-----------------------------------------------------------------------------------+
| 1. Civic Researchers & Data Journalists                                           |
|    - Need: Population-standardized, citational baseline rates (NCRB Tables 1A.1).|
|    - Pain Point: Manually parsing 1,000+ page government PDFs and Excel tables.   |
+-----------------------------------------------------------------------------------+
| 2. Relocating Professionals, Students & Solo Commuters                             |
|    - Need: Quick orientation on state emergency infrastructure & local helplines. |
|    - Pain Point: Navigating unfamiliar state police portals and regional gazettes.|
+-----------------------------------------------------------------------------------+
| 3. Civil Society Organizations (CSOs) & Legal Aid Workers                         |
|    - Need: Tracking procedural compliance (SOPs on missing minors, BNS transition)|
|    - Pain Point: Inconsistent gazette indexing and lack of transparent audit trails|
+-----------------------------------------------------------------------------------+
| 4. General Citizens in Non-Emergency Advisory Contexts                            |
|    - Need: Verifying emerging threats (e.g., MHA advisories on Digital Arrests).  |
|    - Pain Point: Exposure to unverified WhatsApp forwards and panic-inducing news.|
+-----------------------------------------------------------------------------------+
```

---

## 3. Value Proposition

Averti does **not** replace police forces, dispatch first responders, or offer real-time personal safety surveillance. Its defined value proposition is:

> **"A restrained, population-normalized civic intelligence atlas that translates official administrative crime returns and statutory public notices into transparent, verifiable public knowledge."**

### Core Pillars of Value:
1. **Ethical Statistical Normalization:** Every metric is standardized to **Registered Cases per 1 Lakh (100,000) Population**, contextualized with national quintile distribution ($Q_1$ to $Q_5$) and prominent statutory disclaimers explaining that high registration frequently reflects administrative accessibility rather than heightened danger.
2. **Zero Hallucination / Provenance Tracking:** Every datapoint, news report, and statutory notice is tied to an explicit issuing authority, official publication year (NCRB 2024), and outbound verification link.
3. **Clean Directional Routing:** The platform acts as a funnel toward official government systems (e.g., initiating direct phone calls to 112, linking to `trackchild.gov.in`, or directing financial victims to `cybercrime.gov.in`).

---

## 4. Competitor & Alternative Analysis

```
+------------------------------------+--------------------------+------------------------------+------------------------------------+
| Solution / Alternative             | Status / Type            | Primary Strength             | Operational / UX Limitation        |
+------------------------------------+--------------------------+------------------------------+------------------------------------+
| NCRB Official Portal               | Real / Official          | Supreme statutory authority; | Dense static PDFs; delayed release |
| (ncrb.gov.in)                      | Central Gov              | primary source for all courts| cycles; poor mobile readability.   |
+------------------------------------+--------------------------+------------------------------+------------------------------------+
| TrackChild & Khoya-Paya            | Real / Official          | Centralized legal repository | Siloed strictly to minors; clunky  |
| (trackchild.gov.in)                | MWCD / NIC               | for child welfare committees | form UX; no state macro analytics. |
+------------------------------------+--------------------------+------------------------------+------------------------------------+
| State Police Web Portals           | Real / Official          | Direct local commissionerate | 36 distinct interfaces; variable   |
| (e.g., Delhi, Odisha, Maharashtra) | State Gov                | jurisdiction; e-FIR intake   | uptime; non-standardized search.   |
+------------------------------------+--------------------------+------------------------------+------------------------------------+
| ERSS 112 Live Infrastructure       | Real / Official          | Live dispatch, CAD telemetry | Emergency-only channel; not        |
| (112.gov.in)                       | MHA / CDAC               | and rapid patrol routing     | designed for research or inquiry.  |
+------------------------------------+--------------------------+------------------------------+------------------------------------+
| Commercial Hyperlocal News Apps    | Real / Commercial        | High virality; fast crowdsourced| Sensation-driven; high rumour/spam |
| (e.g., Public, Inshorts, Twitter)  | Private Sector           | neighborhood updates         | rate; lacks data normalization.    |
+------------------------------------+--------------------------+------------------------------+------------------------------------+
| Averti (Proposed Model)            | Evaluated Prototype      | Population-normalized atlas; | No live dispatch; dependent on     |
|                                    | Civic Tech               | multi-tier verification UX   | official government data cadence.  |
+------------------------------------+--------------------------+------------------------------+------------------------------------+
```

*Note for Further Research:* Commercial private neighborhood safety apps (analogous to US Citizen/Nextdoor) have faced significant legal and ethical scrutiny in India regarding vigilante profiling and defamation. Averti deliberately avoids crowdsourced user-generated crime pinboards.

---

## 5. MVP Feature Prioritisation Matrix

Using a composite framework of **Impact, Technical Feasibility, Data Reliability, and Privacy Risk**:

```
+-----------------------------------------------------------------------------------------------------------------+
| IMPACT & RELIABILITY HIGH                                                                                       |
|                                                                                                                 |
| [P0 - MUST HAVE / LAUNCH ESSENTIAL]                     [P1 - SHOULD HAVE / NEAR TERM]                          |
| - Verified NCRB 2024 State Choropleth (per 1L pop)     - Verified District GeoJSON boundary alignment           |
| - Single-tap 112 ERSS & 1930 Helpline Dialers          - Exportable Open Data Tables (CSV / GeoJSON)            |
| - Curated Journalistic Insights with Source URLs       - Dual-Language Support (English + Hindi)                |
| - Fast Takedown / Correction Intake Form               - Direct TrackChild deep-linking integration             |
| - Mandatory Non-Affiliation Statutory Banners          - Offline Helpline PWA caching                           |
+-----------------------------------------------------------------------------------------------------------------+
| IMPACT OR FEASIBILITY LOW / HIGH PRIVACY RISK                                                                   |
|                                                                                                                 |
| [P2 - COULD HAVE / EXPERIMENTAL]                        [P3 - OUT OF SCOPE / WON'T HAVE (ETHICAL GUARDRAILS)]   |
| - Automated Scraping of State Police Circulars         - Crowdsourced "Live Crime Pinning" (Vigilantism risk)  |
| - Audio Read-out of Safety Advisories                  - Predictive "Danger Heatmaps" (Algorithmic bias)        |
| - District Police Triage Back-office Integration       - Live GPS Phone Surveillance of Users                   |
| - SMS Receipt Generation for Citizen Tips              - Monetized Paywalls on Emergency Numbers                |
+-----------------------------------------------------------------------------------------------------------------+
```

---

## 6. Operational Workflow (Information Lifecycle)

To transition from prototype to production, the platform requires an accountable six-stage operational pipeline:

```
[1. INGESTION]  --> Official Gazette RSS, NCRB Annual Tables, PIB Releases, Police Circulars
      |
[2. AUDIT]      --> Dual-Review Checklist:
                    a. Is the issuing authority an accredited public agency?
                    b. Is there a unique FIR or statutory reference number?
                    c. Does publishing comply with Juvenile Justice Act Section 74?
      |
[3. NORMALISE]  --> Convert raw cases into per-100,000 population metric using Census projections.
      |
[4. PUBLISH]    --> Publish with explicit provenance tag:
                    "Official Notice" vs "DEMO Example" + Link to original source.
      |
[5. MONITOR]    --> Automated weekly HTTP link-rot checker on all source URLs.
      |
[6. EXPEDITE]   --> 24-Hour Right-to-be-Forgotten / Correction Workflow:
                    Immediate removal upon proof of trace, reconciliation, or quashed charges.
```

---

## 7. Success Metrics & Performance Indicators

*Constraint Check:* **No baseline numbers exist because the platform has not undergone public deployment.** The following metrics are recommended for pilot telemetry:

### 1. User Utility & Trust Metrics
- **Outbound Authority Click-Through Rate (CTR):** Percentage of detail views that click *"Open official notice"* or *"Visit official portal"* (Target: $> 25\%$, indicating users utilize Averti as a credible index).
- **Task Completion Time on Emergency Lookup:** Time elapsed from landing to clicking *Call 112* or copying the *1930 Cyber Fraud Helpline* (Target: $< 15$ seconds).
- **Caveat Exposure Rate:** Percentage of users who view the population normalization disclaimer before viewing state rankings (Target: $100\%$, enforced by card layout).

### 2. Operational & Data Quality Metrics
- **Source Link Health (Broken-Link Rate):** Percentage of indexed government URLs returning HTTP 404/500 (Target: $< 2.0\%$).
- **Correction Request Turnaround Time (TAT):** Elapsed hours between a citizen/police takedown submission via `CorrectionsModal` and editorial resolution (Target: $< 24$ hours).
- **Data Latency Delta:** Calendar days elapsed between official NCRB public release and platform ingestion (Target: $< 14$ days).

---

## 8. Strategic Risks and Mitigation Matrix

```
+--------------------------+------------------------------------+-----------------------------------------------------+
| Risk Domain              | Manifestation Scenario             | Platform Mitigation Strategy                        |
+--------------------------+------------------------------------+-----------------------------------------------------+
| 1. Data Access & Latency | NCRB releases reports annually with| Display explicit reporting year tags (e.g., "NCRB  |
|                          | a 12-to-18 month lag.              | 2024 Return") and historical 3-year trajectories.   |
+--------------------------+------------------------------------+-----------------------------------------------------+
| 2. Legal / Defamation    | A wanted notice remains active on  | Embed mandatory legal caveat: "Request for info,    |
|                          | Averti after court proceedings are | not a finding of guilt". Maintain active expedited  |
|                          | quashed or subject is exonerated.  | takedown modal (`CorrectionsModal.tsx`).            |
+--------------------------+------------------------------------+-----------------------------------------------------+
| 3. False Affiliation     | Citizen assumes Averti can dispatch| Multi-tier disclaimers: Top header banner, card-    |
|    Expectations          | emergency police units.            | level warnings, and prominent red "Call 112" CTA.   |
+--------------------------+------------------------------------+-----------------------------------------------------+
| 4. Geographic Stigma     | High-registration states (e.g.,    | Enforce population normalization (per 1L pop) and   |
|                          | Kerala, Delhi) labeled "unsafe".   | editorial callout explaining reporting culture bias.|
+--------------------------+------------------------------------+-----------------------------------------------------+
| 5. Child Privacy Breach  | Accidental publication of minor    | Hardcoded protocol: Minor details restricted to     |
|                          | identities violating JJ Act.       | official TrackChild redirect links only.            |
+--------------------------+------------------------------------+-----------------------------------------------------+
```

---

## 9. Business & Sustainability Model (Hypotheses)

*Governance Constraint:* Public-safety platforms lose moral authority and public trust if monetized via sensationalist advertising, paywalled emergency contacts, or data harvesting.

```
+-----------------------------------------------------------------------------------+
| PLAUSIBLE SUSTAINABILITY HYPOTHESES                                               |
+-----------------------------------------------------------------------------------+
| Model A: Academic & Civic Technology Research Grants                              |
| - Funding from non-partisan governance bodies, digital rights foundations,        |
|   or university public policy centers (e.g., CPR, Dvara, NLU Research Hubs).     |
+-----------------------------------------------------------------------------------+
| Model B: Pro-Bono Open-Source Public Infrastructure                               |
| - Hosted as an open-source civic utility under GitHub / Open City India, with     |
|   compute costs sponsored by public cloud philanthropic credits.                  |
+-----------------------------------------------------------------------------------+
| Model C: B2B / B2G Analytical Research Exports                                    |
| - Providing structured clean datasets, API connectors, and policy brief           |
|   compilations for think-tanks, compliance auditors, and risk consultancies.     |
+-----------------------------------------------------------------------------------+
```

---

## 10. Recommended Next Validation Experiments

Three cost-effective experiments to validate core demand hypotheses before writing production ingestion infrastructure:

### Experiment 1: The "Research Workflow" Usability Test (Qualitative)
- **Hypothesis:** Academic researchers and policy analysts save $> 50\%$ time accessing standardized crime statistics via Averti compared to parsing NCRB PDF tables.
- **Method:** Recruit 6 graduate students or junior policy analysts. Give them 3 tasks: (1) Compare violent crime rates between Odisha and Maharashtra, (2) Identify the cyber fraud reporting helpline, (3) Locate standard operating procedures on missing children.
- **Budget:** Zero INR / 6 hours of user observation.
- **Validation Threshold:** 5 of 6 users complete tasks without disorientation and cite population-normalized rates accurately.

### Experiment 2: The Emergency Direct-Dial Friction Test
- **Hypothesis:** Citizens looking up safety information on mobile click the 112 or 1930 action within 15 seconds when presented with restrained, high-contrast visual hierarchy.
- **Method:** Run unmoderated click-flow testing with 20 diverse smartphone users across Delhi NCR and Tier-2 cities on the mobile web build.
- **Budget:** Zero INR / remote link distribution.
- **Validation Threshold:** Average time to locate verified helpline $< 12$ seconds; zero accidental clicks on third-party links.

### Experiment 3: Mock Takedown Protocol Legal Audit
- **Hypothesis:** Averti's 24-hour depublication protocol and non-guilt declaration satisfy Indian digital intermediary guidelines and legal counsel standards.
- **Method:** Present `CorrectionsModal.tsx`, the terms of service, and notice provenance schema to 2 practicing High Court cyber-law advocates or legal aid clinics for structured review.
- **Budget:** Pro-bono academic consultation.
- **Validation Threshold:** Written affirmation that notice metadata and takedown mechanisms comply with the Bharatiya Nagarik Suraksha Sanhita (BNSS) and intermediary due diligence rules.

---

*Case Study Documentation verified against live codebase.*  
*Artifact stored in repository for evaluation by hiring teams in Business Analysis, Product Operations, and Strategy.*
