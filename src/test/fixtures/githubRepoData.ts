/**
 * Test fixtures for github-repo edge function integration tests
 */

// Valid SSH key formats for testing
export const validSSHKeys = {
  rsa: 'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQC3FlNgdp6TmDqz0L1b2rNGK4L5Y4K6a2S5bPcf8M6Z5d test@lovable.dev',
  ed25519: 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIGtest1234567890abcdefghijklmnopqrstuvwxyz test@lovable.dev',
  ecdsa: 'ecdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBtest test@lovable.dev',
};

// Invalid SSH key formats for testing
export const invalidSSHKeys = {
  empty: '',
  noPrefix: 'AAAAB3NzaC1yc2EAAAADAQABAAABgQC3FlNgdp6TmDqz0L1b2rNGK4L5Y4K6a2S5bPcf8M6Z5d',
  malformed: 'ssh-invalid key-data',
  tooShort: 'ssh-rsa AAAA',
};

// Valid PAT tokens for testing
export const validPATTokens = {
  ghp: 'ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  github_pat: 'github_pat_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
};

// Invalid PAT tokens for testing
export const invalidPATTokens = {
  empty: '',
  noPrefix: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  wrongPrefix: 'gho_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  tooShort: 'ghp_xxx',
};

// Request payloads
export const mockGitHubRepoRequests = {
  createDeployKey: {
    valid: {
      action: 'create-deploy-key' as const,
      title: 'Lovable Deploy Key',
      key: validSSHKeys.ed25519,
      read_only: true,
    },
    validReadWrite: {
      action: 'create-deploy-key' as const,
      title: 'Lovable Deploy Key (Write)',
      key: validSSHKeys.rsa,
      read_only: false,
    },
    missingTitle: {
      action: 'create-deploy-key' as const,
      key: validSSHKeys.ed25519,
      read_only: true,
    },
    missingKey: {
      action: 'create-deploy-key' as const,
      title: 'Lovable Deploy Key',
      read_only: true,
    },
  },
  
  deleteDeployKey: {
    valid: {
      action: 'delete-deploy-key' as const,
      keyId: 123456789,
    },
    missingKeyId: {
      action: 'delete-deploy-key' as const,
    },
    invalidKeyId: {
      action: 'delete-deploy-key' as const,
      keyId: 'invalid-id',
    },
  },
  
  validateToken: {
    valid: {
      action: 'validate-token' as const,
      custom_token: validPATTokens.ghp,
    },
    validGithubPat: {
      action: 'validate-token' as const,
      custom_token: validPATTokens.github_pat,
    },
    missingToken: {
      action: 'validate-token' as const,
    },
  },
  
  saveToken: {
    valid: {
      action: 'save-token' as const,
      custom_token: validPATTokens.ghp,
      token_name: 'Production Token',
    },
    missingToken: {
      action: 'save-token' as const,
      token_name: 'Production Token',
    },
  },
  
  getDeployKeys: {
    valid: {
      action: 'get-deploy-keys' as const,
      path: '/repos/B0yZ4kr14/TSiJUKEBOX/keys',
    },
  },
  
  invalidAction: {
    action: 'invalid-action',
    path: '/test',
  },
};

// Success response payloads
export const mockGitHubSuccessResponses = {
  deployKey: {
    id: 12345678,
    key: validSSHKeys.ed25519,
    url: 'https://api.github.com/repos/B0yZ4kr14/TSiJUKEBOX/keys/12345678',
    title: 'Lovable Deploy Key',
    verified: true,
    created_at: '2024-01-15T10:30:00Z',
    read_only: true,
  },
  
  deployKeysList: [
    {
      id: 12345678,
      key: validSSHKeys.ed25519,
      title: 'Lovable Deploy Key',
      read_only: true,
      created_at: '2024-01-15T10:30:00Z',
    },
    {
      id: 87654321,
      key: validSSHKeys.rsa,
      title: 'CI/CD Key',
      read_only: false,
      created_at: '2024-01-10T08:00:00Z',
    },
  ],
  
  validateToken: {
    login: 'testuser',
    id: 12345678,
    avatar_url: 'https://avatars.githubusercontent.com/u/12345678',
    type: 'User',
  },
  
  saveToken: {
    success: true,
    message: 'Token validated successfully',
    token_name: 'Production Token',
    login: 'testuser',
  },
  
  deleteKey: null, // 204 No Content
};

// Error response payloads
export const mockGitHubErrorResponses = {
  keyAlreadyInUse: {
    message: 'key is already in use',
    errors: [{ resource: 'DeployKey', code: 'custom', field: 'key', message: 'key is already in use' }],
    documentation_url: 'https://docs.github.com/rest/deploy-keys/deploy-keys#create-a-deploy-key',
  },
  
  keyAlreadyExists: {
    message: 'Validation Failed',
    errors: [{ resource: 'DeployKey', code: 'custom', field: 'key', message: 'key_already_exists' }],
  },
  
  badCredentials: {
    message: 'Bad credentials',
    documentation_url: 'https://docs.github.com/rest',
  },
  
  notFound: {
    message: 'Not Found',
    documentation_url: 'https://docs.github.com/rest',
  },
  
  forbidden: {
    message: 'Must have admin rights to Repository',
    documentation_url: 'https://docs.github.com/rest/deploy-keys/deploy-keys#create-a-deploy-key',
  },
  
  validationFailed: {
    message: 'Validation Failed',
    errors: [{ resource: 'DeployKey', code: 'missing_field', field: 'key' }],
  },
  
  rateLimited: {
    message: 'API rate limit exceeded',
    documentation_url: 'https://docs.github.com/rest/rate-limit',
  },
  
  serverError: {
    message: 'Internal Server Error',
  },
};

// HTTP status codes
export const httpStatus = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
};

// CORS headers expected in responses
export const expectedCorsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Edge function endpoint
export const GITHUB_REPO_FUNCTION_URL = 'https://ynkqczsmcnxvapljofel.supabase.co/functions/v1/github-repo';
