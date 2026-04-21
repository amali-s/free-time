import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { cities, spaces } from "../src/lib/db/schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL is not set. Add it to .env.local.");
  process.exit(1);
}

const client = postgres(connectionString, { max: 1 });
const db = drizzle(client);

const cityData = [
  {
    slug: "denver-co",
    name: "Denver",
    region: "CO",
    country: "US",
    lat: 39.7392,
    lng: -104.9903,
  },
  {
    slug: "boulder-co",
    name: "Boulder",
    region: "CO",
    country: "US",
    lat: 40.015,
    lng: -105.2705,
  },
];

const spaceData = [
  // ── Denver Libraries ──
  {
    id: "denver-central-library",
    name: "Denver Central Library",
    type: "library" as const,
    lat: 39.7376,
    lng: -104.9879,
    address: "10 W 14th Ave Pkwy, Denver, CO 80204",
    city: "denver-co",
    amenities: ["wifi", "outlets", "seating", "bathroom"],
    tags: ["free", "wifi", "bathroom"],
    priceType: "free" as const,
    noiseLevel: "quiet" as const,
    hours: { open: "09:00", close: "20:00" },
    description:
      "Denver's flagship public library with five floors of workspace, free wifi, and stunning architecture.",
  },
  {
    id: "woodbury-library",
    name: "Woodbury Library",
    type: "library" as const,
    lat: 39.7618,
    lng: -105.0244,
    address: "3265 Federal Blvd, Denver, CO 80211",
    city: "denver-co",
    amenities: ["wifi", "outlets", "seating", "bathroom", "parking"],
    tags: ["free", "wifi", "bathroom"],
    priceType: "free" as const,
    noiseLevel: "quiet" as const,
    hours: { open: "10:00", close: "18:00" },
    description: "Neighborhood DPL branch with meeting rooms and free parking.",
  },
  {
    id: "ross-cherry-creek-library",
    name: "Ross-Cherry Creek Library",
    type: "library" as const,
    lat: 39.7182,
    lng: -104.9549,
    address: "305 Milwaukee St, Denver, CO 80206",
    city: "denver-co",
    amenities: ["wifi", "outlets", "seating", "bathroom"],
    tags: ["free", "wifi", "bathroom"],
    priceType: "free" as const,
    noiseLevel: "quiet" as const,
    hours: { open: "10:00", close: "18:00" },
    description: "Cozy Cherry Creek branch with study rooms and garden views.",
  },
  {
    id: "sam-gary-library",
    name: "Sam Gary Library",
    type: "library" as const,
    lat: 39.756,
    lng: -104.926,
    address: "2961 Roslyn St, Denver, CO 80238",
    city: "denver-co",
    amenities: ["wifi", "outlets", "seating", "bathroom", "parking"],
    tags: ["free", "wifi", "bathroom"],
    priceType: "free" as const,
    noiseLevel: "quiet" as const,
    hours: { open: "09:00", close: "20:00" },
    description:
      "Modern Stapleton branch with large study areas and ample parking.",
  },

  // ── Denver Cafes ──
  {
    id: "tattered-cover-colfax",
    name: "Tattered Cover (Colfax)",
    type: "cafe" as const,
    lat: 39.7403,
    lng: -104.9538,
    address: "2526 E Colfax Ave, Denver, CO 80206",
    city: "denver-co",
    amenities: ["wifi", "seating", "bathroom"],
    tags: ["cafe", "wifi"],
    priceType: "purchase-required" as const,
    noiseLevel: "moderate" as const,
    hours: { open: "07:00", close: "21:00" },
    description:
      "Iconic Denver bookstore with an in-house cafe. Great for long reading and work sessions.",
  },
  {
    id: "huckleberry-roasters",
    name: "Huckleberry Roasters (Sunnyside)",
    type: "cafe" as const,
    lat: 39.7716,
    lng: -104.9976,
    address: "4301 Gallegos Way, Denver, CO 80211",
    city: "denver-co",
    amenities: ["wifi", "outlets", "seating"],
    tags: ["cafe", "wifi"],
    priceType: "purchase-required" as const,
    noiseLevel: "moderate" as const,
    hours: { open: "06:30", close: "18:00" },
    description:
      "Specialty roaster with communal tables and a work-friendly atmosphere.",
  },
  {
    id: "thump-coffee",
    name: "Thump Coffee",
    type: "cafe" as const,
    lat: 39.7362,
    lng: -104.9718,
    address: "1201 E 13th Ave, Denver, CO 80218",
    city: "denver-co",
    amenities: ["wifi", "outlets", "seating"],
    tags: ["cafe", "wifi"],
    priceType: "purchase-required" as const,
    noiseLevel: "moderate" as const,
    hours: { open: "06:00", close: "19:00" },
    description:
      "Spacious Capitol Hill cafe popular with remote workers. Plenty of outlets.",
  },
  {
    id: "novo-coffee-gilpin",
    name: "Novo Coffee (Gilpin)",
    type: "cafe" as const,
    lat: 39.7448,
    lng: -104.9908,
    address: "1600 Glenarm Pl, Denver, CO 80202",
    city: "denver-co",
    amenities: ["wifi", "outlets", "seating"],
    tags: ["cafe", "wifi"],
    priceType: "purchase-required" as const,
    noiseLevel: "moderate" as const,
    hours: { open: "07:00", close: "17:00" },
    description:
      "Downtown Denver micro-roaster with minimalist design and strong espresso.",
  },
  {
    id: "parkside-cafe",
    name: "Parkside Cafe",
    type: "cafe" as const,
    lat: 39.7525,
    lng: -104.9696,
    address: "1609 E 22nd Ave, Denver, CO 80205",
    city: "denver-co",
    amenities: ["wifi", "seating"],
    tags: ["cafe", "wifi"],
    priceType: "purchase-required" as const,
    noiseLevel: "moderate" as const,
    hours: { open: "07:00", close: "16:00" },
    description: "Neighborhood cafe near City Park with a relaxed vibe.",
  },

  // ── Denver Coworking ──
  {
    id: "industry-denver",
    name: "Industry Denver",
    type: "coworking" as const,
    lat: 39.7677,
    lng: -104.9787,
    address: "3001 Brighton Blvd, Denver, CO 80216",
    city: "denver-co",
    amenities: ["wifi", "outlets", "seating", "bathroom", "storage"],
    tags: ["coworking", "wifi", "storage"],
    priceType: "paid" as const,
    noiseLevel: "moderate" as const,
    hours: { open: "08:00", close: "18:00" },
    description:
      "Large RiNo coworking space with day passes, conference rooms, and a rooftop deck.",
  },
  {
    id: "enterprise-coworking-rino",
    name: "Enterprise Coworking (RiNo)",
    type: "coworking" as const,
    lat: 39.7641,
    lng: -104.9783,
    address: "3000 Lawrence St, Denver, CO 80205",
    city: "denver-co",
    amenities: ["wifi", "outlets", "seating", "bathroom"],
    tags: ["coworking", "wifi"],
    priceType: "paid" as const,
    noiseLevel: "moderate" as const,
    hours: { open: "08:00", close: "18:00" },
    description:
      "RiNo coworking with day pass option, phone booths, and a community kitchen.",
  },
  {
    id: "catalyst-hti",
    name: "Catalyst HTI",
    type: "coworking" as const,
    lat: 39.771,
    lng: -104.9748,
    address: "3513 Brighton Blvd, Denver, CO 80216",
    city: "denver-co",
    amenities: ["wifi", "outlets", "seating", "bathroom"],
    tags: ["coworking", "wifi"],
    priceType: "paid" as const,
    noiseLevel: "moderate" as const,
    hours: { open: "08:00", close: "18:00" },
    description:
      "Health-tech focused coworking in RiNo with open desks and event spaces.",
  },

  // ── Denver Parks ──
  {
    id: "denver-botanic-gardens",
    name: "Denver Botanic Gardens",
    type: "park" as const,
    lat: 39.7327,
    lng: -104.9607,
    address: "1007 York St, Denver, CO 80206",
    city: "denver-co",
    amenities: ["seating", "bathroom", "parking"],
    tags: ["paid", "outdoor"],
    priceType: "paid" as const,
    noiseLevel: "quiet" as const,
    hours: { open: "09:00", close: "17:00" },
    description:
      "Beautiful gardens with benches and shaded seating. Paid admission but a peaceful retreat.",
  },
  {
    id: "civic-center-park",
    name: "Civic Center Park",
    type: "park" as const,
    lat: 39.739,
    lng: -104.9881,
    address: "101 W 14th Ave, Denver, CO 80204",
    city: "denver-co",
    amenities: ["seating", "bathroom"],
    tags: ["free", "outdoor"],
    priceType: "free" as const,
    noiseLevel: "moderate" as const,
    hours: null,
    description:
      "Central park between the Capitol and library. Benches, shade trees, and people-watching.",
  },
  {
    id: "cheesman-park",
    name: "Cheesman Park",
    type: "park" as const,
    lat: 39.7312,
    lng: -104.9677,
    address: "1599 E 8th Ave, Denver, CO 80218",
    city: "denver-co",
    amenities: ["seating", "parking"],
    tags: ["free", "outdoor"],
    priceType: "free" as const,
    noiseLevel: "quiet" as const,
    hours: null,
    description:
      "Sprawling urban park with the Cheesman Pavilion and mountain views. Quiet during weekdays.",
  },
  {
    id: "washington-park",
    name: "Washington Park",
    type: "park" as const,
    lat: 39.6978,
    lng: -104.9725,
    address: "701 S Franklin St, Denver, CO 80209",
    city: "denver-co",
    amenities: ["seating", "bathroom", "parking"],
    tags: ["free", "outdoor", "bathroom"],
    priceType: "free" as const,
    noiseLevel: "moderate" as const,
    hours: null,
    description:
      "Denver's most popular park with lakes, paths, and picnic areas.",
  },
  {
    id: "commons-park",
    name: "Commons Park",
    type: "park" as const,
    lat: 39.7571,
    lng: -105.0067,
    address: "1550 Little Raven St, Denver, CO 80202",
    city: "denver-co",
    amenities: ["seating"],
    tags: ["free", "outdoor"],
    priceType: "free" as const,
    noiseLevel: "moderate" as const,
    hours: null,
    description:
      "Riverfront park near Union Station with grassy slopes and skyline views.",
  },

  // ── Denver Transit / Lobby / Plaza ──
  {
    id: "union-station-great-hall",
    name: "Union Station Great Hall",
    type: "transit" as const,
    lat: 39.753,
    lng: -105.0,
    address: "1701 Wynkoop St, Denver, CO 80202",
    city: "denver-co",
    amenities: ["wifi", "seating", "bathroom"],
    tags: ["free", "wifi", "bathroom"],
    priceType: "free" as const,
    noiseLevel: "loud" as const,
    hours: { open: "05:00", close: "01:00" },
    description:
      "Historic train station with free wifi, long communal tables, and plenty of seating. Gets busy during commute hours.",
  },
  {
    id: "colorado-convention-center-lobby",
    name: "Colorado Convention Center Lobby",
    type: "lobby" as const,
    lat: 39.7437,
    lng: -104.9953,
    address: "700 14th St, Denver, CO 80202",
    city: "denver-co",
    amenities: ["wifi", "seating", "bathroom"],
    tags: ["free", "wifi", "bathroom"],
    priceType: "free" as const,
    noiseLevel: "loud" as const,
    hours: { open: "08:00", close: "17:00" },
    description:
      "Large public lobby with seating areas. Accessible when events are running.",
  },
  {
    id: "16th-street-mall",
    name: "16th Street Mall",
    type: "plaza" as const,
    lat: 39.7476,
    lng: -104.9942,
    address: "16th Street Mall, Denver, CO 80202",
    city: "denver-co",
    amenities: ["seating"],
    tags: ["free", "outdoor"],
    priceType: "free" as const,
    noiseLevel: "loud" as const,
    hours: null,
    description:
      "Mile-long pedestrian mall with outdoor seating, shade structures, and street performers.",
  },

  // ── Boulder Spaces ──
  {
    id: "boulder-public-library",
    name: "Boulder Public Library (Main)",
    type: "library" as const,
    lat: 40.0143,
    lng: -105.2791,
    address: "1001 Arapahoe Ave, Boulder, CO 80302",
    city: "boulder-co",
    amenities: ["wifi", "outlets", "seating", "bathroom"],
    tags: ["free", "wifi", "bathroom"],
    priceType: "free" as const,
    noiseLevel: "quiet" as const,
    hours: { open: "09:00", close: "20:00" },
    description:
      "Modern main branch with creek-side reading areas and study rooms.",
  },
  {
    id: "laughing-goat-coffee",
    name: "Laughing Goat Coffee",
    type: "cafe" as const,
    lat: 40.0189,
    lng: -105.2748,
    address: "1709 Pearl St, Boulder, CO 80302",
    city: "boulder-co",
    amenities: ["wifi", "seating"],
    tags: ["cafe", "wifi"],
    priceType: "purchase-required" as const,
    noiseLevel: "moderate" as const,
    hours: { open: "06:30", close: "20:00" },
    description:
      "Pearl Street coffeehouse with live music evenings and a laptop-friendly daytime crowd.",
  },
  {
    id: "rayback-collective",
    name: "Rayback Collective",
    type: "cafe" as const,
    lat: 40.0235,
    lng: -105.2518,
    address: "2775 Valmont Rd, Boulder, CO 80304",
    city: "boulder-co",
    amenities: ["wifi", "outlets", "seating", "bathroom", "parking"],
    tags: ["cafe", "wifi", "bathroom"],
    priceType: "purchase-required" as const,
    noiseLevel: "loud" as const,
    hours: { open: "07:00", close: "22:00" },
    description:
      "Food truck park and taproom with covered outdoor seating and fast wifi. Popular coworking spot.",
  },
  {
    id: "chautauqua-park",
    name: "Chautauqua Park",
    type: "park" as const,
    lat: 39.9996,
    lng: -105.2811,
    address: "900 Baseline Rd, Boulder, CO 80302",
    city: "boulder-co",
    amenities: ["seating", "parking"],
    tags: ["free", "outdoor"],
    priceType: "free" as const,
    noiseLevel: "quiet" as const,
    hours: null,
    description:
      "Historic park at the base of the Flatirons with meadow seating and trailhead access.",
  },
  {
    id: "kiln-coworking",
    name: "Kiln Coworking",
    type: "coworking" as const,
    lat: 40.0228,
    lng: -105.2586,
    address: "2701 Iris Ave, Boulder, CO 80304",
    city: "boulder-co",
    amenities: ["wifi", "outlets", "seating", "bathroom"],
    tags: ["coworking", "wifi"],
    priceType: "paid" as const,
    noiseLevel: "moderate" as const,
    hours: { open: "08:00", close: "18:00" },
    description:
      "Boulder coworking space with day passes, meeting rooms, and a community vibe.",
  },
];

async function seed() {
  console.log("Seeding cities...");
  await db.insert(cities).values(cityData).onConflictDoNothing();
  console.log(`  Inserted ${cityData.length} cities.`);

  console.log("Seeding spaces...");
  await db.insert(spaces).values(spaceData).onConflictDoNothing();
  console.log(`  Inserted ${spaceData.length} spaces.`);

  console.log(`Seed complete — ${cityData.length} cities, ${spaceData.length} spaces.`);
  await client.end();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
