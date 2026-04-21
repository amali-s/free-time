# Priority Action Plan — Complete Issue Roadmap

**Date:** April 19, 2026  
**Total Issues Found:** 13 (4 accessibility + 9 functional bugs)  
**Blocking Launch:** YES (5 critical bugs)

---

## Triage & Priorities

### 🔴 CRITICAL — MUST FIX BEFORE LAUNCH (3-4 hours)

These bugs prevent the app from working at all. Users cannot:
- Get location automatically
- Load any spaces
- Search for cities on mobile
- Use the app on mobile devices

#### **Priority #1: Geolocation Detection** (30 min)
**Impact:** Blocks entire app on first load  
**Files:** `src/lib/geo/use-geolocation.ts`, `src/app/page.tsx`  
**Task:** #6  

Why first: Without location, users stuck on empty state. Blocks everything else.

---

#### **Priority #2: Data Loading** (45 min)
**Impact:** Shows skeletons forever, data never appears  
**Files:** `src/app/page.tsx`, `src/lib/store.ts`, API endpoint  
**Task:** #7  

Why second: Even if geolocation works, spaces won't load.

---

#### **Priority #3: City Search on Mobile** (45 min)
**Impact:** Can't search for cities or change location on mobile  
**Files:** `src/components/search/CitySearch.tsx`, API endpoint  
**Task:** #8  

Why third: Alternative way to select city if geolocation doesn't work.

---

#### **Priority #4: Mobile Layout Responsiveness** (1 hour)
**Impact:** App unusable on phone (content overflows, hard to tap)  
**Files:** `src/app/page.tsx`, `src/styles/tokens.css`, viewport meta tag  
**Task:** #9  

Why fourth: Makes phone interface usable at all.

---

#### **Priority #5: Touch Target Sizes** (1 hour)
**Impact:** Can't tap buttons/filters/tags on mobile  
**Files:** `src/components/filters/FilterBar.tsx`, `src/components/space-card/SpaceCard.tsx`, `src/components/common/AmenityTag.tsx`  
**Task:** #3 (accessibility audit), #10 (bug report)

Why fifth: Combines accessibility requirements + usability on mobile.

**Can be done in parallel with Priority #4**

---

### 🟡 HIGH — SHOULD FIX BEFORE LAUNCH (1-2 hours)

These improve UX but don't completely block functionality.

#### **Priority #6: Search "No Results" State** (20 min)
**Impact:** Users confused when searching for non-existent city  
**Files:** `src/components/search/CitySearch.tsx`  
**Task:** Not created yet (nice to have)

---

#### **Priority #7: Chevron Animation Verification** (10 min)
**Impact:** Animation may ignore prefers-reduced-motion  
**Files:** `src/components/common/Chevron.tsx`, `src/app/globals.css`  
**Task:** Not critical (code appears correct)

---

#### **Priority #8: Miscellaneous Touch Issues** (Varies)
**Impact:** General mobile responsiveness polish  
**Files:** Various  
**Task:** Depends on specific issues found

---

## Implementation Timeline

### 🚀 DAY 1 (TODAY): Debug & Identify Root Causes (2 hours)

```
[ ] 10 min  — Read geolocation code, check for obvious issues
[ ] 10 min  — Test geolocation in browser console
[ ] 10 min  — Check API endpoint response in Network tab
[ ] 10 min  — Test city search on mobile (DevTools) and desktop
[ ] 10 min  — Check viewport meta tag and CSS constraints
[ ] 10 min  — Review error logs in console
```

**Deliverable:** Understand which systems are broken and why

---

### 🚀 DAY 2: Fix Core Issues (3-4 hours)

```
[Priority #1] 30 min  — Fix geolocation
  [ ] Enable geolocation API
  [ ] Fix reverse geocoding
  [ ] Test in browser
  [ ] Verify coordinates detected

[Priority #2] 45 min  — Fix data loading
  [ ] Debug API endpoint
  [ ] Check fetch logic
  [ ] Verify data in state
  [ ] Test on dev server

[Priority #3] 45 min  — Fix city search
  [ ] Fix Enter key handler
  [ ] Test on mobile
  [ ] Test on desktop
  [ ] Add no-results state

[Priority #4] 1 hour  — Fix mobile layout
  [ ] Check viewport meta tag
  [ ] Fix container widths
  [ ] Test at 375px, 414px
  [ ] Ensure no horizontal scroll
```

**Deliverable:** Core functionality working on mobile

---

### 🚀 DAY 3: Touch & Accessibility (1-2 hours)

```
[Priority #5] 1 hour  — Fix touch targets
  [ ] FilterBar chips: 20 → 40px
  [ ] Copy button: 20 → 40px
  [ ] Chevron: 28 → 40px
  [ ] Tags: 8px → 12px
  [ ] Test on actual phone

[Priority #6] 20 min — Add no-results state
[ ] Chevron animation check (10 min)
[ ] Other polish (varies)
```

**Deliverable:** App fully accessible and mobile-responsive

---

## Quick Start: Debugging Guide

### Step 1: Check Browser Console (5 min)

```bash
# Open DevTools (F12)
# Go to Console tab
# Look for red errors

Common errors:
- "Geolocation permission denied" → User said no
- "Failed to fetch" → Network/API issue
- "Uncaught TypeError" → Code error
```

### Step 2: Check Network Requests (5 min)

```bash
# Open DevTools → Network tab
# Reload page
# Look for requests:
  /api/cities?q=...
  /api/spaces?city=...
  
Check status:
  200 = Success
  404 = Not found (endpoint doesn't exist)
  500 = Server error
  CORS error = Frontend/backend mismatch
```

### Step 3: Check Environment Variables (5 min)

```bash
# Check if .env.local file exists
# Verify these are set:
  NEXT_PUBLIC_API_URL (if needed)
  Mapbox token (if using Mapbox)
  
# If missing, add them:
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Step 4: Test Geolocation (5 min)

```javascript
// In browser console:
navigator.geolocation.getCurrentPosition(
  (pos) => {
    console.log("Latitude:", pos.coords.latitude);
    console.log("Longitude:", pos.coords.longitude);
  },
  (err) => {
    console.log("Error:", err.message);
    console.log("Code:", err.code);
    // 1 = permission denied
    // 2 = position unavailable
    // 3 = timeout
  }
);
```

### Step 5: Test API Endpoint (5 min)

```javascript
// In browser console:
fetch('/api/spaces?city=denver-co')
  .then(r => r.json())
  .then(d => {
    console.log("Status: Success");
    console.log("Data:", d);
  })
  .catch(e => {
    console.log("Status: Error");
    console.log("Error:", e.message);
  });
```

---

## Risk & Mitigation

### High Risk Issues

| Issue | Risk | Mitigation |
|-------|------|-----------|
| Geolocation | Won't work without it | Fall back to city search |
| API endpoint | Might not exist | Check if routes created |
| Mobile layout | Hard to fix right | Test on actual device |
| Database | Might be empty | Seed test data |

### Mitigation Checklist

- [ ] Do API routes exist in `/api/spaces` and `/api/cities`?
- [ ] Is database running and seeded with test data?
- [ ] Are environment variables set correctly?
- [ ] Can you access the API directly from browser?
- [ ] Do you have geolocation permission granted in browser?
- [ ] Have you tested on actual mobile device (not just DevTools)?

---

## Success Criteria

### After Priority #1-2 (Geolocation + Data Loading)
- [ ] App detects user location on first load
- [ ] Space data appears (real cards, not skeletons)
- [ ] No console errors
- [ ] Works on both desktop and mobile

### After Priority #3 (City Search)
- [ ] Can type city name and select from dropdown
- [ ] Works on both desktop and mobile
- [ ] Enter key works to select city
- [ ] City changes and spaces reload

### After Priority #4-5 (Mobile Layout + Touch Targets)
- [ ] No horizontal scrolling at 375px
- [ ] All buttons 44px+ tap target
- [ ] All text readable on small screens
- [ ] Tested on actual phone

### Before Launch
- [ ] Geolocation works (or clear fallback)
- [ ] City search works
- [ ] Data loads correctly
- [ ] Mobile layout responsive
- [ ] All touch targets 44px+
- [ ] Color contrast verified
- [ ] Animations respect prefers-reduced-motion
- [ ] No console errors

---

## Branch & Git Strategy

```bash
# Create feature branch for bug fixes
git checkout -b fix/mobile-critical-issues

# Fix Priority #1: Geolocation
# Commit
git commit -m "fix: geolocation detection not working"

# Fix Priority #2: Data loading
# Commit
git commit -m "fix: spaces data not loading from API"

# Fix Priority #3: City search
# Commit  
git commit -m "fix: city search broken on mobile"

# Fix Priority #4: Mobile layout
# Commit
git commit -m "fix: mobile layout not responsive"

# Fix Priority #5: Touch targets
# Commit
git commit -m "fix: touch target sizes below WCAG minimum"

# When all done:
git push origin fix/mobile-critical-issues
# Create PR for review
```

---

## Questions During Implementation

**Q: Where should I start?**  
A: Start with Geolocation (#6). It's blocking everything else.

**Q: How do I know if API is working?**  
A: Open Network tab, make request, check status is 200, check response has data.

**Q: What if geolocation doesn't work?**  
A: That's OK. Fall back to city search. User can still select city manually.

**Q: Should I test on actual phone?**  
A: YES. DevTools mobile mode isn't perfect. Actual device testing is critical.

**Q: When should I commit changes?**  
A: After each priority is fixed and tested. Makes debugging easier.

**Q: What if I break something?**  
A: You can always revert: `git revert <commit-hash>`

---

## Progress Tracking

Use the task list to track progress:

- Task #6: Geolocation
- Task #7: Data loading
- Task #8: City search
- Task #9: Mobile layout
- Task #10: Touch targets
- Task #3: Accessibility (touch targets, already in list)
- Task #4: Color contrast verification
- Task #5: Escape key enhancement

Mark each as "in_progress" when you start, "completed" when finished.

---

## Expected Timeline

| Phase | Work | Est. Time | Cumulative |
|-------|------|-----------|-----------|
| 1 | Debug & understand | 2 hours | 2 hours |
| 2 | Fix critical bugs | 3 hours | 5 hours |
| 3 | Polish & verify | 2 hours | 7 hours |
| 4 | Final testing | 1 hour | 8 hours |

**Total:** ~8 hours of work to have a production-ready mobile app

---

## After Fixes: What's Next?

Once these critical bugs are fixed:

1. **Phase 2: Desktop Layout Polish** (2-3 hours)
   - Detail panel layout
   - Split view on desktop
   - Responsive at 1024px+

2. **Phase 3: Canvas/Map View** (Future)
   - Map view instead of list
   - Pin interactions
   - Mapbox integration

3. **Phase 4: Advanced Features** (Future)
   - Favorites
   - Filters UI enhancement
   - Settings page

---

**Status: Ready to start debugging! 🔍**

Begin with Priority #1 (Geolocation) for 30 minutes of debugging.
