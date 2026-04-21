# Updates to Space Qualification Criteria

**Date:** April 19, 2026  
**Changes Made:** Storage clarification + Excluded space types

---

## Change #1: Storage Spaces Clarification

### New Clear Distinction

**Storage is NOT a space type on FreeTime.** Instead, there's a difference between:

#### ❌ **Storage Facility** (Do NOT Include)
A dedicated storage business where people rent units to store things:
- Self-storage units
- Storage warehouses
- Climate-controlled lockers
- Public storage rental facilities

**Why excluded:** People don't spend extended time IN storage facilities. It's for asset storage, not for people to work/stay.

---

#### ✅ **Storage Amenity** (Include as Part of a Space)
A feature within a legitimate workspace where people can store personal items while working:
- Coworking space with employee/day-pass member lockers
- Cafe with coat racks or bag cubbies
- Library with secure locker storage
- Hotel lobby with luggage holding

**How to handle:** List the primary space type (coworking, cafe, etc.) and check "storage" as an available amenity.

---

### Updated Amenity Definition

**Before:**
> **storage** | Luggage/bag storage available | Yes/No

**After:**
> **storage** | Luggage/bag/coat storage while working | Yes/No

The key is that storage is for **temporary holding while the user is present**, not permanent storage rental.

---

## Change #2: Excluded Space Types

### New Exclusion Categories

Added to "Spaces That DO NOT Qualify":

#### ❌ **Event Spaces**
Wedding venues, conference rooms, private halls, banquet spaces

**Why excluded:** 
- Private rental only (not open to public)
- Requires special booking arrangement
- Not walk-in accessible
- Not suitable for casual work sessions

---

#### ❌ **Corporate/Office Buildings (Private)**
Office buildings, corporate headquarters, private office parks

**Why excluded:**
- Private property requiring access credentials
- Not open to general public
- Requires employee badge or invitation
- Not suitable for casual public use

**Note:** A cafe INSIDE a building is OK. The building itself is not.

---

#### ❌ **Event Venues**
Convention centers (private), event halls, banquet facilities

**Why excluded:**
- Only accessible during booked events
- Not open to walk-in public
- Requires paid event booking

---

## Summary: Storage & Exclusions

### What Changed

| Item | Before | After |
|------|--------|-------|
| Storage | One of 8 space types | Removed as space type |
| Storage amenity | Available as amenity | Clarified: only for temporary holding |
| Event spaces | Not explicitly listed | NOW EXCLUDED |
| Corporate buildings | Not explicitly listed | NOW EXCLUDED |
| Storage facilities | Not explicitly listed | NOW EXCLUDED |

---

### Key Rules

**✅ INCLUDE spaces where people work/spend time:**
- Cafe with storage cubbies
- Coworking with lockers
- Library with bag storage
- Hotel with luggage storage

**❌ DO NOT INCLUDE storage businesses:**
- Self-storage units
- Storage warehouses
- Storage rental facilities
- Dedicated locker services

**❌ DO NOT INCLUDE private/event spaces:**
- Office buildings (private)
- Event venues
- Corporate headquarters
- Wedding halls
- Convention centers (private rental)

---

## Updated Quick Reference

### Space Types Still Valid

✅ cafe  
✅ coworking  
✅ library  
✅ park  
✅ plaza  
✅ transit  
✅ lobby  
✅ other  

❌ ~~storage~~ (Removed - not a place for people)

---

### Storage Rules

| Category | Include? | Example |
|----------|----------|---------|
| Space type "storage" | ❌ NO | Self-storage facility |
| "Storage" amenity | ✅ YES | Cafe with coat hooks |
| Storage at workplace | ✅ YES | Coworking locker |

---

## Impact on Data Entry

If someone submits:

### Scenario 1: "Extra Space Self-Storage Unit"
- **Verdict:** ❌ REJECT
- **Reason:** It's a storage facility, not a workspace
- **Alternative:** Can't be added to FreeTime

### Scenario 2: "WeWork Coworking (Day Pass)"
- **Verdict:** ✅ INCLUDE
- **Amenities:** Wifi, seating, outlets, **storage** (lockers)
- **Type:** coworking

### Scenario 3: "Holiday Inn Downtown (Luggage Storage)"
- **Verdict:** ✅ INCLUDE
- **Amenities:** Seating, **storage** (luggage room)
- **Type:** lobby

### Scenario 4: "Denver Convention Center"
- **Verdict:** ❌ REJECT if private event rental
- **Reason:** Event space, not public access
- **Alternative:** If has public cafe/lobby, include that

### Scenario 5: "Corporate Office Park with Seating"
- **Verdict:** ❌ REJECT
- **Reason:** Private property, requires credentials
- **Alternative:** Can't be added to FreeTime

---

## Clarified Definitions

### Storage
**AS AMENITY:** "Storage available" means you can temporarily store a bag, coat, or luggage while you're working in that space (1-8 hours).

**NOT AS SPACE:** A standalone storage facility where people rent units long-term to store belongings.

---

### Private Property
**EXCLUDED:** Any space that:
- Requires building access badge/credentials
- Requires employee status
- Restricts general public entry
- Requires advance booking/arrangement
- Is corporate-owned and not open to public

**INCLUDED:** Public businesses even if they're in private buildings (cafe in an office building is OK)

---

### Event Spaces
**EXCLUDED:** Any space that:
- Is rented for specific events
- Only accessible during booked time
- Charges event rental fees
- Not open to walk-in public

**INCLUDED:** Venues that are open to public daily for socializing/working

---

## Quality Control Checklist

When reviewing space submissions:

```
REJECT if:
☐ It's a storage facility (not a workspace)
☐ It's a private office/corporate building
☐ It's an event venue (rental only)
☐ It requires credentials to access
☐ It's not open to the general public
☐ It's too temporary

INCLUDE if:
☐ Public can walk in during business hours
☐ Safe to work/stay for 2+ hours
☐ Has at least 1 amenity
☐ Has complete information (name, address, hours)
```

---

**These changes ensure FreeTime only includes genuine public workspaces, not private facilities or asset storage.** ✨
