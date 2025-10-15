<!--
==============================================================================
SYNC IMPACT REPORT - Constitution Update
==============================================================================
Version Change: N/A (initial version) → 1.0.0

Rationale: MINOR version (1.0.0) - Initial constitution establishment with
foundational principles for Nuxt 4 application development.

Modified Principles: N/A (new constitution)

Added Sections:
- Core Principles (5 principles focused on Nuxt best practices)
- Code Quality Standards
- Development Workflow
- Governance

Templates Requiring Updates:
✅ plan-template.md - Constitution Check section already references constitution file
✅ spec-template.md - No constitution-specific references; compatible as-is
✅ tasks-template.md - Already organized for modular development; compatible

Follow-up TODOs: None

Generated: 2025-10-15
==============================================================================
-->

# ScanningGUI Constitution

## Core Principles

### I. Component Modularity

Components MUST be self-contained, single-responsibility units. Each Vue component should:
- Have a clear, singular purpose
- Minimize dependencies on other components
- Use composables for shared logic
- Be independently testable
- Follow Nuxt's auto-import conventions

**Rationale**: Modular components enable parallel development, easier testing, and better
maintainability. Nuxt's architecture is designed around this principle with its auto-import
system and composables pattern.

### II. File-Based Conventions

The project MUST leverage Nuxt's file-based routing and auto-import system. Developers must:
- Place pages in `pages/` directory for automatic routing
- Place components in `components/` directory for auto-import
- Place composables in `composables/` directory for auto-import
- Place utilities in `utils/` directory for auto-import
- Use `layouts/` for shared page layouts
- Use `middleware/` for route middleware

**Rationale**: Nuxt 4's convention-over-configuration approach reduces boilerplate and
ensures consistency. Fighting these conventions creates maintenance burden.

### III. TypeScript-First Development

All code MUST be written in TypeScript with strict type safety:
- No `any` types without explicit justification documented in code comments
- Define interfaces for all data structures
- Use Nuxt's generated type definitions (`.nuxt/tsconfig.*.json`)
- Leverage Vue 3's `<script setup lang="ts">` syntax
- Type all function parameters and return values

**Rationale**: TypeScript catches errors at compile-time, improves IDE support, enables
confident refactoring, and serves as living documentation. Nuxt 4 has first-class
TypeScript support built-in.

### IV. Composable-First Logic

Shared logic MUST be extracted into composables following Vue 3 Composition API patterns:
- State management via composables (avoid Vuex/Pinia unless justified)
- API calls wrapped in composables with proper error handling
- Reusable UI logic as composables
- Follow `use*` naming convention (e.g., `useAuth`, `useFetch`)
- Keep composables focused and single-purpose

**Rationale**: Composables are Vue 3's recommended pattern for code reuse. They provide
better TypeScript support, easier testing, and clearer dependency tracking than mixins
or plugins.

### V. Testing & Validation

Code changes MUST include appropriate test coverage:
- Unit tests for composables and utility functions
- Component tests for complex components
- E2E tests for critical user flows
- Type checking must pass (`nuxt typecheck` if implemented)
- Tests must pass before merging

**Rationale**: Testing ensures reliability, enables confident refactoring, and documents
expected behavior. The modular architecture makes unit testing straightforward.

## Code Quality Standards

### Clean Code Practices

- Keep functions small and focused (ideally < 50 lines)
- Use descriptive names for variables, functions, and components
- Avoid deep nesting (max 3 levels)
- Extract complex logic into named functions or composables
- Remove unused imports and commented-out code before committing

### Vue 3 & Nuxt Best Practices

- Use `<script setup>` syntax for all components
- Prefer `ref()` and `reactive()` over Options API
- Use `defineProps()` and `defineEmits()` with TypeScript interfaces
- Follow Vue 3 reactivity rules (avoid destructuring reactive objects)
- Use Nuxt's built-in composables (`useFetch`, `useAsyncData`, etc.) over manual fetching
- Leverage `app.vue` as the single root component

### Performance Considerations

- Use `lazy` imports for heavy components (`<LazyComponentName />`)
- Implement proper loading and error states
- Avoid unnecessary reactivity (use `computed` vs `ref` appropriately)
- Monitor bundle size and use code splitting when appropriate

## Development Workflow

### Feature Development

1. Plan features using `.specify/` templates and workflows
2. Create feature branches following naming convention
3. Implement following the principles above
4. Write/update tests
5. Run type checking and linting
6. Submit for code review

### Code Review Requirements

All pull requests must:
- Pass all tests and type checking
- Follow the principles defined in this constitution
- Include appropriate test coverage
- Have clear commit messages
- Be reviewed by at least one other developer

### Complexity Justification

When violating principles (e.g., using `any` type, adding external state management):
- Document the justification in code comments
- Note in PR description
- Consider if simpler alternatives were properly evaluated
- Update constitution if pattern becomes standard

## Governance

This constitution supersedes all other development practices and serves as the
authoritative guide for ScanningGUI development.

### Amendment Process

Constitution amendments require:
1. Proposal with clear rationale
2. Team discussion and approval
3. Version increment following semantic versioning
4. Update to dependent templates in `.specify/templates/`
5. Communication to all developers

### Compliance

- All code reviews MUST verify compliance with this constitution
- Violations must be justified and documented
- PRs that violate principles without justification should be rejected
- Use `CLAUDE.md` for AI assistant development guidance

### Versioning

Constitution uses semantic versioning:
- **MAJOR**: Backward-incompatible changes to core principles
- **MINOR**: New principles or sections added
- **PATCH**: Clarifications, wording improvements, non-semantic changes

**Version**: 1.0.0 | **Ratified**: 2025-10-15 | **Last Amended**: 2025-10-15
