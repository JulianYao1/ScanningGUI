# Implementation Plan: Picklist Scanner

**Branch**: `001-picklist-scanner` | **Date**: 2025-10-15 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-picklist-scanner/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build a warehouse picklist scanning application where workers select a box number and style, scan product barcodes using keyboard wedge scanners, and download CSV picklists. The system uses Nuxt 4 (Vue 3 + TypeScript) for the frontend, MySQL for product database access, and onscan.js library for handling barcode scanner input. Core workflow supports quantity increment on duplicate scans, multiple concurrent sessions, and session persistence.

## Technical Context

**Language/Version**: TypeScript with Nuxt 4.1.3, Vue 3.5.22, Node.js (LTS)
**Primary Dependencies**: Nuxt 4, Vue 3, onscan.js (barcode scanning), MySQL client library
**Storage**: MySQL database for products, browser localStorage/IndexedDB for session persistence
**Testing**: Vitest (Nuxt's recommended test framework), Vue Test Utils, Playwright for E2E
**Target Platform**: Modern web browsers (Chrome, Firefox, Edge, Safari)
**Project Type**: Single-page web application (Nuxt SPA mode)
**Performance Goals**: <2s product lookup (SC-002), <3min full workflow (SC-001), 60 FPS UI rendering
**Constraints**: Network-dependent MySQL queries, keyboard wedge scanner required, browser storage limits
**Scale/Scope**: 10 concurrent sessions (SC-004), warehouse worker interface (desktop/tablet)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle I: Component Modularity
✅ **PASS** - Design uses self-contained components:
- `BoxSetupForm` (box number/style input)
- `BarcodeScanner` (onscan.js integration)
- `ProductList` (scanned products display)
- `SessionManager` (multi-session UI)
- `PicklistDownload` (CSV generation)

Each component has single responsibility, minimal coupling.

### Principle II: File-Based Conventions
✅ **PASS** - Will use Nuxt structure:
- `pages/index.vue` - Main scanning interface
- `components/` - UI components (auto-imported)
- `composables/useScanning.ts` - Scanning session logic
- `composables/useProductLookup.ts` - MySQL queries
- `composables/usePicklistExport.ts` - CSV generation
- `utils/` - Helper functions (barcode validation, formatting)

### Principle III: TypeScript-First Development
✅ **PASS** - All code TypeScript with interfaces:
- `ScanningSession` interface
- `Product` interface
- `BoxStyle` enum
- Typed composables and components
- No `any` types (justified if needed)

### Principle IV: Composable-First Logic
✅ **PASS** - Logic extracted to composables:
- `useScanning()` - Session state management
- `useProductLookup()` - Database queries with error handling
- `useBarcodeScanner()` - onscan.js wrapper
- `useSessionPersistence()` - localStorage management
- `usePicklistExport()` - CSV generation logic

No Vuex/Pinia needed - composable state sufficient for this scope.

### Principle V: Testing & Validation
✅ **PASS** - Test coverage planned:
- Unit tests for composables (`useScanning`, `useProductLookup`, `usePicklistExport`)
- Component tests for `ProductList`, `BoxSetupForm`
- E2E tests for P1/P2 user stories (scanning workflow, download)
- Type checking via `nuxt typecheck`

**Gate Status**: ✅ ALL PRINCIPLES SATISFIED - Proceed to Phase 0

---

## Post-Design Constitution Re-Evaluation

*Re-checked after Phase 1 design completion*

### Principle I: Component Modularity ✅
**Status**: PASS - Design maintains modularity
- Components remain single-responsibility
- No new coupling introduced
- Clear interfaces between components via composables
- API endpoint properly separated from UI logic

### Principle II: File-Based Conventions ✅
**Status**: PASS - Follows Nuxt conventions
- Server API routes in `server/api/` directory
- Composables in `composables/` directory
- Types in `types/` directory
- No deviation from Nuxt patterns

### Principle III: TypeScript-First Development ✅
**Status**: PASS - Full TypeScript coverage
- All interfaces defined in data model
- Server API uses TypeScript
- No `any` types in design
- Type safety maintained throughout

### Principle IV: Composable-First Logic ✅
**Status**: PASS - Composables properly designed
- Five focused composables created
- No state management library needed
- Clean separation of concerns
- Testable pure functions

### Principle V: Testing & Validation ✅
**Status**: PASS - Comprehensive test strategy
- Unit tests for all composables planned
- Component tests for UI elements
- E2E tests for user stories P1/P2
- Test examples provided in quickstart

**Final Gate Status**: ✅ ALL PRINCIPLES SATISFIED - Ready for Implementation

## Project Structure

### Documentation (this feature)

```
specs/001-picklist-scanner/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── api-spec.md      # MySQL query patterns and CSV format
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```
# Nuxt 4 Web Application Structure
app/
├── app.vue                          # Root component
└── router.options.ts                # Router config (if needed)

pages/
└── index.vue                        # Main scanning interface page

components/
├── BoxSetupForm.vue                 # Box number/style input form
├── BarcodeScanner.vue               # Barcode scanner integration
├── ProductList.vue                  # Display scanned products
├── ProductListItem.vue              # Single product row with quantity
├── SessionManager.vue               # Switch between sessions (P3)
└── PicklistDownload.vue             # Download CSV button

composables/
├── useScanning.ts                   # Scanning session state management
├── useBarcodeScanner.ts             # onscan.js integration
├── useProductLookup.ts              # MySQL product queries
├── useSessionPersistence.ts         # localStorage/IndexedDB management
└── usePicklistExport.ts             # CSV generation logic

utils/
├── barcodeValidator.ts              # Barcode format validation
├── csvFormatter.ts                  # CSV file generation helpers
└── dateFormatter.ts                 # Timestamp formatting

types/
├── scanning.ts                      # ScanningSession, Product interfaces
└── boxStyles.ts                     # BoxStyle enum/types

server/
└── api/
    └── products/
        └── [barcode].get.ts         # Nitro API endpoint for MySQL queries

public/
└── favicon.ico                      # App icon

tests/
├── unit/
│   ├── composables/
│   │   ├── useScanning.test.ts
│   │   ├── useProductLookup.test.ts
│   │   └── usePicklistExport.test.ts
│   └── utils/
│       ├── barcodeValidator.test.ts
│       └── csvFormatter.test.ts
├── component/
│   ├── ProductList.test.ts
│   ├── BoxSetupForm.test.ts
│   └── BarcodeScanner.test.ts
└── e2e/
    ├── scanning-workflow.spec.ts    # P1 user story
    └── download-picklist.spec.ts    # P2 user story

nuxt.config.ts                       # Nuxt configuration
package.json                         # Dependencies (onscan.js, MySQL client)
tsconfig.json                        # TypeScript config (extends Nuxt)
```

**Structure Decision**: Selected Nuxt 4 web application structure with server API routes for MySQL access. Client-side handles UI and session management, server-side API endpoints query MySQL database. This follows Nuxt conventions with pages/, components/, composables/, and server/api/ directories. Browser storage (localStorage/IndexedDB) handles session persistence (FR-014).

## Complexity Tracking

*No constitution violations - this section intentionally left empty.*
