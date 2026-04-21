# Quick Start: Accessibility Audit

**TL;DR — Just follow these 5 steps:**

---

## 🚀 Step 1: Start Dev Server (Terminal 1)

```bash
cd /sessions/loving-zealous-fermat/mnt/free-time
npm run dev
```

Wait for:
```
ready - started server on 0.0.0.0:3000
```

✅ Leave this running. **Do NOT close this terminal.**

---

## 🔗 Step 2: Get Local IP (Terminal 2 - NEW)

**Mac:**
```bash
ipconfig getifaddr en0
```

**Windows:**
```bash
ipconfig
```
Look for "IPv4 Address" (e.g., `192.168.1.100`)

**Linux:**
```bash
hostname -I
```

**Write it down:** `192.168.1.___`

---

## 📱 Step 3: Test on Phone

1. Connect phone to **same WiFi** as computer ✅
2. Open browser on phone
3. Visit: `http://192.168.1.100:3000` (use YOUR IP)
4. You should see the FreeTime app

---

## 💻 Step 4: Test on Desktop

1. Open `http://localhost:3000` in desktop browser
2. Install free axe DevTools extension:
   - **Chrome:** https://chromewebstore.google.com/detail/axe-devtools/lhdoppojpmngadmnkpklempisson
   - **Firefox:** https://addons.mozilla.org/en-US/firefox/addon/axe-devtools/

---

## ✅ Step 5: Run Accessibility Tests

### Test 1: Keyboard (5 min)
```
1. Click on search bar
2. Press Tab key repeatedly
3. Verify each element gets focus (blue outline)
4. Order should be: Search → Filters → Cards → Chevrons
```

### Test 2: Screen Reader (15 min)
**Mac:** Press `Cmd+F5` to enable VoiceOver  
**Windows:** Open NVDA (download link above)  
**Phone:** Enable in Accessibility settings

Listen for proper announcements of:
- Filter names and states ("Wifi filter on")
- Space names and addresses
- Amenity descriptions

### Test 3: Touch Targets (5 min)
On your **phone**, tap:
- [ ] Filter chips — Should be easy to tap
- [ ] Chevrons (↓) — Should respond
- [ ] Copy icons (📋) — Should work

All should be comfortable, no accidental taps.

### Test 4: Color Contrast (5 min)
1. Open DevTools (F12)
2. Open axe DevTools extension (icon in top-right)
3. Click "Scan ALL of my page"
4. Should show NO failures (only passes/warnings OK)

### Test 5: Reduced Motion (5 min)
**On Mac:**
```
System Settings → Accessibility → Display → Reduce motion → ON
```

**On Windows:**
```
Settings → Ease of Access → Display → Show animations → OFF
```

Reload page. Animations should be gone:
- [ ] List items appear instantly (no stagger)
- [ ] Filter toggles are instant (no fade)
- [ ] Chevron doesn't rotate
- [ ] Everything still works

---

## 📝 Document Issues

When you find a problem:

```
Issue: [What's wrong]
Component: [Where]
Severity: [Critical/High/Medium/Low]
Example: [How to reproduce]
```

Save in this format so we can fix it in Step 2.

---

## 🎯 What You're Looking For

✅ **GOOD:**
- Can use keyboard to navigate everything
- Screen reader announces all text clearly
- All buttons are easy to tap on phone
- No color contrast issues
- App works with animations disabled

❌ **BAD (document if found):**
- Keyboard gets stuck anywhere
- Screen reader skips content
- Buttons too small to tap
- Dark text on dark background (hard to read)
- Animations don't respect reduced motion setting

---

## Questions During Testing?

Refer to the full guide:
📄 [ACCESSIBILITY_AUDIT_GUIDE.md](./ACCESSIBILITY_AUDIT_GUIDE.md)

It has detailed steps for every test with expected results.

---

**Status: Ready to test! 🚀**

Start with Step 1 (Dev Server) and let me know what you find! 

I'll be here to help debug any issues.
