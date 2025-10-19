# CTAS-7 Intranet Design Prototypes

## 📱 iOS-Ready Interactive Prototypes

These are **fully functional HTML/CSS prototypes** that you can:
1. **View immediately** in any browser
2. **Test on iOS devices** (Safari, Chrome)
3. **Use as Figma reference** (exact specs included)
4. **Port to Dioxus** with minimal changes

---

## 🎨 Prototypes Included

### 1. Smart Crate Registry (`01-smart-crate-registry.html`)
**Purpose:** Browse and manage all smart crates in the system

**Key Features:**
- Grid layout with responsive cards
- Search bar with filters
- Trivariate hash visualization (color-coded)
- Port badges
- QA score display with circular progress
- Tesla Grade badges
- Hover effects and transitions

**iOS Optimizations:**
- 44px minimum touch targets
- Safe area insets for notch/home indicator
- Active state animations
- Smooth scrolling

**Design Specs:**
- Card size: 320px min-width
- Border radius: 16px
- Padding: 24px
- Font: SF Pro Display/Text
- Colors: Apple-style (no emojis in production)

---

### 2. Product Page - Laser Light (`02-product-page-laser-light.html`)
**Purpose:** Apple-style product showcase page

**Key Features:**
- Hero section with gradient background
- Stats cards with large numbers
- Feature grid (3-column)
- Technical specifications table
- Use cases section
- CTA buttons

**iOS Optimizations:**
- Responsive typography (56px → 36px on mobile)
- Stacked layout on small screens
- Touch-friendly buttons
- Smooth scrolling sections

**Design Specs:**
- Hero height: 200px (mobile) to 320px (desktop)
- Max width: 980px
- Section padding: 80px vertical
- Font sizes: 56px (h1), 40px (h2), 24px (subtitle)

---

### 3. Neural Mux Dashboard (`03-neural-mux-dashboard.html`)
**Purpose:** Real-time operational dashboard (dark theme)

**Key Features:**
- System topology visualization
- Health metrics cards
- OODA loop status display
- Real-time event log
- Port allocation grid
- Pulsing status indicator
- Glass morphism effects

**iOS Optimizations:**
- Dark mode optimized
- Backdrop blur effects
- Smooth animations
- Touch-friendly nodes

**Design Specs:**
- Background: Dark gray (#111827)
- Cards: Glass morphism (blur + transparency)
- Accent color: Blue (#3B82F6)
- Node size: 80px diameter
- Grid: 12-column responsive

---

### 4. Mobile Navigation (`04-mobile-navigation.html`)
**Purpose:** iOS-native style navigation pattern

**Key Features:**
- Slide-out drawer navigation
- Bottom tab bar (iOS style)
- Hamburger menu animation
- Section headers
- Active state indicators
- Badges for notifications
- Smooth slide animations

**iOS Optimizations:**
- Safe area insets (top/bottom)
- 56px header height
- 64px tab bar height
- Drawer width: 80% (max 320px)
- Overlay with backdrop blur
- Prevent body scroll when open
- Touch gestures ready

**Design Specs:**
- Nav item height: 56px (44px+ for touch)
- Tab bar item: 64px height
- Icon size: 24px
- Animation duration: 0.3s
- Overlay opacity: 0.5

---

## 🚀 How to Use

### View in Browser
```bash
cd /Users/cp5337/Developer/ctas7-command-center/ctas-dioxus-docs/design-prototypes

# Open any file in your browser
open 01-smart-crate-registry.html
open 02-product-page-laser-light.html
open 03-neural-mux-dashboard.html
open 04-mobile-navigation.html
```

### Test on iOS Device
1. **AirDrop** the HTML files to your iPhone/iPad
2. Open in **Safari** or **Chrome**
3. Test touch interactions, scrolling, safe areas

### Use as Figma Reference
1. Open the HTML file in browser
2. Use browser DevTools to inspect exact measurements
3. All CSS variables are documented in `:root`
4. Colors, spacing, typography all specified

### Port to Dioxus
All prototypes use:
- Standard CSS (no frameworks)
- Semantic HTML
- iOS-safe CSS variables
- Documented component structure

---

## 🎨 Design System Reference

### Typography
```css
Font Family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text"

Sizes:
- h1: 48-56px (desktop), 36px (mobile)
- h2: 36-40px (desktop), 32px (mobile)
- h3: 20-24px
- body: 16px
- small: 13-14px
- tiny: 11-12px

Weights:
- Regular: 400
- Medium: 500
- Semibold: 600
- Bold: 700
```

### Colors
```css
/* Grayscale */
--black: #000000;
--white: #FFFFFF;
--gray-50: #F9FAFB;
--gray-100: #F3F4F6;
--gray-200: #E5E7EB;
--gray-300: #D1D5DB;
--gray-400: #9CA3AF;
--gray-500: #6B7280;
--gray-600: #4B5563;
--gray-700: #374151;
--gray-800: #1F2937;
--gray-900: #111827;

/* Accent */
--blue-500: #3B82F6;
--blue-600: #2563EB;

/* Trivariate Hash */
--cyan: #06B6D4;    /* SCH segment */
--purple: #8B5CF6;  /* CUID segment */
--green: #10B981;   /* UUID segment */

/* Status */
--green-500: #10B981;   /* Success */
--yellow-500: #F59E0B;  /* Warning */
--red-500: #EF4444;     /* Error */
```

### Spacing
```css
/* 8px base unit */
--space-1: 8px;
--space-2: 16px;
--space-3: 24px;
--space-4: 32px;
--space-5: 40px;
--space-6: 48px;
--space-8: 64px;
--space-10: 80px;
--space-12: 96px;
```

### Border Radius
```css
--radius-sm: 8px;   /* Small elements */
--radius-md: 12px;  /* Buttons, inputs */
--radius-lg: 16px;  /* Cards */
--radius-xl: 20px;  /* Pills */
--radius-full: 50%; /* Circles */
```

### Touch Targets (iOS)
```css
min-height: 44px;
min-width: 44px;
```

### Safe Areas (iOS)
```css
padding-top: env(safe-area-inset-top, 0px);
padding-right: env(safe-area-inset-right, 0px);
padding-bottom: env(safe-area-inset-bottom, 0px);
padding-left: env(safe-area-inset-left, 0px);
```

---

## 📐 Layout Patterns

### Responsive Grid
```css
.grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 20px;
}

/* Mobile: 1 column */
/* Tablet: 2 columns */
/* Desktop: 3-4 columns */
```

### Card Component
```css
.card {
    background: var(--white);
    border-radius: 16px;
    padding: 24px;
    border: 1px solid var(--gray-200);
    transition: all 0.3s;
}

.card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
}
```

### Button Component
```css
.btn {
    padding: 14px 32px;
    min-height: 44px;
    border-radius: 24px;
    font-size: 16px;
    font-weight: 600;
    transition: all 0.3s;
}

.btn:active {
    transform: scale(0.98);
}
```

---

## 🔄 Dioxus Conversion Guide

### HTML → Dioxus Component
```rust
// HTML
<div class="card">
    <h3 class="card-title">Title</h3>
    <p class="card-description">Description</p>
</div>

// Dioxus
rsx! {
    div { class: "card",
        h3 { class: "card-title", "Title" }
        p { class: "card-description", "Description" }
    }
}
```

### CSS → Dioxus Styling
```rust
// Option 1: External CSS (recommended)
// Keep the CSS files as-is, import in index.html

// Option 2: Inline styles
rsx! {
    div {
        style: "background: white; padding: 24px;",
        "Content"
    }
}

// Option 3: CSS-in-Rust (using a styling crate)
use dioxus_css::*;
```

---

## ✅ iOS Compatibility Checklist

All prototypes include:
- [x] Safe area insets for notch/home indicator
- [x] 44px minimum touch targets
- [x] Active state animations (`:active`)
- [x] Smooth scrolling (`-webkit-overflow-scrolling: touch`)
- [x] No horizontal scroll
- [x] Tap highlight removal
- [x] Font smoothing (`-webkit-font-smoothing: antialiased`)
- [x] Viewport meta tag with `viewport-fit=cover`
- [x] Responsive breakpoints (mobile-first)
- [x] Touch gesture support

---

## 🎯 Next Steps

1. **Review prototypes** in browser and on iOS device
2. **Approve designs** or request changes
3. **Export to Figma** (optional, for client presentations)
4. **Begin Dioxus implementation** using these as reference
5. **Iterate** based on user testing

---

## 📝 Notes

- **No emoji icons in production** - These are placeholders for real icons (SF Symbols on iOS, Lucide/Heroicons on web)
- **Apple-style design** - Clean, minimal, generous whitespace
- **Performance optimized** - CSS animations use `transform` and `opacity` for 60fps
- **Accessibility ready** - Semantic HTML, proper contrast ratios
- **Dark mode support** - Neural Mux dashboard demonstrates dark theme

---

**Created:** October 18, 2025  
**Version:** 1.0.0  
**Status:** Ready for Review  
**Next:** Figma export or Dioxus implementation

