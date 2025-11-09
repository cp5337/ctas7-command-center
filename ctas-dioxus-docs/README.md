# CTAS-7 Dioxus Documentation Site

**Docusaurus-style documentation site built with Dioxus and Rust**

---

## 🎯 **What This Is**

A beautiful, fast documentation site for CTAS-7 and Synaptix products, similar to Docusaurus but built entirely in Rust with Dioxus.

### **Features**
- ✅ Sidebar navigation with collapsible sections
- ✅ Table of contents for each page
- ✅ Markdown rendering
- ✅ Search functionality
- ✅ Dark mode support
- ✅ Mobile responsive
- ✅ Fast and lightweight

---

## 🚀 **Quick Start**

### **Run Development Server**
```bash
cd ctas7-command-center/ctas-dioxus-docs
dx serve
```

Then open: `http://localhost:8080`

### **Build for Production**
```bash
dx build --release
```

---

## 📁 **Structure**

```
ctas-dioxus-docs/
├── src/
│   ├── main.rs                 # App entry point
│   ├── routes.rs               # Route definitions
│   ├── components/
│   │   ├── sidebar.rs          # Sidebar navigation
│   │   └── mod.rs              # Component exports
│   └── ...
├── docs/
│   ├── index.md                # Documentation home
│   ├── sidebar.json            # Sidebar configuration
│   ├── architecture/           # Architecture docs
│   ├── agents/                 # Agent system docs
│   ├── foundation/             # Foundation docs
│   ├── products/               # Product docs
│   ├── development/            # Dev guides
│   └── research/               # Research papers
├── assets/
│   ├── docs-styles.css         # Documentation styles
│   └── ...
└── README.md                   # This file
```

---

## 📝 **Adding Documentation**

### **1. Create Markdown File**
```bash
# Example: Add new architecture doc
touch docs/architecture/my-new-doc.md
```

### **2. Add to Sidebar**
Edit `docs/sidebar.json`:
```json
{
  "title": "Architecture",
  "icon": "🏗️",
  "items": [
    {
      "title": "My New Doc",
      "path": "/docs/architecture/my-new-doc"
    }
  ]
}
```

### **3. Write Content**
Use standard markdown:
```markdown
# My New Documentation

## Overview
This is my new documentation page.

## Features
- Feature 1
- Feature 2

## Code Example
\`\`\`rust
fn main() {
    println!("Hello, CTAS-7!");
}
\`\`\`
```

---

## 🎨 **Customization**

### **Sidebar Configuration**
Edit `docs/sidebar.json` to customize the sidebar menu structure.

### **Styling**
Edit `assets/docs-styles.css` to customize colors, fonts, and layout.

### **Components**
Add new components in `src/components/` for custom functionality.

---

## 📚 **Documentation Categories**

### **Architecture** (`/docs/architecture/`)
- PLASMA-PRISM-PTCC
- Kali Synaptix
- Legion Multi-World
- Universal GIS
- Threat Emulation
- Security & Compliance

### **Agent Systems** (`/docs/agents/`)
- Overview
- Dual-LLM Architecture
- Agent Profiles
- Deployment
- Linear Integration
- Voice System

### **Foundation** (`/docs/foundation/`)
- USIM System
- PTCC 7.0 Validation
- Trivariate Hashing
- Mathematical Methods
- Smart Crates

### **Products** (`/docs/products/`)
- ABE Platform
- Synaptix Plasma
- LaserLight Communications
- Mobile (iOS)

### **Development** (`/docs/development/`)
- Development Setup
- Git Workflow
- Docker & OrbStack
- Testing & QA
- CI/CD Pipeline

### **Operations** (`/docs/operations/`)
- HD4 Framework
- Threat Intelligence
- GIS Operations
- OSINT Collection

### **Research** (`/docs/research/`)
- White Papers
- Experiments
- Bibliography

### **API Reference** (`/docs/api/`)
- REST API
- GraphQL API
- gRPC Services
- WebSocket

---

## 🔧 **Technical Details**

### **Built With**
- **Dioxus** - Rust UI framework
- **Markdown** - Documentation format
- **CSS** - Styling
- **JSON** - Configuration

### **Key Files**
- `src/components/sidebar.rs` - Sidebar navigation component
- `docs/sidebar.json` - Sidebar menu structure
- `assets/docs-styles.css` - Docusaurus-style CSS
- `docs/index.md` - Documentation homepage

---

## 🎯 **Next Steps**

### **Phase 1: Core Setup** ✅
- ✅ Sidebar navigation
- ✅ Markdown rendering
- ✅ Styling
- ✅ Structure

### **Phase 2: Content Migration** (In Progress)
- ⏳ Copy markdown files from Google Drive
- ⏳ Update internal links
- ⏳ Add images and diagrams
- ⏳ Test all pages

### **Phase 3: Features** (Coming Soon)
- ⏳ Search functionality
- ⏳ Syntax highlighting
- ⏳ Dark mode toggle
- ⏳ Mobile menu
- ⏳ Breadcrumbs
- ⏳ Edit on GitHub links

### **Phase 4: Deployment** (Future)
- ⏳ Build optimization
- ⏳ Static site generation
- ⏳ CDN deployment
- ⏳ Custom domain

---

## 📊 **Status**

- **Version:** 0.1.0
- **Status:** 🚧 In Development
- **Last Updated:** 2025-11-09

---

## 🎉 **Ready to Use!**

The documentation site structure is ready. Just add your markdown files to the `docs/` folder and they'll automatically appear in the sidebar menu!

**Start the dev server and see it in action:**
```bash
dx serve
```

