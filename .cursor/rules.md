# CTAS-7 Agent Studio - Cursor AI Rules
## Fortune 10 Development Standards

### Project Context
This is the CTAS-7 (Cognitive Tactics Analysis System) Agent Studio, a military-grade cognitive computing platform with:
- Multi-agent orchestration (Claude, GPT-4, Gemini, Grok)
- Neural Mux intelligent routing
- Smart Crate orchestration
- DOD-compliant EA artifact generation
- Intelligent transpiler (React Native → iOS)

### Code Generation Standards

#### Commit Messages (Conventional Commits)
```
feat(component): add new feature
fix(service): resolve bug in neural mux routing
docs(readme): update installation instructions
refactor(adapter): improve figma integration performance
test(gateway): add integration tests for agents
chore(deps): update dependencies
perf(transpiler): optimize iOS code generation
ci(github): configure automated deployment
```

**Format**: `<type>(<scope>): <subject>`
- **Types**: feat, fix, docs, style, refactor, test, chore, perf, ci, revert
- **Scope**: component name, service, module
- **Subject**: imperative, lowercase, no period

#### Branch Naming
```
feature/COG-123-add-bolt-integration
bugfix/COG-124-fix-neural-mux-timeout
hotfix/COG-125-security-patch
release/v7.1.0
```

**Format**: `<type>/<linear-issue>-<description>`

#### Pull Request Template
```markdown
## Description
Brief description of changes

## Linear Issue
Closes COG-XXX

## Type of Change
- [ ] New feature
- [ ] Bug fix
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No new warnings
- [ ] Tests added/updated
```

### Coding Standards

#### Rust
- Use `anyhow::Result` for error handling
- Add comprehensive documentation comments
- Include unit tests
- Follow Rust API guidelines
- Use `#[derive(Debug, Clone, Serialize, Deserialize)]` for data structures

#### TypeScript
- Use strict mode
- Prefer `interface` over `type` for objects
- Use `async/await` over promises
- Document public APIs with JSDoc
- Use proper error handling with try/catch

#### Architecture Patterns
- Adapter pattern for external integrations
- Repository pattern for data access
- Service layer for business logic
- Event-driven communication via Forge
- Direct peer-to-peer service calls (no gateway bottlenecks)

### File Organization
```
ctas7-command-center/
├── agent-studio/           # Main studio
│   ├── gateway/           # Agent gateway (port 15181)
│   ├── forge-integrations/ # Direct Forge connections
│   ├── ai-code-gen-routes/ # Cursor, Bolt.new, v0.dev
│   ├── document-stratification/ # Doc classification
│   ├── bolt-diy/          # Self-hosted code gen
│   └── config/            # Environment config
```

### Integration Points
- **Linear API**: Project management, issue tracking
- **GitHub**: Version control, PRs, actions
- **Figma API**: Design system, EA diagrams
- **Canva API**: Business presentations
- **Google Workspace**: Docs, Sheets, Slides
- **Vercel**: Frontend deployment
- **bolt.new**: AI code generation
- **v0.dev**: UI component generation

### Security
- Never commit API keys (use `.env`)
- Always validate external input
- Use authentication for all endpoints
- Follow least privilege principle
- Implement rate limiting

### Performance
- Cache frequently accessed data
- Use connection pooling
- Implement circuit breakers for external services
- Profile before optimizing
- Use async/await for I/O operations

### Testing
- Write tests for all public APIs
- Use integration tests for critical paths
- Mock external services in tests
- Aim for 80%+ code coverage
- Run tests before committing

### Documentation
- Update README when adding features
- Document all public APIs
- Include code examples
- Keep architecture diagrams current
- Maintain CHANGELOG

### Linear Integration
- Create issue for every feature/bug
- Update issue status as work progresses
- Link commits to Linear issues
- Use Linear API for automation
- Track time and estimates

### Deployment
- Use Docker for containerization
- Follow 12-factor app principles
- Implement health checks
- Use rolling deployments
- Monitor all services

### AI Code Generation Preferences
1. **v0.dev** - React + Tailwind UI components
2. **Bolt.new** - Full-stack web apps with preview
3. **Cursor AI** - Context-aware code edits
4. **bolt.diy** - Self-hosted fallback

### Document Types (Never Mix)
1. **Technical Documentation** → Docusaurus
2. **BNE Artifacts** → Markdown
3. **White Papers** → Google Docs → Word
4. **EA Documents** → Figma → PowerPoint
5. **Research Papers** → LaTeX → PDF

### Prompt Engineering
When generating code:
- Specify framework and version
- Include design system requirements
- Provide context files
- Request tests and documentation
- Follow CTAS-7 patterns

