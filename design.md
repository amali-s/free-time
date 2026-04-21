# design.md -- UX, Design System & Interaction Specification

## Design System Source

**Figma file**: [Sage Component Kit](https://www.figma.com/design/5TMUAOp35jOOKBNNqEo32Z/Sage-Component-kit?node-id=134-891&t=JZc9tgd3qrtwFZYC-1)

All components, tokens, and visual language derive from the Sage Component Kit. Do not invent new tokens. Extend only when the kit has a clear gap, and document the extension here.

---

## 1. Visual Style -- Studio Ghibli x Sage

### 1.1 Art Direction

The visual identity of FreeTime draws from the hand-painted, 2D illustration style of Studio Ghibli -- specifically the warm, lived-in world of *Kiki's Delivery Service*. This isn't about literal anime UI. It's about borrowing the emotional texture: a sense of a place that is welcoming, slightly weathered, full of light, and deeply human. Every surface should feel like it was painted, not generated.

**Core mood**: A quiet afternoon in a coastal European town. Warm stone, open windows, laundry on the line, bread cooling on a sill. The user should feel the same calm reassurance Kiki feels landing in Koriko -- *"I don't know this place yet, but it feels like I could belong here."*

### 1.2 Illustration Style

All custom illustrations (empty states, onboarding, error pages, map overlays) follow these rules:

- **2D, hand-painted aesthetic**. No 3D renders, no gradients that feel digital. Use flat color with subtle texture overlays (paper grain, watercolor bleed at edges).
- **Soft outlines**. Lines should feel drawn, not computed. Use 1-2px strokes in `Text Secondary #595640` or `Brand Blue #1E526F`, slightly irregular where possible (SVG filters can simulate hand-drawn strokes).
- **Warm natural light**. Shadows are soft, cast at a low angle (as if it's always late afternoon). Use `Accent #E8DDA2` at low opacity for light washes. Shadows use `Text Secondary #595640` at 8-12% opacity -- never pure black.
- **Lived-in detail**. Illustrations of spaces should include small human touches: a potted plant on a windowsill, a bicycle leaned against a wall, steam rising from a cup. These details are what make Ghibli backgrounds feel real.
- **No characters in UI illustrations**. Spaces should feel inviting but empty -- the user is the one who will fill them. (Exception: onboarding can show a small figure with a bag/laptop arriving in a town.)
- **Limited palette per illustration**. Each illustration should use 3-5 Sage tokens max. Restraint is what makes Ghibli compositions feel harmonious rather than busy.

### 1.3 Map Visual Treatment

The map is the heart of FreeTime and should feel like an illustrated town map, not a standard Mapbox/Google basemap.

- **Custom Mapbox style**: Mute the default basemap. Reduce road label density. Tint land areas toward `Background #EDE6DE`, water toward `Brand Blue #1E526F` at 30% opacity, parks toward `Success #00803F` at 15% opacity.
- **Map pins**: Small, rounded, slightly irregular shapes (not perfect circles). Use a subtle drop shadow (`Text Secondary` at 10%, 2px offset). Color-coded by space type using existing Sage tokens.
- **Pin hover/select state**: Pin gently scales up (1.0 → 1.15) with a soft `Accent #E8DDA2` glow -- like a lantern being lit.
- **Cluster markers**: Rounded rectangles with a hand-drawn border feel. Show count in `Heading 1` (14px, W5). Background `Foreground #FFFDFB` with a 1px `Text Secondary` border.
- **Map terrain**: If Mapbox terrain is available, use a low-exaggeration hillshade to give a sense of topography -- Ghibli towns always feel like they exist in a real landscape with hills and water.

### 1.4 Surface & Texture

- **Paper texture overlay**: Apply a subtle paper grain texture (noise at 2-3% opacity) over the `Background #EDE6DE` surface. This prevents the background from feeling flat/digital. Use a CSS `background-image` with a tiling grain PNG or SVG filter.
- **Card surfaces** (`Foreground #FFFDFB`): Slightly warmer than pure white. Cards should feel like thick paper stock -- use a very subtle inner shadow (1px, `Text Secondary` at 5%) on the bottom/right edges to suggest physicality.
- **Borders**: Prefer soft, muted borders (`Text Disabled #ADABA5` at 50% opacity) over hard lines. Where possible, omit borders entirely and rely on background color contrast and spacing to separate elements.
- **Shadows**: Soft and warm. Never use pure black shadows. Standard elevation shadow: `0 2px 8px rgba(89, 86, 64, 0.08)` (using Text Secondary RGB values). Higher elevation: `0 4px 16px rgba(89, 86, 64, 0.12)`.

### 1.5 Motion & Animation

Ghibli animation is characterized by naturalistic, slightly imperfect movement -- things settle and sway rather than snapping.

- **Easing**: Use `cubic-bezier(0.34, 1.56, 0.64, 1)` for elements entering (slight overshoot, like a leaf landing). Use `ease-out` for exits.
- **Duration**: 200-300ms for micro-interactions (filter toggles, hover). 350-500ms for panel transitions (bottom sheet, side panel). Never exceed 500ms.
- **Map pin entrance**: Pins should drop in with a gentle bounce when data loads, staggered by 30ms each (like raindrops).
- **Bottom sheet**: Slides up with slight momentum overshoot, then settles. Feels like pulling up a window shade.
- **Filter chip toggle**: Background color crossfades (not snaps). Active state fades in over 200ms.
- **Respect `prefers-reduced-motion`**: Replace all animated transitions with instant state changes. No exceptions.

### 1.6 Iconography

- Icons should feel **simple and slightly rounded** -- closer to a woodcut or stamp than a pixel-perfect system icon.
- Use 2px stroke weight, round caps, round joins. Consistent with the Sage Kit icon set but extend with the same hand-drawn quality.
- Amenity icons (wifi, outlet, seating, bathroom, storage) should be recognizable at 16px but designed at 24px.
- Prefer filled icons for active/selected states, outlined for default/inactive.

### 1.7 Photography (if used)

- Photos of spaces should feel editorial, not stock. Warm color grading, natural light, slightly desaturated.
- Apply a subtle warm overlay (`Accent #E8DDA2` at 5-8% opacity, multiply blend) to unify photos with the illustrated UI.
- Round corners to match card border radius (8px).
- If no photo is available for a space, show a type-specific illustrated placeholder (e.g., a simple watercolor sketch of a cafe, library, or park bench).

---

## 2. UX Principles

### 1.1 Speed over spectacle
The user is often in a time-pressured, unfamiliar situation. Every screen should answer: *"How fast can I find a usable space?"* Eliminate decorative friction. Prioritize scannability and action density.

### 1.2 Progressive disclosure
Show the minimum information needed at each level. City → map/list of spaces → space detail card. Don't front-load filters or settings. Let the user drill down only when they need specificity.

### 1.3 Context-aware defaults
Use geolocation to pre-select the city. Sort by proximity. Surface the most common filters (wifi, outlets) prominently. The app should feel like it already knows what you need.

### 1.4 One hand, one eye
Most users will be on a phone, possibly walking or standing. Design for thumb-reachable interactions and glanceable information hierarchy.

---

## 3. UX Laws to Follow

| Law | Application |
|---|---|
| **Fitts's Law** | Make primary actions (search, filter toggles, space cards) large and close to natural thumb zones. Minimum 44px touch targets on mobile. |
| **Hick's Law** | Limit visible filter options to 4-6 at a time. Don't overwhelm with choices. Group secondary filters behind a "More filters" action. |
| **Miller's Law** | Space cards should show 5-7 key attributes max. Use tags and icons to compress information. |
| **Law of Proximity** | Group related metadata (amenities together, location info together, action buttons together) within cards and panels. |
| **Jakob's Law** | Users expect map interactions to work like Google/Apple Maps. Use familiar pin, zoom, and pan conventions. List views should feel like standard proximity-sorted results. |
| **Aesthetic-Usability Effect** | Clean, warm, minimal design builds trust -- users will forgive small gaps in data if the interface feels reliable and considered. |
| **Doherty Threshold** | All interactions should respond within 400ms. Use skeleton loaders and optimistic UI for map/list transitions. |

---

## 4. Design Tokens (from Sage Component Kit)

### 4.1 Color Palette

Supports **Light theme** and **Dark theme** modes.

#### Brand
| Token | Light | Hex |
|---|---|---|
| Brand Blue | `rgb(30, 82, 111)` | `#1E526F` |
| Brand Red | `rgb(125, 10, 22)` | `#7D0A16` |

#### Actions
| Token | Light | Hex | Dark | Hex |
|---|---|---|---|---|
| Primary Action | `rgb(48, 182, 231)` | `#30B6E7` | `rgb(31, 131, 189)` | `#1F83BD` |
| Secondary Action | `rgb(87, 80, 64)` | `#575040` | same | `#575040` |
| Active State | `rgb(133, 206, 222)` | `#85CEDE` | same | `#85CEDE` |
| Active State Secondary | `rgb(191, 154, 73)` | `#BF9A49` | same | `#BF9A49` |

#### Surfaces
| Token | Value | Hex |
|---|---|---|
| Background | `rgb(237, 230, 222)` | `#EDE6DE` |
| Foreground | `rgb(255, 253, 251)` | `#FFFDFB` |
| Accent | `rgb(232, 221, 162)` | `#E8DDA2` |

#### Text
| Token | Light | Hex | Dark | Hex |
|---|---|---|---|---|
| Text Primary | `rgb(27, 35, 35)` | `#1B2323` | same | `#1B2323` |
| Text Secondary | `rgb(89, 86, 64)` | `#595640` | same | `#595640` |
| Text Disabled | `rgb(173, 171, 165)` | `#ADABA5` | same | `#ADABA5` |
| Neutral Text | `rgb(108, 114, 118)` | `#6C7276` | `rgb(150, 158, 163)` | `#969EA3` |

#### Semantic
| Token | Value | Hex |
|---|---|---|
| Error | `rgb(204, 57, 38)` | `#CC3926` |
| Warning | `rgb(217, 137, 0)` | `#D98900` |
| Warning Yellow | `rgb(255, 184, 15)` | `#FFB80F` |
| Success | `rgb(0, 128, 63)` | `#00803F` |
| Disabled | `rgb(165, 177, 184)` | `#A5B1B8` |

#### Extended Palette
| Token | Hex |
|---|---|
| Light Blue | `#60E1F0` |
| Dark Blue | `#096694` |
| Dark Orange | `#875C00` |
| Bright Magenta | `#FF4978` |
| Pale Mustard | `#D9D059` |
| Lime Green | `#16D113` |
| Dark Magenta | `#902944` |

### 4.2 Typography

**Font family**: Hiragino Sans (web fallback: `"Hiragino Sans", "Hiragino Kaku Gothic Pro", "Noto Sans", system-ui, sans-serif`)

| Style | Size | Weight | Line Height | Use |
|---|---|---|---|---|
| Heading 6 | 36px | W2 (light) | ~100% | Hero/page titles |
| Heading 5 | 32px | W3 (regular) | ~100% | Section titles |
| Heading 4 | 24px | W5 (semibold) | ~100% | Card titles, prominent labels |
| Heading 3 | 20px | W1 (thin) | ~100% | Subheadings |
| Heading 2 | 16px | W5 (semibold) | ~100% | List item titles, inline headings |
| Heading 1 | 14px | W5 (semibold) | ~100% | Small headings, tag labels |
| Body 2 | 16px | W3 (regular) | 150% | Primary body text |
| Body 1 | 14px | W3 (regular) | 150% | Secondary body text, descriptions |
| Label 1 | 12px | W3 (regular) | 150% | Captions, metadata, timestamps |
| Label 2 | 14px | W2 (light) | 150% | Subtle labels, helper text |

### 4.3 Spacing

Base unit: **16px**. Use multiples and subdivisions: 4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px.

### 4.4 Border Radius
- Small (tags, chips): 4px
- Medium (cards, inputs): 8px
- Large (modals, sheets): 12px
- Full (avatar, FAB): 50%

---

## 5. Component Inventory (from Sage Component Kit)

| Component | Variants | Usage in FreeTime |
|---|---|---|
| **Primary Button** | Default, Hover, Active, Disabled | "Apply filters", "Get directions", "View details" |
| **Secondary Button** | Default, Hover, Active, Disabled | "Clear filters", "Cancel" |
| **Tertiary Button** | Default, Hover, Active, Disabled | Inline text actions, "Show more" |
| **Ghost Button** | Default, Hover, Active, Disabled | Icon-only actions (close, back) |
| **Card** | Multiple variants | Space cards in list and detail view |
| **Text Input** | Multiple states | City search field |
| **Text Box** | Multiple states | Extended text fields (if needed) |
| **Dropdown** | Default, Open, Selected | City selector, sort options |
| **Dropdown Top Value** | Multiple states | Selected dropdown value display |
| **Slot** | Multiple variants | Reusable content slots within cards |
| **Tearsheet** | Single | Space detail panel (side panel on desktop, bottom sheet on mobile) |
| **Toast Notification** | Multiple variants | Confirmations, errors, location permission prompts |
| **Calendar** | -- | Hours/availability display (future feature) |
| **Icons** | Add, Close, Chevron, Check, Microphone, Loading | Navigation, actions, status indicators |

### Additional Components to Build (not in Sage Kit)
| Component | Description |
|---|---|
| **Filter Chip** | Toggle-able amenity filter (wifi, outlets, seating, bathroom, storage) |
| **Map Pin** | Custom map marker for space locations; color-coded by type |
| **Map Pin Cluster** | Grouped pins at lower zoom levels |
| **Space List Item** | Compact row for list view with name, distance, top amenity icons |
| **View Toggle** | Map/List switch control |
| **City Search Bar** | Prominent search with autocomplete dropdown |
| **Space Count Badge** | Displays total number of spaces found |

---

## 6. Information Architecture

```
App Shell
├── Header
│   ├── City Search Bar (with autocomplete)
│   └── Space Count Badge ("142 spaces in Denver")
├── Filter Bar
│   ├── Filter Chips: Wifi | Outlets | Seating | Bathroom | Storage
│   └── More Filters (expandable)
├── View Toggle (Map / List)
├── Main Content
│   ├── Map View
│   │   ├── Interactive map with pins
│   │   ├── Pin clusters at low zoom
│   │   └── Pin tap → Space Detail Card
│   └── List View
│       ├── Proximity-sorted space list items
│       └── Item tap → Space Detail Card
└── Space Detail Card (overlay / side panel / bottom sheet)
    ├── Space name and type
    ├── Tags (free, paid, cafe, wifi, bathroom, storage)
    ├── Amenity icons
    ├── Address + distance
    ├── Hours (open/closed status)
    ├── Noise level indicator
    ├── Description
    └── Actions: Get Directions, Visit Website
```

---

## 7. Desktop Experience (Click-Through Flows)

### Breakpoint
Desktop: >= 1024px

### Layout
- **Split-panel layout**: Left panel (list/filters, ~400px), right panel (map, fills remaining width).
- City search bar spans the top of the left panel.
- Filter chips sit below the search bar.
- List view is the default left panel content; toggling to "Map only" hides the list panel.
- Space detail opens as a **side panel** (slides in from right over the map, or replaces the list panel).

### Interactions (hover + click)
| Element | Hover | Click |
|---|---|---|
| Map pin | Pin enlarges + tooltip with space name and type | Opens space detail in side panel |
| List item | Subtle background highlight (`Active State #85CEDE` at 10% opacity) | Opens space detail in side panel; corresponding map pin highlights |
| Filter chip | Background shifts to `Accent #E8DDA2` | Toggles filter on/off; chip fills with `Primary Action #30B6E7` when active |
| City search | -- | Focus reveals autocomplete dropdown |
| Autocomplete item | Background highlight | Selects city, reloads spaces |
| View toggle | Button hover state | Switches between split-panel (map + list) and full-map view |
| Space detail "Get Directions" | Button hover state per Sage Primary Button | Opens external maps link in new tab |
| Space detail close (X) | Ghost button hover | Closes detail panel, returns to list/map |

### Desktop States
- **Default**: Split-panel with list on left, map on right, city auto-detected
- **Search active**: Autocomplete dropdown overlays list panel
- **Filters applied**: Active chips highlighted; list and map update; space count updates
- **Detail open**: Side panel slides over map; list remains scrollable behind
- **No results**: Empty state illustration in list panel with message "No spaces match your filters in {city}. Try removing a filter."

---

## 8. Mobile Experience (Tap + Press Flows)

### Breakpoint
Mobile: < 768px. Tablet: 768px - 1023px (follows mobile patterns with more breathing room).

### Layout
- **Full-screen map** as default view with a floating search bar at top and filter chips in a horizontal scroll below it.
- **Bottom sheet** for list view: half-height sheet overlays the map, draggable to full-height.
- Space detail opens as a **bottom sheet** (slides up, covers ~85% of viewport).
- Space count badge floats above the bottom sheet handle.

### Interactions (tap + press)
| Element | Tap | Long Press | Swipe |
|---|---|---|---|
| Map pin | Opens space detail bottom sheet | -- | -- |
| Bottom sheet handle | -- | -- | Drag up to expand list to full height; drag down to collapse to peek (showing 2-3 items) or dismiss |
| List item | Opens space detail bottom sheet | -- | -- |
| Filter chip | Toggles filter on/off | -- | Horizontal scroll through filter chips |
| City search bar | Focus + keyboard opens; autocomplete appears below | -- | -- |
| Space detail bottom sheet | -- | -- | Swipe down to dismiss |
| "Get Directions" button | Opens native maps app (deep link) | -- | -- |
| View toggle | Switches between map-focused and list-focused views | -- | -- |
| Back (top-left) | Returns from detail to previous view | -- | -- |

### Thumb Zone Considerations
- Primary actions (filter chips, search, view toggle) placed in the **top third** so they're reachable before scrolling.
- Space detail action buttons ("Get Directions", "Visit Website") placed at the **bottom of the sheet**, within natural thumb reach.
- Bottom sheet handle in the center-top of the sheet for easy grab.
- Minimum touch target: **44 x 44px** on all interactive elements.

### Mobile States
- **Default**: Full-screen map, floating search bar, collapsed bottom sheet peeking 2-3 list items
- **List expanded**: Bottom sheet at full height, list scrollable, map partially visible behind
- **Search active**: Keyboard open, autocomplete dropdown fills screen above keyboard
- **Filters applied**: Chips scroll position maintained; map pins and list update; count updates
- **Detail open**: Bottom sheet at ~85% height with space info, scrollable content, sticky action bar at bottom
- **Location permission**: Toast notification asking to enable location; fallback to city search
- **No results**: Centered illustration in list/bottom sheet with message and "Clear filters" button
- **Loading**: Skeleton cards in list view; subtle pulsing pins on map
- **Error**: Toast notification with error message and retry action
- **Offline**: Banner at top: "You're offline. Showing cached results." (if service worker is implemented)

---

## 9. View States (All Platforms)

### 9.1 Loading
- **Map**: Tiles load progressively. Pins appear as small pulsing dots before data resolves.
- **List**: 3-5 skeleton cards with animated shimmer using `Disabled #A5B1B8` on `Background #EDE6DE`.
- **Search**: Spinner in search field (Loading icon from Sage Kit).
- **Detail**: Skeleton layout matching detail card structure.

### 9.2 Empty
- **No spaces in city**: Illustration + "No spaces found in {city} yet. Try a nearby city."
- **No filter matches**: "No spaces match your filters. Try removing a filter." + "Clear all filters" Tertiary Button.
- **City not found**: "We couldn't find that city. Check the spelling or try a nearby city."

### 9.3 Error
- **API error**: Toast notification (Error variant from Sage Kit): "Something went wrong. Tap to retry."
- **Geolocation error**: Toast: "Couldn't detect your location. Search for a city instead."
- **Map load failure**: Fallback to list-only view with inline banner: "Map unavailable. Showing list view."

### 9.4 Success / Confirmation
- **City changed**: Brief toast: "Showing spaces in {city}"
- **Filters applied**: Immediate UI update (no toast needed; count change is sufficient feedback)

---

## 10. Tag System

Tags appear on space detail cards and optionally as small badges on list items.

| Tag | Color | Meaning |
|---|---|---|
| free | `Success #00803F` on light bg | No cost to use the space |
| paid | `Warning #D98900` on light bg | Requires payment or day pass |
| cafe | `Dark Orange #875C00` on light bg | Purchase expected (coffee, food) |
| wifi | `Primary Action #30B6E7` on light bg | Wifi available |
| bathroom | `Brand Blue #1E526F` on light bg | Restroom available |
| storage | `Dark Blue #096694` on light bg | Luggage storage available |
| coworking | `Secondary Action #575040` on light bg | Dedicated workspace |
| outdoor | `Lime Green #16D113` on light bg | Outdoor space |

Tags use Label 1 (12px, W3) text, 4px border radius, 4px vertical / 8px horizontal padding.

---

## 11. Responsive Breakpoints

| Name | Range | Layout |
|---|---|---|
| Mobile | 0 - 767px | Full-screen map + bottom sheet list |
| Tablet | 768px - 1023px | Full-screen map + wider bottom sheet |
| Desktop | 1024px+ | Split-panel: list/filters left, map right |

---

## 12. Accessibility

- All interactive elements have visible focus indicators (2px solid `Primary Action #30B6E7`).
- Color is never the only indicator of state; pair with icons or text.
- Map pins have `aria-label` with space name and type.
- Filter chips announce state changes to screen readers ("Wifi filter on", "Wifi filter off").
- Bottom sheets and side panels use `role="dialog"` with proper focus trapping.
- Ensure all text meets 4.5:1 contrast ratio against its background.
- Provide `prefers-reduced-motion` support: disable map animations, replace shimmers with static placeholders.
