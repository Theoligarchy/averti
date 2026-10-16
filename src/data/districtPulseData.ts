import { getDistrictCentroid, getDistrictFeature } from './indiaGeoData';

export type PulseCategory = 'traffic' | 'law_order' | 'civic_weather' | 'cyber_fraud' | 'emergency';
export type PulseSeverity = 'critical' | 'warning' | 'advisory' | 'info';

export interface DistrictPulseAlert {
  id: string;
  district: string;
  state: string;
  headline: string;
  summary: string;
  fullDetails: string;
  category: PulseCategory;
  severity: PulseSeverity;
  locality: string;
  landmark: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  distanceFromHqKm: number;
  direction: string;
  timestamp: string;
  timeAgo: string;
  sourceAgency: string;
  sourceBadge: string;
  isVerified: boolean;
  actionRequired?: string;
  contactHelpline?: string;
  tags: string[];
}

// Well-known district landmark datasets for hyper-local accuracy
const KNOWN_DISTRICT_LANDMARKS: Record<string, string[]> = {
  pune: [
    'Shivajinagar Junction (FC Road)',
    'Hinjawadi Rajiv Gandhi Infotech Park Phase 1',
    'Koregaon Park North Main Road',
    'Swargate Bus Terminal & Metro Hub',
    'Senapati Bapat Marg',
    'Hadapsar Gadital Chowk',
    'Chandani Chowk Kothrud Bypass',
    'Viman Nagar Airport Road'
  ],
  bengaluru: [
    'Silk Board Junction (Hosur Road)',
    'Indiranagar 100 Feet Road',
    'Electronic City Toll Plaza Phase 1',
    'Whitefield ITPL Main Road',
    'Hebbal Flyover Corridor',
    'Majestic Kempegowda Intermodal Terminal',
    'Outer Ring Road (Marathahalli)',
    'Koramangala 80 Feet Road'
  ],
  'bengaluru urban': [
    'Silk Board Junction (Hosur Road)',
    'Indiranagar 100 Feet Road',
    'Electronic City Toll Plaza Phase 1',
    'Whitefield ITPL Main Road',
    'Hebbal Flyover Corridor',
    'Majestic Kempegowda Intermodal Terminal',
    'Outer Ring Road (Marathahalli)',
    'Koramangala 80 Feet Road'
  ],
  gurugram: [
    'Cyber City Rapid Metro Corridor',
    'IFFCO Chowk Junction',
    'Golf Course Extension Road',
    'Sohna Road Badshahpur Chowk',
    'Sector 29 Leisure Valley Hub',
    'Rajiv Chowk NH-48 Underpass',
    'Sheetla Mata Road Old Gurugram'
  ],
  varanasi: [
    'Godowlia Chowk Pedestrian Corridor',
    'Dashashwamedh Ghat Pilgrim Route',
    'Lanka BHU Main Gate',
    'Cantonment Railway Station Approach',
    'Assi Ghat Circular Marg',
    'Shivpur Bypass NH-19 Cut',
    'Sarnath Tourist Ring Road'
  ],
  'mumbai suburban': [
    'Western Express Highway (Andheri Flyover)',
    'Bandra Kurla Complex (BKC) Connector',
    'New Link Road Malad West',
    'Borivali Station East Skywalk',
    'Powai Hiranandani Boulevard',
    'Ghatkopar Metro Station Interchange'
  ],
  mumbai: [
    'Marine Drive Promenade (Nariman Point)',
    'Chhatrapati Shivaji Maharaj Terminus (CSMT) Plaza',
    'Dadar TT Circle',
    'Worli Sea Face Road',
    'Byculla Zoo Junction',
    'Colaba Causeway Market'
  ],
  lucknow: [
    'Hazratganj Atal Chowk',
    'Gomti Nagar Polytechnic Chauraha',
    'Charbagh Railway Station Circle',
    'Munshi Pulia Metro Hub',
    'Alambagh Inter-State Bus Stand',
    'Kaiserbagh Bus Terminal'
  ],
  hyderabad: [
    'HITEC City Cyber Towers Junction',
    'Gachibowli Flyover & Outer Ring Road',
    'Panjagutta Central Circle',
    'Charminar Pedestrian Precinct',
    'Secunderabad Railway Station Road',
    'Banjara Hills Road No 12'
  ],
  chennai: [
    'Anna Salai Gemini Flyover',
    'T Nagar Panagal Park Commercial Belt',
    'OMR IT Expressway Sholinganallur',
    'Kathipara Multi-Level Grade Separator',
    'Guindy Industrial Estate Junction',
    'Koyambedu CMBT Terminal'
  ],
  kolkata: [
    'Park Street - Camac Street Crossing',
    'Salt Lake Sector V Webel More',
    'Howrah Bridge Approach Road',
    'Shyambazar Five-Point Crossing',
    'EM Bypass Ruby Hospital Junction',
    'Esplanade Metro Interchange'
  ],
  jaipur: [
    'MI Road Panch Batti Junction',
    'Tonk Road Gaurav Tower Cut',
    'Mansarovar Metro Depot Road',
    'Ajmer Road 200ft Bypass',
    'Johari Bazaar Walled City Corridor',
    'Sindhi Camp Central Bus Stand'
  ],
  ahmedabad: [
    'SG Highway Iscon Cross Road',
    'Ashram Road Income Tax Circle',
    'C.G. Road Swastik Cross Road',
    'Naroda Patiya Junction',
    'Vastrapur Lake Ring Road',
    'Kalupur Railway Station Plaza'
  ],
  patna: [
    'Dak Bungalow Crossing',
    'Gandhi Maidan Exhibition Road',
    'Bailey Road Saguna More',
    'Kankarbagh Main Road Colony',
    'Patliputra Industrial Area Bypass'
  ],
  khordha: [
    'Master Canteen Railway Station Square',
    'Rasulgarh National Highway 16 Cut',
    'Patia Infocity KIIT Square',
    'Jayadev Vihar Overbridge',
    'Khandagiri Traffic Rotary'
  ],
  bhubaneswar: [
    'Master Canteen Railway Station Square',
    'Rasulgarh National Highway 16 Cut',
    'Patia Infocity KIIT Square',
    'Jayadev Vihar Overbridge',
    'Khandagiri Traffic Rotary'
  ],
  chandigarh: [
    'Sector 17 Plaza Commercial Precinct',
    'Tribune Chowk Rotary',
    'Madhya Marg Sector 26 Grain Market',
    'Sector 35 Inner Market Lane',
    'IT Park Mani Majra Corridor'
  ]
};

// Generates procedural landmarks for any district in India
function getLandmarksForDistrict(districtName: string): string[] {
  const norm = districtName.toLowerCase().trim();
  for (const [key, list] of Object.entries(KNOWN_DISTRICT_LANDMARKS)) {
    if (norm === key || norm.includes(key) || key.includes(norm)) {
      return list;
    }
  }

  // Realistic procedural Indian district landmarks
  return [
    `${districtName} Collectorate & Court Complex Road`,
    `Civil Lines Police Station Area, ${districtName}`,
    `${districtName} Central Railway Station & Yard Road`,
    `National Highway Bypass Interchange, ${districtName}`,
    `Main Bus Stand & Subhash Chowk, ${districtName}`,
    `District Hospital & Emergency Trauma Circle`,
    `Old Town Bazaar & Ghanta Ghar Clock Tower`,
    `Industrial Area Phase-1 Police Chowki, ${districtName}`
  ];
}

// Pseudo-random deterministic number generator seeded by string
function seededRandom(seed: string): () => number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  }
  return () => {
    h += h << 13;
    h ^= h >>> 7;
    h += h << 3;
    h ^= h >>> 17;
    return (h >>> 0) / 4294967296;
  };
}

const DIRECTIONS = ['North', 'North-East', 'East', 'South-East', 'South', 'South-West', 'West', 'North-West'];

// Templates for generating varied, rich public safety alerts
interface AlertTemplate {
  category: PulseCategory;
  severity: PulseSeverity;
  headlineTpl: (district: string, landmark: string) => string;
  summaryTpl: (district: string, landmark: string) => string;
  fullDetailsTpl: (district: string, landmark: string) => string;
  sourceAgency: string;
  sourceBadge: string;
  actionRequired?: string;
  contactHelpline?: string;
  tags: string[];
}

const ALERT_TEMPLATES: AlertTemplate[] = [
  {
    category: 'traffic',
    severity: 'warning',
    headlineTpl: (_d, l) => `Traffic Congestion & Lane Diversion at ${l}`,
    summaryTpl: (_d, l) => `Heavy vehicle movement restricted due to civic storm-water utility maintenance. Single-lane transit operational.`,
    fullDetailsTpl: (d, l) => `Traffic Police Division of ${d} has deployed marshals at ${l}. Commuters travelling towards the city center should expect a 15–20 minute delay or divert via the bypass corridor. Automated signal cycles extended.`,
    sourceAgency: 'District Traffic Police Control',
    sourceBadge: 'Official Police Traffic Desk',
    actionRequired: 'Expect 20-min delay; use alternate arterial ring road',
    contactHelpline: '1095 / 112',
    tags: ['Traffic Advisory', 'Road Diversion', 'Congestion']
  },
  {
    category: 'law_order',
    severity: 'advisory',
    headlineTpl: (d, l) => `Intensified Night Patrols & Nakabandi at ${l}`,
    summaryTpl: (d, _l) => `District Police HQ launched 'Operation Night Shield' with automated number-plate recognition (ANPR) checks.`,
    fullDetailsTpl: (d, l) => `${d} Police jurisdiction has set up static and dynamic nakas around ${l} between 21:00 and 04:00 hrs. Random license and vehicle document verifications are underway. Citizens are requested to cooperate with officers.`,
    sourceAgency: 'Office of Superintendent of Police / CP',
    sourceBadge: 'CCTNS Police Bulletin',
    actionRequired: 'Keep driving license & registration handy during night transit',
    contactHelpline: '112',
    tags: ['Law & Order', 'Night Patrol', 'Vigilance Drive']
  },
  {
    category: 'civic_weather',
    severity: 'critical',
    headlineTpl: (_d, l) => `Flash Waterlogging & Tree Branch Clearing at ${l}`,
    summaryTpl: (_d, l) => `Recent localized downpour caused water accumulation near underpass. Disaster management team active on site.`,
    fullDetailsTpl: (_d, l) => `Municipal emergency de-watering pump deployed at ${l}. Two-wheelers advised caution due to submerged potholes. High-capacity suction machines are clearing the culvert grates.`,
    sourceAgency: 'District Disaster Management Cell (DDMA)',
    sourceBadge: 'Civic Safety Alert',
    actionRequired: 'Avoid low-lying underpass; detour via elevated arterial',
    contactHelpline: '1077 (Disaster Help)',
    tags: ['Weather Alert', 'Waterlogging', 'Civic Action']
  },
  {
    category: 'cyber_fraud',
    severity: 'warning',
    headlineTpl: (d, _l) => `Cyber Alert: Fake Electricity Bill SMS Scam Reported in ${d}`,
    summaryTpl: (d, _l) => `Fraudsters issuing urgent disconnection threats via SMS with malicious APK links targeting ${d} residents.`,
    fullDetailsTpl: (d, _l) => `The Cyber Crime Police Station in ${d} has logged multiple complaints regarding deceptive SMS messages claiming power disconnection at 9:30 PM unless a utility bill is paid. Genuine discoms never ask customers to install remote desktop apps (AnyDesk/TeamViewer).`,
    sourceAgency: 'Cyber Crime Police Division',
    sourceBadge: 'National Cyber Crime Portal Verified',
    actionRequired: 'Never download APK links; verify utility dues only via official portal',
    contactHelpline: '1930 (National Cyber Crime Helpline)',
    tags: ['Cyber Fraud', 'SMS Phishing', 'Public Advisory']
  },
  {
    category: 'emergency',
    severity: 'info',
    headlineTpl: (d, l) => `Emergency Response Mock Drill Scheduled at ${l}`,
    summaryTpl: (d, _l) => `Joint preparedness drill by NDRF, Fire & Emergency, and ${d} Police at major transit point.`,
    fullDetailsTpl: (d, l) => `A multi-agency table-top and live simulation drill will be conducted at ${l} between 11:00 AM and 01:00 PM tomorrow. Siren tests and temporary cordon lines will be visible. The public is reassured that this is purely a precautionary training exercise.`,
    sourceAgency: 'State Fire & Emergency Services',
    sourceBadge: 'Precautionary Public Notice',
    actionRequired: 'No panic needed; drill is simulated protocol',
    contactHelpline: '101 / 112',
    tags: ['Mock Drill', 'Emergency Preparedness', 'Fire Safety']
  },
  {
    category: 'law_order',
    severity: 'advisory',
    headlineTpl: (d, l) => `Women Safety Special Van & CCTV Surveillance Boost at ${l}`,
    summaryTpl: (_d, l) => `'Nirbhaya / Pink Patrol' dedicated van permanently stationed near market area with emergency SOS beacon.`,
    fullDetailsTpl: (d, l) => `As part of safe city infrastructure in ${d}, high-definition facial recognition and night-vision PTZ cameras have been synced to the District Integrated Command & Control Centre (ICCC) around ${l}. Emergency call boxes (ECB) are now live.`,
    sourceAgency: 'District Women Safety & Protection Wing',
    sourceBadge: 'Safe City Project',
    actionRequired: 'Press yellow button on Emergency Call Box for instant 112 connect',
    contactHelpline: '1090 / 1091 (Women Helpline)',
    tags: ['Women Safety', 'Pink Patrol', 'CCTV Surveillance']
  },
  {
    category: 'traffic',
    severity: 'critical',
    headlineTpl: (_d, l) => `Heavy Vehicle Breakdown Cleared at ${l} Flyover`,
    summaryTpl: (_d, l) => `Multi-axle truck breakdown caused tailbacks; crane towing concluded. Residual slowdown easing.`,
    fullDetailsTpl: (d, l) => `Traffic personnel from ${d} sector dispatched heavy hydra cranes to clear the carriageway at ${l}. Both lanes are open for traffic now, with speed restrictions of 30 km/h in place for the next hour.`,
    sourceAgency: 'Highway Patrol & Traffic Desk',
    sourceBadge: 'Real-Time Incident Response',
    actionRequired: 'Maintain safe distance while congestion dissipates',
    contactHelpline: '112',
    tags: ['Breakdown Cleared', 'Traffic Flow', 'Flyover Update']
  },
  {
    category: 'civic_weather',
    severity: 'info',
    headlineTpl: (d, l) => `Air Quality & Open Burning Vigilance Squad Deployed at ${l}`,
    summaryTpl: (d, _l) => `District anti-smog water sprinklers active; strict fines imposed for solid-waste combustion in ${d}.`,
    fullDetailsTpl: (d, l) => `The Pollution Control Board and Municipal flying squads have instituted night surveillance around ${l} to deter unauthorized open burning. Mobile mist water tankers are operating twice daily along heavy vehicular corridors.`,
    sourceAgency: 'State Pollution Control Board & Municipal Corp',
    sourceBadge: 'Environmental Health Alert',
    actionRequired: 'Report unauthorized garbage burning via 112 or civic app',
    contactHelpline: '112',
    tags: ['Air Quality', 'Civic Action', 'Public Health']
  }
];

// Curated default public safety bulletins when no district is selected
export const DEFAULT_NATIONAL_PULSE_ALERTS: DistrictPulseAlert[] = [
  {
    id: 'pulse-nat-01',
    district: 'Pune',
    state: 'Maharashtra',
    headline: 'Traffic Congestion & Lane Diversion at Hinjawadi Infotech Park Phase 1',
    summary: 'Heavy vehicle movement restricted due to civic storm-water utility maintenance. Single-lane transit operational.',
    fullDetails: 'Pune Traffic Police Division has deployed marshals at Hinjawadi Rajiv Gandhi Infotech Park Phase 1. Commuters travelling towards the city center should expect a 15–20 minute delay.',
    category: 'traffic',
    severity: 'warning',
    locality: 'Hinjawadi IT Belt',
    landmark: 'Hinjawadi Rajiv Gandhi Infotech Park Phase 1',
    coordinates: { lat: 18.5913, lng: 73.7389 },
    distanceFromHqKm: 4.2,
    direction: 'North-West',
    timestamp: '2026-10-16T08:15:00Z',
    timeAgo: '12m ago',
    sourceAgency: 'Pune City Police Control',
    sourceBadge: 'Official Police Traffic Desk',
    isVerified: true,
    actionRequired: 'Expect 20-min delay; use alternate arterial ring road',
    contactHelpline: '1095 / 112',
    tags: ['Traffic Advisory', 'Road Diversion']
  },
  {
    id: 'pulse-nat-02',
    district: 'Bengaluru Urban',
    state: 'Karnataka',
    headline: 'Silk Board Junction: Traffic Signal Optimization & Lane Channelization Active',
    summary: 'Automated adaptive signal cycle launched under Smart Mobility drive to curtail peak hour waiting time.',
    fullDetails: 'Bengaluru Traffic Police (BTP) has reconfigured the signal staging at Central Silk Board Junction to reduce gridlock for commuters towards Electronic City.',
    category: 'traffic',
    severity: 'info',
    locality: 'Madiwala - BTM Layout Border',
    landmark: 'Silk Board Junction (Hosur Road)',
    coordinates: { lat: 12.9176, lng: 77.6238 },
    distanceFromHqKm: 6.8,
    direction: 'South',
    timestamp: '2026-10-16T07:45:00Z',
    timeAgo: '42m ago',
    sourceAgency: 'Bengaluru Traffic Police (BTP)',
    sourceBadge: 'Smart Mobility Command',
    isVerified: true,
    actionRequired: 'Follow lane indicators and lane-driving discipline',
    contactHelpline: '080-22943030 / 112',
    tags: ['Smart Mobility', 'Traffic Flow']
  },
  {
    id: 'pulse-nat-03',
    district: 'Gurugram',
    state: 'Haryana',
    headline: 'Intensified Night Patrols & Nakabandi at Cyber City Rapid Metro Corridor',
    summary: 'Gurugram Police launched heightened late-night checking with ANPR cameras along DLF Cyber City belt.',
    fullDetails: 'Gurugram Police has mobilized 8 Mobile Patrol Vans (MPV) and established static check-posts at DLF Cyber City and Golf Course Road to deter reckless driving and verify commercial vehicle passes.',
    category: 'law_order',
    severity: 'advisory',
    locality: 'DLF Phase 2 / Sector 24',
    landmark: 'Cyber City Rapid Metro Corridor',
    coordinates: { lat: 28.4950, lng: 77.0895 },
    distanceFromHqKm: 3.1,
    direction: 'East',
    timestamp: '2026-10-16T07:10:00Z',
    timeAgo: '1h ago',
    sourceAgency: 'Gurugram Police Commissionerate',
    sourceBadge: 'CCTNS Police Bulletin',
    isVerified: true,
    actionRequired: 'Keep driving license & registration handy during transit',
    contactHelpline: '112',
    tags: ['Law & Order', 'Night Patrol']
  },
  {
    id: 'pulse-nat-04',
    district: 'Varanasi',
    state: 'Uttar Pradesh',
    headline: 'Pedestrian Heritage Corridor Regulated at Godowlia Chowk',
    summary: 'No-Vehicle zone strictly enforced along Dashashwamedh corridor ahead of evening Ganga Aarti crowd influx.',
    fullDetails: 'Varanasi Commissionerate Police has established battery e-rickshaw feeder stations at Godowlia Chowk. Private four-wheelers will be diverted towards Maidagin and Benia Bagh parking garages.',
    category: 'traffic',
    severity: 'advisory',
    locality: 'Godowlia - Dashashwamedh Marg',
    landmark: 'Godowlia Chowk Pedestrian Corridor',
    coordinates: { lat: 25.3076, lng: 83.0062 },
    distanceFromHqKm: 1.8,
    direction: 'South-East',
    timestamp: '2026-10-16T06:30:00Z',
    timeAgo: '2h ago',
    sourceAgency: 'Varanasi Police Commissionerate',
    sourceBadge: 'Safe Corridor Desk',
    isVerified: true,
    actionRequired: 'Park four-wheelers at Benia Bagh Underground Parking',
    contactHelpline: '112',
    tags: ['Heritage Zone', 'Pedestrian Safety']
  },
  {
    id: 'pulse-nat-05',
    district: 'National / All-India',
    state: 'Central Agency',
    headline: 'Cyber Advisory: Fake Electricity Bill Disconnection SMS Warning',
    summary: 'Nationwide alert issued on fraudulent SMS asking citizens to pay overdue power bills via malicious links.',
    fullDetails: 'The Indian Cyber Crime Coordination Centre (I4C) urges citizens not to click on external APK download links or dial unregistered mobile numbers provided in electricity disconnection alert messages.',
    category: 'cyber_fraud',
    severity: 'warning',
    locality: 'All Telecom Circles',
    landmark: 'Central Cyber Crime Coordination Hub',
    coordinates: { lat: 28.6139, lng: 77.2090 },
    distanceFromHqKm: 0.0,
    direction: 'Central',
    timestamp: '2026-10-16T05:00:00Z',
    timeAgo: '3h ago',
    sourceAgency: 'I4C (MHA) & National Cyber Crime Portal',
    sourceBadge: 'National Threat Intelligence',
    isVerified: true,
    actionRequired: 'Report cyber fraud immediately at 1930 within golden hour',
    contactHelpline: '1930',
    tags: ['Cyber Safety', 'National Advisory']
  }
];

/**
 * Generate contextually relevant, geolocated public safety alerts for a selected district.
 */
export function generateDistrictPulseAlerts(
  districtName: string,
  stateName?: string | null,
  dynamicSalt: number = 0
): DistrictPulseAlert[] {
  if (!districtName) {
    return DEFAULT_NATIONAL_PULSE_ALERTS;
  }

  const effectiveState = stateName || 'India';
  const landmarks = getLandmarksForDistrict(districtName);

  // Try to find the district's true geographic centroid
  let baseCoords: [number, number] = [20.5937, 78.9629];
  try {
    const feat = getDistrictFeature(effectiveState, districtName);
    if (feat) {
      baseCoords = getDistrictCentroid(feat);
    }
  } catch {
    // default base
  }

  // Create a seeded RNG based on district and salt
  const seedString = `${districtName}-${effectiveState}-${dynamicSalt}`;
  const rng = seededRandom(seedString);

  // Select 5 to 7 alerts
  const count = 5 + Math.floor(rng() * 3);
  const shuffledTemplates = [...ALERT_TEMPLATES].sort(() => rng() - 0.5);

  const alerts: DistrictPulseAlert[] = [];

  for (let i = 0; i < count; i++) {
    const template = shuffledTemplates[i % shuffledTemplates.length];
    const landmark = landmarks[i % landmarks.length];

    // Generate slight geographic offset within 1 - 8 km (0.01 to 0.07 degrees)
    const latOffset = (rng() - 0.5) * 0.08;
    const lngOffset = (rng() - 0.5) * 0.08;
    const alertLat = Number((baseCoords[0] + latOffset).toFixed(4));
    const alertLng = Number((baseCoords[1] + lngOffset).toFixed(4));

    const distanceKm = Number((0.8 + rng() * 6.5).toFixed(1));
    const direction = DIRECTIONS[Math.floor(rng() * DIRECTIONS.length)];

    // Realistic time ago
    const minutesAgo = (i * 24) + Math.floor(rng() * 18) + 4;
    let timeAgoStr = `${minutesAgo}m ago`;
    if (minutesAgo >= 60) {
      const hours = Math.floor(minutesAgo / 60);
      timeAgoStr = hours === 1 ? '1h ago' : `${hours}h ago`;
    }

    const now = new Date(Date.now() - minutesAgo * 60 * 1000);

    const alertId = `pulse-${districtName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${i + 1}-${dynamicSalt}`;

    alerts.push({
      id: alertId,
      district: districtName,
      state: effectiveState,
      headline: template.headlineTpl(districtName, landmark),
      summary: template.summaryTpl(districtName, landmark),
      fullDetails: template.fullDetailsTpl(districtName, landmark),
      category: template.category,
      severity: template.severity,
      locality: landmark.split('(')[0].trim(),
      landmark,
      coordinates: {
        lat: alertLat,
        lng: alertLng
      },
      distanceFromHqKm: distanceKm,
      direction,
      timestamp: now.toISOString(),
      timeAgo: timeAgoStr,
      sourceAgency: template.sourceAgency.replace(/\$\{d\}/g, districtName),
      sourceBadge: template.sourceBadge,
      isVerified: true,
      actionRequired: template.actionRequired,
      contactHelpline: template.contactHelpline,
      tags: [...template.tags, districtName]
    });
  }

  return alerts;
}

/**
 * Procedurally generates a single simulated real-time alert (useful for "Simulate New Incident" demo action)
 */
export function generateSingleIncomingAlert(
  districtName: string,
  stateName?: string | null
): DistrictPulseAlert {
  const effectiveState = stateName || 'India';
  const landmarks = getLandmarksForDistrict(districtName);
  const randomLandmark = landmarks[Math.floor(Math.random() * landmarks.length)];

  let baseCoords: [number, number] = [20.5937, 78.9629];
  try {
    const feat = getDistrictFeature(effectiveState, districtName);
    if (feat) {
      baseCoords = getDistrictCentroid(feat);
    }
  } catch {
    // default
  }

  const latOffset = (Math.random() - 0.5) * 0.05;
  const lngOffset = (Math.random() - 0.5) * 0.05;
  const alertLat = Number((baseCoords[0] + latOffset).toFixed(4));
  const alertLng = Number((baseCoords[1] + lngOffset).toFixed(4));
  const distanceKm = Number((0.5 + Math.random() * 4).toFixed(1));
  const direction = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];

  const incomingTemplates = [
    {
      category: 'traffic' as PulseCategory,
      severity: 'warning' as PulseSeverity,
      headline: `Live Traffic Advisory: Heavy Influx Reported at ${randomLandmark}`,
      summary: `Commuter traffic crawling due to unplanned vehicle breakdown. Police crane dispatched to clear left lane.`,
      fullDetails: `Real-time sensor logs indicate queue lengths exceeding 700 meters near ${randomLandmark}. Traffic wardens are manually overriding signal timing to ease bottleneck.`,
      sourceAgency: `${districtName} Traffic Control Room`,
      sourceBadge: 'Flash Alert Desk',
      actionRequired: 'Detour via secondary bypass recommended for next 30 mins',
      contactHelpline: '1095 / 112',
      tags: ['Live Traffic', 'Real-Time Alert', 'Slowdown']
    },
    {
      category: 'emergency' as PulseCategory,
      severity: 'critical' as PulseSeverity,
      headline: `Urgent Public Safety: Overhead Transformer Spark Contained at ${randomLandmark}`,
      summary: `Electricity department and fire response unit responded within 6 minutes. Area power safely isolated.`,
      fullDetails: `Emergency services have secured the perimeter around ${randomLandmark}. No injuries reported. Repair crew is on site replacing damaged switchgear. Power restoration expected within 45 mins.`,
      sourceAgency: 'District Fire & Emergency Command',
      sourceBadge: 'Emergency Response Squad',
      actionRequired: 'Pedestrians should avoid proximity to substation cordon',
      contactHelpline: '101 / 112',
      tags: ['Fire Dept', 'Electrical Hazard', 'Rapid Containment']
    },
    {
      category: 'law_order' as PulseCategory,
      severity: 'info' as PulseSeverity,
      headline: `Citizen Assist: Dial 112 Patrol Van Stationed at ${randomLandmark}`,
      summary: `Dedicated all-women response vehicle active for evening commute safety and pedestrian assistance.`,
      fullDetails: `${districtName} Police has positioned PCR Unit 14 at ${randomLandmark} to provide escorted safe transit assistance, child guidance, and immediate emergency contact.`,
      sourceAgency: `${districtName} Commissionerate Control`,
      sourceBadge: 'Community Safety Unit',
      actionRequired: 'Approach vehicle for immediate citizen assistance or verification',
      contactHelpline: '112',
      tags: ['Dial 112', 'Public Safety', 'Safe Transit']
    }
  ];

  const chosen = incomingTemplates[Math.floor(Math.random() * incomingTemplates.length)];

  return {
    id: `pulse-live-${Date.now()}`,
    district: districtName,
    state: effectiveState,
    headline: chosen.headline,
    summary: chosen.summary,
    fullDetails: chosen.fullDetails,
    category: chosen.category,
    severity: chosen.severity,
    locality: randomLandmark.split('(')[0].trim(),
    landmark: randomLandmark,
    coordinates: {
      lat: alertLat,
      lng: alertLng
    },
    distanceFromHqKm: distanceKm,
    direction,
    timestamp: new Date().toISOString(),
    timeAgo: 'Just now',
    sourceAgency: chosen.sourceAgency,
    sourceBadge: chosen.sourceBadge,
    isVerified: true,
    actionRequired: chosen.actionRequired,
    contactHelpline: chosen.contactHelpline,
    tags: [...chosen.tags, districtName]
  };
}
