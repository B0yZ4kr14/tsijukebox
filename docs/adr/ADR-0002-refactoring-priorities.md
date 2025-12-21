# ADR-0002: Refactoring Priorities and Technical Debt

## Status

**Proposed** — 2024-12-21

## Context

During the repository professionalization effort, several areas of technical debt and refactoring opportunities were identified. This ADR documents these findings and establishes prioritization criteria for addressing them systematically.

### Assessment Criteria

Each item is evaluated on:
- **Impact**: Benefit to codebase quality (High/Medium/Low)
- **Risk**: Chance of breaking existing functionality (High/Medium/Low)
- **Effort**: Development time required (High/Medium/Low)

Priority formula: **High Impact + Low Risk = Do First**

## Decision

We establish the following refactoring priorities:

### Top 10 Refactoring Priorities

#### 1. Bundle Size Optimization
**Priority: HIGH | Impact: High | Risk: Low | Effort: Medium**

- **Issue**: `Settings` chunk (1,088 KB) and `index` chunk (1,675 KB) exceed 500 KB
- **Action**: Implement dynamic imports and code splitting
- **Location**: `src/pages/Settings.tsx`, `src/App.tsx`
- **Test Required**: Build size monitoring

```typescript
// Before
import { Settings } from './pages/Settings';

// After
const Settings = lazy(() => import('./pages/Settings'));
```

---

#### 2. ESLint Error Resolution
**Priority: HIGH | Impact: High | Risk: Low | Effort: Low**

- **Issue**: 13 ESLint errors in the codebase
- **Key files**:
  - `AudioVisualizer.tsx` — lexical declarations in case blocks
  - `PlayerControls.tsx` — unused expression
  - `ThemeSection.tsx` — explicit `any` type
  - `VoiceAnalyticsCharts.tsx` — explicit `any` types
- **Action**: Fix each error while preserving behavior
- **Test Required**: Existing tests + lint check

---

#### 3. Hook Dependencies Warning
**Priority: MEDIUM | Impact: Medium | Risk: Medium | Effort: Low**

- **Issue**: `FullscreenKaraoke.tsx` has unstable hook dependencies
- **Line**: 72 — `lines` logical expression in useEffect dependencies
- **Action**: Wrap in `useMemo()` as suggested by ESLint
- **Test Required**: E2E karaoke test

```typescript
// Before
const lines = lyrics?.split('\n') || [];
useEffect(() => { /* uses lines */ }, [lines]);

// After
const lines = useMemo(() => lyrics?.split('\n') || [], [lyrics]);
useEffect(() => { /* uses lines */ }, [lines]);
```

---

#### 4. E2E Test React Hook Violations
**Priority: LOW | Impact: Low | Risk: Low | Effort: Low**

- **Issue**: Playwright fixtures using React hooks incorrectly
- **Files**: `e2e/fixtures/auth.fixture.ts`, `e2e/fixtures/brand.fixture.ts`
- **Note**: False positives — `use` in Playwright is not React's `use`
- **Action**: Add ESLint ignore comment or rename functions

---

#### 5. `@ts-ignore` to `@ts-expect-error`
**Priority: LOW | Impact: Low | Risk: Low | Effort: Low**

- **Issue**: `e2e/specs/voice-control.spec.ts` uses deprecated `@ts-ignore`
- **Action**: Replace with `@ts-expect-error` for type safety
- **Lines**: 183, 185

---

#### 6. Fast Refresh Warnings
**Priority: LOW | Impact: Low | Risk: Low | Effort: Medium**

- **Issue**: Several files export both components and constants
- **Files**:
  - `PermissionGate.tsx`
  - `DatabaseConnectionHistory.tsx`
  - `GuidedTour.tsx`
  - `BrandText.tsx`
  - `badge.tsx`
- **Action**: Extract constants to separate files
- **Note**: These are warnings, not errors

---

#### 7. Type Safety Improvements
**Priority: MEDIUM | Impact: High | Risk: Medium | Effort: High**

- **Issue**: Several components use `any` type
- **Action**: Replace with proper interfaces
- **Strategy**: Gradual adoption, one file at a time
- **Test Required**: TypeScript strict mode check

---

#### 8. Test Coverage Expansion
**Priority: MEDIUM | Impact: High | Risk: Low | Effort: High**

- **Issue**: Critical paths may lack test coverage
- **Action**: Add tests for:
  - Player controls
  - Authentication flows
  - Backup/restore operations
- **Target**: 80% coverage for hooks, 70% for components

---

#### 9. Component Prop Standardization
**Priority: LOW | Impact: Medium | Risk: Medium | Effort: Medium**

- **Issue**: Inconsistent prop patterns across components
- **Action**: Document and enforce standard patterns:
  - `className` for styling override
  - `onX` for event handlers
  - `isX` for boolean states
- **Test Required**: Prop type validation

---

#### 10. Documentation Sync
**Priority: LOW | Impact: Medium | Risk: Low | Effort: Low**

- **Issue**: Some docs may be outdated
- **Action**: Review and update:
  - API references
  - Component examples
  - Installation guides
- **Test Required**: Documentation link checker

---

### Refactoring Process

For each refactoring:

1. **Before**: Document current behavior
2. **Test**: Ensure coverage exists (add if missing)
3. **Change**: Make incremental changes
4. **Verify**: Run tests, lint, build
5. **After**: Document changes
6. **ADR**: Update this document

### Rollback Plan

Each refactoring should be:
- In a separate commit
- Revertible via `git revert`
- Tested before merge

## Consequences

### Positive

- **Quality**: Reduced technical debt
- **Maintainability**: Cleaner codebase
- **Performance**: Smaller bundles
- **DevEx**: Fewer warnings/errors

### Negative

- **Time Investment**: Initial refactoring effort
- **Risk**: Potential regressions if not tested

### Neutral

- **No Feature Changes**: Behavior preserved
- **Incremental**: Can be done over time

## References

- [ADR-0001: Repository Structure](ADR-0001-repository-structure.md)
- ESLint output from `npm run lint`
- Vite build warnings

---

**Authors**: Repository Architect Agent  
**Reviewers**: Maintainers  
**Last Updated**: 2024-12-21
