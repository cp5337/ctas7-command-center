# Questions for Claude Crate Analysis Agent

## Context
We're building the **CTAS-7 Intranet** - a Dioxus-based (Rust) multi-purpose platform that serves as:
- 🏢 **Internal Intranet** - Dev Center, Ops System, Tools
- 🎯 **Client Demo Platform** - Show off capabilities (e.g., Laser Light Communications)
- 📚 **Documentation Hub** - Smart crate registry, API docs, self-documenting infrastructure
- 🔧 **Operational Tools** - Live system control, Neural Mux console
- 👥 **Onboarding Portal** - New devs and clients

**Key Constraint**: We have a **universal mobile framework** (Synaptix Journeyman Mobile) built on React that we want to adapt/integrate with this Dioxus platform.

---

## PART 1: Smart Crate Discovery & Metadata

### Q1.1: Where are all the smart crates located?
- Specific directories to scan?
- Example paths?
- Are they all in `/Users/cp5337/Developer/ctas-7-shipyard-staging/`?
- Any in `/Users/cp5337/Developer/ctas7-command-center/`?

### Q1.2: What does a `smart-crate.toml` file look like?
- Can you provide 2-3 real examples from the codebase?
- What fields are present?
- Is there a standard schema?
- Example from `ctas7-gis-cesium-1/smart-crate.toml`?

### Q1.3: What are "QA blockchain numbers"?
- Cryptographic hashes?
- Where are they stored?
- How do we verify them?
- Example format?
- Related to the "retrofit timestamp"?

### Q1.4: What does "retrofit timestamp" mean?
- When a crate was converted to a smart crate?
- Format? (ISO 8601?)
- Where is it stored in `smart-crate.toml`?
- Example: `retrofit_timestamp = "2024-10-13T00:00:00Z"`?

### Q1.5: Trivariate Hash System
- Where is the Rust implementation? (`ctas7-foundation-core/src/trivariate_hash.rs`?)
- What are the three components? (SCH, CUID, UUID?)
- How do we generate these for display in the intranet?
- Can you show an example hash?

---

## PART 2: Port Assignments & CTAS7 Infrastructure

### Q2.1: How are CTAS7 official ports assigned?
- Is there a central registry file?
- Are they in each crate's `smart-crate.toml`?
- What's the port range structure?
- Example from GIS: 18400 (API), 18401 (WebSocket)?

### Q2.2: What port ranges exist?
- We know: 18400-18499 for GIS
- What other ranges?
- Neural Mux ports?
- Ops Center ports?
- Any documentation on this?

### Q2.3: Sister ports calculation?
- Formula: primary + 32768 = sister?
- Are there exceptions?
- Custom mirror ports?
- Example: 18400 + 32768 = 51168?

### Q2.4: Neural Mux Integration
- What ports does Neural Mux use?
- How do we query it for system topology?
- API endpoints available?
- WebSocket for real-time updates?

---

## PART 3: Markdown Documentation & Content

### Q3.1: Where is the Markdown content located?
- Specific directories?
- Naming conventions?
- Example paths?
- Is it organized by topic/crate/feature?

### Q3.2: What percentage of docs are in Markdown?
- You mentioned 90% - where's the other 10%?
- Other formats we need to support? (RST, AsciiDoc, HTML?)
- Any auto-generated docs?

### Q3.3: Markdown structure?
- Do docs follow a template?
- Frontmatter metadata? (YAML, TOML?)
- Example of a typical doc file?
- How do we extract metadata for the intranet?

### Q3.4: Documentation Categories
- How should docs be organized?
- Architecture guides?
- API references?
- Smart crate specs?
- Integration guides?

---

## PART 4: Mobile Framework Integration

### Q4.1: Synaptix Journeyman Mobile Framework
- Location: `/Users/cp5337/Developer/synaptix-journeyman-mobile`
- It's React-based - how do we integrate with Dioxus?
- Can we embed React components in Dioxus?
- Or do we need to port components to Dioxus?

### Q4.2: VSC-SOP Mobile Patterns
- These are proven patterns from WTC security operations
- How do we adapt them for the intranet?
- User Profiles → Operator Profiles?
- Daily Check-In → Shift Handoff?
- Task Manager → Command Queue?

### Q4.3: Neural Mux iOS Product Scaffold
- Location: `/Users/cp5337/Developer/ctas7-command-center/neural-mux-scaffold`
- This generates iOS apps from YAML specs
- Can we use this to generate mobile views for the intranet?
- Or is it separate from the Dioxus intranet?

### Q4.4: iOS Adaptive Design System
- The mobile framework has an iOS-native design system
- Can we use these design principles in Dioxus?
- SF Pro font stack?
- Adaptive layouts (iPhone vs iPad)?
- Touch-friendly controls (44px minimum)?

---

## PART 5: Product/Solution Examples

### Q5.1: Laser Light Communications
- Is this a real customer/partner?
- What CTAS-7 products would they use?
- What's the use case? (Satellite network, ground stations, HFT?)
- Do we have a case study or demo to showcase?

### Q5.2: What other customer examples exist?
- Any other reference customers?
- Use cases to highlight?
- Industries served? (Defense, Finance, Telecom, Maritime?)

### Q5.3: Product categories?
- What are the main CTAS-7 products/solutions?
- How should they be organized?
- Examples:
  - Satellite Network Platform?
  - HFT Routing System?
  - Smart Crate Infrastructure?
  - GIS/Visualization Tools?
  - PLC Control Systems (Cognetix)?

---

## PART 6: Content Organization & Navigation

### Q6.1: How should products be categorized?
- By industry? (Defense, Finance, Telecom)
- By capability? (Networking, Visualization, Analytics)
- By component? (Backend, Frontend, Infrastructure)
- By domain? (Space, Network, Ground, Cyber)?

### Q6.2: What metadata do we need for each product page?
- Title, description, features?
- Pricing info?
- Technical specs?
- Screenshots/demos?
- Related smart crates?

### Q6.3: Navigation structure?
- How deep should the hierarchy go?
- Breadcrumbs needed?
- Search functionality?
- Tagging system?

---

## PART 7: Dev Center Content

### Q7.1: What should the Dev Center contain?
- API documentation?
- Code examples?
- Tutorials?
- Integration guides?
- Smart Crate Registry browser?

### Q7.2: Are there existing API docs?
- OpenAPI/Swagger specs?
- Markdown files?
- Code comments to extract?
- Auto-generated from Rust docs?

### Q7.3: Code examples location?
- Where are example projects?
- Languages to support? (Rust, TypeScript, Python?)
- Are they in separate repos or embedded in docs?

### Q7.4: Smart Crate Registry Features
- Browse all crates?
- Search/filter by name, category, port?
- View dependencies?
- Deploy/manage crates?
- View QA scores and retrofit status?

---

## PART 8: Ops Center Requirements

### Q8.1: What operational data should we display?
- Service health?
- Deployment status?
- Performance metrics?
- Log aggregation?
- Port assignments?

### Q8.2: Neural Mux integration?
- What endpoints are available?
- Authentication required?
- Real-time updates via WebSocket?
- Example API responses?
- System topology visualization?

### Q8.3: What controls do ops need?
- Deploy/rollback?
- Start/stop services?
- Configuration updates?
- Emergency procedures?
- Port management?

### Q8.4: Live System Topology
- How do we get the current system state?
- Which services are running?
- Which ports are in use?
- Health checks?
- Dependency graph?

---

## PART 9: Client Demo Requirements

### Q9.1: What should clients see?
- Live system demos?
- Pre-recorded showcases?
- Interactive exploration?
- Performance benchmarks?
- Case studies?

### Q9.2: What capabilities to highlight?
- Satellite network (12 sats, 259 ground stations)?
- HFT routing?
- QKD encryption?
- Real-time visualization?
- Smart crate infrastructure?

### Q9.3: Demo data?
- Use real data or sanitized/mock data?
- What's safe to show externally?
- Any NDAs or restrictions?
- Can we show Laser Light Communications as a case study?

### Q9.4: Demo Mode Features
- Auto-play demo mode?
- Screenshot mode for presentations?
- Screen recording capability?
- Curated data sets?
- Hide dev tools/errors?

---

## PART 10: Mobile/iOS Deployment

### Q10.1: iOS app requirements?
- App Store or internal distribution?
- Authentication needed?
- Offline mode?
- Push notifications?
- Native features (camera, GPS, etc.)?

### Q10.2: Dioxus Mobile Support
- Can Dioxus compile to iOS?
- Performance compared to native Swift?
- Access to native APIs?
- Integration with existing Swift code?

### Q10.3: Mobile-specific features?
- Touch gestures?
- Haptic feedback?
- Camera integration?
- Native controls?
- Adaptive layouts (iPhone vs iPad)?

### Q10.4: Synaptix Journeyman Integration
- Can we embed the React mobile framework in Dioxus?
- Or do we need to port it to Dioxus?
- Which approach is better?
- Can we share components between web and mobile?

---

## PART 11: Data Sources & Integration

### Q11.1: What databases/services exist?
- Supabase (what tables?)
- SurrealDB (what's in the graph?)
- Sled (what's cached?)
- Others?

### Q11.2: How to query smart crate data?
- Filesystem scan?
- Database query?
- API call?
- Combination?

### Q11.3: Real-time updates?
- WebSocket connections?
- Polling intervals?
- Event-driven updates?
- Server-Sent Events (SSE)?

### Q11.4: HFT Slot Graph
- What is the Legion Slot Graph?
- How does it relate to the intranet?
- SurrealDB for graph queries?
- Sled for fast KV lookups?

---

## PART 12: Dioxus-Specific Questions

### Q12.1: Dioxus Capabilities
- What can Dioxus do that React can't?
- Performance benefits?
- Compile targets (web, desktop, mobile)?
- Integration with Rust backend?

### Q12.2: Dioxus UI Components
- Are there pre-built component libraries?
- Do we need to build everything from scratch?
- Can we use Tailwind CSS with Dioxus?
- Styling approach?

### Q12.3: Dioxus Routing
- How does routing work in Dioxus?
- Client-side or server-side?
- Deep linking support?
- Navigation guards?

### Q12.4: Dioxus State Management
- How do we manage global state?
- Context API equivalent?
- Redux-like patterns?
- Integration with Rust backend state?

---

## PART 13: Apple-Style Product Pages

### Q13.1: Design System
- We want Apple-style minimalism
- No emoji icons, clean typography
- Black, white, grays, minimal blue
- How do we implement this in Dioxus?

### Q13.2: Markdown → Product Page Pipeline
- How do we parse Markdown frontmatter?
- Auto-generate sections (hero, features, stats, specs)?
- Template system?
- Example pipeline?

### Q13.3: Laser Light Communications Page
- Can you provide a complete example?
- Frontmatter metadata?
- Content structure?
- Visual design?

---

## PART 14: Specific File/Path Questions

### Q14: Please provide examples of:

1. **A complete `smart-crate.toml` file** (anonymized if needed)
2. **A typical Markdown documentation file** (with frontmatter if used)
3. **Directory structure** of where docs/crates are located
4. **Example API response** from Neural Mux
5. **Port registry file** (if it exists)
6. **Trivariate hash example** (48-byte SCH+CUID+UUID)
7. **QA blockchain entry** (format and location)

### Q15: Please confirm locations:

- Smart crates directory: `/Users/cp5337/Developer/ctas-7-shipyard-staging/` ?
- Markdown docs directory: ?
- Configuration files: ?
- Asset files (images, videos): ?
- Mobile framework: `/Users/cp5337/Developer/synaptix-journeyman-mobile` ?
- Neural Mux scaffold: `/Users/cp5337/Developer/ctas7-command-center/neural-mux-scaffold` ?

---

## Priority Order

**Phase 1 (Immediate)**:
1. Smart crate discovery and parsing
2. Markdown rendering pipeline
3. Product page template (Apple-style)
4. Navigation structure
5. Mobile framework integration strategy

**Phase 2 (Next)**:
6. Dev Center with API docs
7. Ops Center with live data
8. Client demo mode
9. Search functionality
10. Smart Crate Registry browser

**Phase 3 (Future)**:
11. Mobile optimization (iOS/Android)
12. Real-time updates (WebSocket)
13. Advanced analytics
14. Multi-tenant support

---

## Expected Deliverables

Based on your answers, we'll build:

1. ✅ **Apple-style product pages** - Clean, beautiful, no funky colors/emojis
2. ✅ **Markdown → Product Page pipeline** - Auto-generate from .md files
3. ✅ **Smart Crate Registry** - Browse, search, manage crates
4. ✅ **Dev Center** - API docs, examples, guides
5. ✅ **Ops Center** - Live monitoring, deployment control
6. ✅ **Client Demo** - Laser Light Communications use case
7. ✅ **Mobile Integration** - Synaptix Journeyman framework
8. ✅ **Self-Documenting Infrastructure** - Auto-extract metadata

---

## Notes

- **Design**: Apple-style minimalism, no emoji icons, clean typography
- **Content**: 90% Markdown, need to support other 10%
- **Customers**: Laser Light Communications as reference example
- **Platform**: Dioxus (Rust), mobile-first, cross-platform
- **Mobile Framework**: Synaptix Journeyman (React) needs integration strategy
- **Smart Crates**: Auto-discover, display metadata, QA scores, ports
- **Neural Mux**: Integration for system topology and routing

Please answer as many questions as possible. Even partial answers help! 🎯
