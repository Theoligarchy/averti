# Averti | Citizen Safety Platform

**made by Priyash Priyal Jena**

Averti is a proposed citizen-facing safety platform designed to make public safety information more accessible and help people explore safety-related information and resources.

## Live Demo

[![Open Averti](https://img.shields.io/badge/Open_Live_Platform-Averti_Citizen_Safety-0F766E?style=for-the-badge&logo=google-chrome&logoColor=white)](https://ais-pre-bvn4xlcdbazswjey4z63wk-79946636155.asia-east1.run.app)

[Open the Averti website](https://ais-pre-bvn4xlcdbazswjey4z63wk-79946636155.asia-east1.run.app)  
*Alternative Development Mirror: [https://ais-dev-bvn4xlcdbazswjey4z63wk-79946636155.asia-east1.run.app](https://ais-dev-bvn4xlcdbazswjey4z63wk-79946636155.asia-east1.run.app)*

---

## Problem

People can struggle to find accessible, location-specific safety information and understand available support resources. 

Public safety data across India is often distributed across dense annual static PDF statistical compendiums, fragmented departmental circulars, disparate state police portals, and isolated emergency helpline directories. As a result:
- Citizens lack an intuitive, visual medium to understand jurisdictional safety infrastructure and verified emergency channels in their specific district or city.
- Raw crime statistics are frequently misunderstood or sensationalized, failing to distinguish between genuine crime incidence and proactive, citizen-friendly police FIR registration practices.
- Critical time-sensitive notices—such as official missing persons bulletins, vulnerable runaway alerts, and stolen property notices—struggle for coordinated, location-based public visibility.

---

## Proposed Solution

Averti addresses these challenges through a unified, restrained, and editorial civic public safety platform:

- **Safety information and map interface**:
  - Interactive WebGIS Atlas with dual-layer cartography (Terrain Canvas, Realistic Satellite Imagery, and OpenStreetMap presets with high-contrast label overlays).
  - 5-Quintile choropleth classification and continuous density gradients for state-level and district-level crime registration rates per 1 lakh population.
  - Interactive multi-layer controller toggling geocoded police stations, active vigilance corridors (crime hotspots with perimeter buffers), and 24x7 trauma and help centers.

- **Location-based exploration**:
  - Dynamic state and district search autocomplete with instantaneous boundary fly-to and drill-down (e.g. Pune, Bengaluru Urban, Gurugram, Varanasi, New Delhi, Chennai, Mumbai, Kolkata).
  - Side-by-side state comparison using interactive Recharts bar charts across monthly registration trends.
  - **District Pulse**: A real-time, geolocated public safety feed providing hyper-local alerts, transit notices, and night patrol checkpoints.

- **Safety awareness and support resources**:
  - Plain-language statistical explanations powered by Google Gemini 3.8 Flash with Google Search Grounding to verify real-time advisories, commissionerate orders, and cyber safety warnings.
  - Centralized helpline directory with one-tap dialing for unified Dial 112 ERSS, National Cyber Helpline 1930, Women Helpline 181/1091, Childline 1098, and Senior Helpline 14567.

- **Missing-person information concept**:
  - Filterable directory of official missing person, vulnerable senior, and youth notices.
  - Location and jurisdiction-specific case files with physical descriptions, last-seen markers, and direct official police station reporting contact points (without storing citizen tips).

- **SOS interface concept**:
  - Quick-access **Emergency 112** persistent banner and Trusted Circle SOS simulator demonstrating coordinate broadcasting, SMS escalation, and localized police station routing.

---

## Built With

- **React 19** (`react`, `react-dom`): Modern functional component architecture with hooks and concurrent rendering.
- **Vite 8** (`vite`, `@vitejs/plugin-react`): High-performance build tool and local development server.
- **TypeScript** (`typescript`): Static type-safety across geospatial data types, crime schemas, and UI state models.
- **Tailwind CSS 4** (`tailwindcss`, `@tailwindcss/vite`): Modern utility-first styling adhering to Averti's restrained editorial design system (`#F6F8F7` canvas, `#0F766E` primary teal, `#0B1F33` high-contrast ink).
- **Leaflet & React-Leaflet** (`leaflet`, `react-leaflet`, `@types/leaflet`): High-performance mobile-friendly WebGIS map rendering, custom SVG DivIcons, circle radius geometries, and interactive popups.
- **Recharts 3** (`recharts`): Responsive data visualization powering the 12-Month Incident Bar Chart, side-by-side two-state comparative analysis, and 6-month district trend trajectories.
- **D3.js** (`d3`): Exact curve calculations, scales, and geo-projection utilities.
- **Lucide React** (`lucide-react`): Crisp, consistent civic, cartographic, and public safety iconography.
- **Google GenAI SDK** (`@google/genai`): Server-side integration with **Gemini 3.8 Flash** (`gemini-3.8-flash`) utilizing the `googleSearch` tool for real-time search-grounded public safety advisories and statistical interpretation.
- **Express 4** (`express`, `tsx`): Node.js server proxying API calls, managing in-memory caching with circuit-breaker rate-limit handling, and serving static production assets.
- **TopoJSON Client** (`topojson-client`): Decoding and processing compressed Indian administrative boundaries.

---

## Current Status

**Prototype built for demonstration and evaluation.**

Features that rely on external data, emergency services, or backend integrations are identified separately and should not be assumed operational:
- **Emergency Dispatch**: The SOS interface, 112 trigger buttons, and emergency contact links trigger conceptual client flows or standard `tel:` URI handlers on supported mobile devices; they do not dispatch first responders automatically.
- **Citizen Tips & Investigations**: Averti does not store, intercept, or process citizen tips or FIR complaints. All reporting buttons direct citizens to official state police portals and the National Cyber Crime Reporting Portal (`cybercrime.gov.in`).
- **Simulated Feeds**: Certain public safety pulse bulletins and real-time broadcast simulations are generated for evaluation and prototype testing.

---

## Data Sources

Averti grounds its visualizations in official, documented public records:

1. **National Crime Records Bureau (NCRB)**, Ministry of Home Affairs, Government of India:
   - *Crime in India 2024* (Volume I, Table 1A.3: State/UT-wise Total IPC/BNS & SLL Crimes).
   - Multi-year statistical comparisons incorporating *Crime in India 2022* and *Crime in India 2023*.
   - Population estimates standardized from official NCRB mid-year projected census figures.
   - *Coverage Date*: 2022–2024 reporting periods.

2. **DataMeet India Open Data Project**:
   - Pan-India State and District GeoJSON / TopoJSON boundary maps.
   - *License*: Creative Commons Attribution 2.5 India (CC BY 2.5 India).

3. **Emergency Response Support System (ERSS - Dial 112)**:
   - Ministry of Home Affairs guidelines and standardized nationwide police, fire, and ambulance dispatch protocols ([112.gov.in](https://112.gov.in)).

4. **National Cyber Crime Reporting Portal**:
   - Ministry of Home Affairs & Indian Cyber Crime Coordination Centre (I4C) directives, 1930 golden-hour helpline, and citizen fraud prevention portals ([cybercrime.gov.in](https://cybercrime.gov.in)).

### Statistical Principles & Limitations
- **Registration vs. Danger**: Official crime statistics measure police registrations (First Information Reports / FIRs), not actual personal danger. A higher registered-crime rate often reflects citizen trust, proactive law enforcement, and mandatory online FIR registration rather than higher crime incidence.
- **Indicative Boundaries**: Spatial district boundaries are simplified for browser performance and should be treated as indicative references rather than authoritative legal demarcation lines.

---

## Running Locally

1. **Install Node.js**: Ensure Node.js (v18 or higher) and npm are installed on your machine.
2. **Clone this repository**:
   ```bash
   git clone <repository-url>
   cd averti
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Environment Configuration (Optional)**:
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - (Optional) Provide your `GEMINI_API_KEY` for live search grounding. If omitted, Averti automatically uses its built-in contextual safety dataset fallback.
5. **Start development server**:
   ```bash
   npm run dev
   ```
6. **Open the local URL**: Open [http://localhost:3000](http://localhost:3000) in your web browser.

To create an optimized production build:
```bash
npm run build
npm start
```

---

## Author

Conceived, authored, and made by **Priyash Priyal Jena**.

---

## Disclaimer

**Averti is a prototype and is not a replacement for official emergency services. For emergencies in India, call 112.**
