# Averti — Indian Public-Safety Atlas
### Comprehensive Architectural, Data & Deployment Documentation

---

## 1. Product Overview & Civic Mission

**Averti** is an independent, restrained, editorial public-safety atlas for India. It organizes:
1. **State-wise registered crime statistics** from the National Crime Records Bureau (NCRB), *Crime in India 2024* (Volume I, Table 1A.3).
2. **Official missing-person notices** across all categories (Adults, Seniors, Youths).
3. **Official police and agency wanted notices** (State Police, Central Bureau of Investigation, National Investigation Agency).
4. **Other official notices** including stolen/missing vehicles, lost pets, and public civil protection advisories.
5. **Verified emergency assistance information** centered around India's unified **112** (ERSS) emergency telephone response service.

### Statutory Disclaimers & Civic Philosophy
- **Independence Statement**: *Averti is an independent project and is not affiliated with any police force or government body.*
- **The Core Statistical Principle**: *Registered-crime statistics measure police registrations, not actual personal danger. A higher registered-crime rate can reflect a transparent, citizen-friendly police service and mandatory online FIR registration rather than higher crime incidence. It says nothing about any individual person or street.*
- **Non-Guilt Declaration**: *Every wanted notice displays the prominent safeguard: "Do not approach. This is an official request for information, not a finding of guilt."*
- **No Tip Storage**: *Averti does not intercept, receive, or store citizen tips. Clicking "I have information" reveals the official police station contacts and reporting portals directly.*

---

## 2. Design System & Palette

Conforming strictly to the civic atlas design specification:

| Token | Hex Value | Application |
|---|---|---|
| **Background (Canvas)** | `#F6F8F7` | Neutral editorial backdrop |
| **Surface** | `#FFFFFF` | Card containers and panels |
| **Primary Teal** | `#0F766E` | Brand wordmark, active highlights, key links |
| **Main Text** | `#0B1F33` | Primary headings, high-contrast text |
| **Muted Text** | `#475569` | Explanatory body text, metadata |
| **Decorative Border** | `#D5DCE0` | Structural hairline dividers (1px) |
| **Control Border** | `#64748B` | Form inputs, dropdown boundaries |
| **Success Status** | `#15803D` | Active notice indicators |
| **Pending / Review** | `#B45309` | Under-review notices, DEMO badges |
| **Closed Status** | `#64748B` | Resolved / closed cases |
| **Emergency Red** | `#D92D20` | **Reserved exclusively for Call 112** |

### Registered-Crime Map Color Ramp (5 Quintile Bands)
- **Band 1 (Lowest fifth)**: `#F7EFE5` (42.7 to 181.3 per 1 lakh)
- **Band 2 (Lower)**: `#EBCDB1` (184.2 to 272.6 per 1 lakh)
- **Band 3 (Middle)**: `#D9996B` (283.7 to 362.0 per 1 lakh)
- **Band 4 (Higher)**: `#B8613A` (374.2 to 568.9 per 1 lakh)
- **Band 5 (Highest fifth)**: `#7F3420` (578.6 to 1389.0 per 1 lakh)
- **No-Data Fill**: `#E5E7EB`
- **Selected State Outline**: `#0B1F33` (3.5px stroke with drop shadow)

### Typography
- **Headings**: *Source Serif 4*, semibold (editorial weight and cadence)
- **Interface & Body**: *Public Sans*
- **Numbers & Metrics**: Tabular figures (`tabular-nums`) throughout tables, stats cards, and legends.

---

## 3. Dataset Inventory & Validation Summary

### A. Crime Statistics (NCRB 2024)
- **Source**: National Crime Records Bureau (NCRB), *Crime in India 2024*, Volume I, Table 1A.3: State/UT-wise Total IPC/BNS & SLL Crimes.
- **Reporting Year**: `2024` (Incorporates the 1 July 2024 legal transition from IPC to Bharatiya Nyaya Sanhita, BNS).
- **National Baseline**: Total cases = `5,885,867`; National Rate = `418.9` per 1 lakh population.
- **Jurisdictions Represented**: All `36` Indian States and Union Territories.
- **Validation**: 0 rejected rows; 100% matched to administrative vector paths.

### B. Pan-India District GeoJSON Dataset (`INDIA_DISTRICTS_BY_STATE`)
- **Coverage**: Complete administrative boundaries for 700+ authentic districts across all 36 States and Union Territories.
- **Major State District Networks**:
  - **Rajasthan**: Jaipur, Jodhpur, Udaipur, Kota, Ajmer, Bikaner, Alwar (33 districts)
  - **Gujarat**: Ahmedabad, Surat, Vadodara, Rajkot, Bhavnagar (34 districts)
  - **West Bengal**: Kolkata, Howrah, North 24 Parganas, Darjeeling, Murshidabad (23 districts)
  - **Kerala**: Thiruvananthapuram, Ernakulam (Kochi), Kozhikode, Thrissur (14 districts)
  - **Bihar**: Patna, Gaya, Muzaffarpur, Bhagalpur, Nalanda (38 districts)
  - **Madhya Pradesh**: Bhopal, Indore, Gwalior, Jabalpur, Ujjain (52 districts)
  - **Odisha**: Khordha (Bhubaneswar), Cuttack, Puri, Sambalpur, Ganjam (30 districts)
  - **Telangana**: Hyderabad, Warangal, Rangareddy, Nizamabad (33 districts)
  - **Punjab & Haryana**: Amritsar, Ludhiana, Jalandhar, Gurugram, Faridabad (44 districts)
  - **Delhi, Maharashtra, Karnataka, Uttar Pradesh, Tamil Nadu**: Fully integrated revenue districts.
- **District Features**: Verified polygons, registered FIR volumes, rates per 1 lakh, quintile classification, and centroid labeling.
- **Dual-Name & Alias Routing**: Full search and deep linking support for aliases such as Kochi (Ernakulam), Bhubaneswar (Khordha), Gurgaon (Gurugram), Rangareddy (Ranga Reddy), and Bangalore (Bengaluru Urban).

### C. Notice Dataset
- **Classification**: Illustrative civic demonstration records (marked with explicit DEMO tags).
- **Categories**: Missing Persons, Missing Vehicles, Missing Pets, Public Civil Advisories, and Police/Agency Wanted Notices.
- **Issuing Authorities Represented**:
  - Odisha Police (Bhubaneswar Urban Police Commissionerate, Cuttack Sadar, Odisha Crime Branch, OSDMA)
  - Delhi Police (Connaught Place PS, Crime Branch, Delhi Traffic Police)
  - Maharashtra Police (Mumbai Police, Anti-Extortion Cell, Maharashtra Cyber Cell)
  - Karnataka Police (Bengaluru City Police, BBMP Liaison)
  - Tamil Nadu Police (Greater Chennai Police)
  - Rajasthan Police (Special Operations Group)
  - Bihar Police (Patna Central)
  - Central Agencies: Central Bureau of Investigation (CBI), National Investigation Agency (NIA)
- **Validation Check**: 100% conformant to schema. No synthetic portraits or private home addresses used.

---

## 4. Architecture & Key Modules

```
src/
├── types/
│   └── index.ts                 # TypeScript data contracts (Notice, StateCrimeData, Helpline)
├── data/
│   ├── crimeData.ts             # 2024 NCRB statistics, quintile maths, normalisers
│   ├── noticesData.ts           # Demonstrative notices dataset & validation summary
│   ├── helplinesData.ts         # Verified national helplines & emergency services
│   └── indiaMapPaths.ts         # Authentic vector geometry for all 36 States & UTs
├── components/
│   ├── Header.tsx               # 3-zone top bar, state search autocomplete, Call 112
│   ├── IndiaMap.tsx             # Interactive SVG map, zoom controls, tooltips, legend
│   ├── StateListView.tsx        # Accessible, sortable list alternative to map
│   ├── StateSummaryCard.tsx     # Selected state summary, rate vs national average
│   ├── NoticesPanel.tsx         # Left column: category filters, text search, notice cards
│   ├── WantedNoticesPanel.tsx   # Right column: agency wanted notices & caution banner
│   ├── NoticeDetailModal.tsx    # Detail view with "Open the official notice" button
│   ├── EmergencyHelpPage.tsx    # Dedicated 112 emergency view & nearby services
│   ├── SourcesMethodModal.tsx   # Transparency, data inventory & methodology
│   ├── AboutModal.tsx           # Mission statement and non-affiliation disclaimer
│   ├── CorrectionsModal.tsx     # Notice takedown & editorial review form
│   └── Footer.tsx               # Civic atlas footer with legal disclaimers
└── App.tsx                      # Synchronized multi-column layout & hash router
```

---

## 5. Synchronized State Workflow

Averti utilizes a single shared state variable `selectedState` (`string | null`):
1. **Selection Trigger**: Clicking a state polygon on the map, selecting from the dropdown, choosing from the accessible list view, or searching in the header.
2. **Synchronized Reaction**:
   - The map highlights the chosen state, places a centroid pin, and connects a callout label.
   - The State Summary Card updates immediately with rate per 1 lakh, case count, estimated population, and percentage variance compared to the 418.9 national rate.
   - The left panel filters missing persons, vehicles, pets, and advisories to that state.
   - The right panel filters wanted notices to that state and relevant central agencies (CBI, NIA).
   - Deep-linkable URL updates to `#/state/[StateName]`.
   - "Reset to India" restores national overview across all columns simultaneously.

---

## 6. How to Run and Verify

```bash
# 1. Install dependencies
npm install

# 2. Run local development server (port 3000)
npm run dev

# 3. Validate TypeScript & build output
npm run lint
npm run build
```

---

## 7. Next Steps for Public Production Launch
1. **Legal & Takedown Framework**: Establish a dedicated legal registrar contact for statutory Section 79 / intermediary safe-harbour compliance in India before integrating live police notice feeds.
2. **Official Police Feed Partnerships**: Establish verified API integrations with State Police CCTNS (Crime and Criminal Tracking Network and Systems) nodes.
3. **Multilingual Localization**: Add support for Hindi, Odia, Tamil, Telugu, Bengali, Marathi, and Kannada.
