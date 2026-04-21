# Space Qualification Criteria for FreeTime

**Document Purpose:** Define what qualifies as a "space" that should be shown on FreeTime

**Last Updated:** April 19, 2026

---

## Core Definition

A **space** in FreeTime is any **public or semi-public location** where a person can spend **extended time** (2+ hours) productively, without being a customer requirement to purchase anything.

**Examples:** Coffee shops (if you can stay without buying), libraries, coworking spaces, parks, plazas, transit hubs, lobbies, bookstores

---

## Required Fields for a Space to Qualify

### 1. **Geographic Location** ✅ REQUIRED
- Latitude & longitude (required)
- Valid address (required)
- City/region (required)
- Must be mappable and locatable

### 2. **Identity** ✅ REQUIRED
- Unique ID (required)
- Name (required, e.g., "Central Library", "Starbucks Downtown")
- Space type/category (required)

### 3. **Accessibility Information** ✅ REQUIRED
- At least ONE of the following:
  - Hours of operation (open/close times)
  - OR price type (free/paid/purchase-required)
  - OR description explaining access

---

## Space Type Categories

Spaces must fit into one of these categories:

| Type | Description | Example |
|------|-------------|---------|
| **cafe** | Coffee shop, tea shop, casual dining | Starbucks, local coffee roaster |
| **coworking** | Dedicated co-working space (day-pass available) | WeWork, local co-working space |
| **library** | Public library, academic library | Denver Central Library |
| **park** | Public outdoor space with seating | Washington Park, urban plaza |
| **plaza** | Town square, outdoor public gathering space | Civic Center Plaza |
| **transit** | Transit hubs (airports, train stations) | Union Station, airport terminal |
| **lobby** | Hotel/building lobby accessible to public | Hotel lobby seating area |
| **other** | Doesn't fit above categories | Museum, university common room |

---

## IMPORTANT: Storage Spaces Are NOT Included

**Storage facilities are a SEPARATE category and should NOT be shown on FreeTime.**

| NOT a Space | Reason | Example |
|-----------|--------|---------|
| **Storage** | For assets, not people. No extended time spent. | Self-storage units, lockers, storage warehouses |

**Key Distinction:**
- ✅ **Amenity:** "Storage available" = Space has lockers/cubbies where you can store bags while working
- ❌ **Space Type:** "Storage" = Storage facility where you rent a unit (not a place to spend time)

**If a space offers "storage as an amenity"** (like a coworking space with lockers), that's fine—include it as a coworking space with "storage" amenity.

**If it's just a storage facility**, do not include it. FreeTime is for places where people spend time, not for places to store things.

---

## Amenity Support

Spaces should indicate which of these amenities they support:

| Amenity | Meaning | Selection |
|---------|---------|-----------|
| **wifi** | Free WiFi available | Yes/No |
| **outlets** | Power outlets/charging available | Yes/No |
| **seating** | Comfortable seating available | Yes/No |
| **bathroom** | Restroom access for customers | Yes/No |
| **storage** | Luggage/bag/coat storage while working | Yes/No |
| **quiet** | Quiet environment suitable for focus work | Yes/No |
| **parking** | Parking available (free or paid) | Yes/No |

**Note on Storage Amenity:**
- ✅ **Storage as amenity** = Coworking space with lockers, cafe with coat rack/cubbies where you can leave your bag while working
- ❌ **Storage as space type** = Self-storage unit rental facility (NOT a FreeTime space)

**Requirement:** Spaces should have at least ONE amenity listed (preferably 2+)

---

## Price Type Classification

Every space must be classified as ONE of:

| Price Type | Meaning | Examples |
|-----------|---------|----------|
| **free** | No purchase required to stay | Parks, libraries, some lobbies, plazas |
| **paid** | Day-pass or membership required | Coworking spaces, some gyms |
| **purchase-required** | Must buy something to stay (but doesn't require continuous purchases) | Coffee shop, restaurant |

---

## Noise Level Classification

Every space must be classified as ONE of:

| Noise Level | Suitable For | Examples |
|-------------|-------------|----------|
| **quiet** | Focused work, studying, calls | Libraries, quiet cafes, study lounges |
| **moderate** | General work, meetings, some distractions | Most coffee shops, coworking spaces |
| **loud** | Social meetings, group work, casual hangout | Busy cafes, food courts, bustling plazas |

---

## Hours of Operation

**Requirement:** Should include hours if possible
- Format: HH:MM (24-hour format, e.g., "09:00", "20:00")
- If hours vary by day: Should handle that or list typical hours
- If open 24/7: Can be noted
- If no fixed hours: Can be null/empty

---

## Filtering Criteria

Users can filter spaces by:

**Primary Filters (Amenities):**
- Wifi
- Outlets
- Seating
- Bathroom
- Storage
- Quiet

**Secondary Filters (Metadata):**
- Distance (within X km)
- Price type (free/paid/purchase-required)
- Noise level (quiet/moderate/loud)
- Hours (currently open/will open)
- Space type (cafe, library, coworking, etc.)

**Spaces must be queryable by at least 2 filters to be useful**

---

## Spaces That DO NOT Qualify

❌ **Exclude these:**

| Reason | Example | Why Not |
|--------|---------|---------|
| **Requires paid membership** | Gym, country club | Most users can't access |
| **Must be a customer** | Restaurant (must buy meal every hour) | Not practical for extended time |
| **No amenities** | Empty park with no seating | Can't work there |
| **No public access** | Private office, home, corporate building | Not public |
| **Private property** | Event space, corporation/office buildings | Requires special arrangement, not walk-in accessible |
| **Too temporary** | Food truck, popup | Not reliable |
| **Event spaces** | Wedding venues, conference rooms, private halls | Private rental, not open to public |
| **Storage only** | Self-storage units, lockers, storage warehouse | For assets, not for people to spend time |
| **Dangerous/inappropriate** | Sketchy alley, unsafe neighborhood | Not safe |
| **No address** | Unknown location | Can't map it |
| **No name** | "Building near 5th St" | Can't identify it |

---

## Quality Standards

Spaces should meet these quality thresholds:

### Address Quality
- ✅ Complete street address with city/state/zip
- ❌ Vague addresses like "downtown area" or "near the park"

### Amenity Information
- ✅ At least 2 amenities listed (more is better)
- ❌ No amenities listed (space becomes less useful)

### Hours Information
- ✅ Accurate, up-to-date hours of operation
- ❌ Missing or outdated hours

### Description/Context
- ✅ Description of why this is a good work space
- ❌ No description of what makes it suitable

### Image
- ✅ Photo of the space (for visual verification)
- ❌ No image (harder to verify it's the right place)

---

## Data Completeness Scoring

Spaces are more valuable when they have complete data:

| Field | Points | Required? |
|-------|--------|-----------|
| ID | 1 | Yes |
| Name | 1 | Yes |
| Address | 1 | Yes |
| Lat/Lng | 1 | Yes |
| Type | 1 | Yes |
| Price Type | 1 | Yes |
| Noise Level | 1 | Yes |
| **Subtotal** | **7** | **Required** |
| Hours (open/close) | 2 | Recommended |
| 2+ Amenities | 2 | Recommended |
| Description | 1 | Recommended |
| Website | 1 | Optional |
| Image | 1 | Optional |
| **Total Possible** | **14** | |

**Minimum to Show:** 7/14 (required fields only)  
**Good Quality:** 10/14+  
**Excellent Quality:** 12/14+

---

## Location Requirements

Spaces must:
- ✅ Be in a supported city (Denver, Boulder, etc.)
- ✅ Have valid latitude/longitude coordinates
- ✅ Be geographically accurate (can be mapped)
- ✅ Be accessible (legal public access)
- ✅ Be reachable (not private property)

---

## Content Verification

Before a space is added to FreeTime:

### Verification Steps
1. ✅ Is the name correct?
2. ✅ Is the address accurate?
3. ✅ Are the amenities actually available?
4. ✅ Are the hours correct?
5. ✅ Is the space still in operation?
6. ✅ Is the image recent and accurate?

### Update Frequency
- Hours: Weekly or monthly
- Amenities: Monthly
- Address/contact: Quarterly
- Status (open/closed): Monthly

---

## Special Cases

### Coffee Shops & Cafes
- ✅ INCLUDE: Cafe where you can stay 2+ hours with one purchase
- ❌ EXCLUDE: Fast food where loitering is discouraged
- **Key:** Is the environment conducive to staying? Do they tolerate long stays?

### Parks & Plazas
- ✅ INCLUDE: Park with seating, tables, shade
- ❌ EXCLUDE: Empty field or park with no amenities
- **Key:** Can someone realistically work here?

### Transit Hubs
- ✅ INCLUDE: Airport terminal, train station with seating, wifi, bathrooms
- ❌ EXCLUDE: Bus stop with one bench
- **Key:** Is there enough comfort for extended time?

### Hotels & Lobbies
- ✅ INCLUDE: Hotel lobby open to public with comfortable seating
- ❌ EXCLUDE: Restricted access, guest-only areas
- **Key:** Is the public actually welcome?

### Coworking Spaces
- ✅ INCLUDE: Day-pass available (you can pay per day)
- ❌ EXCLUDE: Monthly membership only, no day options
- **Key:** Can casual users access it?

---

## Seasonal Considerations

- Indoor spaces: Available year-round ✅
- Outdoor spaces: May be seasonal (note in description)
- Hours may change by season (update seasonally)

---

## Accessibility Considerations

Spaces should indicate:
- ✅ Wheelchair accessible entrance/restrooms
- ✅ Accessible seating
- ✅ Service animal policy
- ✅ WiFi accessibility (password-free or easy to obtain)

---

## API Response Format

When a space is returned via `/api/spaces`, it should include:

```json
{
  "id": "sp_abc123",
  "name": "Central Library",
  "type": "library",
  "lat": 39.7392,
  "lng": -104.9903,
  "address": "10 W 14th Ave Pkwy, Denver, CO 80202",
  "city": "denver-co",
  "amenities": ["wifi", "outlets", "seating", "bathroom"],
  "tags": ["free", "wifi", "bathroom"],
  "priceType": "free",
  "noiseLevel": "quiet",
  "hours": {
    "open": "09:00",
    "close": "20:00"
  },
  "distanceKm": 0.8,
  "description": "Denver's main public library with free wifi, study spaces, and quiet floors.",
  "websiteUrl": "https://denverlibrary.org",
  "imageUrl": "https://cdn.example.com/central-library.jpg"
}
```

---

## Moderation Guidelines

### Approve a Space When:
- ✅ Meets required fields (ID, name, address, type, price, noise)
- ✅ Address is valid and accurate
- ✅ Space type is correct and relevant
- ✅ At least 2 amenities are listed
- ✅ Hours are current/accurate
- ✅ Image matches the space (if provided)

### Reject a Space When:
- ❌ Missing critical fields (name, address, coordinates)
- ❌ Fake, misleading, or inappropriate space
- ❌ Duplicate of existing space
- ❌ No amenities listed
- ❌ Hours are outdated (months old)
- ❌ Address doesn't match the space
- ❌ Requires ongoing purchases to stay
- ❌ Private property or restricted access

### Flag for Review When:
- ⚠️ Amenities seem incorrect (user reports discrepancy)
- ⚠️ Hours are outdated (need verification)
- ⚠️ Space quality has declined
- ⚠️ User reports it's closed

---

## Summary: Quick Checklist

For a space to appear on FreeTime:

**MUST HAVE:**
- [ ] Unique ID
- [ ] Name (descriptive, accurate)
- [ ] Valid address with city/state/zip
- [ ] Latitude & longitude (mapable)
- [ ] Space type (cafe, library, park, etc.)
- [ ] Price type (free, paid, purchase-required)
- [ ] Noise level (quiet, moderate, loud)

**SHOULD HAVE:**
- [ ] Hours of operation (open/close times)
- [ ] At least 2 amenities (wifi, outlets, seating, bathroom, storage, quiet)
- [ ] Brief description
- [ ] Website/contact info
- [ ] Recent photo/image

**NICE TO HAVE:**
- [ ] Accessibility info
- [ ] Rating/reviews
- [ ] Real-time occupancy
- [ ] Weather considerations
- [ ] Dietary options (if cafe)

---

**Total Quality Scoring:**
- **Minimum (can show):** 7/14 points (required fields only)
- **Good (should show):** 10+/14 points
- **Excellent (promote):** 12+/14 points

---

This criteria ensures FreeTime only shows spaces that are genuinely useful for people looking to work, study, or spend extended time in a productive environment.
