# Contributing to TSiJUKEBOX

<div align="center">
  <img src="../public/logo/tsijukebox-logo.svg" alt="TSiJUKEBOX Logo" width="200">
  
  ## 🎵 Welcome Contributors!
</div>

---

First off, thank you for considering contributing to TSiJUKEBOX! It's people like you that make TSiJUKEBOX such a great tool.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Recognition](#recognition)

---

## 📜 Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](../CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or bun
- Git

### Development Setup

1. **Fork the repository**
   ```bash
   # Click the Fork button on GitHub
   ```

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR-USERNAME/TSiJUKEBOX.git
   cd TSiJUKEBOX
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:5173
   ```

---

## 🛠️ How to Contribute

### Reporting Bugs

1. Check [existing issues](https://github.com/B0yZ4kr14/TSiJUKEBOX/issues)
2. Use the [bug report template](.github/ISSUE_TEMPLATE/bug_report.md)
3. Include:
   - Clear description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - System information

### Suggesting Features

1. Check [existing feature requests](https://github.com/B0yZ4kr14/TSiJUKEBOX/issues?q=label%3Aenhancement)
2. Use the [feature request template](.github/ISSUE_TEMPLATE/feature_request.md)
3. Describe:
   - The problem you're solving
   - Your proposed solution
   - Alternatives considered

### Code Contributions

1. Find an issue to work on or create one
2. Comment on the issue to claim it
3. Fork and create a feature branch
4. Make your changes
5. Submit a pull request

---

## 📐 Coding Standards

### TypeScript

```typescript
// ✅ Use explicit types
function greet(name: string): string {
  return `Hello, ${name}!`;
}

// ❌ Avoid any
function greet(name: any): any {
  return `Hello, ${name}!`;
}
```

### React Components

```tsx
// ✅ Functional components with TypeScript
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export function Button({ label, onClick, disabled = false }: ButtonProps) {
  return (
    <button onClick={onClick} disabled={disabled}>
      {label}
    </button>
  );
}
```

### Styling

```tsx
// ✅ Use Tailwind with design system tokens
<div className="bg-background text-foreground">

// ❌ Avoid direct colors
<div className="bg-white text-black">
```

### File Organization

```
src/
├── components/
│   └── feature/
│       ├── FeatureComponent.tsx
│       ├── FeatureComponent.test.tsx
│       └── index.ts
├── hooks/
│   └── feature/
│       ├── useFeature.ts
│       └── useFeature.test.ts
└── lib/
    └── feature/
        ├── utils.ts
        └── utils.test.ts
```

---

## 💬 Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting, no code change |
| `refactor` | Code change, no feature/fix |
| `perf` | Performance improvement |
| `test` | Adding tests |
| `chore` | Maintenance tasks |

### Examples

```bash
feat(player): add shuffle mode
fix(auth): resolve login redirect loop
docs(readme): update installation steps
test(hooks): add usePlayer tests
```

---

## 🔄 Pull Request Process

### Before Submitting

- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] Commits follow conventions
- [ ] Branch is up to date with main

### PR Template

Use the [PR template](PULL_REQUEST_TEMPLATE.md) which includes:

1. Description of changes
2. Type of change
3. Related issues
4. Screenshots (if UI changes)
5. Testing steps
6. Checklist

### Review Process

1. **Automated checks** run first
2. **Code review** by maintainers
3. **Changes requested** if needed
4. **Approval** when ready
5. **Merge** by maintainer

---

## 🎖️ Recognition

Contributors are recognized in:

- [CREDITS.md](../docs/CREDITS.md)
- GitHub Contributors page
- Release notes for significant contributions

---

## 📚 Additional Resources

- [Developer Guide](../docs/DEVELOPER-GUIDE.md)
- [Architecture](../docs/ARCHITECTURE.md)
- [API Reference](../docs/API-REFERENCE.md)
- [Design System](../docs/DESIGN-SYSTEM.md)

---

## ❓ Questions?

- Check the [FAQ](../docs/GETTING-STARTED.md#common-questions)
- Start a [GitHub Discussion](https://github.com/B0yZ4kr14/TSiJUKEBOX/discussions)
- Read the [Support Guide](SUPPORT.md)

---

<p align="center">
  <sub>Thank you for contributing to TSiJUKEBOX! 🎵</sub>
</p>
