# 🎵 TSiJUKEBOX - Setup & Build Guide

## 📥 Quick Download

You can download and run the automatic setup script in one command:

### For Linux/macOS/Git Bash:

```bash
curl -O https://raw.githubusercontent.com/B0yZ4kr14/TSiJUKEBOX/main/scripts/setup-build-environment.sh
chmod +x setup-build-environment.sh
./setup-build-environment.sh
```

**OR** clone from repo and run:

```bash
git clone https://github.com/B0yZ4kr14/TSiJUKEBOX.git
cd TSiJUKEBOX
bash scripts/setup-build-environment.sh
```

### For Windows (PowerShell):

```powershell
# Option 1: Download and run directly
IEX (New-Object System.Net.WebClient).DownloadString('https://raw.githubusercontent.com/B0yZ4kr14/TSiJUKEBOX/main/scripts/setup-build-environment.ps1')

# Option 2: Download file first, then run
Invoke-WebRequest -Uri 'https://raw.githubusercontent.com/B0yZ4kr14/TSiJUKEBOX/main/scripts/setup-build-environment.ps1' -OutFile 'setup-build-environment.ps1'
.\setup-build-environment.ps1
```

**OR** clone from repo and run:

```powershell
git clone https://github.com/B0yZ4kr14/TSiJUKEBOX.git
cd TSiJUKEBOX
.\scripts\setup-build-environment.ps1
```

---

## ✨ What the Script Does (Autonomously)

The setup script automatically handles **all** of the following:

### ✅ Step 1: Environment Validation
- ✓ Detects OS type (Linux, macOS, Windows)
- ✓ Validates Node.js installation (v16+)
- ✓ Validates npm installation (v8+)
- ✓ Confirms project structure

### ✅ Step 2: Backup Current State
- ✓ Creates backup of `package.json`
- ✓ Creates backup of `package-lock.json`
- ✓ Stores in `.backup-[timestamp]/` directory

### ✅ Step 3: Clean npm Cache
- ✓ Clears npm cache
- ✓ Removes `node_modules` directory
- ✓ Removes `package-lock.json`
- ✓ Fresh start for dependencies

### ✅ Step 4: Detect Missing Dependencies
- ✓ Scans 37 @radix-ui packages
- ✓ Reports missing packages
- ✓ Logs detection results

### ✅ Step 5: Install Dependencies
- ✓ Runs `npm install --legacy-peer-deps`
- ✓ Installs all project dependencies
- ✓ Includes all missing @radix-ui packages

### ✅ Step 6: Fix Security Vulnerabilities
- ✓ Runs `npm audit`
- ✓ Auto-fixes vulnerabilities with `npm audit fix --force`
- ✓ Reports vulnerability status

### ✅ Step 7: Verify Build Configuration
- ✓ Checks `tsconfig.json`
- ✓ Checks `vite.config.ts/js`
- ✓ Checks `tailwind.config.ts/js`
- ✓ Validates critical config files

### ✅ Step 8: Build Project
- ✓ Runs `npm run build`
- ✓ Validates production build
- ✓ Reports build success/failure

### ✅ Final Report
- ✓ Execution time
- ✓ System information
- ✓ Next steps guidance
- ✓ Success/failure summary

---

## 📊 Expected Output

When the script runs successfully, you'll see:

```
════════════════════════════════════════════════════════════════════════════════
║  🎵 TSiJUKEBOX - Build Environment Setup 🎵                                  ║
║  Autonomous Setup & Fix Script (PowerShell/Bash)                             ║
║  Version 1.0.0                                                              ║
════════════════════════════════════════════════════════════════════════════════

ℹ Starting comprehensive build environment setup...

────────────────────────────────────────────────────────────────────────────────
║ STEP 1/8: Validating Environment                                            ║
────────────────────────────────────────────────────────────────────────────────

▶ Checking Node.js installation...
✓ Node.js found: v18.19.0
▶ Checking npm installation...
✓ npm found: 10.2.4
✓ package.json found

...[Steps 2-8 continue]...

────────────────────────────────────────────────────────────────────────────────
║ SETUP REPORT                                                                ║
────────────────────────────────────────────────────────────────────────────────

✓ BUILD SUCCESSFUL!
ℹ Your project is ready to run!

Next commands:
  • Development server: npm run dev
  • Preview build: npm run preview
  • Run tests: npm run test
  • Run e2e tests: npm run test:e2e

────────────────────────────────────────────────────────────────────────────────
║ SYSTEM INFORMATION                                                           ║
────────────────────────────────────────────────────────────────────────────────

Node.js: v18.19.0
npm: v10.2.4
OS: Windows 10.0.19045 / macOS 14.1 / Linux 5.15.0
Script: PowerShell 7.4.0 / bash 5.2.0

════════════════════════════════════════════════════════════════════════════════
```

---

## 🔧 Manual Setup (If Needed)

If you prefer to run commands manually:

```bash
# 1. Validate environment
node --version      # Should be v16+
npm --version       # Should be v8+

# 2. Backup current state
cp package.json package.json.backup
cp package-lock.json package-lock.json.backup

# 3. Clean everything
npm cache clean --force
rm -rf node_modules
rm package-lock.json

# 4. Reinstall dependencies
npm install --legacy-peer-deps

# 5. Fix vulnerabilities
npm audit fix --force

# 6. Build
npm run build

# 7. Preview (optional)
npm run preview
```

---

## 🆘 Troubleshooting

### Issue: "Node.js not found"

**Solution:** Install Node.js from https://nodejs.org/ (v16 or higher)

### Issue: Permission denied when running script

**Linux/macOS:**
```bash
chmod +x scripts/setup-build-environment.sh
./scripts/setup-build-environment.sh
```

**Windows PowerShell:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\scripts\setup-build-environment.ps1
```

### Issue: Build still fails after running script

1. Check the `.backup-[timestamp]/` directory for backups
2. Review the error messages in the output
3. Try manual setup using the commands above
4. Check GitHub Issues: https://github.com/B0yZ4kr14/TSiJUKEBOX/issues

### Issue: npm audit fix didn't resolve all vulnerabilities

This is normal. Some vulnerabilities require manual review:

```bash
npm audit
# Read the report and update packages manually if needed
npm update [package-name]@latest
```

---

## 📁 Script Files

Both scripts are included in the repository:

- **`scripts/setup-build-environment.sh`** (Bash - 14.4 KB)
  - For Linux, macOS, and Git Bash on Windows
  - Full-featured with color output and detailed logging

- **`scripts/setup-build-environment.ps1`** (PowerShell - 15.3 KB)
  - For Windows PowerShell 5.0+
  - Full-featured with color output and detailed logging

- **`scripts/fix-missing-dependencies.mjs`** (Node.js - 2.7 KB)
  - Standalone dependency fixer
  - Cross-platform

- **`scripts/fix-missing-dependencies.sh`** (Bash - 2.0 KB)
  - Lightweight bash alternative

---

## ⚡ Quick Reference

### After successful setup:

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run unit tests
npm run test

# Run e2e tests
npm run test:e2e

# Fix missing dependencies again (if needed)
npm run fix-deps

# Fix dependencies AND build
npm run fix-build
```

---

## 📚 Additional Resources

- [Node.js Documentation](https://nodejs.org/docs/)
- [npm Documentation](https://docs.npmjs.com/)
- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/)

---

## ✅ Verification Checklist

After running the setup script, verify:

- [ ] Script completed with exit code 0
- [ ] "BUILD SUCCESSFUL!" message shown
- [ ] `dist/` directory created
- [ ] No error messages in output
- [ ] `npm run dev` starts development server
- [ ] `npm run build` completes without errors
- [ ] Application loads in browser at http://localhost:5173

---

## 📞 Support

If you encounter issues:

1. **Check the error output** - The script provides detailed error messages
2. **Review logs** - Look for `setup-build-report-*.log` files
3. **Check backups** - Restore from `.backup-[timestamp]/` if needed
4. **Consult README** - [scripts/DEPENDENCY_FIX.md](scripts/DEPENDENCY_FIX.md)
5. **Open an issue** - [TSiJUKEBOX Issues](https://github.com/B0yZ4kr14/TSiJUKEBOX/issues)

---

## 📝 Version Info

- **Script Version:** 1.0.0
- **Last Updated:** December 23, 2025
- **Tested on:**
  - Node.js 16.x, 18.x, 20.x
  - npm 8.x, 9.x, 10.x
  - Linux (Ubuntu, Debian, Arch)
  - macOS (12.x, 13.x, 14.x)
  - Windows 10/11 with PowerShell 5.0+
  - Git Bash on Windows

---

**Status:** ✅ Production Ready

**Made with ❤️ by TSiJUKEBOX Team**
