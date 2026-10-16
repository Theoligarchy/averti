/**
 * Layer definitions and mock spatial data for WebGIS Atlas
 * Data layers: Police Stations, Crime Hotspots, Help & Medical Centers
 */

export interface PoliceStation {
  id: string;
  name: string;
  stationCode: string;
  type: 'police';
  jurisdiction: string;
  district: string;
  state: string;
  lat: number;
  lng: number;
  officerInCharge: string;
  phone: string;
  emergencyDial: string;
  address: string;
  services: string[];
}

export interface CrimeHotspot {
  id: string;
  name: string;
  type: 'hotspot';
  district: string;
  state: string;
  lat: number;
  lng: number;
  radiusMeters: number;
  severity: 'high' | 'elevated' | 'moderate';
  reportedIncidents30d: number;
  primaryCategory: 'Vehicle Theft' | 'Cyber Fraud' | 'Pickpocketing' | 'Traffic Congestion' | 'Property Trespass';
  patrolStatus: 'Active Night Patrol' | 'CCTV Monitored' | 'Intensive Checkpoint' | 'Heightened Vigilance';
  description: string;
}

export interface HelpCenter {
  id: string;
  name: string;
  type: 'help_center';
  category: 'hospital' | 'emergency_112' | 'women_helpline' | 'child_care' | 'disaster_relief';
  district: string;
  state: string;
  lat: number;
  lng: number;
  helplineNumber: string;
  operatingHours: string;
  address: string;
  agency: string;
}

export interface ActiveLayerToggles {
  policeStations: boolean;
  crimeHotspots: boolean;
  helpCenters: boolean;
  choroplethBands: boolean;
}

// -------------------------------------------------------------
// CURATED PAN-INDIA GIS FEATURE SET
// -------------------------------------------------------------

export const MOCK_POLICE_STATIONS: PoliceStation[] = [
  // Delhi
  {
    id: 'ps-dl-01',
    name: 'Parliament Street Police Station',
    stationCode: 'DL-PS-011',
    type: 'police',
    jurisdiction: 'New Delhi Sub-Division',
    district: 'New Delhi',
    state: 'Delhi',
    lat: 28.6258,
    lng: 77.2144,
    officerInCharge: 'Insp. R. K. Sharma (SHO)',
    phone: '011-23361100',
    emergencyDial: '112',
    address: 'Parliament Street, Connaught Place, New Delhi 110001',
    services: ['24x7 Citizen Reception', 'Cyber Cell Desk', 'Women Help Desk', 'Lost & Found Reporting']
  },
  {
    id: 'ps-dl-02',
    name: 'Connaught Place Police Station',
    stationCode: 'DL-PS-012',
    type: 'police',
    jurisdiction: 'Connaught Place Outer Circle',
    district: 'New Delhi',
    state: 'Delhi',
    lat: 28.6328,
    lng: 77.2197,
    officerInCharge: 'Insp. Arvind Mishra',
    phone: '011-23744100',
    emergencyDial: '112',
    address: 'Shaheed Bhagat Singh Marg, Connaught Place, New Delhi 110001',
    services: ['Tourist Police Desk', 'Mobile Patrol Unit', 'Bicycle Patrols']
  },
  {
    id: 'ps-dl-03',
    name: 'Hauz Khas Police Station',
    stationCode: 'DL-PS-048',
    type: 'police',
    jurisdiction: 'South District Command',
    district: 'South Delhi',
    state: 'Delhi',
    lat: 28.5494,
    lng: 77.2001,
    officerInCharge: 'Insp. Vikram Rawat',
    phone: '011-26562200',
    emergencyDial: '112',
    address: 'Near IIT Flyover, Hauz Khas, New Delhi 110016',
    services: ['Cybercrime Unit', 'Anti-Snatching Squad']
  },

  // Maharashtra - Mumbai
  {
    id: 'ps-mh-01',
    name: 'Colaba Police Station',
    stationCode: 'MH-MUM-001',
    type: 'police',
    jurisdiction: 'Zone 1 Commissionerate',
    district: 'Mumbai City',
    state: 'Maharashtra',
    lat: 18.9167,
    lng: 72.8286,
    officerInCharge: 'Senior PI Suresh Gaikwad',
    phone: '022-22856262',
    emergencyDial: '112',
    address: 'SBS Road, Colaba Causeway, Mumbai 400005',
    services: ['Coastal Coastal Patrol', 'Tourist Safety Help Desk', 'Dial 112 Rapid Dispatch']
  },
  {
    id: 'ps-mh-02',
    name: 'Bandra Police Station',
    stationCode: 'MH-MUM-024',
    type: 'police',
    jurisdiction: 'Zone 9 Western Suburbs',
    district: 'Mumbai Suburban',
    state: 'Maharashtra',
    lat: 19.0596,
    lng: 72.8295,
    officerInCharge: 'Senior PI Rajesh Kulkarni',
    phone: '022-26422002',
    emergencyDial: '112',
    address: 'Hill Road, Bandra West, Mumbai 400050',
    services: ['Traffic Triage Support', 'Cyber Crime Wing', 'Nirbhaya Mobile Van']
  },

  // Maharashtra - Pune
  {
    id: 'ps-mh-03',
    name: 'Shivajinagar Police Station',
    stationCode: 'MH-PUN-005',
    type: 'police',
    jurisdiction: 'Zone 1 Pune Commissionerate',
    district: 'Pune',
    state: 'Maharashtra',
    lat: 18.5314,
    lng: 73.8446,
    officerInCharge: 'Senior PI Anil Mane',
    phone: '020-25536263',
    emergencyDial: '112',
    address: 'Old Pune-Mumbai Road, Shivajinagar, Pune 411005',
    services: ['Student Safety Cell', 'E-FIR Kiosk', 'Dial 112 Patrol']
  },
  {
    id: 'ps-mh-04',
    name: 'Hinjawadi IT Park Police Station',
    stationCode: 'MH-PUN-019',
    type: 'police',
    jurisdiction: 'Pimpri-Chinchwad Commissionerate',
    district: 'Pune',
    state: 'Maharashtra',
    lat: 18.5913,
    lng: 73.7389,
    officerInCharge: 'Insp. Sunita Chavan',
    phone: '020-22934250',
    emergencyDial: '112',
    address: 'Phase 1, Rajiv Gandhi Infotech Park, Hinjawadi, Pune 411057',
    services: ['24x7 IT Employee Escort Patrol', 'Cyber Security Desk', 'Women Night Safety Cell']
  },

  // Karnataka - Bengaluru
  {
    id: 'ps-ka-01',
    name: 'Cubbon Park Police Station',
    stationCode: 'KA-BLR-003',
    type: 'police',
    jurisdiction: 'Central Division',
    district: 'Bengaluru Urban',
    state: 'Karnataka',
    lat: 12.9778,
    lng: 77.5956,
    officerInCharge: 'Inspector Manjunath Swamy',
    phone: '080-22942583',
    emergencyDial: '112',
    address: 'Kasturba Road, Opp. High Court, Bengaluru 560001',
    services: ['Suraksha Mobile Kiosk', 'Tourist Safety Officer', 'Bicycle Patrols']
  },
  {
    id: 'ps-ka-02',
    name: 'Indiranagar Police Station',
    stationCode: 'KA-BLR-028',
    type: 'police',
    jurisdiction: 'East Division',
    district: 'Bengaluru Urban',
    state: 'Karnataka',
    lat: 12.9784,
    lng: 77.6408,
    officerInCharge: 'Inspector Harish Reddy',
    phone: '080-22942542',
    emergencyDial: '112',
    address: '100 Feet Road, HAL 2nd Stage, Indiranagar, Bengaluru 560038',
    services: ['Night Vigilance Unit', 'Traffic Control Interceptor', 'Citizen Help Desk']
  },

  // Haryana - Gurugram
  {
    id: 'ps-hr-01',
    name: 'Cyber Crime Police Station Gurugram',
    stationCode: 'HR-GGN-CYB',
    type: 'police',
    jurisdiction: 'Gurugram Commissionerate HQ',
    district: 'Gurugram',
    state: 'Haryana',
    lat: 28.4595,
    lng: 77.0266,
    officerInCharge: 'ACP Priyanshu Dewan',
    phone: '0124-2211033',
    emergencyDial: '1930 / 112',
    address: 'Sector 43, DLF Phase 4, Gurugram 122002',
    services: ['Cyber Financial Fraud Rapid Freezing', 'Forensic Data Extraction', 'Corporate Alert Desk']
  },

  // Uttar Pradesh - Varanasi
  {
    id: 'ps-up-01',
    name: 'Dashashwamedh Police Station',
    stationCode: 'UP-VNS-002',
    type: 'police',
    jurisdiction: 'Kashi Zone Commissionerate',
    district: 'Varanasi',
    state: 'Uttar Pradesh',
    lat: 25.3076,
    lng: 83.0072,
    officerInCharge: 'Insp. Ajay Pratap Singh',
    phone: '0542-2450505',
    emergencyDial: '112',
    address: 'Godowlia Road, Near Dashashwamedh Ghat, Varanasi 221001',
    services: ['Ghat Pilgrim Support Team', 'Lost Person Assistance', 'Water Police Patrol Vessel']
  },

  // Tamil Nadu - Chennai
  {
    id: 'ps-tn-01',
    name: 'Mylapore Police Station (E-1)',
    stationCode: 'TN-CHN-011',
    type: 'police',
    jurisdiction: 'South Zone Mylapore',
    district: 'Chennai',
    state: 'Tamil Nadu',
    lat: 13.0336,
    lng: 80.2676,
    officerInCharge: 'Inspector S. Thangadurai',
    phone: '044-23452580',
    emergencyDial: '112',
    address: 'Kutchery Road, Mylapore, Chennai 600004',
    services: ['Kavalan SOS Dispatch', 'Senior Citizen Safety Patrol', 'Traffic Interceptor Unit']
  },

  // West Bengal - Kolkata
  {
    id: 'ps-wb-01',
    name: 'Lalbazar Central Police Station',
    stationCode: 'WB-KOL-HQ',
    type: 'police',
    jurisdiction: 'Central Division Kolkata',
    district: 'Kolkata',
    state: 'West Bengal',
    lat: 22.5726,
    lng: 88.3519,
    officerInCharge: 'DC Central Command',
    phone: '033-22143230',
    emergencyDial: '112',
    address: '18 Lalbazar Street, BBD Bagh, Kolkata 700001',
    services: ['Integrated Command Control Center', 'Quick Response Team (QRT)', 'Mobile PCR Vans']
  },

  // Rajasthan - Jaipur
  {
    id: 'ps-rj-01',
    name: 'Kotwali Police Station (Badi Chaupar)',
    stationCode: 'RJ-JPR-001',
    type: 'police',
    jurisdiction: 'North District Jaipur',
    district: 'Jaipur',
    state: 'Rajasthan',
    lat: 26.9239,
    lng: 75.8267,
    officerInCharge: 'Insp. Mahendra Meena',
    phone: '0141-2601912',
    emergencyDial: '112',
    address: 'Badi Chaupar, Walled City, Jaipur 302002',
    services: ['Tourist Assistance Unit', 'Heritage Area Foot Patrol', 'Abhay Command Dispatch']
  },

  // Gujarat - Ahmedabad
  {
    id: 'ps-gj-01',
    name: 'Navrangpura Police Station',
    stationCode: 'GJ-AHM-014',
    type: 'police',
    jurisdiction: 'Sector 1 Ahmedabad',
    district: 'Ahmedabad',
    state: 'Gujarat',
    lat: 23.0373,
    lng: 72.5532,
    officerInCharge: 'PI Bhavesh Patel',
    phone: '079-26442345',
    emergencyDial: '112',
    address: 'Near Gujarat University, Navrangpura, Ahmedabad 380009',
    services: ['SHE Team Women Patrol', 'VISWAS CCTV Monitoring', 'E-FIR Citizen Help Kiosk']
  },

  // Telangana - Hyderabad
  {
    id: 'ps-ts-01',
    name: 'Banjara Hills Police Station',
    stationCode: 'TS-HYD-019',
    type: 'police',
    jurisdiction: 'West Zone Commissionerate',
    district: 'Hyderabad',
    state: 'Telangana',
    lat: 17.4156,
    lng: 78.4357,
    officerInCharge: 'Insp. K. Srinivas',
    phone: '040-27853580',
    emergencyDial: '112',
    address: 'Road No. 12, Banjara Hills, Hyderabad 500034',
    services: ['Hawk Eye Rapid Mobile Unit', 'CCTV Video Surveillance Node', '24x7 Night Interceptor']
  }
];

export const MOCK_CRIME_HOTSPOTS: CrimeHotspot[] = [
  // Delhi
  {
    id: 'hs-dl-01',
    name: 'Old Delhi Railway Station & Chandni Chowk Transit Hub',
    type: 'hotspot',
    district: 'Central Delhi',
    state: 'Delhi',
    lat: 28.6586,
    lng: 77.2309,
    radiusMeters: 650,
    severity: 'high',
    reportedIncidents30d: 48,
    primaryCategory: 'Pickpocketing',
    patrolStatus: 'Intensive Checkpoint',
    description: 'High passenger density intersection prone to bag snatching and pickpocketing during peak transit hours (08:00–11:00 & 18:00–21:00).'
  },
  {
    id: 'hs-dl-02',
    name: 'Anand Vihar ISBT & Terminal Surroundings',
    type: 'hotspot',
    district: 'East Delhi',
    state: 'Delhi',
    lat: 28.6469,
    lng: 77.3160,
    radiusMeters: 750,
    severity: 'elevated',
    reportedIncidents30d: 36,
    primaryCategory: 'Vehicle Theft',
    patrolStatus: 'Active Night Patrol',
    description: 'Interstate border corridor with frequent two-wheeler theft reports and unauthorized commuter taxi operations.'
  },

  // Maharashtra - Pune
  {
    id: 'hs-mh-01',
    name: 'Swargate Bus Terminal & Flyover Corridor',
    type: 'hotspot',
    district: 'Pune',
    state: 'Maharashtra',
    lat: 18.5018,
    lng: 73.8586,
    radiusMeters: 550,
    severity: 'elevated',
    reportedIncidents30d: 29,
    primaryCategory: 'Pickpocketing',
    patrolStatus: 'CCTV Monitored',
    description: 'Major state transport node with elevated phone grabbing and bag theft cases reported during evening commute.'
  },
  {
    id: 'hs-mh-02',
    name: 'Wakad-Hinjawadi Flyover Junction',
    type: 'hotspot',
    district: 'Pune',
    state: 'Maharashtra',
    lat: 18.5987,
    lng: 73.7621,
    radiusMeters: 800,
    severity: 'moderate',
    reportedIncidents30d: 19,
    primaryCategory: 'Traffic Congestion',
    patrolStatus: 'Active Night Patrol',
    description: 'High-volume IT commute gateway; frequent minor vehicular accidents and evening congestion bottlenecks.'
  },

  // Karnataka - Bengaluru
  {
    id: 'hs-ka-01',
    name: 'Majestic KSR Bengaluru Inter-modal Hub',
    type: 'hotspot',
    district: 'Bengaluru Urban',
    state: 'Karnataka',
    lat: 12.9781,
    lng: 77.5695,
    radiusMeters: 700,
    severity: 'high',
    reportedIncidents30d: 52,
    primaryCategory: 'Pickpocketing',
    patrolStatus: 'Intensive Checkpoint',
    description: 'Confluence of metro, BMTC, KSRTC, and railway terminals; persistent high footfall attracts petty theft syndicates.'
  },
  {
    id: 'hs-ka-02',
    name: 'Silk Board Junction & ORR Flyover',
    type: 'hotspot',
    district: 'Bengaluru Urban',
    state: 'Karnataka',
    lat: 12.9176,
    lng: 77.6238,
    radiusMeters: 850,
    severity: 'elevated',
    reportedIncidents30d: 31,
    primaryCategory: 'Traffic Congestion',
    patrolStatus: 'CCTV Monitored',
    description: 'Extreme peak traffic corridor with frequent two-wheeler breakdown bottlenecks and evening hit-and-run fender benders.'
  },

  // Haryana - Gurugram
  {
    id: 'hs-hr-01',
    name: 'Cyber City & Shankar Chowk Expressway Underpass',
    type: 'hotspot',
    district: 'Gurugram',
    state: 'Haryana',
    lat: 28.4984,
    lng: 77.0888,
    radiusMeters: 600,
    severity: 'elevated',
    reportedIncidents30d: 27,
    primaryCategory: 'Cyber Fraud',
    patrolStatus: 'CCTV Monitored',
    description: 'Corporate hub perimeter with reports of fraudulent ATM skimming, taxi overcharging disputes, and late-night speeding.'
  },

  // Uttar Pradesh - Varanasi
  {
    id: 'hs-up-01',
    name: 'Godowlia Crossing to Dashashwamedh Ghat',
    type: 'hotspot',
    district: 'Varanasi',
    state: 'Uttar Pradesh',
    lat: 25.3090,
    lng: 83.0040,
    radiusMeters: 500,
    severity: 'moderate',
    reportedIncidents30d: 22,
    primaryCategory: 'Pickpocketing',
    patrolStatus: 'Heightened Vigilance',
    description: 'Dense pilgrimage pedestrian alley with evening Aarti crowd surges; warnings issued against unauthorized ticket agents.'
  },

  // Maharashtra - Mumbai
  {
    id: 'hs-mh-03',
    name: 'Dadar Western-Central Rail Interchange',
    type: 'hotspot',
    district: 'Mumbai City',
    state: 'Maharashtra',
    lat: 19.0178,
    lng: 72.8432,
    radiusMeters: 600,
    severity: 'high',
    reportedIncidents30d: 44,
    primaryCategory: 'Pickpocketing',
    patrolStatus: 'Intensive Checkpoint',
    description: 'Busiest railway transit interchange in Mumbai; heavy crowding on foot overbridges during morning peak rush.'
  },

  // Tamil Nadu - Chennai
  {
    id: 'hs-tn-01',
    name: 'T. Nagar Ranganathan Street Commercial Belt',
    type: 'hotspot',
    district: 'Chennai',
    state: 'Tamil Nadu',
    lat: 13.0418,
    lng: 80.2341,
    radiusMeters: 550,
    severity: 'moderate',
    reportedIncidents30d: 25,
    primaryCategory: 'Pickpocketing',
    patrolStatus: 'CCTV Monitored',
    description: 'High-density commercial retail bazaar with seasonal festive shopping crowd bottlenecks.'
  },

  // West Bengal - Kolkata
  {
    id: 'hs-wb-01',
    name: 'Howrah Station Approach & Bus Terminal',
    type: 'hotspot',
    district: 'Kolkata',
    state: 'West Bengal',
    lat: 22.5839,
    lng: 88.3426,
    radiusMeters: 700,
    severity: 'high',
    reportedIncidents30d: 39,
    primaryCategory: 'Pickpocketing',
    patrolStatus: 'Active Night Patrol',
    description: 'Major railway terminus connecting metropolitan Kolkata; high-density luggage theft and tout activity zone.'
  }
];

export const MOCK_HELP_CENTERS: HelpCenter[] = [
  // National / Delhi
  {
    id: 'hc-dl-01',
    name: 'Delhi Emergency Response Support System (ERSS 112)',
    type: 'help_center',
    category: 'emergency_112',
    district: 'New Delhi',
    state: 'Delhi',
    lat: 28.6304,
    lng: 77.2177,
    helplineNumber: '112',
    operatingHours: '24 Hours / 7 Days',
    address: 'Delhi Police HQ, Jai Singh Road, New Delhi 110001',
    agency: 'Ministry of Home Affairs & Delhi Police'
  },
  {
    id: 'hc-dl-02',
    name: 'Dr. Ram Manohar Lohia Hospital (Emergency Trauma Center)',
    type: 'help_center',
    category: 'hospital',
    district: 'New Delhi',
    state: 'Delhi',
    lat: 28.6245,
    lng: 77.1995,
    helplineNumber: '011-23365525',
    operatingHours: '24 Hours / 7 Days',
    address: 'Baba Kharak Singh Marg, Connaught Place, New Delhi 110001',
    agency: 'Central Government Hospital & Level 1 Trauma Care'
  },
  {
    id: 'hc-dl-03',
    name: 'National Cyber Crime Reporting Center (I4C)',
    type: 'help_center',
    category: 'emergency_112',
    district: 'New Delhi',
    state: 'Delhi',
    lat: 28.6200,
    lng: 77.2180,
    helplineNumber: '1930',
    operatingHours: '24 Hours / 7 Days',
    address: 'NDCC-II Building, Jai Singh Road, New Delhi 110001',
    agency: 'Indian Cyber Crime Coordination Centre (I4C)'
  },
  {
    id: 'hc-dl-04',
    name: 'One Stop Crisis Center for Women (Sakhi Center)',
    type: 'help_center',
    category: 'women_helpline',
    district: 'New Delhi',
    state: 'Delhi',
    lat: 28.6142,
    lng: 77.2120,
    helplineNumber: '181',
    operatingHours: '24 Hours / 7 Days',
    address: 'Near Lady Hardinge Medical College, New Delhi 110001',
    agency: 'Department of Women & Child Development'
  },

  // Maharashtra - Mumbai & Pune
  {
    id: 'hc-mh-01',
    name: 'Maharashtra Dial 112 State Command & Control Center',
    type: 'help_center',
    category: 'emergency_112',
    district: 'Mumbai City',
    state: 'Maharashtra',
    lat: 18.9322,
    lng: 72.8335,
    helplineNumber: '112',
    operatingHours: '24 Hours / 7 Days',
    address: 'State Police Headquarters, Colaba, Mumbai 400001',
    agency: 'Maharashtra State Police'
  },
  {
    id: 'hc-mh-02',
    name: 'KEM Hospital & Seth GS Medical College (Apex Trauma)',
    type: 'help_center',
    category: 'hospital',
    district: 'Mumbai City',
    state: 'Maharashtra',
    lat: 19.0028,
    lng: 72.8427,
    helplineNumber: '022-24107000',
    operatingHours: '24 Hours / 7 Days',
    address: 'Acharya Donde Marg, Parel, Mumbai 400012',
    agency: 'Brihanmumbai Municipal Corporation (BMC)'
  },
  {
    id: 'hc-mh-03',
    name: 'Sassoon General Hospital & BJ Government Medical College',
    type: 'help_center',
    category: 'hospital',
    district: 'Pune',
    state: 'Maharashtra',
    lat: 18.5283,
    lng: 73.8742,
    helplineNumber: '020-26128000',
    operatingHours: '24 Hours / 7 Days',
    address: 'Near Pune Railway Station, Sassoon Road, Pune 411001',
    agency: 'Government of Maharashtra Medical Education'
  },
  {
    id: 'hc-mh-04',
    name: 'Pune Childline & Emergency Child Protection Cell',
    type: 'help_center',
    category: 'child_care',
    district: 'Pune',
    state: 'Maharashtra',
    lat: 18.5300,
    lng: 73.8500,
    helplineNumber: '1098',
    operatingHours: '24 Hours / 7 Days',
    address: 'Shivajinagar Social Welfare Complex, Pune 411005',
    agency: 'Ministry of Women and Child Development'
  },

  // Karnataka - Bengaluru
  {
    id: 'hc-ka-01',
    name: 'Karnataka Dial 112 Command & Control Center',
    type: 'help_center',
    category: 'emergency_112',
    district: 'Bengaluru Urban',
    state: 'Karnataka',
    lat: 12.9716,
    lng: 77.5946,
    helplineNumber: '112',
    operatingHours: '24 Hours / 7 Days',
    address: 'Infantry Road, Bengaluru 560001',
    agency: 'Karnataka State Police ERSS'
  },
  {
    id: 'hc-ka-02',
    name: 'Victoria Hospital Emergency Trauma Center',
    type: 'help_center',
    category: 'hospital',
    district: 'Bengaluru Urban',
    state: 'Karnataka',
    lat: 12.9642,
    lng: 77.5746,
    helplineNumber: '080-26701150',
    operatingHours: '24 Hours / 7 Days',
    address: 'Fort Road, Near City Market, Bengaluru 560002',
    agency: 'Bangalore Medical College and Research Institute'
  },
  {
    id: 'hc-ka-03',
    name: 'Bengaluru Parihar Vanitha Sahayavani (Women Distress Desk)',
    type: 'help_center',
    category: 'women_helpline',
    district: 'Bengaluru Urban',
    state: 'Karnataka',
    lat: 12.9780,
    lng: 77.5920,
    helplineNumber: '1091 / 080-22943225',
    operatingHours: '24 Hours / 7 Days',
    address: 'Bengaluru City Police Commissioner Office, Infantry Road, Bengaluru 560001',
    agency: 'Bengaluru City Police Community Initiative'
  },

  // Haryana - Gurugram
  {
    id: 'hc-hr-01',
    name: 'Civil Hospital Gurugram (Trauma & Emergency Wing)',
    type: 'help_center',
    category: 'hospital',
    district: 'Gurugram',
    state: 'Haryana',
    lat: 28.4632,
    lng: 77.0305,
    helplineNumber: '0124-2320102',
    operatingHours: '24 Hours / 7 Days',
    address: 'Civil Lines, Near Mor Chowk, Gurugram 122001',
    agency: 'Health Department Haryana'
  },
  {
    id: 'hc-hr-02',
    name: 'Haryana 112 ERSS Emergency Center',
    type: 'help_center',
    category: 'emergency_112',
    district: 'Gurugram',
    state: 'Haryana',
    lat: 28.4710,
    lng: 77.0420,
    helplineNumber: '112',
    operatingHours: '24 Hours / 7 Days',
    address: 'Mini Secretariat, Sector 1, Gurugram 122001',
    agency: 'Haryana Police ERSS'
  },

  // Uttar Pradesh - Varanasi
  {
    id: 'hc-up-01',
    name: 'Sir Sunderlal Hospital & Trauma Center (BHU)',
    type: 'help_center',
    category: 'hospital',
    district: 'Varanasi',
    state: 'Uttar Pradesh',
    lat: 25.2750,
    lng: 82.9990,
    helplineNumber: '0542-2369024',
    operatingHours: '24 Hours / 7 Days',
    address: 'Banaras Hindu University Campus, Varanasi 221005',
    agency: 'Institute of Medical Sciences, BHU'
  },

  // Tamil Nadu - Chennai
  {
    id: 'hc-tn-01',
    name: 'Rajiv Gandhi Government General Hospital (Trauma Hub)',
    type: 'help_center',
    category: 'hospital',
    district: 'Chennai',
    state: 'Tamil Nadu',
    lat: 13.0810,
    lng: 80.2780,
    helplineNumber: '044-25305000',
    operatingHours: '24 Hours / 7 Days',
    address: 'EVR Periyar Salai, Park Town, Chennai 600003',
    agency: 'Madras Medical College & TN Health'
  },

  // West Bengal - Kolkata
  {
    id: 'hc-wb-01',
    name: 'SSKM Hospital & IPGMER (Level-1 Apex Trauma)',
    type: 'help_center',
    category: 'hospital',
    district: 'Kolkata',
    state: 'West Bengal',
    lat: 22.5398,
    lng: 88.3444,
    helplineNumber: '033-22231589',
    operatingHours: '24 Hours / 7 Days',
    address: '244 AJC Bose Road, Bhowanipore, Kolkata 700020',
    agency: 'Department of Health & Family Welfare, WB'
  }
];

// Helper to filter features by active district or state
export function getFilteredLayerFeatures(
  selectedState: string | null,
  selectedDistrict: string | null
) {
  const normState = selectedState?.toLowerCase().trim();
  const normDist = selectedDistrict?.toLowerCase().trim();

  const police = MOCK_POLICE_STATIONS.filter(p => {
    if (normDist && p.district.toLowerCase() === normDist) return true;
    if (normState && p.state.toLowerCase() === normState) return true;
    return !normState; // If all-India, show all
  });

  const hotspots = MOCK_CRIME_HOTSPOTS.filter(h => {
    if (normDist && h.district.toLowerCase() === normDist) return true;
    if (normState && h.state.toLowerCase() === normState) return true;
    return !normState;
  });

  const helpCenters = MOCK_HELP_CENTERS.filter(c => {
    if (normDist && c.district.toLowerCase() === normDist) return true;
    if (normState && c.state.toLowerCase() === normState) return true;
    return !normState;
  });

  return { police, hotspots, helpCenters };
}
