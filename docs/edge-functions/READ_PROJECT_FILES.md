# Read Project Files Edge Function

## Overview
The `read-project-files` edge function reads multiple files from the GitHub repository for code analysis and synchronization.

## Endpoint
`POST /functions/v1/read-project-files`

## Request Schema

```typescript
interface FileRequest {
  paths: string[];    // Array of file paths
  branch?: string;    // Default: 'main'
}
```

## Response Schema

```typescript
interface ReadResult {
  files: Array<{
    path: string;
    content: string;
  }>;
  errors: string[];     // Files with errors
  notFound: string[];   // Files that don't exist
}
```

## Example Request

```bash
curl -X POST https://[project-id].supabase.co/functions/v1/read-project-files \
  -H "Content-Type: application/json" \
  -d '{
    "paths": [
      "src/App.tsx",
      "package.json",
      "README.md"
    ],
    "branch": "main"
  }'
```

## Example Response

```json
{
  "files": [
    {
      "path": "src/App.tsx",
      "content": "import React from 'react';\n\nexport function App() {\n  return <div>Hello</div>;\n}"
    },
    {
      "path": "package.json",
      "content": "{\n  \"name\": \"tsijukebox\",\n  \"version\": \"4.2.0\"\n}"
    }
  ],
  "errors": [],
  "notFound": ["README.md"]
}
```

## GitHub API Integration

Uses GitHub Contents API:
- **Endpoint**: `https://api.github.com/repos/{owner}/{repo}/contents/{path}`
- **Authentication**: Bearer token via `GITHUB_ACCESS_TOKEN`
- **Encoding**: Base64 decoded to UTF-8

## Error Handling

### File Not Found
- File added to `notFound` array
- No error thrown
- Processing continues

### File Read Error
- File path added to `errors` array
- Error message logged
- Processing continues

### Directory Instead of File
- Added to `errors` as "Not a file"
- Processing continues

## Example: Handling Errors

Request:
```json
{
  "paths": [
    "src/App.tsx",           // ✅ Exists
    "missing.txt",           // ❌ Not found
    "src/components"         // ❌ Directory
  ]
}
```

Response:
```json
{
  "files": [
    {
      "path": "src/App.tsx",
      "content": "..."
    }
  ],
  "errors": ["src/components: Not a file"],
  "notFound": ["missing.txt"]
}
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GITHUB_ACCESS_TOKEN` | Yes | GitHub API token |

## Repository Configuration

```typescript
const REPO_OWNER = 'thugzook';
const REPO_NAME = 'TSiJUKEBOX';
```

## Features
- ✅ Batch file reading
- ✅ Base64 decoding
- ✅ Error resilience
- ✅ Branch selection
- ✅ Not found detection
- ✅ Directory detection
- ✅ CORS enabled

## Limitations
- Only reads text files
- Cannot read binary files
- Limited by GitHub API rate limits
- Files must be UTF-8 encoded

## Use Cases
- Code analysis
- Configuration reading
- Documentation sync
- Multi-file refactoring
- Repository inspection
