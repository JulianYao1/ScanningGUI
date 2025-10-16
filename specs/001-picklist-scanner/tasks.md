---
description: "Task list for picklist scanner feature implementation"
---

# Tasks: Picklist Scanner

**Input**: Design documents from `/specs/001-picklist-scanner/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are included based on spec requirements (SC-003, SC-005, SC-006 mention validation needs).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions
- **Nuxt 4 web app**: `pages/`, `components/`, `composables/`, `server/api/` at repository root
- All paths shown are absolute from repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Install production dependencies (onscan.js, mysql2) via npm install
- [X] T002 [P] Install development dependencies (@nuxt/test-utils, @vue/test-utils, @playwright/test, vitest, happy-dom)
- [X] T003 [P] Create .env file with database credentials (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME)
- [X] T004 [P] Add .env to .gitignore and create .env.example template
- [X] T005 Configure Nuxt config in nuxt.config.ts for SPA mode and devtools

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T006 Create TypeScript interfaces in types/scanning.ts (ScanningSession, SessionProduct, SessionStatus enum, BoxStyle enum)
- [X] T007 [P] Create database types in server/types/database.ts (DatabaseProduct interface)
- [X] T008 [P] Create error types in types/errors.ts (ErrorCode enum, AppError interface)
- [X] T009 Create MySQL connection pool in server/utils/database.ts with mysql2
- [X] T010 Create server API endpoint in server/api/products/[barcode].get.ts for product lookup
- [X] T011 [P] Create barcode validator utility in utils/barcodeValidator.ts (isValidBarcode, sanitizeBarcode functions)
- [X] T012 Test database connection and API endpoint with sample barcode query

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Scan Products into Box (Priority: P1) 🎯 MVP

**Goal**: Enable warehouse workers to scan products into a box and track them digitally

**Independent Test**: Create a session with box details, scan multiple product barcodes (including duplicates), verify all scanned items are recorded correctly with quantity increments

### Implementation for User Story 1

- [X] T013 [P] [US1] Create useProductLookup composable in composables/useProductLookup.ts with product fetch logic
- [X] T014 [P] [US1] Create useScanning composable in composables/useScanning.ts with session state management (createSession, addProduct, quantity increment)
- [X] T015 [P] [US1] Create useBarcodeScanner composable in composables/useBarcodeScanner.ts with onscan.js integration
- [X] T016 [P] [US1] Create useSessionPersistence composable in composables/useSessionPersistence.ts with localStorage save/load
- [X] T017 [US1] Create BoxSetupForm component in components/BoxSetupForm.vue (box number input, box style dropdown)
- [X] T018 [US1] Create BarcodeScanner component in components/BarcodeScanner.vue (integrates useBarcodeScanner, shows scan feedback)
- [X] T019 [P] [US1] Create ProductListItem component in components/ProductListItem.vue (displays single product with quantity)
- [X] T020 [US1] Create ProductList component in components/ProductList.vue (displays all scanned products using ProductListItem)
- [X] T021 [US1] Create main scanning page in pages/index.vue (integrates BoxSetupForm, BarcodeScanner, ProductList)
- [X] T022 [US1] Update app.vue to include routing and basic layout
- [X] T023 [US1] Implement error handling for invalid barcodes (FR-011: show error message with barcode code, allow retry)
- [X] T024 [US1] Add session persistence on scan (save to localStorage after each product added)

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently. Users can create sessions, scan products, see quantity increments, and have data persist.

---

## Phase 4: User Story 2 - Download Picklist File (Priority: P2)

**Goal**: Enable workers to download a CSV picklist file after completing scanning

**Independent Test**: Complete a scanning session with multiple products, click download button, verify downloaded CSV file contains accurate product data in correct format with all required columns

### Implementation for User Story 2

- [X] T025 [P] [US2] Create CSV formatter utility in utils/csvFormatter.ts (generate CSV with proper escaping)
- [X] T026 [P] [US2] Create usePicklistExport composable in composables/usePicklistExport.ts (generateCSV, downloadCSV functions)
- [X] T027 [US2] Create PicklistDownload component in components/PicklistDownload.vue (download button, triggers CSV generation)
- [X] T028 [US2] Integrate PicklistDownload component into pages/index.vue
- [X] T029 [US2] Implement CSV format per spec (Box Number, Box Style, Barcode, Product Name, SKU, Quantity, Unit Price, Total Price)
- [X] T030 [US2] Add UTF-8 BOM to CSV for Excel compatibility
- [X] T031 [US2] Test CSV download with various product combinations (with/without prices, special characters in names)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently. Users can complete full workflow from session creation to CSV download.

---

## Phase 5: User Story 3 - Manage Multiple Scanning Sessions (Priority: P3)

**Goal**: Enable workers to handle multiple boxes simultaneously and switch between sessions

**Independent Test**: Create multiple sessions with different box numbers, switch between them, verify each maintains its own product list, resume paused sessions and confirm data integrity

### Implementation for User Story 3

- [X] T032 [P] [US3] Extend useScanning composable to support multiple sessions (session array, currentSessionId, switchSession function)
- [X] T033 [P] [US3] Add session status transitions in useScanning (active, paused, completed states)
- [X] T034 [US3] Create SessionManager component in components/SessionManager.vue (list all sessions, switch between them, show session status)
- [X] T035 [US3] Integrate SessionManager into pages/index.vue layout
- [X] T036 [US3] Implement session switching logic (pause current, activate selected)
- [X] T037 [US3] Update useSessionPersistence to save all sessions (not just current one)
- [X] T038 [US3] Add visual indicators for active vs paused sessions in UI
- [X] T039 [US3] Test with 10+ concurrent sessions to verify performance (SC-004)

**Checkpoint**: All user stories should now be independently functional. Full application feature set complete.

---

## Phase 6: Testing & Validation

**Purpose**: Comprehensive test coverage to meet success criteria

- [X] T040 [P] Write unit test for useScanning composable in tests/unit/composables/useScanning.test.ts (test quantity increment, session creation)
- [X] T041 [P] Write unit test for useProductLookup composable in tests/unit/composables/useProductLookup.test.ts (test API calls, error handling)
- [X] T042 [P] Write unit test for usePicklistExport composable in tests/unit/composables/usePicklistExport.test.ts (test CSV generation)
- [X] T043 [P] Write unit test for barcodeValidator in tests/unit/utils/barcodeValidator.test.ts (test validation patterns)
- [X] T044 [P] Write unit test for csvFormatter in tests/unit/utils/csvFormatter.test.ts (test escaping, formatting)
- [X] T045 [P] Write component test for BoxSetupForm in tests/component/BoxSetupForm.test.ts (test form validation, submission)
- [X] T046 [P] Write component test for ProductList in tests/component/ProductList.test.ts (test rendering, quantity display)
- [X] T047 [P] Write component test for BarcodeScanner in tests/component/BarcodeScanner.test.ts (test scan detection)
- [X] T048 Install Playwright browsers (npx playwright install)
- [X] T049 [P] Write E2E test for User Story 1 in tests/e2e/scanning-workflow.spec.ts (full workflow: create session, scan products, verify display)
- [X] T050 [P] Write E2E test for User Story 2 in tests/e2e/download-picklist.spec.ts (complete session, download CSV, verify file content)
- [X] T051 Run all unit tests and verify passing (npm run test:unit)
- [X] T052 Run all E2E tests and verify passing (npm run test:e2e)
- [X] T053 Run type checking and verify no errors (npx nuxi typecheck)

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T054 [P] Create date formatter utility in utils/dateFormatter.ts for timestamp display
- [ ] T055 [P] Add loading states to product lookup (show spinner during API call)
- [ ] T056 [P] Add loading states to CSV download (show generating message)
- [ ] T057 [P] Implement database connection error handling (show user-friendly message if MySQL unavailable)
- [ ] T058 [P] Add input validation for box number (alphanumeric, max length, sanitize special characters)
- [ ] T059 [P] Add visual feedback for successful scans (flash/highlight effect)
- [ ] T060 [P] Add empty state handling (show message when no products scanned)
- [ ] T061 Optimize bundle size and check for lazy loading opportunities
- [ ] T062 Test full workflow timing to meet SC-001 (complete in under 3 minutes)
- [ ] T063 Test barcode recognition speed to meet SC-002 (95% recognized in under 2 seconds)
- [ ] T064 Verify session persistence meets SC-003 (100% data integrity after app close)
- [ ] T065 Run quickstart.md validation (follow setup guide, verify all commands work)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Testing (Phase 6)**: Can start after each user story completes (incremental testing)
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Technically independent, but logically follows US1
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Enhances US1 but doesn't block anything

### Within Each User Story

- Composables can be built in parallel ([P] tasks)
- Components depend on composables being complete
- Page integration depends on components being complete
- Each story should be tested independently before moving to next

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all three user stories can start in parallel (if team capacity allows)
- Within User Story 1: T013-T016 and T019 can all run in parallel
- Within User Story 2: T025-T026 can run in parallel
- Within User Story 3: T032-T033 can run in parallel
- All test files (T040-T050) can be written and run in parallel

---

## Parallel Example: User Story 1

```bash
# After Foundational phase is complete, launch these User Story 1 tasks in parallel:

# Terminal 1: Composables
Task: T013 - Create useProductLookup composable in composables/useProductLookup.ts

# Terminal 2: Composables
Task: T014 - Create useScanning composable in composables/useScanning.ts

# Terminal 3: Composables
Task: T015 - Create useBarcodeScanner composable in composables/useBarcodeScanner.ts

# Terminal 4: Composables
Task: T016 - Create useSessionPersistence composable in composables/useSessionPersistence.ts

# Terminal 5: Component
Task: T019 - Create ProductListItem component in components/ProductListItem.vue

# Wait for all to complete, then proceed sequentially with T017-T024
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (T013-T024)
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Verify acceptance criteria:
   - Can create session with box details
   - Can scan products and see them added
   - Duplicate scans increment quantity
   - Session persists through app refresh
6. Run E2E test for US1 (T049)
7. **MVP COMPLETE** - Deployable for basic warehouse use

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → **Deploy MVP** (basic scanning workflow)
3. Add User Story 2 → Test independently → **Deploy v1.1** (adds CSV download capability)
4. Add User Story 3 → Test independently → **Deploy v1.2** (adds multi-session management)
5. Add Testing + Polish → **Deploy v1.3** (production-ready with full test coverage)

Each increment adds value without breaking previous functionality.

### Parallel Team Strategy

With multiple developers:

1. **Team completes Setup + Foundational together** (T001-T012)
2. Once Foundational is done, split work:
   - **Developer A**: User Story 1 (T013-T024) + Tests (T040-T041, T045-T047, T049)
   - **Developer B**: User Story 2 (T025-T031) + Tests (T042, T044, T050)
   - **Developer C**: User Story 3 (T032-T039)
   - **Developer D**: Infrastructure setup, database optimization, polish tasks
3. Stories complete and integrate independently
4. Final integration testing with all three stories together

---

## Notes

- [P] tasks = different files, no dependencies, can run in parallel
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Stop at any checkpoint to validate story independently before proceeding
- T001-T012 are blocking for all user stories - prioritize these first
- Tests can be written in parallel with implementation or after (TDD vs integration testing approach)
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- All file paths are absolute from repository root (e.g., `pages/index.vue` not `./pages/index.vue`)

**Task Count Summary**:
- Setup: 5 tasks (T001-T005)
- Foundational: 7 tasks (T006-T012)
- User Story 1: 12 tasks (T013-T024)
- User Story 2: 7 tasks (T025-T031)
- User Story 3: 8 tasks (T032-T039)
- Testing: 14 tasks (T040-T053)
- Polish: 12 tasks (T054-T065)
- **Total: 65 tasks**

**Parallel Opportunities**: 28 tasks marked with [P] can run in parallel within their phase
