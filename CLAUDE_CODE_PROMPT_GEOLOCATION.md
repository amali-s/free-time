# Claude Code Prompt: Fix Geolocation Detection

## Problem Statement

**Bug #1: Geolocation fails to detect user location**

The app requests browser geolocation permission but doesn't detect the city. Users see "Search for a city above" prompt even after granting permission. This blocks the entire app on first visit.

---

## Current Behavior

1. App loads and requests geolocation permission
2. Browser shows permission dialog
3. User grants permission
4. ❌ Nothing happens — no city detected, no spaces loaded
5. User stuck on empty state

## Expected Behavior

1. App loads and requests geolocation permission
2. User grants permission
3. ✅ App gets coordinates (latitude, longitude)
4. ✅ Reverse geocodes coordinates to city name (e.g., "Denver, CO")
5. ✅ Fetches spaces for that city
6. ✅ Loads and displays space list with real data

---

## Files to Review & Fix

### 1. Geolocation Hook
**File:** `src/lib/geo/use-geolocation.ts`

This is the custom hook that calls `navigator.geolocation.getCurrentPosition()`. 

**Check for:**
- Is the hook actually calling the geolocation API?
- Are error callbacks being handled?
- Is state being updated with coordinates?
- Are there any TypeScript type issues?

### 2. Reverse Geocoding Logic
**File:** `src/lib/geo/reverse-geocode.ts`

This converts coordinates to a city name.

**Check for:**
- Is the reverse geocoding function being called?
- Is it calling the right API (Mapbox Geocoding or Nominatim)?
- Are API credentials set (if needed)?
- Is the response being parsed correctly?
- What format is the city returned in? (e.g., "Denver, CO" or "denver-co"?)

### 3. Page Integration
**File:** `src/app/page.tsx` (lines 93-111)

This is where geolocation is triggered on mount.

**Check for:**
- Is the useGeolocation hook being called?
- Is the result being used to trigger the reverse geocoding?
- Is the detected city being stored in the Zustand store?
- Are there any missing dependencies in useEffect?
- Is there error handling for permission denied?

---

## Debugging Steps to Perform

### Step 1: Check if Browser Geolocation Works
```javascript
// In browser console, test the native API:
navigator.geolocation.getCurrentPosition(
  (pos) => {
    console.log("✅ Success! Latitude:", pos.coords.latitude);
    console.log("✅ Success! Longitude:", pos.coords.longitude);
  },
  (err) => {
    console.log("❌ Error:", err.message);
    console.log("Error code:", err.code); // 1=denied, 2=unavailable, 3=timeout
  }
);
```

### Step 2: Check if Hook Returns Data
Look in `use-geolocation.ts` and verify:
- Is it returning an object with `{ latitude, longitude, error, loading }`?
- Is the state actually changing when geolocation completes?

### Step 3: Check Reverse Geocoding
```javascript
// In browser console, test reverse geocoding directly:
fetch('https://nominatim.openstreetmap.org/reverse?format=json&lat=39.7392&lon=-104.9903')
  .then(r => r.json())
  .then(d => console.log("City:", d.address.city));
```

Or if using Mapbox:
```javascript
// Check if Mapbox token is set in environment
console.log("Mapbox token:", process.env.NEXT_PUBLIC_MAPBOX_TOKEN);
```

### Step 4: Check Store Update
Look in `src/lib/store.ts` and verify:
- Is there a `setCity()` action in the Zustand store?
- Is it being called with the detected city?
- Is the city slug format correct? (should be "denver-co", not "Denver, CO")

### Step 5: Trace the Full Flow in Page.tsx
```typescript
// Verify this sequence happens:
1. useGeolocation() called
2. When coordinates arrive → call reverse-geocode function
3. When city name arrives → format it to slug (e.g., "denver-co")
4. Set city in store: store.setCity(citySlug)
5. This should trigger data fetch via useEffect that depends on city
```

---

## Common Causes & Fixes

### 🔴 Geolocation Permission Denied
- User said "No" to permission dialog
- **Fix:** Check if error code = 1, show fallback city search UI

### 🔴 Reverse Geocoding API Not Called
- Hook returns coordinates but reverse geocoding never runs
- **Fix:** Add useEffect in page.tsx to call reverse-geocode when coordinates change

### 🔴 City Slug Format Wrong
- Reverse geocoding returns "Denver, Colorado" but API expects "denver-co"
- **Fix:** Check city formatting function, ensure lowercase and hyphen-separated

### 🔴 Environment Variables Missing
- Mapbox token not set if using Mapbox geocoding
- **Fix:** Check `.env.local` has required API keys

### 🔴 No Error Handling
- Geolocation fails silently, user never gets feedback
- **Fix:** Add error state and show message to user

---

## Success Criteria

After fixes are applied:

- [ ] User geolocation permission dialog appears on load
- [ ] After granting permission, app detects coordinates (check console)
- [ ] Reverse geocoding returns a city name
- [ ] City slug is correctly formatted (e.g., "denver-co")
- [ ] Zustand store updates with the city
- [ ] API call to `/api/spaces?city=denver-co` is made
- [ ] Space data loads and skeleton cards are replaced with real data
- [ ] No console errors
- [ ] Works on both desktop and mobile browsers

---

## Test Cases to Verify

1. **Allow geolocation permission**
   - Grant permission → Should auto-detect city
   - Verify spaces load

2. **Deny geolocation permission**
   - Deny permission → Should show error or fallback to city search
   - User can still search for city manually

3. **Geolocation timeout**
   - Should fallback to city search after ~10 seconds

4. **Wrong location (test with VPN or mock)**
   - Should still load spaces for detected city

---

## Files to Check/Modify

```
src/
  lib/geo/
    use-geolocation.ts        ← Hook that calls navigator.geolocation
    reverse-geocode.ts        ← Function to convert coords to city
  app/
    page.tsx                  ← Orchestration (lines 93-111)
  lib/
    store.ts                  ← Zustand store with setCity action
```

---

## Environment Variables Needed

Check `.env.local` has these (if using Mapbox):

```
NEXT_PUBLIC_MAPBOX_TOKEN=<your-token>
```

If using Nominatim (free, no token needed), no env vars required.

---

## Priority & Impact

- **Severity:** 🔴 CRITICAL
- **Blocks:** Entire app on first visit
- **Est. Fix Time:** 30 minutes
- **Est. Test Time:** 15 minutes
- **Total:** ~45 minutes

---

## After This Fix

Once geolocation is working, immediately move to **Priority #2: Fix Data Loading** (skeleton cards issue). The fixes are related — geolocation detects city, which triggers data fetching. If geolocation works but data doesn't load, the issue is in the fetch/API side.

---

## How to Use This Prompt

Copy this text and run in Claude Code:

```bash
claude code /path/to/free-time
# Then paste this entire prompt or sections
```

Or reference specific files directly:

```bash
claude code /path/to/free-time/src/lib/geo/use-geolocation.ts
# "Fix geolocation detection. Follow the debugging steps in CLAUDE_CODE_PROMPT_GEOLOCATION.md"
```

