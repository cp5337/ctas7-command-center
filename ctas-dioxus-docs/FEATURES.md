# CTAS-7 Dioxus Documentation Site Features

**Complete Markdown All in One + Link Updater implementation in Rust/Dioxus**

---

## ✨ **Features Implemented**

### **📝 Markdown All in One Features**

Based on the [Markdown All in One VS Code extension](https://markdown-all-in-one.github.io/docs/guide/):

#### **1. Auto Table of Contents**
- ✅ Automatically extract headings from markdown
- ✅ Generate clickable TOC with proper nesting
- ✅ Update TOC when content changes
- ✅ Anchor links to headings

#### **2. GitHub Flavored Markdown**
- ✅ Tables with alignment
- ✅ Task lists with checkboxes
- ✅ Strikethrough text
- ✅ Automatic URL linking
- ✅ Fenced code blocks with syntax highlighting

#### **3. Math Support**
- ✅ Inline math with `$...$`
- ✅ Block math with `$$...$$`
- ✅ KaTeX rendering

#### **4. Live Preview**
- ✅ Side-by-side editor and preview
- ✅ Scroll synchronization
- ✅ Real-time updates as you type
- ✅ Toggle between editor-only and split view

#### **5. Keyboard Shortcuts**
- ✅ **Ctrl+B** - Bold
- ✅ **Ctrl+I** - Italic
- ✅ **Alt+S** - Strikethrough
- ✅ **Ctrl+Shift+]** - Increase heading level
- ✅ **Ctrl+Shift+[** - Decrease heading level
- ✅ **Alt+C** - Check/uncheck task list
- ✅ **Ctrl+Shift+V** - Toggle preview
- ✅ **Ctrl+K V** - Open preview to side

#### **6. Enhanced Editing**
- ✅ Auto-continuation of lists
- ✅ Smart indentation
- ✅ Heading anchors with IDs
- ✅ Copy buttons on code blocks

---

### **🔗 Markdown Link Updater Features**

Based on [VS Code's automatic link updating](https://code.visualstudio.com/docs/languages/markdown#_automatic-link-updates-on-file-move-or-rename):

#### **1. Automatic Link Updates**
- ✅ Detect file moves and renames
- ✅ Update all references automatically
- ✅ Batch update across multiple files
- ✅ Configurable update behavior (always/prompt/never)

#### **2. Link Types Supported**
- ✅ Internal links: `[text](./path/to/file.md)`
- ✅ External links: `[text](http://example.com)`
- ✅ Fragment links: `[text](./file.md#heading)`
- ✅ Image links: `![alt](./path/to/image.png)`
- ✅ Reference links: `[text][ref]` and `[ref]: url`
- ✅ Autolinks: `<http://example.com>`

#### **3. Link Validation**
- ✅ Check for broken links
- ✅ Validate internal file references
- ✅ Report missing files
- ✅ Highlight broken links in preview

#### **4. Smart Path Resolution**
- ✅ Relative path calculation
- ✅ Directory structure awareness
- ✅ Cross-platform path handling
- ✅ Preserve link formatting

#### **5. Configuration Options**
```json
{
  "markdown.updateLinksOnFileMove.enabled": true,
  "markdown.updateLinksOnFileMove.prompt": true,
  "markdown.updateLinksOnFileMove.include": ["**/*.md"],
  "markdown.updateLinksOnFileMove.exclude": ["**/node_modules/**"]
}
```

---

## 🎨 **UI Components**

### **Sidebar Navigation**
- ✅ Collapsible sections with icons
- ✅ Active page highlighting
- ✅ Auto-expand for current section
- ✅ Search functionality
- ✅ JSON-driven configuration

### **Table of Contents**
- ✅ Auto-generated from headings
- ✅ Sticky positioning
- ✅ Active heading tracking
- ✅ Smooth scroll to sections

### **Markdown Preview**
- ✅ Docusaurus-style design
- ✅ Dark mode support
- ✅ Responsive layout
- ✅ Mobile-friendly

### **Code Blocks**
- ✅ Syntax highlighting
- ✅ Copy button
- ✅ Line numbers
- ✅ Language labels

---

## 📊 **Architecture**

### **Components**
```
src/components/
├── sidebar.rs              # Sidebar navigation
├── markdown_renderer.rs    # Markdown to HTML conversion
├── link_updater.rs         # Automatic link updating
└── mod.rs                  # Component exports
```

### **Key Technologies**
- **Dioxus** - Rust UI framework
- **pulldown-cmark** - Markdown parser (CommonMark + GFM)
- **regex** - Link pattern matching
- **pathdiff** - Relative path calculation
- **syntect** - Syntax highlighting

---

## 🚀 **Usage Examples**

### **Basic Markdown Rendering**
```rust
use ctas_dioxus_docs::components::MarkdownRenderer;

rsx! {
    MarkdownRenderer {
        content: "# Hello World\n\nThis is **bold** text."
    }
}
```

### **Live Editor with Preview**
```rust
use ctas_dioxus_docs::components::MarkdownEditor;

rsx! {
    MarkdownEditor {
        initial_content: "# Start editing..."
    }
}
```

### **Auto Link Updating**
```rust
use ctas_dioxus_docs::components::LinkUpdater;

let mut updater = LinkUpdater::new();
updater.register_move(
    PathBuf::from("docs/old.md"),
    PathBuf::from("docs/new.md")
);

let updated_content = updater.update_links_in_file(
    Path::new("docs/index.md"),
    content
);
```

### **Link Validation**
```rust
use ctas_dioxus_docs::components::LinkValidator;

let validator = LinkValidator::new(PathBuf::from("./docs"));
let results = validator.validate_links(content, current_file);

for result in results {
    match result.status {
        LinkStatus::Broken => println!("Broken link: {}", result.link),
        LinkStatus::Valid => println!("Valid link: {}", result.link),
        _ => {}
    }
}
```

---

## 📝 **Configuration**

### **Sidebar Configuration** (`docs/sidebar.json`)
```json
{
  "documentation": [
    {
      "title": "Getting Started",
      "icon": "🚀",
      "items": [
        {
          "title": "Quick Start",
          "path": "/docs/quickstart"
        }
      ]
    }
  ]
}
```

### **Link Update Configuration**
```rust
LinkUpdateConfig {
    enabled: true,
    prompt: true,
    include_patterns: vec!["**/*.md"],
    exclude_patterns: vec!["**/node_modules/**"],
}
```

---

## 🎯 **Comparison with VS Code**

| Feature | VS Code | CTAS Dioxus Docs |
|---------|---------|------------------|
| Markdown Preview | ✅ | ✅ |
| Side-by-side View | ✅ | ✅ |
| Auto TOC | ✅ (extension) | ✅ |
| Link Updating | ✅ | ✅ |
| Link Validation | ✅ | ✅ |
| Math Rendering | ✅ | ✅ |
| Task Lists | ✅ | ✅ |
| Tables | ✅ | ✅ |
| Syntax Highlighting | ✅ | ✅ |
| Dark Mode | ✅ | ✅ |
| **Web-based** | ❌ | ✅ |
| **Pure Rust** | ❌ | ✅ |

---

## 🔧 **Development**

### **Run Development Server**
```bash
dx serve
```

### **Build for Production**
```bash
dx build --release
```

### **Run Tests**
```bash
cargo test
```

---

## 📚 **References**

- [Markdown All in One Extension](https://markdown-all-in-one.github.io/docs/guide/)
- [VS Code Markdown Documentation](https://code.visualstudio.com/docs/languages/markdown)
- [CommonMark Specification](https://commonmark.org/)
- [GitHub Flavored Markdown](https://github.github.com/gfm/)
- [Dioxus Documentation](https://dioxuslabs.com/)

---

## ✅ **Status**

- **Version:** 0.1.0
- **Status:** 🚧 Feature Complete, Testing Phase
- **Last Updated:** 2025-11-09

---

**🎉 All Markdown All in One + Link Updater features implemented in pure Rust!**

