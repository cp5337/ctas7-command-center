# 🎨 SYNAPTIX DARK PROFESSIONAL DESIGN SYSTEM

**Version:** 1.0  
**For:** Google Workspace, Figma, Canva  
**Theme:** Dark, Professional, Executive-Ready  

---

## 🎨 **COLOR PALETTE**

### **Primary Dark Colors**

```css
/* Background Colors */
--synaptix-bg-primary: #0A0E17;      /* Deep space blue-black */
--synaptix-bg-secondary: #131824;    /* Card/panel background */
--synaptix-bg-tertiary: #1A2030;     /* Elevated surfaces */
--synaptix-bg-hover: #222B3D;        /* Hover states */

/* Accent Colors */
--synaptix-blue: #3B82F6;            /* Primary blue (Synaptix brand) */
--synaptix-blue-bright: #60A5FA;     /* Bright blue (highlights) */
--synaptix-cyan: #06B6D4;            /* Cyan accents */
--synaptix-purple: #8B5CF6;          /* Purple (secondary) */

/* Status Colors */
--synaptix-success: #10B981;         /* Green (operational) */
--synaptix-warning: #F59E0B;         /* Amber (in progress) */
--synaptix-danger: #EF4444;          /* Red (critical) */
--synaptix-info: #3B82F6;            /* Blue (info) */

/* Text Colors */
--synaptix-text-primary: #F8FAFC;    /* Pure white text */
--synaptix-text-secondary: #CBD5E1;  /* Gray text (secondary) */
--synaptix-text-tertiary: #94A3B8;   /* Dim gray (labels) */
--synaptix-text-muted: #64748B;      /* Very dim (metadata) */

/* Border Colors */
--synaptix-border: #2D3748;          /* Subtle borders */
--synaptix-border-bright: #475569;   /* Visible borders */
```

### **RGB Values (for Google APIs)**

```javascript
// Backgrounds
bgPrimary:    { red: 0.039, green: 0.055, blue: 0.090 }    // #0A0E17
bgSecondary:  { red: 0.075, green: 0.094, blue: 0.141 }    // #131824
bgTertiary:   { red: 0.102, green: 0.125, blue: 0.188 }    // #1A2030

// Accent Colors
blue:         { red: 0.231, green: 0.510, blue: 0.965 }    // #3B82F6
cyan:         { red: 0.024, green: 0.714, blue: 0.831 }    // #06B6D4
purple:       { red: 0.545, green: 0.361, blue: 0.965 }    // #8B5CF6

// Status
success:      { red: 0.063, green: 0.725, blue: 0.506 }    // #10B981
warning:      { red: 0.961, green: 0.620, blue: 0.043 }    // #F59E0B
danger:       { red: 0.937, green: 0.267, blue: 0.267 }    // #EF4444

// Text
textPrimary:  { red: 0.973, green: 0.980, blue: 0.988 }    // #F8FAFC
textSecondary:{ red: 0.796, green: 0.835, blue: 0.882 }    // #CBD5E1
```

---

## 📝 **TYPOGRAPHY**

### **Primary Font Family**

**Google Fonts:** Inter (sans-serif)  
**Fallback:** -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif

### **Font Weights**

- **Light:** 300 (body text, secondary content)
- **Regular:** 400 (standard body)
- **Medium:** 500 (emphasis, buttons)
- **Semibold:** 600 (headings, subheadings)
- **Bold:** 700 (titles, important text)
- **Extrabold:** 800 (hero text, display)

### **Font Sizes (Google Slides/Sheets)**

```javascript
// Slides
heroTitle:      { magnitude: 48, unit: 'PT' }    // Main titles
title:          { magnitude: 36, unit: 'PT' }    // Slide titles
subtitle:       { magnitude: 24, unit: 'PT' }    // Subtitles
heading:        { magnitude: 20, unit: 'PT' }    // Section headings
body:           { magnitude: 16, unit: 'PT' }    // Body text
caption:        { magnitude: 14, unit: 'PT' }    // Captions, labels
small:          { magnitude: 12, unit: 'PT' }    // Fine print

// Sheets
sheetHeader:    14                                 // Header row
sheetBody:      11                                 // Data rows
sheetCaption:   10                                 // Footer/notes
```

---

## 🎯 **DESIGN PRINCIPLES**

### **1. Executive Professional**
- **NO EMOJIS** - Suitable for government officials and CEOs
- Professional Unicode symbols only (●, ■, ▸, etc.)
- Text labels for all status indicators
- Military/intelligence community aesthetic

### **2. Dark First**
- All backgrounds dark (#0A0E17 to #1A2030)
- High contrast text (white on dark)
- Subtle shadows and glows
- No pure white backgrounds

### **3. Sophisticated Hierarchy**
- Clear visual hierarchy
- Generous whitespace
- Distinct sections
- Guided eye flow

### **4. Professional Polish**
- Clean, modern aesthetics
- Minimal decoration
- Focus on content
- Pentagon/Fortune 500 ready

### **5. Brand Consistency**
- Synaptix blue (#3B82F6) as primary
- Cyan accents for highlights
- Status colors for indicators
- Consistent spacing

---

## 📐 **LAYOUT GUIDELINES**

### **Spacing System (8px base)**

```javascript
spacing: {
  xs:   8,     // 8px   - tight spacing
  sm:   16,    // 16px  - small spacing
  md:   24,    // 24px  - medium spacing
  lg:   32,    // 32px  - large spacing
  xl:   48,    // 48px  - extra large
  xxl:  64     // 64px  - hero spacing
}
```

### **Border Radius**

```javascript
borderRadius: {
  sm:   4,     // Subtle rounding
  md:   8,     // Standard cards
  lg:   12,    // Large elements
  xl:   16,    // Hero elements
  full: 9999   // Pills/circles
}
```

### **Shadows (for depth)**

```css
/* Subtle elevation */
shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.3);

/* Standard cards */
shadow-md: 0 4px 6px rgba(0, 0, 0, 0.4);

/* Elevated elements */
shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.5);

/* Hero/floating */
shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.6);
```

---

## 🎨 **COMPONENT STYLES**

### **Quad Chart Cards**

```javascript
{
  background: '#131824',           // Dark card
  border: '3px solid #3B82F6',    // Blue border
  borderRadius: '12px',
  padding: '32px',
  boxShadow: '0 10px 15px rgba(0, 0, 0, 0.5)'
}
```

### **Status Indicators**

```javascript
operational: {
  background: 'rgba(16, 185, 129, 0.2)',  // Green tint
  border: '2px solid #10B981',            // Green border
  color: '#10B981',
  icon: '🟢'
}

inProgress: {
  background: 'rgba(245, 158, 11, 0.2)',  // Amber tint
  border: '2px solid #F59E0B',            // Amber border
  color: '#F59E0B',
  icon: '🟡'
}

planning: {
  background: 'rgba(239, 68, 68, 0.2)',   // Red tint
  border: '2px solid #EF4444',            // Red border
  color: '#EF4444',
  icon: '🔴'
}
```

### **Progress Bars**

```javascript
{
  background: '#1A2030',           // Dark track
  height: '32px',
  borderRadius: '16px',
  fill: 'linear-gradient(90deg, #3B82F6, #60A5FA)', // Blue gradient
  textColor: '#F8FAFC',            // White text
  fontSize: '16px',
  fontWeight: 600
}
```

### **Headers**

```javascript
{
  background: 'linear-gradient(135deg, #0A0E17, #1A2030)',
  borderBottom: '2px solid #3B82F6',
  padding: '24px 32px',
  color: '#F8FAFC',
  fontSize: '36px',
  fontWeight: 700
}
```

---

## 📊 **FIGMA SETUP**

### **Create Master Template**

1. **Frame Size:** 1920x1080 (16:9 - standard presentation)
2. **Background:** #0A0E17
3. **Grid:** 8px base unit
4. **Columns:** 12-column grid, 24px gutter

### **Components to Create**

```
Figma Components/
├── Backgrounds/
│   ├── Primary (#0A0E17)
│   ├── Secondary (#131824)
│   └── Tertiary (#1A2030)
├── Cards/
│   ├── Quad Chart Card (with blue border)
│   ├── Stat Card
│   └── Info Card
├── Status/
│   ├── Operational Badge (green)
│   ├── In Progress Badge (amber)
│   └── Planning Badge (red)
├── Typography/
│   ├── Hero Title (48pt, white)
│   ├── Title (36pt, white)
│   ├── Body (16pt, light gray)
│   └── Caption (14pt, dim gray)
└── Data Viz/
    ├── Progress Bar
    ├── Donut Chart
    └── Bar Chart
```

### **Figma Color Styles**

```
Colors/
├── Background/
│   ├── Primary
│   ├── Secondary
│   └── Tertiary
├── Text/
│   ├── Primary
│   ├── Secondary
│   └── Muted
├── Brand/
│   ├── Blue
│   ├── Cyan
│   └── Purple
└── Status/
    ├── Success
    ├── Warning
    └── Danger
```

---

## 🎨 **CANVA SETUP**

### **Create Brand Kit**

1. **Brand Colors:**
   - Add all hex codes from palette
   - Set #3B82F6 as primary
   - Add status colors

2. **Brand Fonts:**
   - Primary: Inter (all weights)
   - Headings: Inter Bold/Extrabold
   - Body: Inter Regular/Medium

3. **Logo Upload:**
   - Synaptix wordmark (white version)
   - Icon mark (blue version)

### **Template Sizes**

```
Presentation (16:9):  1920 x 1080 px
Document (A4):        2480 x 3508 px
Social (Square):      1080 x 1080 px
Banner (Wide):        1200 x 628 px
```

### **Canva Template Structure**

```
Templates/
├── Quad Chart Template
│   ├── Dark background
│   ├── 4 card layout
│   ├── Progress bars
│   └── Status indicators
├── Executive Presentation
│   ├── Title slide
│   ├── Agenda slide
│   ├── Content slides (10)
│   └── Thank you slide
└── Data Dashboard
    ├── Header with metrics
    ├── Chart grid (2x2)
    └── Footer with timestamp
```

---

## 📤 **EXPORT GUIDELINES**

### **From Figma:**

```bash
# Export settings
Format: PNG (for static)
Scale: 2x (for retina)
Background: Transparent (for overlays)

# Or SVG for scalability
Format: SVG
Outline Strokes: Yes
```

### **From Canva:**

```bash
# Export as
Presentation: PDF (high quality)
Images: PNG (with transparent background)
Templates: As Canva template link
```

### **Import to Google:**

```bash
# Convert Figma designs to Google Slides
1. Export PNG from Figma (2x resolution)
2. Upload to Google Slides as background
3. Add text overlays with matching fonts
4. Apply color scheme
```

---

## 🔧 **IMPLEMENTATION CHECKLIST**

### **Phase 1: Figma Setup** (30 min)
- [ ] Create Figma project: "Synaptix Design System"
- [ ] Set up color styles (all hex codes)
- [ ] Install Inter font
- [ ] Create component library
- [ ] Design quad chart template
- [ ] Design slide master template

### **Phase 2: Canva Setup** (20 min)
- [ ] Create brand kit in Canva
- [ ] Add all colors
- [ ] Set Inter as brand font
- [ ] Upload logo
- [ ] Create quad chart template
- [ ] Create presentation template

### **Phase 3: Google Workspace** (40 min)
- [ ] Export templates from Figma/Canva
- [ ] Create Google Slides master template
- [ ] Apply dark theme to Sheets
- [ ] Set up folder structure
- [ ] Test automated script with dark theme

### **Phase 4: Automation** (30 min)
- [ ] Update upload script with dark colors
- [ ] Add custom fonts
- [ ] Apply new color scheme
- [ ] Test full workflow
- [ ] Generate sample report

---

## 🎯 **USAGE**

### **For New Presentations:**

1. **Figma:** Create design → Export PNG
2. **Google Slides:** Import as background → Add text
3. **Or Canva:** Use template → Customize → Export

### **For Status Reports:**

1. Run report generator
2. Upload script applies dark theme automatically
3. Open in Google Workspace
4. Dark professional styling applied

### **For Custom Designs:**

1. Start with Figma template
2. Use color palette
3. Export and import to Google
4. Or design directly in Canva

---

## 📐 **SAMPLE LAYOUTS**

### **Quad Chart Layout (1920x1080)**

```
┌─────────────────────────────────────────────────────────────┐
│  [Dark Gradient Header: #0A0E17 → #1A2030]                  │
│  🚀 SYNAPTIX STRATEGIC INITIATIVES                          │
│  [Inter Bold, 36pt, #F8FAFC]                                │
├──────────────────────────┬──────────────────────────────────┤
│ [Card: #131824]          │ [Card: #131824]                  │
│ 🏗️ Core Infrastructure  │ 🤖 Agent Coordination            │
│ [Blue border 3px]        │ [Blue border 3px]                │
│                          │                                  │
│ Status: 🟡 In Progress   │ Status: 🟢 Operational           │
│ [#F59E0B]                │ [#10B981]                        │
│                          │                                  │
│ ████████░░░░ 45%        │ █████████████░ 65%               │
│ [Gradient: #3B82F6]      │ [Gradient: #3B82F6]              │
├──────────────────────────┼──────────────────────────────────┤
│ [Card: #131824]          │ [Card: #131824]                  │
│ 🎨 Primary Interfaces    │ ⚡ Universal Execution            │
│ [Blue border 3px]        │ [Blue border 3px]                │
│                          │                                  │
│ Status: 🟡 In Progress   │ Status: 🔴 Planning              │
│ [#F59E0B]                │ [#EF4444]                        │
│                          │                                  │
│ ███████████░ 55%        │ ████░░░░░░░░ 20%                │
│ [Gradient: #3B82F6]      │ [Gradient: #3B82F6]              │
└──────────────────────────┴──────────────────────────────────┘
```

---

## 🚀 **NEXT STEPS**

1. **Create Figma templates** (see checklist)
2. **Set up Canva brand kit** (see checklist)
3. **Update Google Workspace script** (apply dark theme)
4. **Test full workflow** (generate → upload → verify)
5. **Share templates** with team

---

**Dark. Professional. Executive-Ready.** 🎨

