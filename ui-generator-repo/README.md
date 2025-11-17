# UI Generator on Comment

Automatically generate shadcn/ui components from GitHub comments using the CTAS-7 shadcn specification.

## How it works

1. Comment on any issue or PR with `@generate-ui`
2. Mention component type (e.g. "AgentCard" or "Dashboard")
3. GitHub Actions automatically generates the component
4. Bot replies with confirmation

## Example Usage

```
@generate-ui
Can we create an AgentCard component for the dashboard?
```

This will generate:
- `generated/components/AgentCard.tsx`
- Based on the CTAS-7 shadcn specification patterns
- Automatic reply with confirmation

## Repository Structure

```
ui-generator-repo/
├── .github/workflows/
│   └── generate-ui-on-comment.yml  # Main workflow
├── generated/
│   └── components/                 # Generated components
├── specs/
│   └── shadcn-spec.md             # Reference specification
└── package.json                   # Dependencies
```

## Incremental Development

This starts simple and can be extended with:
- More sophisticated comment parsing
- Template selection based on component type
- Integration with Synaptix9 workflow system
- Deployment to staging environments