# Workflow Configuration

## Development Methodology
- **TDD Strictness**: Essential (Unit tests for core logic, Component tests for UI)
- **Git Strategy**: Atomic commits per task completion
- **Documentation**: Synchronize `product.md` and `tech-stack.md` after each phase

## Commit Conventions
- `feat:` for new implementations
- `fix:` for bug fixes
- `refactor:` for code improvements
- `test:` for adding/updating tests
- `chore:` for housekeeping (upgrading deps, updating plans)

## Quality Gates
- All tests must pass before phase completion.
- Accessibility audit for new UI components.
- Dark theme compliance for all frontend changes.
