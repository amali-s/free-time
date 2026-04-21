# Claude Code Prompt — Fix Data Loading Bug

**Copy this entire prompt into Claude Code to debug and fix the data loading issue.**

---

## The Problem

The FreeTime app shows loading skeleton cards indefinitely. Real space data never appears, even after the city is selected. Users see 4 shimmer cards forever and the page never progresses to show actual spaces.

### What Should Happen

1. App loads
2. Shows skeleton/shimmer loading cards (1-2 seconds)
3. Fetches spaces from `/api/spaces?city=denver-co`
4. API returns list of spaces
5. Skeletons disappear
6. Real space cards appear with data (name, address, amenities, etc.)

### What Actually Happens

1. App loads
2. Shows skeleton/shimmer loading cards
3. (Unknown) API call may fail or never happen
4. Skeletons never disappear
5. Page stuck on loading state forever
6. Real data never appears

---

## Task Instructions

### 1. **Investigate the Data Loading Flow**

Debug why spaces data isn't loading. Check these areas:

**File: `src/app/page.tsx`**
- Lines 93-111: Geolocation effect (sets user location)
- Lines 121-141: fetchSpaces function (makes API call)
- Lines 143-147: Loading state logic (isLoading variable)
- Lines 240-280: Main content area that shows SpaceList

**File: `src/lib/store.ts`**
- Check if activeCity state is being set correctly
- Check if activeFilters state exists
- Check if setSpaces function works

**File: `src/components/list/SpaceList.tsx`**
- Lines 139-151: Loading state (renders SkeletonCard)
- Lines 153-179: Data state (should render real SpaceCard)

**File: API Endpoint**
- Check if `GET /api/spaces?city=denver-co` endpoint exists
- Does it return data in the correct format?
- Is there a CORS issue?

### 2. **Debug the API Call**

The most likely issue is the API endpoint either:
- Doesn't exist
- Is failing silently
- Returns error instead of data
- Has CORS issues

**To debug:**

1. **Check if endpoint exists:**
   - Look for `/src/app/api/spaces/route.ts` or similar
   - If it doesn't exist, that's the problem
   - Create the endpoint or verify it's implemented

2. **Test the endpoint manually:**
   - Run dev server: `npm run dev`
   - Open browser console
   - Paste this code:
   ```javascript
   fetch('/api/spaces?city=denver-co')
     .then(r => {
       console.log("Status:", r.status);
       return r.json();
     })
     .then(d => console.log("Response:", d))
     .catch(e => console.log("Error:", e));
   ```
   - Check what comes back
   - Is it 200 with data? Or error?

3. **Check Network tab:**
   - Open DevTools (F12)
   - Go to Network tab
   - Reload page
   - Look for `/api/spaces` request
   - Does it exist? What's the status? What's the response?

### 3. **Check the Fetch Logic**

In `src/app/page.tsx` lines 121-141:

```typescript
const fetchSpaces = useCallback(async () => {
  if (!activeCity) return;  // <-- Does activeCity get set?

  const params = new URLSearchParams({ city: activeCity.slug });
  if (lat !== null) params.set("lat", String(lat));
  if (lng !== null) params.set("lng", String(lng));
  if (activeFilters.length > 0) params.set("filters", activeFilters.join(","));

  setSpacesLoading(true);
  try {
    const res = await fetch(`/api/spaces?${params}`);
    const data = await res.json();
    setSpaces(data.spaces ?? []);
    setTotal(data.total ?? 0);
  } catch {
    setSpaces([]);
    setTotal(0);
  } finally {
    setSpacesLoading(false);
  }
}, [activeCity, activeFilters, lat, lng]);
```

**Questions to answer:**
- Is `activeCity` getting set? (Check with console.log)
- Does the fetch URL look correct? (Log the URL)
- Does the API return data in the right format? (Check response)
- Is there an error in the catch block? (Add logging)
- Is setSpacesLoading being called correctly? (Check state)

### 4. **Fix the Issues You Find**

Once you identify the problem, fix it:

**If API endpoint doesn't exist:**
- Create the endpoint at `src/app/api/spaces/route.ts`
- Implement GET handler
- Return spaces from database
- Ensure correct response format:
  ```json
  {
    "spaces": [
      {
        "id": "sp_123",
        "name": "Central Library",
        "address": "10 W 14th Ave",
        "amenities": ["wifi", "outlets", "seating"],
        "distanceKm": 0.8
      }
    ],
    "total": 142
  }
  ```

**If fetch is failing silently:**
- Add error logging to catch block
- Add console.log statements to debug
- Verify response format matches what app expects

**If API endpoint is returning wrong format:**
- Check database query
- Ensure fields match Space type:
  - id, name, address, amenities, distance, hours, etc.

**If activeCity isn't being set:**
- Check geolocation effect (lines 107-111)
- Check if setActiveCity is being called
- Add console.log to verify

### 5. **Test the Fix**

After making changes:

1. **Test on dev server:**
   ```bash
   npm run dev
   ```

2. **Verify in browser:**
   - Open `http://localhost:3000`
   - Check browser console for errors
   - Check Network tab for API request
   - Does the API return data (200 status)?
   - Do skeleton cards disappear?
   - Do real space cards appear?

3. **Test with different cities:**
   - Search for different cities
   - Verify spaces load each time
   - Check count is correct

4. **Test on mobile:**
   - Use DevTools mobile mode (Ctrl+Shift+M)
   - Or test on actual phone: `http://<your-ip>:3000`
   - Same tests as above

### 6. **Check for Related Issues**

Once data loads, verify:
- [ ] Skeleton cards disappear when data arrives
- [ ] No console errors
- [ ] Loading state correctly updates
- [ ] Works with different cities
- [ ] Works with filters applied
- [ ] Touch targets are 44px+ (accessibility)
- [ ] Mobile layout is responsive

---

## Files to Check/Modify

### Critical Files

1. **`src/app/page.tsx`** — Main component
   - Lines 93-111: Geolocation effect
   - Lines 121-141: fetchSpaces function
   - Lines 143-147: isLoading state
   - Lines 240-280: SpaceList rendering

2. **`src/lib/store.ts`** — State management
   - Check activeCity state
   - Check setSpaces action
   - Check activeFilters state

3. **`src/components/list/SpaceList.tsx`** — List rendering
   - Lines 139-151: Loading skeleton rendering
   - Lines 157-178: Real data rendering

4. **API Endpoint** — Data fetching
   - Check if `/api/spaces` exists
   - Check if it returns correct format
   - Check for CORS issues

### Supporting Files

- `src/lib/types/space.ts` — Space data type definition
- `src/app/api/spaces/route.ts` — (Verify it exists)
- `src/app/layout.tsx` — Check viewport meta tag

---

## Expected Code Changes

You'll likely need to:

1. **Add error logging** to identify where failure happens
2. **Verify API endpoint** exists and works
3. **Fix response format** if needed (ensure spaces array exists)
4. **Fix state updates** if activeCity isn't being set
5. **Test the fix** end-to-end

The changes should be minimal (not a rewrite), mostly debugging and fixing existing logic.

---

## Success Criteria

Fix is complete when:

- [ ] Skeletons appear for 1-2 seconds
- [ ] Real space cards appear with data
- [ ] No console errors
- [ ] Works on desktop and mobile
- [ ] Works with different cities
- [ ] Works with filters applied
- [ ] API returns 200 status in Network tab
- [ ] Response contains spaces array with data

---

## Related Context

This is a blocking issue. Once fixed, you can move to:
- Bug #8: City search on mobile
- Bug #9: Mobile layout responsiveness

See `BUG_REPORT.md` and `PRIORITY_ACTION_PLAN.md` for full context.

---

## Quick Reference

**Dev server:** `npm run dev`  
**API URL:** `GET /api/spaces?city=denver-co`  
**Expected response:**
```json
{
  "spaces": [
    { "id": "...", "name": "...", "address": "...", ... }
  ],
  "total": 142
}
```

Good luck! 🚀
