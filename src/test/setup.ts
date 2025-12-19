import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock do SettingsContext
vi.mock('@/contexts/SettingsContext', () => ({
  useSettings: vi.fn(() => ({
    spotify: { isConnected: true },
    youtube: { isConnected: true },
  })),
}));

// Mock do toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
}));
