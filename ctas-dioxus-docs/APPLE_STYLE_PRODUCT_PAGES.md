# Apple-Style Product Pages - Design System

## Design Principles

✅ **Minimalist** - Clean, spacious, breathable
✅ **Typography-focused** - Let the content shine
✅ **High contrast** - Black text on white, or white on black
✅ **No emoji icons** - Use simple geometric shapes or SF Symbols style
✅ **Professional** - Enterprise-ready, client-facing quality
✅ **Responsive** - Mobile-first, scales beautifully

---

## Color Palette

### Primary Colors
```css
--white: #ffffff;
--black: #1d1d1f;
--gray-50: #f5f5f7;
--gray-100: #e8e8ed;
--gray-200: #d2d2d7;
--gray-300: #86868b;
--gray-400: #6e6e73;
--gray-500: #424245;
```

### Accent Colors (Minimal Use)
```css
--blue: #0071e3;      /* Links, CTAs */
--blue-dark: #0077ed; /* Hover states */
--green: #34c759;     /* Success */
--red: #ff3b30;       /* Error */
```

### Backgrounds
```css
--bg-primary: #ffffff;
--bg-secondary: #f5f5f7;
--bg-dark: #000000;
--bg-dark-secondary: #1d1d1f;
```

---

## Typography

### Font Stack
```css
font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
```

### Type Scale
```css
--text-xs: 12px;    /* Captions */
--text-sm: 14px;    /* Body small */
--text-base: 17px;  /* Body */
--text-lg: 21px;    /* Lead paragraph */
--text-xl: 28px;    /* H4 */
--text-2xl: 40px;   /* H3 */
--text-3xl: 48px;   /* H2 */
--text-4xl: 64px;   /* H1 */
--text-5xl: 80px;   /* Hero */
```

### Font Weights
```css
--font-regular: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### Line Heights
```css
--leading-tight: 1.1;
--leading-snug: 1.2;
--leading-normal: 1.5;
--leading-relaxed: 1.625;
```

---

## Layout System

### Container Widths
```css
--container-sm: 640px;
--container-md: 768px;
--container-lg: 1024px;
--container-xl: 1280px;
--container-2xl: 1440px;
```

### Spacing Scale
```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;
--space-20: 80px;
--space-24: 96px;
--space-32: 128px;
```

---

## Product Page Template

### Hero Section
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                                                             │
│                    CTAS-7 Satellite Network                 │
│                                                             │
│           Global quantum-secured communication              │
│                  infrastructure at scale                    │
│                                                             │
│                    [ Learn More ]  [ Demo ]                 │
│                                                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**CSS**:
```css
.hero {
  min-height: 80vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: var(--space-20) var(--space-6);
  background: var(--bg-primary);
}

.hero-title {
  font-size: var(--text-5xl);
  font-weight: var(--font-semibold);
  line-height: var(--leading-tight);
  color: var(--black);
  margin-bottom: var(--space-4);
}

.hero-subtitle {
  font-size: var(--text-lg);
  font-weight: var(--font-regular);
  line-height: var(--leading-relaxed);
  color: var(--gray-400);
  max-width: 640px;
  margin-bottom: var(--space-8);
}
```

---

### Feature Section (Light Background)
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                   Built for performance                     │
│                                                             │
│    12 satellites. 259 ground stations. Sub-50ms latency.   │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │              │  │              │  │              │    │
│  │   Quantum    │  │   Real-time  │  │   Global     │    │
│  │   Secured    │  │   Routing    │  │   Coverage   │    │
│  │              │  │              │  │              │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**CSS**:
```css
.feature-section {
  padding: var(--space-32) var(--space-6);
  background: var(--bg-secondary);
}

.feature-title {
  font-size: var(--text-3xl);
  font-weight: var(--font-semibold);
  text-align: center;
  margin-bottom: var(--space-4);
}

.feature-subtitle {
  font-size: var(--text-lg);
  color: var(--gray-400);
  text-align: center;
  margin-bottom: var(--space-16);
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--space-8);
  max-width: var(--container-xl);
  margin: 0 auto;
}

.feature-card {
  background: var(--white);
  border-radius: 18px;
  padding: var(--space-8);
  text-align: center;
}

.feature-card-title {
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  margin-bottom: var(--space-3);
}

.feature-card-description {
  font-size: var(--text-base);
  color: var(--gray-400);
  line-height: var(--leading-relaxed);
}
```

---

### Dark Section (Contrast)
```
┌─────────────────────────────────────────────────────────────┐
│                        [Dark BG]                            │
│                                                             │
│                  Enterprise-grade security                  │
│                                                             │
│         Quantum key distribution. End-to-end encryption.    │
│              Zero-trust architecture. FIPS 140-3.           │
│                                                             │
│                      [ View Security Docs ]                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**CSS**:
```css
.dark-section {
  padding: var(--space-32) var(--space-6);
  background: var(--bg-dark);
  color: var(--white);
}

.dark-section-title {
  font-size: var(--text-3xl);
  font-weight: var(--font-semibold);
  text-align: center;
  margin-bottom: var(--space-6);
}

.dark-section-description {
  font-size: var(--text-lg);
  color: var(--gray-200);
  text-align: center;
  max-width: 800px;
  margin: 0 auto var(--space-8);
  line-height: var(--leading-relaxed);
}
```

---

### Stats Section
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│   │              │  │              │  │              │   │
│   │     259      │  │      12      │  │    < 50ms    │   │
│   │              │  │              │  │              │   │
│   │   Ground     │  │  Satellites  │  │   Latency    │   │
│   │   Stations   │  │              │  │              │   │
│   │              │  │              │  │              │   │
│   └──────────────┘  └──────────────┘  └──────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**CSS**:
```css
.stats-section {
  padding: var(--space-24) var(--space-6);
  background: var(--white);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-12);
  max-width: var(--container-lg);
  margin: 0 auto;
}

.stat-card {
  text-align: center;
}

.stat-value {
  font-size: var(--text-4xl);
  font-weight: var(--font-semibold);
  color: var(--black);
  margin-bottom: var(--space-2);
}

.stat-label {
  font-size: var(--text-base);
  color: var(--gray-400);
}
```

---

### Technical Specs Section
```
┌─────────────────────────────────────────────────────────────┐
│                     Technical Specifications                │
│                                                             │
│   Network                                                   │
│   ├─ Bandwidth: Up to 100 Gbps per link                   │
│   ├─ Latency: < 50ms global average                       │
│   └─ Uptime: 99.99% SLA                                    │
│                                                             │
│   Security                                                  │
│   ├─ Encryption: QKD + AES-256                            │
│   ├─ Compliance: FIPS 140-3, SOC 2 Type II               │
│   └─ Architecture: Zero-trust                              │
│                                                             │
│   Infrastructure                                            │
│   ├─ Satellites: 12 MEO constellation                     │
│   ├─ Ground Stations: 259 globally distributed            │
│   └─ Redundancy: N+2 failover                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**CSS**:
```css
.specs-section {
  padding: var(--space-32) var(--space-6);
  background: var(--bg-secondary);
}

.specs-title {
  font-size: var(--text-3xl);
  font-weight: var(--font-semibold);
  text-align: center;
  margin-bottom: var(--space-16);
}

.specs-grid {
  max-width: var(--container-md);
  margin: 0 auto;
  display: grid;
  gap: var(--space-12);
}

.spec-category {
  background: var(--white);
  border-radius: 18px;
  padding: var(--space-8);
}

.spec-category-title {
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  margin-bottom: var(--space-4);
}

.spec-list {
  list-style: none;
  padding: 0;
}

.spec-item {
  font-size: var(--text-base);
  color: var(--gray-400);
  padding: var(--space-2) 0;
  border-bottom: 1px solid var(--gray-100);
}

.spec-item:last-child {
  border-bottom: none;
}
```

---

### CTA Section
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                                                             │
│                     Ready to get started?                   │
│                                                             │
│              Contact our team for a personalized demo.      │
│                                                             │
│                      [ Contact Sales ]                      │
│                                                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**CSS**:
```css
.cta-section {
  padding: var(--space-32) var(--space-6);
  background: var(--white);
  text-align: center;
}

.cta-title {
  font-size: var(--text-3xl);
  font-weight: var(--font-semibold);
  margin-bottom: var(--space-4);
}

.cta-description {
  font-size: var(--text-lg);
  color: var(--gray-400);
  margin-bottom: var(--space-8);
}

.cta-button {
  display: inline-block;
  padding: var(--space-3) var(--space-6);
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  color: var(--white);
  background: var(--blue);
  border-radius: 980px; /* Apple's pill shape */
  text-decoration: none;
  transition: background 0.2s ease;
}

.cta-button:hover {
  background: var(--blue-dark);
}
```

---

## Button Styles

### Primary Button
```css
.button-primary {
  padding: 12px 24px;
  font-size: 17px;
  font-weight: 500;
  color: white;
  background: #0071e3;
  border: none;
  border-radius: 980px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.button-primary:hover {
  background: #0077ed;
}
```

### Secondary Button
```css
.button-secondary {
  padding: 12px 24px;
  font-size: 17px;
  font-weight: 500;
  color: #0071e3;
  background: transparent;
  border: 2px solid #0071e3;
  border-radius: 980px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.button-secondary:hover {
  background: #0071e3;
  color: white;
}
```

### Text Link
```css
.link {
  color: #0071e3;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
}

.link:hover {
  color: #0077ed;
  text-decoration: underline;
}
```

---

## Icon System (No Emojis)

Use simple geometric shapes or SF Symbols-style icons:

### Circle Icon
```css
.icon-circle {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--gray-100);
  display: flex;
  align-items: center;
  justify-content: center;
}
```

### Square Icon
```css
.icon-square {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: var(--gray-100);
  display: flex;
  align-items: center;
  justify-content: center;
}
```

### Simple SVG Icons
```html
<!-- Check mark -->
<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
</svg>

<!-- Arrow right -->
<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
</svg>

<!-- Globe -->
<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
  <path d="M2 12H22M12 2C14.5 4.5 16 8 16 12C16 16 14.5 19.5 12 22M12 2C9.5 4.5 8 8 8 12C8 16 9.5 19.5 12 22" stroke="currentColor" stroke-width="2"/>
</svg>
```

---

## Markdown Rendering

### Frontmatter Schema
```yaml
---
title: "CTAS-7 Satellite Network"
subtitle: "Global quantum-secured communication infrastructure"
category: "Infrastructure"
hero_image: "/assets/satellite-network-hero.jpg"
cta_text: "Request Demo"
cta_link: "/contact"
stats:
  - value: "259"
    label: "Ground Stations"
  - value: "12"
    label: "Satellites"
  - value: "< 50ms"
    label: "Latency"
features:
  - title: "Quantum Secured"
    description: "QKD encryption for unbreakable security"
  - title: "Real-time Routing"
    description: "AI-optimized path selection"
  - title: "Global Coverage"
    description: "259 ground stations worldwide"
specs:
  - category: "Network"
    items:
      - "Bandwidth: Up to 100 Gbps per link"
      - "Latency: < 50ms global average"
      - "Uptime: 99.99% SLA"
  - category: "Security"
    items:
      - "Encryption: QKD + AES-256"
      - "Compliance: FIPS 140-3, SOC 2 Type II"
---

# Main Content

Your markdown content here...
```

### Markdown → Product Page Pipeline

1. **Parse frontmatter** → Extract metadata
2. **Render hero** → Use title, subtitle, hero_image
3. **Render stats** → Auto-generate stats section
4. **Render features** → Auto-generate feature grid
5. **Render content** → Markdown body
6. **Render specs** → Auto-generate specs section
7. **Render CTA** → Use cta_text, cta_link

---

## Example: Laser Light Communications Page

```yaml
---
title: "Laser Light Communications"
subtitle: "Multi-domain global data distribution at scale"
category: "Customer Solutions"
hero_image: "/assets/laser-light-hero.jpg"
customer_logo: "/assets/laser-light-logo.svg"
industry: "Telecommunications"
use_case: "Global Optical Network"
stats:
  - value: "On-Demand"
    label: "Elastic Capacity"
  - value: "AI-Driven"
    label: "Route Optimization"
  - value: "Global"
    label: "Fiber + Satellite"
features:
  - title: "Data Transport as a Service"
    description: "Cloud usage model for high-speed global network"
  - title: "Network on Demand"
    description: "Self-provisioned connectivity in minutes"
  - title: "All-Optical Network"
    description: "Terrestrial fiber + satellite constellation"
challenge: |
  Laser Light needed to transform how high-volume data communications
  are distributed globally, combining terrestrial fiber, subsea cables,
  and satellite links into a single automated platform.
solution: |
  CTAS-7 provides the intelligent routing layer that unifies Laser Light's
  multi-domain network, enabling real-time AI optimization, automated
  service orchestration, and elastic capacity management.
results:
  - "Reduced provisioning time from days to minutes"
  - "AI-optimized routing against specified KPIs"
  - "Massive capacity pool absorbs traffic peaks"
cta_text: "Learn More About Enterprise Solutions"
cta_link: "/solutions/enterprise"
---

# Transforming Global Data Distribution

Laser Light Communications offers an elastic, global data distribution
platform – automated, agile, secure. A convergence of software, fiber
and satellites onto a single service 'always on' platform.

## The Challenge

[Markdown content continues...]
```

---

## Responsive Breakpoints

```css
/* Mobile First (default) */
.container {
  padding: 0 20px;
}

.hero-title {
  font-size: 48px;
}

/* Tablet (768px+) */
@media (min-width: 768px) {
  .container {
    padding: 0 40px;
  }
  
  .hero-title {
    font-size: 64px;
  }
}

/* Desktop (1024px+) */
@media (min-width: 1024px) {
  .container {
    padding: 0 60px;
  }
  
  .hero-title {
    font-size: 80px;
  }
}

/* Large Desktop (1440px+) */
@media (min-width: 1440px) {
  .container {
    max-width: 1440px;
    margin: 0 auto;
  }
}
```

---

## Animation Guidelines

### Subtle, Purposeful Animations

```css
/* Fade in on scroll */
.fade-in {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}

.fade-in.visible {
  opacity: 1;
  transform: translateY(0);
}

/* Hover scale */
.card {
  transition: transform 0.3s ease;
}

.card:hover {
  transform: scale(1.02);
}

/* Button press */
.button:active {
  transform: scale(0.98);
}
```

### No Animations That:
- ❌ Spin endlessly
- ❌ Bounce excessively
- ❌ Flash or strobe
- ❌ Distract from content

---

## Summary

✅ **Clean, minimal design** - Apple-inspired
✅ **Professional color palette** - Black, white, grays, minimal blue
✅ **No emoji icons** - Simple geometric shapes or SVG icons
✅ **Typography-focused** - Let content breathe
✅ **Responsive** - Mobile-first, scales beautifully
✅ **Markdown-driven** - 90% content from .md files
✅ **Frontmatter metadata** - Auto-generate sections
✅ **Customer examples** - Laser Light Communications template

**This is enterprise-grade, client-ready design. Beautiful, functional, professional.** 🎯

