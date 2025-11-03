# CTAS React-Native Web Framework

**Canonical + Hybrid Synchronization Pipeline**

A dual-stack front-end framework that maintains a canonical React Native codebase while providing a web-compatible hybrid version via React Native Web + Next.js 14+.

## Architecture Overview

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│  Canonical React Native Repo (Immutable Source of Truth)   │
│  github.com/cp5337/react-native-canonical-template         │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   │ Sync via GitHub Actions
                   ▼
┌─────────────────────────────────────────────────────────────┐
│  CTAS Hybrid Web Framework (This Repo)                     │
│  • React Native Web                                         │
│  • Next.js 14+ App Router                                   │
│  • Tailwind CSS v4                                          │
│  • TypeScript                                               │
│  • shadcn/ui components                                     │
│  • Dark mode only                                           │
└─────────────────────────────────────────────────────────────┘
\`\`\`

## Key Features

- **Dual-Stack Architecture**: Canonical native + web hybrid
- **Agent Orchestration**: Meta-agent + 5 sub-agents for automated sync
- **Design Token System**: Single JSON source for all platforms
- **Dark Mode Only**: WCAG 2.1 AA compliant, iOS-optimized
- **Touch-Optimized**: 44px minimum touch targets
- **CI/CD Pipeline**: Automated sync, build, test, deploy
- **Cross-Platform**: Web, iOS, Android from one codebase

## Agent System

The framework includes a sophisticated agent orchestration system defined in `agents/pipeline.json`:

### Meta-Agent: Pipeline Supervisor
Oversees React Native ↔ Web synchronization and ensures component parity.

### Sub-Agents

1. **BuildSync** - Mirrors code changes between canonical and web repos
2. **DesignAudit** - Validates design-tokens.json parity across platforms
3. **iOSValidator** - Checks Apple HIG and WebKit compliance
4. **LLMTrainer** - Feeds hybrid examples to CTAS Forge
5. **BoltRegistrar** - Syncs operational metadata to Bolt DB

## Design Tokens

All design decisions are stored in `design-tokens.json`:

\`\`\`json
{
  "color": {
    "primary": { "value": "#38bdf8" },
    "background": {
      "primary": { "value": "#0f172a" }
    }
  },
  "spacing": { "md": { "value": 16 } },
  "typography": { "fontSize": { "base": { "value": 16 } } }
}
\`\`\`

Tokens automatically export to:
- CSS Variables (web)
- Swift Extensions (iOS)
- Kotlin Objects (Android)

## Project Structure

\`\`\`
ctas-react-native-web-framework/
├── app/
│   └── page.tsx                      # Placeholder instructional text
├── src/
│   ├── components/                   # RN-Web compatible components
│   ├── hooks/                        # useResponsive, etc.
│   ├── screens/                      # Sample screens
│   └── tokens/                       # TypeScript token exports
├── agents/
│   └── pipeline.json                 # Agent orchestration config
├── .github/workflows/
│   └── deploy.yml                    # CI/CD automation
├── design-tokens.json                # Single source of truth
├── next.config.mjs                   # React Native Web config
├── vercel.json                       # Vercel deployment config
└── README.md
\`\`\`

## Installation & Setup

\`\`\`bash
# Clone the repository
git clone https://github.com/cp5337/ctas-react-native-web-framework
cd ctas-react-native-web-framework

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Deploy to Vercel
npx vercel --prod
\`\`\`

## CI/CD Pipeline

Every commit to `main` triggers:

1. **Sync** - Pull latest from canonical React Native repo
2. **Validate** - Check agent pipeline configuration
3. **Build** - TypeScript compilation and Next.js build
4. **Test** - Run linting and tests
5. **Export** - Generate Swift/CSS token files
6. **Deploy** - Push to Vercel production
7. **Report** - Send metrics to Bolt DB

## Design System Rules

### Colors
- Dark mode only (no toggle)
- Palette: `#0f172a`, `#1e293b`, `#38bdf8`
- WCAG 2.1 AA compliant contrast ratios

### Typography
- Base: 16px, responsive scale 1.125
- Weights: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)
- Line heights: 1.25 (tight), 1.5 (normal), 1.75 (relaxed)

### Spacing
- Scale: 4px, 8px, 16px, 24px, 32px, 48px, 64px
- Touch targets: Minimum 44x44px

### Layout
- Mobile-first responsive design
- Breakpoints: 320px, 768px, 1024px, 1440px
- Flexbox for most layouts (VStack/HStack thinking)

## Integration Endpoints

The framework integrates with:

- **Bolt DB**: `https://bolt.ctas.dev/ops/ingest`
- **MCP**: Model Context Protocol endpoints
- **ABE**: Agent-Based Execution system
- **OPS**: Operations monitoring
- **DEV**: Development sync tools

Configure via environment variables in `vercel.json`.

## Transpiling to Native

### Generate Swift Tokens

\`\`\`bash
# Automatic generation in CI/CD
npm run generate:tokens

# Manual generation
node -e "
  const tokens = require('./design-tokens.json');
  // Swift code generation logic
"
\`\`\`

### Component Mapping

| React Native Web | SwiftUI | Purpose |
|------------------|---------|---------|
| `<View>` | `VStack/HStack` | Layout containers |
| `<Text>` | `Text` | Typography |
| `<Pressable>` | `Button` | Interactive elements |
| `<TextInput>` | `TextField` | Form inputs |

## Usage Examples

### Responsive Component

\`\`\`tsx
import { useResponsive } from './src/hooks/useResponsive';

export default function MyComponent() {
  const { isMobile, isTablet, isDesktop } = useResponsive();
  
  return (
    <div className={`
      p-4 
      ${isMobile ? 'flex-col' : 'flex-row'}
      ${isDesktop ? 'max-w-7xl' : 'max-w-full'}
    `}>
      <h1 className="text-2xl font-bold text-gray-100">
        Responsive Content
      </h1>
    </div>
  );
}
\`\`\`

### Using Design Tokens

\`\`\`tsx
import { colors, spacing, typography } from './src/tokens';

const styles = {
  container: {
    backgroundColor: colors.background.primary,
    padding: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
};
\`\`\`

## Agent Workflow

\`\`\`mermaid
graph TD
    A[Git Push to main] --> B[BuildSync Agent]
    B --> C[DesignAudit Agent]
    C --> D[Build & Test]
    D --> E[iOSValidator Agent]
    E --> F[Deploy to Vercel]
    F --> G[BoltRegistrar Agent]
    G --> H[LLMTrainer Agent]
    H --> I[Pipeline Supervisor]
\`\`\`

## Best Practices

1. **Never modify canonical repo** - It's the immutable source of truth
2. **Always use design tokens** - No hardcoded colors/spacing
3. **Mobile-first approach** - Design for 320px, enhance upward
4. **Touch-friendly** - 44px minimum for all interactive elements
5. **Semantic naming** - Use `primary`, `surface`, not `blue-500`
6. **Agent-aware** - Structure code for automated sync

## Contributing

1. Make changes in the canonical React Native repo
2. Push to `main` branch
3. CI/CD automatically syncs to web framework
4. Agents validate parity and compliance
5. Deploy to Vercel on success

## Documentation

- [Agent Pipeline Configuration](./agents/pipeline.json)
- [Design Token Specification](./design-tokens.json)
- [CI/CD Workflow](./.github/workflows/deploy.yml)
- [Vercel Deployment](./vercel.json)

## License

MIT

---

**CTAS Framework** - Canonical + Hybrid Synchronization for React Native ↔ Web
