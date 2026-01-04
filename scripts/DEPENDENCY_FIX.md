# 🔧 Missing Radix UI Dependencies Fix

## Problem

When building, you might see errors like:
```
[vite]: Rollup failed to resolve import "@radix-ui/react-toggle" ...
[vite]: Rollup failed to resolve import "@radix-ui/react-radio-group" ...
```

This happens because `shadcn/ui` components depend on `@radix-ui` packages, but not all of them are explicitly listed in `package.json`.

## Solutions

### ✅ Quick Fix (Recommended)

```bash
# Using Node.js script (cross-platform)
node scripts/fix-missing-dependencies.mjs

# OR using bash script (Unix/Linux/macOS)
bash scripts/fix-missing-dependencies.sh
```

Both scripts will:
1. 🔍 Scan for all missing `@radix-ui` packages
2. 📦 Install them automatically
3. 🔨 Run the build and verify it works

### Manual Fix

If you prefer to do it manually:

```bash
# Install all commonly used @radix-ui dependencies
npm install \
  @radix-ui/react-toggle \
  @radix-ui/react-toggle-group \
  @radix-ui/react-use-controllable-state \
  @radix-ui/react-context \
  @radix-ui/react-direction \
  @radix-ui/react-use-callback-ref \
  @radix-ui/react-use-escape-keydown \
  @radix-ui/react-use-layout-effect \
  @radix-ui/react-use-size

# Then build
npm run build
```

## Add to package.json Scripts (Optional)

You can add this to your `package.json` for easier access:

```json
{
  "scripts": {
    "build": "vite build",
    "fix-deps": "node scripts/fix-missing-dependencies.mjs",
    "fix-build": "npm run fix-deps && npm run build"
  }
}
```

Then you can run:
```bash
npm run fix-deps
# or
npm run fix-build
```

## Why This Happens

1. **shadcn/ui is a component library**: It provides pre-built components for you to copy into your project
2. **Components depend on Radix UI**: Most shadcn/ui components are built on top of Radix UI primitives
3. **Incomplete dependency declaration**: The `package.json` doesn't list all possible Radix UI packages because:
   - You might not use all components
   - Different versions of components might have different peer dependencies
   - The library is designed for flexibility

## Prevention

To avoid this in the future:

1. **Use the official shadcn/ui CLI**:
   ```bash
   npx shadcn@latest add toggle
   npx shadcn@latest add toggle-group
   ```
   The CLI automatically installs the correct dependencies

2. **Or run the fix script regularly**:
   ```bash
   npm run fix-deps
   ```

## Troubleshooting

### Still getting errors after running the script?

1. Clear npm cache and reinstall:
   ```bash
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   npm run build
   ```

2. Check for peer dependency conflicts:
   ```bash
   npm ls --all | grep @radix-ui
   ```

3. If you continue to have issues, please check:
   - Your npm version: `npm --version` (should be 8+)
   - Your Node version: `node --version` (should be 16+)
   - Run with verbose output: `npm run build -- --debug`

## Related Issues

- Build fails with "Rollup failed to resolve import"
- Missing Radix UI components in production build
- `@radix-ui/react-*` module not found errors

---

**Last Updated:** December 23, 2025  
**Status:** ✅ Active
