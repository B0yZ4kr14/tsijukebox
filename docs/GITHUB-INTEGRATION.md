# GitHub Integration

This document describes how TSiJUKEBOX integrates with GitHub.

## Features

### 1. Full Repository Sync
Sync all critical files to GitHub with a single click.

### 2. File Selection
Choose which files to sync before committing.

### 3. Sync History
Track all previous synchronizations with commit details.

### 4. Auto-Sync (Optional)
Automatically sync changes when detected.

## Configuration

The sync system is configured in:
- `useGitHubFullSync.ts` - Main sync hook
- `full-repo-sync` - Edge function for GitHub API

## Security
- Only documentation and script files are synced
- Config files (package.json, etc.) are NEVER modified
- GitHub token is stored securely in secrets

---
Version: 4.1.0
Updated: 2025-12-23T04:46:12.543Z
