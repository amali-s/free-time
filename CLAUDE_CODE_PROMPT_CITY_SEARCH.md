# Claude Code Prompt — Fix City Search on Mobile

**Priority:** #3 (45 min)  
**Task:** #8  
**Status:** CRITICAL — City search broken on mobile

---

## The Problem

Users on mobile cannot search for cities or change locations. When they:
1. Type a city name (e.g., "Boulder")
2. See dropdown results briefly
3. Try to select a city (tap or press Enter)
4. **Nothing happens** — city doesn't change, no feedback

**Expected Behavior:**
1. User types "Boulder" on mobile
2. Dropdown appears with matching cities
3. User taps a city in dropdown OR presses Enter
4. City is selected, page updates to show spaces for that city

**Actual Behavior:**
- Dropdown appears initially
- User types city name
- Dropdown may disappear or stay open
- Tapping/pressing Enter does nothing
- City doesn't change
- No error message

---

## Why It's Broken on Mobile

This is likely a **touch event issue**, not a keyboard issue. The component uses:
- `onMouseDown` (line 223) — Doesn't work on mobile (no mouse)
- `onMouseEnter` (line 227) — Doesn't work on mobile (no hover)

**On mobile, these events don't fire**, so users can't select cities even if the dropdown appears.

---

## Your Debugging Task

### 1. **Understand the Current Implementation**

File: `src/components/search/CitySearch.tsx`

**Key Functions:**
- Lines 43-63: `fetchCities()` — fetches from `/api/cities?q=...`
- Lines 65-70: `handleChange()` — input change handler
- Lines 81-96: `handleKeyDown()` — keyboard navigation (Enter key)
- Lines 72-79: `handleSelect()` — selects a city
- Lines 217-261: Dropdown rendering

**Issues to Check:**

1. **Touch events missing** (Line 223-227)
   - Uses `onMouseDown` and `onMouseEnter`
   - Mobile devices send touch events, not mouse events
   - Need to add `onTouchStart` or handle touch events

2. **Dropdown positioning** (Line 201)
   - May be positioned off-screen on small mobile screens
   - Check: `top: "calc(100% + var(--space-1))"`
   - May need to be repositioned on mobile

3. **Dropdown height** (Line 212)
   - `maxHeight: 280` — too tall for mobile
   - Mobile screens are 375-414px tall
   - Dropdown might cover input

4. **API endpoint** (Line 51)
   - Check if `/api/cities?q=...` exists
   - Does it return correct format?
   - Is there a CORS issue?

---

### 2. **Test the API Endpoint First**

Before debugging the component, verify the API works:

```bash
# Run dev server
npm run dev

# In browser console, test:
fetch('/api/cities?q=boulder')
  .then(r => r.json())
  .then(d => console.log(d))

# Expected response:
// { "cities": [ { "slug": "boulder-co", "name": "Boulder", "region": "CO", ... } ] }
```

**If API fails:**
- Check if endpoint exists: `src/app/api/cities/route.ts`
- Check database has city data
- Check for CORS errors

---

### 3. **Debug Mobile Touch Events**

**Hypothesis:** `onMouseDown` and `onMouseEnter` don't work on mobile touch devices.

**Test on mobile (375px viewport):**
1. Open DevTools mobile mode (Ctrl+Shift+M)
2. Type "boulder" in search
3. Dropdown appears
4. Try to tap a city in the dropdown
5. **Does anything happen?** (It shouldn't with current code)

**Fix needed:** Add touch event handlers

```typescript
// Current (mobile-broken):
onMouseDown={(e) => {
  e.preventDefault();
  handleSelect(city);
}}

// Better (handles both mouse and touch):
onMouseDown={(e) => {
  e.preventDefault();
  handleSelect(city);
}}
onTouchStart={(e) => {
  e.preventDefault();
  handleSelect(city);
}}
```

---

### 4. **Check Dropdown Visibility on Mobile**

The dropdown might be positioned off-screen on small devices.

**Check:**
- Line 201: `top: "calc(100% + var(--space-1))"`
- Line 202: `left: 0; right: 0;`
- Line 212: `maxHeight: 280;`

**On mobile (375px):**
- Input is at top of screen
- Dropdown positioned below it
- If dropdown is 280px tall, it will go off-screen

**Potential fix:**
```typescript
// Responsive max height for mobile
maxHeight: window.innerHeight < 600 ? 200 : 280,
```

---

### 5. **Check Enter Key Works on Mobile Keyboard**

On mobile, pressing Enter should select highlighted option.

**Current code (line 89-91):**
```typescript
} else if (e.key === "Enter" && activeIndex >= 0) {
  e.preventDefault();
  handleSelect(results[activeIndex]);
}
```

**Question:** Does `activeIndex` get set when dropdown appears? Or is it always -1?

**Debug:** Add console.log to check
```typescript
} else if (e.key === "Enter") {
  console.log("Enter pressed. activeIndex:", activeIndex, "isOpen:", isOpen);
  if (activeIndex >= 0) {
    e.preventDefault();
    handleSelect(results[activeIndex]);
  }
}
```

---

### 6. **Check for Keyboard/Touch Conflicts**

Mobile keyboards can cause issues with focus/blur events.

**Current code (line 98-105):**
```typescript
function handleBlur(e: React.FocusEvent) {
  if (!e.currentTarget.contains(e.relatedTarget as Node)) {
    setIsOpen(false);
    if (activeCity) setQuery(activeCity.name);
  }
}
```

**Issue:** On mobile, opening keyboard might trigger blur, closing dropdown.

**Test:** Does dropdown close when virtual keyboard opens?

---

## Files to Check

### Primary Files

1. **`src/components/search/CitySearch.tsx`** (262 lines)
   - Line 223: `onMouseDown` — needs touch handler
   - Line 227: `onMouseEnter` — needs touch handler
   - Line 201: Dropdown positioning
   - Line 212: Dropdown max height
   - Line 89: Enter key handler

2. **`src/app/api/cities/route.ts`** (API endpoint)
   - Does this file exist?
   - Does it return correct format?
   - Is database seeded with city data?

3. **`src/lib/store.ts`** (State management)
   - Check `setActiveCity` function
   - Verify it updates state correctly

---

## Expected Response Format

The `/api/cities?q=boulder` endpoint should return:

```json
{
  "cities": [
    {
      "slug": "boulder-co",
      "name": "Boulder",
      "region": "CO",
      "country": "US",
      "lat": 40.0150,
      "lng": -105.2705
    }
  ]
}
```

**If you get an error or empty array, the API is broken.**

---

## Implementation Steps

### Step 1: Verify API Endpoint (5 min)
- Does `/api/cities` endpoint exist?
- Can you fetch it and get results?
- Is database seeded?

### Step 2: Add Touch Event Handling (10 min)
```typescript
// On dropdown items (line 223-226):
onMouseDown={(e) => {
  e.preventDefault();
  handleSelect(city);
}}
onTouchStart={(e) => {
  e.preventDefault();
  handleSelect(city);
}}
```

### Step 3: Fix Dropdown Positioning (5 min)
- Make max height responsive
- Ensure dropdown doesn't go off-screen on mobile
- Test visibility at 375px width

### Step 4: Debug Enter Key (10 min)
- Verify activeIndex gets set when dropdown appears
- Test Enter key selection
- Add console logging to debug

### Step 5: Test End-to-End (15 min)
- Test on mobile (DevTools + actual phone)
- Test on desktop (should still work)
- Test with different cities
- Verify city changes after selection

---

## Success Criteria

Fix is complete when:

- [ ] User can type city name on mobile
- [ ] Dropdown appears with matching cities
- [ ] User can tap a city in dropdown and it selects
- [ ] User can press Enter key to select highlighted city
- [ ] City changes in app after selection
- [ ] Spaces list updates for new city
- [ ] No console errors
- [ ] Works on both desktop and mobile
- [ ] Works with different city names

---

## Debugging Commands

```bash
# Start dev server
npm run dev

# In browser console, test API:
fetch('/api/cities?q=boulder').then(r => r.json()).then(console.log)

# Add logging to CitySearch.tsx:
console.log("Dropdown open:", isOpen);
console.log("Active index:", activeIndex);
console.log("Results:", results);
console.log("Enter pressed");
```

---

## Related Context

This is **Priority #3** because:
- **Priority #1:** Geolocation doesn't detect user location
- **Priority #2:** Data doesn't load (skeleton cards forever)
- **Priority #3:** City search broken on mobile (alternative to geolocation)

Once geolocation is fixed, city search becomes less critical, but it's still needed as a fallback and for users who want to change cities.

---

## Common Issues to Watch For

| Issue | Symptom | Fix |
|-------|---------|-----|
| Missing touch handler | Can't tap to select | Add `onTouchStart` |
| Dropdown off-screen | Can't see options | Fix positioning/height |
| API endpoint missing | No results appear | Create API route |
| Keyboard closes dropdown | Dropdown disappears when typing | Fix blur event |
| Enter key doesn't work | Can select with keyboard | Check activeIndex logic |
| API returns wrong format | Results don't parse | Fix response structure |

---

## Next Steps After Fix

1. ✅ Test on mobile device
2. ✅ Test keyboard selection (Enter key)
3. ✅ Test touch selection (tap dropdown)
4. ✅ Verify city changes and spaces update
5. Then move to **Priority #2: Fix Data Loading** (if not done yet)

---

**Start debugging! 🔍**

Begin with Step 1: Verify the API endpoint works. If API is broken, everything else will fail.
