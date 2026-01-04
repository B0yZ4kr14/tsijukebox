# Copilot Coding Agent Instructions for TSiJUKEBOX

This document provides instructions and context for GitHub Copilot coding agent to work effectively with the TSiJUKEBOX repository.

## Project Overview

TSiJUKEBOX is a modern jukebox application built with:
- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Python (for installation/setup scripts)
- **UI Framework**: Tailwind CSS + Radix UI components
- **State Management**: Zustand
- **Testing**: Vitest (unit) + Playwright (E2E)
- **Target Platform**: CachyOS/Arch Linux (primary), but cross-platform capable

## Build & Development Commands

```bash
# Development
npm install          # Install dependencies
npm run dev          # Start dev server (port 8080)
npm run build        # Production build
npm run preview      # Preview production build

# Testing
npm run test         # Run Vitest unit tests
npm run test:e2e     # Run Playwright E2E tests

# Linting
npm run lint         # Run ESLint
```

## Key Conventions

### Code Style
- Use TypeScript for all new code
- Follow existing ESLint configuration
- Use functional components with hooks (React)
- Prefer named exports over default exports
- Use Tailwind CSS utility classes for styling
- Use Radix UI components for UI primitives

### File Structure
- `src/components/` - React components
- `src/pages/` - Page-level components
- `src/lib/` - Utility functions and shared logic
- `src/hooks/` - Custom React hooks
- `src/stores/` - Zustand state stores
- `src/types/` - TypeScript type definitions

### Dependencies
- **IMPORTANT**: All Radix UI dependencies are already present in package.json
- Do NOT remove any `@radix-ui/*` packages - they are required by UI components
- Use `npm install` (not `npm audit fix --force`) to avoid breaking dependency tree
- The project uses npm (not pnpm or yarn) as the primary package manager

### GitHub Actions / CI/CD

#### External URL Access
The GitHub Actions environment has firewall rules that may block certain external URLs. To work around this:

1. **Playwright/Chromium Dependencies**: These require `googlechromelabs.github.io` access
   - Use Playwright Docker images when possible
   - Cache Playwright browsers to avoid repeated downloads
   - Run Playwright install before firewall activation in Copilot workflows

2. **Allowlist Configuration**:
   - `googlechromelabs.github.io` - Playwright browser downloads
   - `github.com` - Git operations (HTTP fallback)
   - Repository admins can add URLs to custom allowlist in [Copilot coding agent settings](https://github.com/B0yZ4kr14/tsijukebox/settings/copilot/coding_agent)

3. **Actions Setup Steps**:
   - Setup steps should run BEFORE the firewall is enabled
   - Cache npm packages and Playwright browsers
   - Use `actions/cache@v4` for dependencies
   - Install all external dependencies in setup phase

#### Workflow Best Practices
- Use `npm ci` for clean installs in CI (not `npm install`)
- Enable `--legacy-peer-deps` if peer dependency conflicts occur
- Cache `node_modules` and `~/.cache/ms-playwright` directories
- Use `continue-on-error: true` for non-critical steps
- Always use `actions/checkout@v4` or later
- Set `fetch-depth: 0` when full git history is needed

## Common Tasks

### Adding a New Dependency

```bash
# Always verify the dependency first
npm install <package-name>

# Check the build still works
npm run build

# Run tests to ensure nothing broke
npm run test
```

### Fixing Build Issues

1. Check `package.json` and `package-lock.json` are in sync
2. Remove `node_modules` and reinstall: `rm -rf node_modules && npm install`
3. Verify Vite config: `vite.config.ts`
4. Check TypeScript config: `tsconfig.json`
5. Review build output for specific errors

### Working with Workflows

1. Test workflow changes locally when possible
2. Use `workflow_dispatch` trigger for manual testing
3. Check previous successful runs for reference
4. Review workflow logs in Actions tab for debugging
5. Use `continue-on-error: true` for experimental features

## Security Considerations

- Never commit secrets or API keys
- Use environment variables for sensitive data
- Review `npm audit` output before deploying
- Validate all user inputs
- Use Content Security Policy headers
- Keep dependencies updated (but test thoroughly)

## Accessibility

- All UI components should be keyboard accessible
- Use semantic HTML elements
- Include ARIA labels where needed
- Test with screen readers when possible
- Maintain color contrast ratios (WCAG AA minimum)

## Performance

- Lazy load components when appropriate
- Optimize images and assets
- Use React.memo for expensive components
- Monitor bundle size (`npm run build` shows sizes)
- Lighthouse audit scores should be > 90

## Known Issues

### Issue #29: Missing Dependencies
**Status**: RESOLVED
- `@radix-ui/react-radio-group` was reported missing but is present in package.json
- If build fails, check that all `@radix-ui/*` packages are installed
- Run `npm install` to sync dependencies

### Issue #27, #28: Package.json Corruption
**Status**: RESOLVED  
- Previous issue with `npm audit fix --force` breaking dependencies
- Solution: Never use `--force` flag, use manual updates instead
- `.npmrc` configured to prevent automatic major version upgrades

### Firewall Blocking
**Status**: IN PROGRESS
- GitHub Actions firewall blocks `googlechromelabs.github.io` and `github.com`
- Workflows updated to install dependencies in setup phase
- Use allowlist configuration for required external URLs

## Testing Strategy

### Unit Tests (Vitest)
- Test business logic and utility functions
- Test React components in isolation
- Use React Testing Library for component tests
- Aim for >70% code coverage

### E2E Tests (Playwright)
- Test critical user journeys
- Test across Chromium browser
- Run in headless mode in CI
- Keep tests fast and focused

### Accessibility Tests
- Use @axe-core/playwright for automated accessibility testing
- Manual testing with keyboard navigation
- Screen reader testing for critical flows

## Release Process

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Create git tag: `git tag -a v4.2.0 -m "Release 4.2.0"`
4. Push tag: `git push origin v4.2.0`
5. GitHub Actions will create release and deploy

## Resources

- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [Radix UI Documentation](https://www.radix-ui.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Playwright Documentation](https://playwright.dev/)
- [Vitest Documentation](https://vitest.dev/)

## Contact & Support

- Repository: https://github.com/B0yZ4kr14/tsijukebox
- Issues: https://github.com/B0yZ4kr14/tsijukebox/issues
- Wiki: https://github.com/B0yZ4kr14/tsijukebox/wiki

---

**Last Updated**: 2026-01-04
**Copilot Agent Version**: Compatible with GitHub Copilot Workspace
