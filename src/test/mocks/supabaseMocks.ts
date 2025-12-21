import { vi } from 'vitest';

/**
 * Mock do cliente Supabase para testes de integração
 * Simula todas as operações de banco de dados e edge functions
 */

// Mock de retorno encadeado para queries
const createChainMock = () => ({
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  upsert: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  neq: vi.fn().mockReturnThis(),
  gt: vi.fn().mockReturnThis(),
  gte: vi.fn().mockReturnThis(),
  lt: vi.fn().mockReturnThis(),
  lte: vi.fn().mockReturnThis(),
  like: vi.fn().mockReturnThis(),
  ilike: vi.fn().mockReturnThis(),
  is: vi.fn().mockReturnThis(),
  in: vi.fn().mockReturnThis(),
  contains: vi.fn().mockReturnThis(),
  containedBy: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  range: vi.fn().mockReturnThis(),
  single: vi.fn().mockResolvedValue({ data: null, error: null }),
  maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
  then: vi.fn(),
});

// Mock do cliente Supabase completo
export const mockSupabaseClient = {
  from: vi.fn().mockImplementation(() => createChainMock()),
  
  functions: {
    invoke: vi.fn().mockResolvedValue({ data: null, error: null }),
  },
  
  channel: vi.fn().mockReturnValue({
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn().mockReturnValue({ 
      unsubscribe: vi.fn(),
    }),
  }),
  
  removeChannel: vi.fn(),
  
  auth: {
    getUser: vi.fn().mockResolvedValue({ 
      data: { user: null }, 
      error: null 
    }),
    getSession: vi.fn().mockResolvedValue({ 
      data: { session: null }, 
      error: null 
    }),
    signIn: vi.fn().mockResolvedValue({ 
      data: null, 
      error: null 
    }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
    onAuthStateChange: vi.fn().mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    }),
  },
  
  storage: {
    from: vi.fn().mockReturnValue({
      upload: vi.fn().mockResolvedValue({ data: null, error: null }),
      download: vi.fn().mockResolvedValue({ data: null, error: null }),
      getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: '' } }),
      remove: vi.fn().mockResolvedValue({ data: null, error: null }),
      list: vi.fn().mockResolvedValue({ data: [], error: null }),
    }),
  },
};

/**
 * Cria um mock de resposta de sucesso para queries
 */
export function mockQuerySuccess<T>(data: T) {
  return { data, error: null };
}

/**
 * Cria um mock de resposta de erro para queries
 */
export function mockQueryError(message: string, code?: string) {
  return { 
    data: null, 
    error: { 
      message, 
      code: code || 'PGRST000',
      details: null,
      hint: null,
    } 
  };
}

/**
 * Cria um mock de resposta para edge functions
 */
export function mockFunctionSuccess<T>(data: T) {
  return { data, error: null };
}

export function mockFunctionError(message: string) {
  return { 
    data: null, 
    error: new Error(message),
  };
}

/**
 * Configura o mock do Supabase para um teste específico
 */
export function setupSupabaseMock() {
  vi.mock('@/integrations/supabase/client', () => ({
    supabase: mockSupabaseClient,
  }));
  
  return mockSupabaseClient;
}

/**
 * Limpa todos os mocks do Supabase
 */
export function clearSupabaseMocks() {
  vi.clearAllMocks();
}

/**
 * Mock de channel para realtime
 */
export function createRealtimeChannelMock() {
  const handlers: Record<string, Function[]> = {};
  
  return {
    on: vi.fn().mockImplementation((event: string, _filter: unknown, callback: Function) => {
      if (!handlers[event]) handlers[event] = [];
      handlers[event].push(callback);
      return this;
    }),
    subscribe: vi.fn().mockReturnValue({
      unsubscribe: vi.fn(),
    }),
    // Helper para simular eventos
    emit: (event: string, payload: unknown) => {
      handlers[event]?.forEach(handler => handler(payload));
    },
  };
}

/**
 * Mock de resposta paginada
 */
export function mockPaginatedResponse<T>(items: T[], page: number, pageSize: number) {
  const start = page * pageSize;
  const end = start + pageSize;
  const data = items.slice(start, end);
  
  return {
    data,
    error: null,
    count: items.length,
  };
}
