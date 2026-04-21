# Accessibility Audit Guide - Step 1

**Duration:** 3-4 hours  
**Tools Needed:** Dev server + Browser + Screen reader + Phone (optional)  
**Status:** Ready to execute

---

## 🚀 Setup: Run Dev Server & Access from Phone

### Step 1: Start the Development Server

```bash
cd /sessions/loving-zealous-fermat/mnt/free-time
npm run dev
```

Output will show:
```
> next dev
...
 ▲ Next.js 16.2.2
 - Local:        http://localhost:3000
 - Environments: .env.local

ready - started server on 0.0.0.0:3000, url: http://localhost:3000
```

✅ **Server is running. Do NOT close this terminal.**

---

### Step 2: Get Your Computer's Local IP Address

#### **On Mac:**
```bash
# Open new terminal tab (Cmd+T)
ipconfig getifaddr en0
```
Output example: `192.168.1.100`

#### **On Windows:**
```bash
# Open new PowerShell/CMD
ipconfig
```
Look for "IPv4 Address" under your active network. Example: `192.168.1.100`

#### **On Linux:**
```bash
hostname -I
```

**Record this IP address:** `_________________`

---

### Step 3: Access from Your Phone

#### **On Phone (iOS or Android):**

1. **Connect to same WiFi** as your computer ✅
2. **Open browser** (Safari on iOS, Chrome on Android)
3. **Visit:** `http://YOUR-IP:3000`
   - Example: `http://192.168.1.100:3000`
   - Replace `192.168.1.100` with your actual IP from Step 2

4. **You should see:** FreeTime app with search bar, filter chips, and space cards

✅ **Now you can test on your actual phone!**

---

## ✅ Accessibility Testing Checklist

### Test 1: Keyboard Navigation (Desktop)

**Environment:** Desktop browser, dev server running  
**Time:** 20 minutes  
**Tools:** Keyboard only (no mouse)

#### Test 1A: Tab Navigation
```
Expected: Can tab through all interactive elements in logical order
```

**Steps:**
1. Open `http://localhost:3000` on desktop
2. Press **Tab** key repeatedly
3. Observe focus indicator (should be 2px blue outline)
4. Verify order is logical: Search → Filters → Space cards → Chevrons

**Elements that should receive focus:**
- ✓ Search input
- ✓ Filter chips (all 6: Outlets, Seating, Wifi, Bathroom, Free, Storage)
- ✓ Each space card
- ✓ Chevron (expand/collapse button)
- ✓ Copy address button (when visible)

**Pass Criteria:**
- [ ] All interactive elements are focusable
- [ ] Focus order is logical (left-to-right, top-to-bottom)
- [ ] Focus indicator is clearly visible
- [ ] No elements are skipped
- [ ] No keyboard traps (can always escape with Tab or Escape)

**Issues Found:** (List any)
- 
- 

---

#### Test 1B: Enter Key (Activate)
```
Expected: Pressing Enter activates the focused element
```

**Steps:**
1. Tab to a filter chip (e.g., "Wifi")
2. Press **Enter** key
3. Observe: Filter should toggle on (yellow background, X appears)

**Repeat for:**
- [ ] All filter chips
- [ ] Space cards (should expand/collapse)
- [ ] Chevron buttons

**Pass Criteria:**
- [ ] Enter activates all buttons and interactive elements
- [ ] Visual feedback is immediate
- [ ] No console errors

---

#### Test 1C: Escape Key (Close/Dismiss)
```
Expected: Escape key closes expanded elements
```

**Steps:**
1. Tab to a space card
2. Press **Enter** to expand it (shows description)
3. Press **Escape** key
4. Observe: Card should collapse (description disappears)

**Pass Criteria:**
- [ ] Escape closes expanded panels
- [ ] Focus returns to the card element
- [ ] No errors in console

---

#### Test 1D: Arrow Keys (Within Filter Bar)
```
Expected: Arrow keys move between filter chips horizontally
```

**Steps:**
1. Tab to first filter chip ("Outlets")
2. Press **Right Arrow** key
3. Observe: Focus moves to next chip ("Seating")
4. Press **Left Arrow** key
5. Observe: Focus moves back to previous chip

**Pass Criteria:**
- [ ] Arrow keys move focus left/right in filter bar
- [ ] Wraps around at edges (Right at end goes to start)
- [ ] Each chip shows focus indicator

**Note:** If filter bar doesn't support arrow navigation, document it for enhancement.

---

### Test 2: Screen Reader Testing

**Environment:** Desktop browser + screen reader  
**Time:** 45 minutes  
**Tools:** 
- **Mac/iOS:** VoiceOver (built-in, activate with Cmd+F5)
- **Windows:** NVDA (free, download from https://www.nvaccess.org/)
- **Android:** TalkBack (built-in)

#### Test 2A: Setup Screen Reader

**On Mac (VoiceOver):**
```bash
# Enable VoiceOver
Cmd + F5

# You'll hear: "VoiceOver on"
# To navigate: Use VO key (Ctrl+Option) + Arrow keys
```

**On Windows (NVDA):**
1. Download: https://www.nvaccess.org/download/
2. Install and open NVDA
3. Start reading with arrow keys

**On iPhone (VoiceOver):**
```
Settings → Accessibility → VoiceOver → toggle ON
```

**On Android (TalkBack):**
```
Settings → Accessibility → TalkBack → toggle ON
```

---

#### Test 2B: Page Structure & Landmarks

**Steps:**
1. Start screen reader
2. Press arrow down or use **Rotor** (Mac: VO+U, Windows: NVDA+F7)
3. Listen to headings and landmarks

**Expected Announcements:**
- [ ] "Main landmark" or "Main region"
- [ ] "Header landmark" or "Header region"
- [ ] Page title or heading

**Pass Criteria:**
- [ ] Page has proper landmark structure (header, main, section)
- [ ] Headings are announced with level (H1, H2, etc.)
- [ ] No "unlabeled" buttons or regions

**Issues Found:**
- 

---

#### Test 2C: Filter Chip Labels & States

**Steps:**
1. Navigate to filter bar with screen reader
2. Tab to each filter chip
3. Listen to announcement

**Expected for inactive chip:**
```
"Outlets filter off, toggle button"
```

**Expected for active chip:**
```
"Outlets filter on, toggle button"  (or similar)
```

**Pass Criteria:**
- [ ] Each filter announces its name and current state
- [ ] "Off" vs "On" is clearly stated
- [ ] No ambiguous labels like "Button"

**Issues Found:**
- 

---

#### Test 2D: Space Card Announcements

**Steps:**
1. Navigate to first space card
2. Screen reader should announce:
   - Space name
   - Address
   - Distance/type info
   - Amenities
   - Expansion state (collapsed/expanded)

**Expected:**
```
"Koffee Korner, cafe, 789 Pine Avenue, 0.8km away, 
Wifi, Outlets, Seating, expandable, button"
```

**Pass Criteria:**
- [ ] Card name is announced first
- [ ] All content is readable
- [ ] Amenities are announced
- [ ] Expansion state is clear ("expandable" or "expanded")

**Issues Found:**
- 

---

#### Test 2E: Expand/Collapse Announcement

**Steps:**
1. Focus on expanded space card
2. Press Enter to collapse
3. Listen for announcement

**Expected:**
```
"Collapsed" or "Expand" hint should be announced
```

**Pass Criteria:**
- [ ] State change is announced
- [ ] User knows they can expand again
- [ ] No confusion about current state

---

### Test 3: Touch Target Sizes

**Environment:** Phone (iOS or Android)  
**Time:** 15 minutes  
**Tools:** Finger + Chrome DevTools (optional for measurement)

#### Test 3A: Filter Chip Touch Targets

**Steps:**
1. Access app on phone: `http://YOUR-IP:3000`
2. Try tapping each filter chip
3. Use finger (not stylus) for accurate size testing

**Requirement:** Each target should be at least 44×44 pixels

**Visual Check:**
- [ ] Can comfortably tap filters without hitting adjacent elements
- [ ] No double-taps needed
- [ ] No accidental touches of other elements

**Measurement (optional):**
```
1. Open Chrome DevTools on desktop (F12)
2. Tab to filter chip
3. Right-click → Inspect
4. Look at computed height/width in Styles panel
5. Should be ≥ 44px in both dimensions
```

**Pass Criteria:**
- [ ] All filter chips are at least 44×44px
- [ ] Comfortable to tap on phone
- [ ] No accidental adjacent touches

**Actual sizes found:**
- Filter chip height: _____ px
- Filter chip width: _____ px

---

#### Test 3B: Space Card Chevron Touch Target

**Steps:**
1. On phone, find chevron (↓) below space card
2. Try tapping it

**Pass Criteria:**
- [ ] Chevron is easy to tap
- [ ] At least 44px×44px
- [ ] Correctly expands/collapses card

**Actual size:** _____ px × _____ px

---

#### Test 3C: Copy Address Button Touch Target

**Steps:**
1. On phone, look at copy icon (📋) next to address
2. Try tapping it

**Pass Criteria:**
- [ ] Icon is tappable without accidentally tapping address
- [ ] At least 44×44px (including padding)
- [ ] Visual feedback on tap

**Issue:** Currently may be too small. Document for improvement.

---

### Test 4: Color Contrast (WCAG AA)

**Environment:** Desktop browser  
**Time:** 15 minutes  
**Tools:** axe DevTools (free browser extension)

#### Install axe DevTools

**Chrome:**
1. Visit: https://chromewebstore.google.com/detail/axe-devtools/lhdoppojpmngadmnkpklempisson
2. Click "Add to Chrome"
3. You'll see axe icon in toolbar

**Firefox:**
1. Visit: https://addons.mozilla.org/en-US/firefox/addon/axe-devtools/
2. Click "Add to Firefox"

---

#### Test 4A: Run axe Accessibility Check

**Steps:**
1. Open `http://localhost:3000`
2. Open DevTools (F12)
3. Find axe icon (top-right of DevTools)
4. Click "Scan ALL of my page"
5. Wait for results

**Results will show:**
- 🔴 **Failures** — Must fix (contrast, labels, etc.)
- 🟡 **Warnings** — Should review
- 🟢 **Passes** — Good to go

---

#### Test 4B: Check Specific Elements

**Focus on these:**

**Filter Chips (Active - Yellow):**
```
Text: var(--color-text-tertiary) = #827A64
Background: var(--color-accent) = #E8DDA2

Contrast ratio should be ≥ 4.5:1 (WCAG AA)
```

**Filter Chips (Inactive - White):**
```
Text: var(--color-text-tertiary) = #827A64
Background: var(--color-foreground) = #FFFDFB

Contrast ratio should be ≥ 4.5:1 (WCAG AA)
```

**Amenity Tags:**
```
Text: var(--color-text-tertiary) = #827A64
Background: var(--color-background) = #EDE6DE

Contrast ratio should be ≥ 4.5:1 (WCAG AA)
```

**Pass Criteria:**
- [ ] No contrast failures reported by axe
- [ ] All text is easily readable
- [ ] No color-only information (icons have labels)

**Issues Found:**
- 

---

### Test 5: Prefers-Reduced-Motion

**Environment:** Desktop browser  
**Time:** 10 minutes  
**Tools:** Browser settings + DevTools

#### Test 5A: Enable Reduced Motion

**On Mac:**
```
System Settings → Accessibility → Display → Reduce motion
Toggle: ON
```

**On Windows:**
```
Settings → Ease of Access → Display → Show animations
Toggle: OFF
```

**On Browser (easier for testing):**
```
DevTools → ... (three dots) → More tools → Rendering → 
Emulate CSS media feature prefers-reduced-motion
Set to: "prefers-reduced-motion: reduce"
```

---

#### Test 5B: Observe Animation Changes

**With reduced motion enabled:**

1. **List item entry:**
   - [ ] Items appear instantly (no stagger animation)
   - [ ] No smooth slide-in
   - [ ] Content is immediately visible

2. **Filter chip toggle:**
   - [ ] Background changes instantly
   - [ ] No 200ms color transition
   - [ ] State change is immediate

3. **Card expand/collapse:**
   - [ ] Chevron doesn't rotate
   - [ ] Description appears instantly
   - [ ] No slide-down animation

4. **Focus indicators:**
   - [ ] Still visible
   - [ ] Just not animated

**Pass Criteria:**
- [ ] All animations are disabled
- [ ] Content is still accessible
- [ ] No reduced functionality
- [ ] CSS respects `prefers-reduced-motion: reduce`

---

## 📋 Summary Checklist

### Keyboard Navigation
- [ ] Tab moves focus logically
- [ ] Enter activates buttons
- [ ] Escape closes panels
- [ ] Arrow keys work in filter bar
- [ ] No keyboard traps

### Screen Reader
- [ ] Page has proper landmarks
- [ ] All text is announced
- [ ] Button states are announced
- [ ] Amenities are readable
- [ ] State changes are announced

### Touch Targets
- [ ] Filter chips: ≥ 44×44px
- [ ] Chevrons: ≥ 44×44px
- [ ] Copy buttons: ≥ 44×44px
- [ ] Comfortable to tap on phone

### Color Contrast
- [ ] No failures in axe DevTools
- [ ] All text readable (≥4.5:1 ratio)
- [ ] No color-only information

### Reduced Motion
- [ ] Animations are disabled
- [ ] Content still accessible
- [ ] No functionality lost

---

## 📝 Issues Found Template

For each issue, document:

```
Issue #1: [Title]
---
Component: [e.g., Filter Chip]
Severity: [Critical/High/Medium/Low]
Description: [What's wrong]
How to fix: [Suggested fix]
Files to update: [e.g., FilterBar.tsx]
```

---

## 🎯 Success Criteria

✅ **All tests pass when:**
1. Every interactive element is keyboard accessible
2. Screen readers announce all content correctly
3. All touch targets are at least 44×44px
4. Color contrast meets WCAG AA (4.5:1)
5. Animations respect prefers-reduced-motion

---

## Next Steps After Audit

1. **Document all issues** found
2. **Prioritize fixes** (Critical → High → Medium)
3. **Update components** to fix issues
4. **Re-test** each fix
5. **Move to Step 2: Desktop Layout Polish**

---

**Happy testing! 🚀**

Questions? Refer to:
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM Color Contrast](https://webaim.org/articles/contrast/)
- [Axe DevTools Docs](https://www.deque.com/axe/devtools/)
