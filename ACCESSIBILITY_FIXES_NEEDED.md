# Accessibility Fixes — Priority List

**Date:** April 19, 2026  
**Audit Status:** Complete — 4 Issues Found  
**Blocking Launch:** 1 (Touch Targets)

---

## Summary

The FreeTime app has **strong accessibility foundations** but needs **touch target fixes** before mobile launch. Color contrast should pass verification, and keyboard navigation is mostly solid.

**Est. Time to Fix:** 2-3 hours total

---

## Priority 1: CRITICAL — Touch Target Sizes

**Impact:** Makes app unusable on mobile, fails WCAG 2.5.5

### Issue 1A: Filter Chips Too Small (20px)

**Problem:** Users can't tap filter chips accurately on mobile.

**Current Code (FilterBar.tsx):**
```typescript
<button
  style={{
    minHeight: 20,        // ❌ TOO SMALL
    paddingBlock: "4px",
    paddingInline: "8px",
  }}
>
```

**Fix:**
```typescript
<button
  style={{
    minHeight: 40,        // ✅ WCAG COMPLIANT
    paddingBlock: "8px",
    paddingInline: "12px",
  }}
>
```

**Files:** `src/components/filters/FilterBar.tsx` (line 87)

**Testing:** Tap on each filter chip on a phone. Should be easy to hit with one finger.

---

### Issue 1B: Copy Address Button Too Small (20px)

**Problem:** Users miss the copy icon when trying to tap it.

**Current Code (SpaceCard.tsx):**
```typescript
<button
  style={{
    minHeight: 20,      // ❌ TOO SMALL
    minWidth: 20,
    padding: 2,
  }}
>
  <CopyIcon />
</button>
```

**Fix:**
```typescript
<button
  style={{
    minHeight: 40,      // ✅ WCAG COMPLIANT
    minWidth: 40,
    padding: 6,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  }}
>
  <CopyIcon />
</button>
```

**Alternative (Better):** Make the entire address row tappable:
```typescript
<div 
  role="button"
  tabIndex={0}
  onClick={handleCopyAddress}
  onKeyDown={(e) => {
    if (e.key === "Enter" || e.key === " ") handleCopyAddress();
  }}
  aria-label={`Copy address: ${space.address}`}
  style={{
    display: "flex",
    alignItems: "center",
    gap: "var(--space-1)",
    padding: "8px",  // Larger tap target
    minHeight: 44,
    cursor: "pointer",
  }}
>
  <span>{space.address}</span>
  <CopyIcon />
</div>
```

**Files:** `src/components/space-card/SpaceCard.tsx` (lines 183-203)

**Testing:** Tap the copy icon. Should activate without hitting address text.

---

### Issue 1C: Chevron Button Too Small (28px)

**Problem:** Users can't accurately expand/collapse cards on mobile.

**Current Code (SpaceCard.tsx):**
```typescript
<button
  style={{
    minHeight: 28,      // ❌ TOO SMALL
  }}
>
  <Chevron />
</button>
```

**Fix:**
```typescript
<button
  style={{
    minHeight: 40,      // ✅ WCAG COMPLIANT
    padding: "var(--space-2)",
  }}
>
  <Chevron />
</button>
```

**Files:** `src/components/space-card/SpaceCard.tsx` (line 359)

**Testing:** Tap the chevron. Should expand/collapse card easily.

---

### Issue 1D: Close Icon Inside Filter Chip (7×8px)

**Problem:** Can't accurately tap the X to remove a filter.

**Current Code (FilterBar.tsx):**
```typescript
function CloseIcon() {
  return (
    <svg width="7" height="8" viewBox="0 0 7 8">  // ❌ TOO SMALL
      ...
    </svg>
  );
}
```

**Better Approach:** Make entire button area tappable, not just icon

```typescript
<button
  style={{
    minHeight: 40,  // ✅ Larger overall button
  }}
>
  {label}
  {isActive && <CloseIcon />}  // Icon now has more padding context
</button>
```

**Alternative: Separate Close Button**
```typescript
{isActive ? (
  <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
    {label}
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        toggleFilter(amenity);
      }}
      aria-label={`Remove ${label} filter`}
      style={{
        background: "none",
        border: "none",
        padding: "4px",
        display: "flex",
        alignItems: "center",
        cursor: "pointer",
      }}
    >
      <CloseIcon />
    </button>
  </span>
) : (
  label
)}
```

**Files:** `src/components/filters/FilterBar.tsx` (lines 30-36, 93-94)

**Testing:** Tap the X icon to remove filter. Should work without hitting label.

---

## Priority 2: MEDIUM — Optional Enhancements

### Issue 2A: Escape Key to Close Expanded Cards

**Problem:** No Escape key handler for expanded space cards.

**Current Code (SpaceCard.tsx):**
```typescript
function handleToggle() {
  setLocalExpanded((v) => !v);
  onSelect?.(space.id);
}

// Only handles click, not keyboard
```

**Fix:**
```typescript
function handleKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
  if (e.key === "Escape" && isExpanded) {
    e.preventDefault();
    setLocalExpanded(false);
  }
}

// On chevron button:
<button
  onClick={handleToggle}
  onKeyDown={handleKeyDown}  // Add keyboard handler
  aria-label={...}
>
```

**Files:** `src/components/space-card/SpaceCard.tsx` (lines 108-111, 344-363)

**Impact:** Nice-to-have. Users can still click chevron to collapse. Not required for WCAG.

---

### Issue 2B: Arrow Keys in Filter Bar

**Problem:** No arrow key navigation between filter chips.

**Current:** Tab moves between chips in DOM order
**Desired:** Left/Right arrows move between chips on same row

**Implementation:** Add keyboard handler to FilterBar
```typescript
function handleFilterKeyDown(
  e: React.KeyboardEvent,
  currentIndex: number,
  totalFilters: number
) {
  if (e.key === "ArrowRight") {
    e.preventDefault();
    const nextIndex = (currentIndex + 1) % totalFilters;
    // Focus next button element
  } else if (e.key === "ArrowLeft") {
    e.preventDefault();
    const prevIndex = (currentIndex - 1 + totalFilters) % totalFilters;
    // Focus previous button element
  }
}
```

**Files:** `src/components/filters/FilterBar.tsx` (lines 62-97)

**Impact:** Low — Not required for WCAG. Tab works fine.

---

## Priority 3: VERIFY — Color Contrast

### Testing Required

No code changes needed. Just verification with axe DevTools.

**Steps:**
1. Run dev server: `npm run dev`
2. Open `http://localhost:3000`
3. Install axe DevTools (Chrome)
4. Click axe icon → "Scan ALL of my page"
5. Check for failures

**Expected Result:** No failures (design tokens should pass)

**Color Pairs to Check:**
- Filter text (#827A64) on accent background (#E8DDA2)
- Filter text (#827A64) on white background (#FFFDFB)
- Secondary text (#595640) on white background (#FFFDFB)
- Status colors (green/red) on white background

**Files:** None (verification only)

---

## Implementation Order

### Phase 1: Touch Targets (Required)

1. **FilterBar touch size** — 10 min
   - Change minHeight: 20 → 40
   - Adjust padding
   - Test on phone

2. **SpaceCard copy button** — 15 min
   - Change minHeight/minWidth: 20 → 40
   - Adjust padding
   - Consider making entire row tappable

3. **SpaceCard chevron** — 5 min
   - Change minHeight: 28 → 40
   - Test on phone

4. **Test all changes** — 30 min
   - Verify on actual mobile device
   - Test on tablet
   - Re-run axe DevTools

**Est. Time:** 60 minutes

### Phase 2: Enhancements (Optional)

5. **Escape key for cards** — 10 min
   - Add onKeyDown handler
   - Test keyboard navigation

6. **Arrow keys in filter bar** — 20 min
   - Implement arrow key navigation
   - Test with keyboard

**Est. Time:** 30 minutes

### Phase 3: Verification (Required)

7. **Run axe DevTools scan** — 10 min
   - Verify no contrast failures
   - Document results

8. **Comprehensive manual testing** — 60 min
   - Keyboard: Tab through all elements
   - Screen reader: VoiceOver/NVDA on dev server
   - Touch: Test all tappable elements on phone
   - Reduced motion: Enable and verify animations disabled

**Est. Time:** 70 minutes

---

## Testing Checklist

### Desktop Testing
- [ ] Tab navigation: All elements focusable in logical order
- [ ] Enter key: All buttons activate
- [ ] Escape key: Close expanded cards and dropdowns
- [ ] Focus visible: 2px blue outline on all elements
- [ ] Screen reader: Run VoiceOver/NVDA, verify all content announced
- [ ] axe DevTools: No failures reported

### Mobile Testing (375px viewport)
- [ ] Filter chips: Can tap each one easily
- [ ] Close icon: Can remove filters accurately
- [ ] Copy button: Can tap without hitting address
- [ ] Chevron: Can expand/collapse cards
- [ ] All buttons: 44×44px target area

### Browser Compatibility
- [ ] Chrome (latest)
- [ ] Safari (latest)
- [ ] Firefox (latest)
- [ ] Chrome Mobile (Android)
- [ ] Safari Mobile (iOS)

### Accessibility Checklist
- [ ] All ARIA labels present and correct
- [ ] All landmarks (header, main, section) present
- [ ] Color contrast meets WCAG AA (4.5:1)
- [ ] Animations respect prefers-reduced-motion
- [ ] All interactive elements keyboard accessible
- [ ] No keyboard traps

---

## Rollback Plan

If issues arise after fixes:
```bash
git revert <commit-hash>
```

All changes are focused and isolated:
- FilterBar.tsx: Only CSS properties
- SpaceCard.tsx: Only CSS properties
- No logic changes
- Easy to rollback

---

## After Fixes

1. **Re-run full audit** — 30 min
2. **Update ACCESSIBILITY_AUDIT_RESULTS.md** with "PASS" status
3. **Ready for Phase 2:** Desktop Layout Polish

---

## Questions?

Refer to:
- **WCAG Guidelines**: https://www.w3.org/WAI/WCAG21/quickref/?showtechniques=251#target-size-enhanced
- **WebAIM Touch Targets**: https://webaim.org/articles/touchscreen/
- **Current Audit Results**: ACCESSIBILITY_AUDIT_RESULTS.md
- **Quick Start Guide**: QUICK_START_ACCESSIBILITY.md

---

**Status: Ready for implementation 🚀**

Start with Phase 1 (touch targets). Est. 1 hour to fix + test.
