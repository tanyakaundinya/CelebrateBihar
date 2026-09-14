export interface ServiceItem {
  id: string;
  name: string;
  shortDesc: string;
  group: "cooling" | "appliances" | "electrical" | "plumbing" | "furniture" | "turnkey" | "custom";
  features: string[];
  popular?: boolean;
  pricingModel?: "fixed" | "starting_from" | "custom";
  basePrice?: number | null;
  pricingLabel?: string;
}

export interface ServiceCategory {
  id: string;
  categoryName: string;
  shortTitle: string;
  badge: string;
  description: string;
  targetSpaces?: string[];
  services: ServiceItem[];
}

export const serviceData: ServiceCategory[] = [
  {
    id: "repair-maintenance",
    categoryName: "Repair & Maintenance Services",
    shortTitle: "Repair & Maintenance",
    badge: "Doorstep Qualified Technicians",
    description:
      "Rapid doorstep repair, maintenance, installation and technical support across Bihar. Verified professionals, transparent diagnostics, and 30-day rework warranty.",
    services: [
      {
        id: "ac-service-repair",
        name: "Air Conditioner (AC) Repair, Service & Installation",
        shortDesc: "Split & Window AC servicing, gas refill, deep cleaning, installation & PCB repairs.",
        group: "cooling",
        popular: true,
        features: [
          "Jet pump deep foam cleaning",
          "Gas leak detection & refill",
          "Indoor & outdoor unit mounting / uninstallation",
          "Compressor & inverter PCB diagnosis",
        ],
      },
      {
        id: "refrigerator-repair",
        name: "Refrigerator Repair & Maintenance",
        shortDesc: "Single, double door & deep freezer cooling diagnostics and component replacement.",
        group: "appliances",
        popular: true,
        features: [
          "Cooling coil & defrost cycle repair",
          "Compressor testing & relay replacement",
          "Gas charging & thermostat fixing",
          "Door gasket & electrical leakage check",
        ],
      },
      {
        id: "tv-repair",
        name: "Television (TV) Repair & Maintenance",
        shortDesc: "LED, OLED & Smart TV display panel, sound, backlight, and motherboard repairs.",
        group: "appliances",
        features: [
          "Display panel & backlight strip repair",
          "Sound IC & speaker replacement",
          "Smart TV motherboard & power supply fix",
          "Wall mount bracket installation",
        ],
      },
      {
        id: "air-cooler-repair",
        name: "Air Cooler Repair & Service",
        shortDesc: "Desert & personal air cooler motor rewinding, pump replacement and pad fitting.",
        group: "cooling",
        features: [
          "Submersible water pump replacement",
          "Fan motor servicing & coil rewinding",
          "Honeycomb & grass pad replacement",
          "Wiring, swing louvers & body sealing",
        ],
      },
      {
        id: "fan-repair-installation",
        name: "Fan Repair & Installation",
        shortDesc: "Ceiling, exhaust, wall and pedestal fan rewinding, capacitor, and new fittings.",
        group: "electrical",
        features: [
          "Ceiling fan mounting & hook alignment",
          "Capacitor & bearing replacement",
          "Copper coil rewinding & speed regulation",
          "Kitchen & bathroom exhaust fan setup",
        ],
      },
      {
        id: "general-electrical",
        name: "General Electrical Services",
        shortDesc: "Rapid fault troubleshooting, MCB tripping, socket replacement and short circuit repairs.",
        group: "electrical",
        popular: true,
        features: [
          "Short circuit & line fault diagnosis",
          "MCB, isolator & distribution box fixing",
          "Modular switch & socket replacement",
          "Inverter & battery wiring overhaul",
        ],
      },
      {
        id: "electrical-wiring-fitting",
        name: "Electrical Wiring & Fitting",
        shortDesc: "Complete concealed conduit wiring, phase load balancing and renovation fittings.",
        group: "electrical",
        features: [
          "Concealed PVC conduit pipe routing",
          "Fire-resistant copper cable pulling",
          "Earthing & 3-phase load balancing",
          "Appliance heavy load cabling",
        ],
      },
      {
        id: "lighting-installation",
        name: "Lighting Installation & Maintenance",
        shortDesc: "LED false ceiling lights, chandeliers, profile lights, indoor & outdoor illumination.",
        group: "electrical",
        features: [
          "COB, spot & strip profile lighting",
          "Chandelier & pendant light installation",
          "Commercial panel & floodlight mounting",
          "Smart ambient & decorative illumination",
        ],
      },
      {
        id: "plumbing-services",
        name: "Plumbing Services",
        shortDesc: "Leakage fixing, tap/sanitary fittings, pipe blockages, geyser and motor connections.",
        group: "plumbing",
        popular: true,
        features: [
          "Tap, shower & diverter valve replacement",
          "Concealed pipeline leakage detection",
          "Washbasin, commode & cistern fitting",
          "Water motor pump & tank connection",
        ],
      },
      {
        id: "furniture-repair-assembly",
        name: "Furniture Repair & Assembly",
        shortDesc: "Modular workstation assembly, chair hydraulics, bed/wardrobe fittings & carpentry.",
        group: "furniture",
        features: [
          "IKEA & modular furniture assembly",
          "Hydraulic office chair gas lift repair",
          "Bed, wardrobe & cabinet hinges fixing",
          "Door lock, handle & slider alignment",
        ],
      },
      {
        id: "equipment-installation",
        name: "Equipment Installation & Maintenance",
        shortDesc: "Heavy appliance mounting, commercial kitchen equipment, stabilizers & office gear.",
        group: "appliances",
        features: [
          "Heavy voltage stabilizer & UPS setup",
          "Water purifier & RO commercial filter setup",
          "Commercial microwave & warmer setup",
          "Safety earthing & load check",
        ],
      },
      {
        id: "home-commercial-maintenance",
        name: "Home & Commercial Maintenance Services",
        shortDesc: "Preventative multi-point electrical, HVAC, plumbing and infrastructure audits.",
        group: "turnkey",
        features: [
          "Periodic HVAC & electrical safety check",
          "Plumbing pressure & pipeline inspection",
          "Priority emergency technician dispatch",
          "Quarterly & annual maintenance contracts",
        ],
      },
      {
        id: "custom-repair",
        name: "Other Custom Repair Requirements",
        shortDesc: "Specialized equipment repairs, bespoke electrical tasks, and tailored technical fixes.",
        group: "custom",
        features: [
          "Dedicated site diagnosis by senior technician",
          "Custom parts procurement assistance",
          "Transparent scope approval",
          "Single-point operational accountability",
        ],
      },
    ],
  },
  {
    id: "bank-office-setup",
    categoryName: "Bank, Office & Institutional Setup Solutions",
    shortTitle: "Bank & Office Setup",
    badge: "Turnkey Commercial Infrastructure",
    description:
      "End-to-end procurement, coordination, and setup support for newly established, renovated, or expanding commercial spaces across Bihar. Single-point contact, zero operational headaches.",
    targetSpaces: [
      "Banks & Financial Branches",
      "Corporate Offices & IT Hubs",
      "Retail Shops & Showrooms",
      "Educational Institutions & Labs",
      "Government & Private Establishments",
      "Other Commercial Facilities",
    ],
    services: [
      {
        id: "furniture-workspace-setup",
        name: "Furniture & Workspace Setup",
        shortDesc: "Workstations, ergonomic seating, reception desks, waiting lounges, and storage units.",
        group: "furniture",
        popular: true,
        features: [
          "Office tables & modular workstation pods",
          "Ergonomic executive & staff chair setups",
          "Reception counters & customer waiting areas",
          "Filing cabinets, lockers & storage units",
        ],
      },
      {
        id: "electrical-lighting-solutions",
        name: "Electrical & Lighting Solutions",
        shortDesc: "Full electrical wiring, switches/sockets, LED illumination, and power distribution infrastructure.",
        group: "electrical",
        popular: true,
        features: [
          "Complete structured electrical wiring & conduits",
          "Modular switch, socket & floor-box fitting",
          "Indoor & outdoor LED lighting layout",
          "Main panel, DB & UPS power distribution",
        ],
      },
      {
        id: "cooling-climate-solutions",
        name: "Cooling & Climate Solutions",
        shortDesc: "Commercial AC installation, cassette/ductable units, ventilation, and air circulation setup.",
        group: "cooling",
        features: [
          "Multi-split, cassette & ductable AC installation",
          "Commercial air cooler & exhaust setup",
          "Fresh air ventilation & duct arrangements",
          "Climate control & temperature balancing",
        ],
      },
      {
        id: "plumbing-utility-installation",
        name: "Plumbing & Utility Installation",
        shortDesc: "Water supply systems, sanitary washroom fittings, drainage lines, and water treatment.",
        group: "plumbing",
        features: [
          "Commercial water supply line layout",
          "Staff & visitor washroom sanitary fittings",
          "Underground & overhead drainage solutions",
          "Commercial RO & pantry utility setup",
        ],
      },
      {
        id: "infrastructure-support-services",
        name: "CCTV, Networking & Infrastructure Support",
        shortDesc: "Branding signage, CCTV surveillance, structured LAN/Wi-Fi, and facility preparation.",
        group: "turnkey",
        popular: true,
        features: [
          "Outdoor/indoor branding & signage fitting",
          "CCTV camera & NVR surveillance setup",
          "Structured LAN cabling, rack & Wi-Fi router setup",
          "Deep site cleaning & facility preparation",
        ],
      },
      {
        id: "turnkey-setup-management",
        name: "Complete Turnkey Branch & Office Setup",
        shortDesc: "All-in-one coordination: from empty shell space to fully operational, ready-to-work facility.",
        group: "turnkey",
        popular: true,
        features: [
          "Single-point coordination for all 5 pillars",
          "Comprehensive itemized BOQ estimation",
          "Dedicated Bihar district operations supervisor",
          "Strict milestone tracking & handover guarantee",
        ],
      },
    ],
  },
];
