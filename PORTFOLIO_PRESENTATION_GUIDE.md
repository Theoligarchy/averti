# Averti: Professional Portfolio Presentation Guide

**Target Role Types:** Business Analyst, Product Operations, Strategy & Operations, Civic Tech / Policy Research Internships  
**Student Profile:** Bachelor of Business Administration (BBA)  
**Status:** Independent Prototype Showcase (Honest, Evidence-Grounded Portfolio Artifact)

---

## 1. Resume Project Descriptions

Use either of these two formats depending on the space available on your resume:

### Option A: 3-Bullet Format (Recommended for standard 1-page resumes)
* **Averti — Independent Public-Safety Information Platform (React, TypeScript, WebGIS)**
  * Conceptualized and built an editorial civic intelligence prototype standardizing National Crime Records Bureau (NCRB 2024) statistics across all 36 Indian States and Union Territories.
  * Designed an ethical data framework normalizing raw FIR counts into **Registered Cases per 100,000 Population**, mitigating reporting-bias distortion and state population disparities.
  * Architected a 6-pillar information architecture integrating verified emergency infrastructure (112 ERSS, 1930 Cyber Fraud Helpline) and public notice provenance workflows.

### Option B: 2-Sentence Concise Summary (For LinkedIn / Project Overview)
> **Averti (Civic Intelligence Prototype):** An independent public-safety information platform standardizing official NCRB 2024 crime returns across all 36 Indian States/UTs. Built with React, TypeScript, and Leaflet WebGIS to translate complex administrative compendiums into population-normalized metrics, verified emergency directories, and transparent notice workflows.

---

## 2. Portfolio Case-Study Outline

Structure your online portfolio page (Notion, PDF deck, or personal website) using these five sections:

```
+-----------------------------------------------------------------------------------+
| 1. CONTEXT & PROBLEM                                                              |
|    - Administrative crime data in India is published in massive annual PDFs       |
|      (NCRB's 1,500-page reports), creating severe public accessibility friction. |
|    - Raw FIR counts mislead citizens: populous states or areas with proactive     |
|      e-FIR logging appear artificially dangerous due to lack of normalization.    |
|    - Emergency contacts for specialized threats (e.g. 1930 cyber fraud) remain    |
|      scattered during high-stress preparatory scenarios.                          |
+-----------------------------------------------------------------------------------+
| 2. PRODUCT & STRATEGIC DECISIONS                                                  |
|    - Normalized Metric: Standardized to Registered Cases per 1 Lakh Population    |
|      using census estimates, accompanied by national quintile distribution bands. |
|    - Ethical Safeguards: Added explicit callouts stating that high registration   |
|      rates often reflect accessible police recording rather than crime incidence. |
|    - Directional Routing: Designed platform as an authoritative funnel toward     |
|      official channels (Call 112, TrackChild, Cybercrime portal) rather than      |
|      attempting to replicate emergency dispatch.                                  |
|    - Zero-Pill Design: Implemented calm, high-contrast editorial typography and    |
|      consistent card dimensions, avoiding sensationalist "danger" heatmaps.       |
+-----------------------------------------------------------------------------------+
| 3. PROTOTYPE IMPLEMENTATION                                                       |
|    - Built an interactive WebGIS choropleth map using Leaflet Canvas rendering.   |
|    - Developed a responsive 3-column desktop layout switching to structured tabs  |
|      and sticky bottom navigation on mobile devices.                              |
|    - Embedded verified NCRB 2024 returns, 3-year historical trends, and official |
|      helpline directories.                                                        |
|    - Tagged all sample notices with explicit "DEMO — fictional example" badges.  |
+-----------------------------------------------------------------------------------+
| 4. HONEST LIMITATIONS                                                             |
|    - Annual Reporting Lag: NCRB reports reflect completed calendar years with an  |
|      unavoidable 12–18 month publication latency; not a live dispatch tool.       |
|    - District Approximations: District crime figures are maintained by local      |
|      police commissionerates; UI transparently disclaims state-aggregate basis.   |
|    - Synthetic Notice Records: Prototype missing-person records are illustrative  |
|      samples because no real-time national public API currently exists.           |
+-----------------------------------------------------------------------------------+
| 5. NEXT STRATEGIC STEPS                                                           |
|    - Conduct qualitative usability sessions with policy students and researchers. |
|    - Implement an automated weekly link-health checker for government URLs.       |
|    - Explore multi-lingual interfaces (Hindi, Odia, Tamil) for broader access.    |
+-----------------------------------------------------------------------------------+
```

---

## 3. Exact Screenshots to Capture from the Working Application

Capture these 6 clean, high-resolution screenshots directly from your browser:

1. **Overview Section (Executive Landing):**
   * *URL / State:* `#/overview`
   * *Visual Focus:* The hero banner, the 4 quantitative baseline metrics (All-India Rate: 422.2, 36 States/UTs Coverage), and the 6 module cards.
2. **National WebGIS Choropleth Map:**
   * *URL / State:* `#/map` (or `#/atlas` in `gis` view mode)
   * *Visual Focus:* The entire map of India rendered with clean grayscale basemap, quintile legend at bottom-left ($Q_1$ to $Q_5$), and the top state search bar.
3. **Selected State Deep-Dive Card (e.g., Maharashtra or Odisha):**
   * *URL / State:* `#/state/Maharashtra`
   * *Visual Focus:* Right-hand `StateSummaryCard` displaying registered cases (524,960), rate per 1L (416.7), category composition stacked bar, 3-year trajectory (2022–2024), and the mandatory *Statistical Caveat* box.
4. **Public Notices Registry & Detail Modal:**
   * *URL / State:* Click on notice `OD-MP-2026-0842` (`Dilip Kumar Sahu`)
   * *Visual Focus:* The opened `NoticeDetailModal` showing the amber `EXAMPLE NOTICE` banner, issuing authority provenance, and the prominent *"Open the official notice"* button.
5. **Verified Emergency Helplines Directory:**
   * *URL / State:* `#/emergency`
   * *Visual Focus:* The large red `Call 112` primary action card, followed by the verified directory cards for 1930 (Cyber Fraud), 1098 (Childline), and 181 (Women Helpline).
6. **Mobile Viewport (Responsive View):**
   * *Visual Focus:* Open Chrome DevTools in iPhone/Pixel dimensions ($390 \times 844$px). Capture the clean mobile segmented switcher (`Map & Stats` | `Missing Persons` | `Wanted`) and the sticky bottom navigation bar.

---

## 4. 60–90 Second Demonstration Script

*(Read at a calm, professional pace. Estimated timing: 75 seconds.)*

> "This is **Averti**, an independent civic public-safety prototype I designed to solve a major information-accessibility problem in India.
> 
> Official crime statistics are published annually by the National Crime Records Bureau in massive, dense compendiums. The public and media frequently misinterpret raw FIR numbers, assuming that states with higher case volumes are inherently more dangerous. In reality, higher registration often reflects accessible e-FIR systems and proactive policing.
> 
> To address this, Averti standardizes data across all 36 States and Union Territories into a population-normalized metric: **Registered Cases per 100,000 Population**, mapped across national quintiles.
> 
> When I click on a state—like Maharashtra—the interface dynamically updates to display official NCRB 2024 figures, a 3-year reporting trajectory, and a category breakdown, all accompanied by explicit statutory caveats.
> 
> Alongside the statistics, I designed a public notices registry with clear provenance markers. Because external police APIs do not exist, all sample records are explicitly labeled as demonstration examples, with direct outbound links to official databases like TrackChild and the CBI.
> 
> Finally, the platform acts as an intuitive funnel toward verified emergency services—prioritizing direct access to India's single 112 emergency line and the 1930 Cyber Fraud Helpline.
> 
> As a business and strategy student, this project allowed me to practice data normalization, ethical UX constraints, and public-interest product design without making unverified claims."

---

## 5. Technologies Confirmed from Actual Project Files

These are the exact technologies and packages confirmed from `package.json`, `server.ts`, and the codebase:

* **Frontend Framework:** React 19 (`react`, `react-dom`) with TypeScript.
* **Build System & Dev Server:** Vite 8 (`vite`, `@vitejs/plugin-react`).
* **Styling & Design System:** Tailwind CSS v4 (`@tailwindcss/vite`, `tailwindcss`) with Source Serif 4 & Public Sans typography.
* **Cartography & WebGIS:** Leaflet (`leaflet` 1.9), React-Leaflet (`react-leaflet` 5.0) utilizing Canvas vector rendering, TopoJSON (`topojson-client`), and Survey of India boundary GeoJSON.
* **Icons & Visual Components:** Lucide React (`lucide-react`) for restrained, zero-pill UI icons.
* **Backend Runtime:** Node.js with Express 4 (`express`) and TypeScript execution via `tsx` (`server.ts`).
* **Data Sources (Embedded):** Official National Crime Records Bureau (NCRB) *Crime in India 2024* (Tables 1A.1 & 1A.3) and official Ministry of Home Affairs ERSS 112 directories.
* **Server-Side AI Proxy:** `@google/genai` TypeScript SDK (isolated strictly in `server.ts` with automated deterministic fallback to prevent quota or rate-limit breakages).

---

## 6. Three Interview Questions & Honest Answer Frameworks

### Q1: "Why did you build this as an analytical atlas rather than a real-time crime alert app like Citizen?"
* **Answer Framework:**
  * **Acknowledge the Trade-off:** "Real-time crowdsourced crime apps drive high engagement, but they present massive ethical, operational, and legal hazards in India—notably rumor spreading, mob vigilantism, and defamation."
  * **State the Product Thesis:** "I deliberately chose an institutional, research-driven approach. By focusing on verified annual government data, population normalization, and clear emergency routing, Averti prioritizes trust, statistical validity, and citizen utility over sensationalism."

### Q2: "How did you ensure the accuracy of the crime statistics in the project?"
* **Answer Framework:**
  * **Cite the Source:** "All state-level statistics in Averti come directly from the latest National Crime Records Bureau publication, *Crime in India 2024*, specifically Tables 1A.1 and 1A.3."
  * **Explain the Normalization Formula:** "Instead of using raw case totals, I normalized the data using Census-projected populations: $(\text{Registered FIRs} \div \text{Population}) \times 100,000$."
  * **Highlight Contextual Safeguards:** "I added explicit editorial caveats explaining that registered crime rates reflect police recording practices and citizen reporting trust, preventing users from treating administrative rates as a crude proxy for personal danger."

### Q3: "What were the biggest limitations you encountered while developing this prototype?"
* **Answer Framework:**
  * **Data Latency:** "NCRB publications have an inherent 12-to-18 month lag because administrative verification takes time. I handled this by clearly labeling the reporting year throughout the UI rather than pretending the data is real-time."
  * **Lack of Open APIs:** "Indian law enforcement agencies do not offer open public APIs for missing or wanted circulars. Rather than scraping unverified data, I created structured demonstration records clearly labeled as 'DEMO' and directed users to official portals like TrackChild."
  * **District-Level Granularity:** "While district boundaries are rendered authentically on the map, detailed district crime tables are maintained independently by state headquarters, so the UI honestly clarifies that district views reflect state aggregates."

---

## 7. Checklist of Claims to Strictly Avoid

Review this checklist before every interview or portfolio submission:

- [ ] **Do NOT claim police partnerships:** Never state or imply that Averti has an official partnership, memorandum of understanding (MoU), or endorsement from state police forces or the Ministry of Home Affairs.
- [ ] **Do NOT claim live government API integration:** Averti uses curated, verified static datasets from published reports. Never claim you have "real-time police database feeds" or "live CCTNS synchronization."
- [ ] **Do NOT claim the map predicts danger or crime:** Emphasize that Averti displays historical registered cases per 100,000 population, not crime prediction, risk scores, or safety heatmaps.
- [ ] **Do NOT claim live emergency dispatch:** Never state that Averti can send help, dispatch patrol vans, or trace emergency phone locations. It routes users to native phone calls to `112`.
- [ ] **Do NOT claim unmeasured user adoption or metrics:** Never invent numbers like "used by 10,000 citizens" or "reduced response times by 30%." Frame it honestly as an *independent functional prototype*.
- [ ] **Do NOT claim the demo notices are real active cases:** Always acknowledge that the individual notice cards are synthetic demonstration prototypes created to showcase information architecture and rights-respecting workflows.
