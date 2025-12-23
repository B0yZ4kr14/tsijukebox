import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CreateDeployKeyModal } from '../CreateDeployKeyModal';

// Mock Supabase client
const mockInvoke = vi.fn();
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: (...args: unknown[]) => mockInvoke(...args),
    },
  },
}));

// Mock sonner toast
const mockToast = {
  error: vi.fn(),
  success: vi.fn(),
};
vi.mock('sonner', () => ({
  toast: mockToast,
}));

describe('CreateDeployKeyModal', () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    onSuccess: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  // ============================================
  // Rendering Tests
  // ============================================
  describe('Rendering', () => {
    it('should render modal when open is true', () => {
      render(<CreateDeployKeyModal {...defaultProps} />);
      
      expect(screen.getByText('Gerenciar Acesso ao GitHub')).toBeInTheDocument();
      expect(screen.getByText('Deploy Key')).toBeInTheDocument();
      expect(screen.getByText('Personal Token')).toBeInTheDocument();
    });

    it('should not render modal when open is false', () => {
      render(<CreateDeployKeyModal {...defaultProps} open={false} />);
      
      expect(screen.queryByText('Gerenciar Acesso ao GitHub')).not.toBeInTheDocument();
    });

    it('should display both tabs (Deploy Key and Personal Token)', () => {
      render(<CreateDeployKeyModal {...defaultProps} />);
      
      const tabs = screen.getAllByRole('tab');
      expect(tabs).toHaveLength(2);
      expect(tabs[0]).toHaveTextContent('Deploy Key');
      expect(tabs[1]).toHaveTextContent('Personal Token');
    });

    it('should default to Deploy Key tab', () => {
      render(<CreateDeployKeyModal {...defaultProps} />);
      
      const deployKeyTab = screen.getByRole('tab', { name: /Deploy Key/i });
      expect(deployKeyTab).toHaveAttribute('data-state', 'active');
      
      // Check deploy key form fields are visible
      expect(screen.getByLabelText('Título')).toBeInTheDocument();
      expect(screen.getByLabelText('Chave Pública SSH')).toBeInTheDocument();
    });

    it('should switch to PAT tab when clicked', async () => {
      const user = userEvent.setup();
      render(<CreateDeployKeyModal {...defaultProps} />);
      
      const patTab = screen.getByRole('tab', { name: /Personal Token/i });
      await user.click(patTab);
      
      expect(patTab).toHaveAttribute('data-state', 'active');
      expect(screen.getByLabelText('Personal Access Token')).toBeInTheDocument();
    });

    it('should show read-only warning when switch is disabled', async () => {
      const user = userEvent.setup();
      render(<CreateDeployKeyModal {...defaultProps} />);
      
      // Find and toggle the read-only switch
      const switchElement = screen.getByRole('switch');
      await user.click(switchElement);
      
      expect(screen.getByText(/Chaves com permissão de escrita podem modificar o repositório/)).toBeInTheDocument();
    });
  });

  // ============================================
  // SSH Key Validation Tests
  // ============================================
  describe('SSH Key Validation', () => {
    it('should show error for empty title', async () => {
      const user = userEvent.setup();
      render(<CreateDeployKeyModal {...defaultProps} />);
      
      const createButton = screen.getByRole('button', { name: /Criar Deploy Key/i });
      await user.click(createButton);
      
      expect(mockToast.error).toHaveBeenCalledWith('Digite um título para a chave');
    });

    it('should show error for empty key', async () => {
      const user = userEvent.setup();
      render(<CreateDeployKeyModal {...defaultProps} />);
      
      const titleInput = screen.getByLabelText('Título');
      await user.type(titleInput, 'Test Key');
      
      const createButton = screen.getByRole('button', { name: /Criar Deploy Key/i });
      await user.click(createButton);
      
      expect(mockToast.error).toHaveBeenCalledWith('Cole a chave pública SSH');
    });

    it('should reject invalid SSH key format', async () => {
      const user = userEvent.setup();
      render(<CreateDeployKeyModal {...defaultProps} />);
      
      const titleInput = screen.getByLabelText('Título');
      const keyInput = screen.getByLabelText('Chave Pública SSH');
      
      await user.type(titleInput, 'Test Key');
      await user.type(keyInput, 'invalid-key-format');
      
      const createButton = screen.getByRole('button', { name: /Criar Deploy Key/i });
      await user.click(createButton);
      
      expect(screen.getByText(/Formato de chave SSH inválido/)).toBeInTheDocument();
    });

    it('should accept valid ssh-rsa key', async () => {
      const user = userEvent.setup();
      mockInvoke.mockResolvedValue({
        data: { success: true },
        error: null,
      });
      
      render(<CreateDeployKeyModal {...defaultProps} />);
      
      const titleInput = screen.getByLabelText('Título');
      const keyInput = screen.getByLabelText('Chave Pública SSH');
      
      await user.type(titleInput, 'Test RSA Key');
      await user.type(keyInput, 'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDtest test@host');
      
      const createButton = screen.getByRole('button', { name: /Criar Deploy Key/i });
      await user.click(createButton);
      
      await waitFor(() => {
        expect(mockInvoke).toHaveBeenCalledWith('github-repo', {
          body: {
            action: 'create-deploy-key',
            title: 'Test RSA Key',
            key: 'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDtest test@host',
            read_only: true,
          },
        });
      });
    });

    it('should accept valid ssh-ed25519 key', async () => {
      const user = userEvent.setup();
      mockInvoke.mockResolvedValue({
        data: { success: true },
        error: null,
      });
      
      render(<CreateDeployKeyModal {...defaultProps} />);
      
      const titleInput = screen.getByLabelText('Título');
      const keyInput = screen.getByLabelText('Chave Pública SSH');
      
      await user.type(titleInput, 'Test ED25519 Key');
      await user.type(keyInput, 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAItest test@host');
      
      const createButton = screen.getByRole('button', { name: /Criar Deploy Key/i });
      await user.click(createButton);
      
      await waitFor(() => {
        expect(mockInvoke).toHaveBeenCalled();
      });
    });

    it('should accept valid ecdsa-sha2-nistp256 key', async () => {
      const user = userEvent.setup();
      mockInvoke.mockResolvedValue({
        data: { success: true },
        error: null,
      });
      
      render(<CreateDeployKeyModal {...defaultProps} />);
      
      const titleInput = screen.getByLabelText('Título');
      const keyInput = screen.getByLabelText('Chave Pública SSH');
      
      await user.type(titleInput, 'Test ECDSA Key');
      await user.type(keyInput, 'ecdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYtest test@host');
      
      const createButton = screen.getByRole('button', { name: /Criar Deploy Key/i });
      await user.click(createButton);
      
      await waitFor(() => {
        expect(mockInvoke).toHaveBeenCalled();
      });
    });

    it('should reject key without proper base64 content', async () => {
      const user = userEvent.setup();
      render(<CreateDeployKeyModal {...defaultProps} />);
      
      const titleInput = screen.getByLabelText('Título');
      const keyInput = screen.getByLabelText('Chave Pública SSH');
      
      await user.type(titleInput, 'Test Key');
      await user.type(keyInput, 'ssh-rsa ');
      
      const createButton = screen.getByRole('button', { name: /Criar Deploy Key/i });
      await user.click(createButton);
      
      expect(screen.getByText(/Formato de chave SSH inválido/)).toBeInTheDocument();
    });
  });

  // ============================================
  // PAT Validation Tests
  // ============================================
  describe('PAT Validation', () => {
    it('should show error for empty token', async () => {
      const user = userEvent.setup();
      render(<CreateDeployKeyModal {...defaultProps} />);
      
      // Switch to PAT tab
      const patTab = screen.getByRole('tab', { name: /Personal Token/i });
      await user.click(patTab);
      
      const validateButton = screen.getByRole('button', { name: /Validar e Salvar Token/i });
      await user.click(validateButton);
      
      expect(mockToast.error).toHaveBeenCalledWith('Cole o Personal Access Token');
    });

    it('should reject token without ghp_ or github_pat_ prefix', async () => {
      const user = userEvent.setup();
      render(<CreateDeployKeyModal {...defaultProps} />);
      
      // Switch to PAT tab
      const patTab = screen.getByRole('tab', { name: /Personal Token/i });
      await user.click(patTab);
      
      const tokenInput = screen.getByLabelText('Personal Access Token');
      await user.type(tokenInput, 'invalid_token_format');
      
      const validateButton = screen.getByRole('button', { name: /Validar e Salvar Token/i });
      await user.click(validateButton);
      
      expect(screen.getByText(/Token inválido. O Personal Access Token deve começar com ghp_ ou github_pat_/)).toBeInTheDocument();
    });

    it('should accept valid ghp_ token and call validate endpoint', async () => {
      const user = userEvent.setup();
      mockInvoke
        .mockResolvedValueOnce({
          data: { success: true, data: { login: 'testuser' } },
          error: null,
        })
        .mockResolvedValueOnce({
          data: { success: true },
          error: null,
        });
      
      render(<CreateDeployKeyModal {...defaultProps} />);
      
      // Switch to PAT tab
      const patTab = screen.getByRole('tab', { name: /Personal Token/i });
      await user.click(patTab);
      
      const tokenInput = screen.getByLabelText('Personal Access Token');
      await user.type(tokenInput, 'ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
      
      const validateButton = screen.getByRole('button', { name: /Validar e Salvar Token/i });
      await user.click(validateButton);
      
      await waitFor(() => {
        expect(mockInvoke).toHaveBeenCalledWith('github-repo', {
          body: {
            action: 'validate-token',
            custom_token: 'ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
          },
        });
      });
    });

    it('should accept valid github_pat_ token', async () => {
      const user = userEvent.setup();
      mockInvoke
        .mockResolvedValueOnce({
          data: { success: true, data: { login: 'testuser' } },
          error: null,
        })
        .mockResolvedValueOnce({
          data: { success: true },
          error: null,
        });
      
      render(<CreateDeployKeyModal {...defaultProps} />);
      
      // Switch to PAT tab
      const patTab = screen.getByRole('tab', { name: /Personal Token/i });
      await user.click(patTab);
      
      const tokenInput = screen.getByLabelText('Personal Access Token');
      await user.type(tokenInput, 'github_pat_11AXXXXXX_xxxxxxxxxxxxxxxxxxxx');
      
      const validateButton = screen.getByRole('button', { name: /Validar e Salvar Token/i });
      await user.click(validateButton);
      
      await waitFor(() => {
        expect(mockInvoke).toHaveBeenCalled();
        expect(mockToast.success).toHaveBeenCalledWith('Token válido! Autenticado como: testuser');
      });
    });
  });

  // ============================================
  // Error 422 Handling Tests
  // ============================================
  describe('Error 422 Handling', () => {
    it('should display "key is already in use" error message', async () => {
      const user = userEvent.setup();
      mockInvoke.mockResolvedValue({
        data: { success: false, error: 'key is already in use' },
        error: null,
      });
      
      render(<CreateDeployKeyModal {...defaultProps} />);
      
      const titleInput = screen.getByLabelText('Título');
      const keyInput = screen.getByLabelText('Chave Pública SSH');
      
      await user.type(titleInput, 'Test Key');
      await user.type(keyInput, 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAItest test@host');
      
      const createButton = screen.getByRole('button', { name: /Criar Deploy Key/i });
      await user.click(createButton);
      
      await waitFor(() => {
        expect(screen.getByText('Esta chave SSH já está em uso em outro repositório. Use uma chave diferente.')).toBeInTheDocument();
      });
    });

    it('should display "key_already_exists" error message', async () => {
      const user = userEvent.setup();
      mockInvoke.mockResolvedValue({
        data: { success: false, error: 'key_already_exists' },
        error: null,
      });
      
      render(<CreateDeployKeyModal {...defaultProps} />);
      
      const titleInput = screen.getByLabelText('Título');
      const keyInput = screen.getByLabelText('Chave Pública SSH');
      
      await user.type(titleInput, 'Test Key');
      await user.type(keyInput, 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAItest test@host');
      
      const createButton = screen.getByRole('button', { name: /Criar Deploy Key/i });
      await user.click(createButton);
      
      await waitFor(() => {
        expect(screen.getByText('Esta chave SSH já existe no repositório.')).toBeInTheDocument();
      });
    });

    it('should display "bad credentials" error message', async () => {
      const user = userEvent.setup();
      mockInvoke.mockResolvedValue({
        data: { success: false, error: 'bad credentials' },
        error: null,
      });
      
      render(<CreateDeployKeyModal {...defaultProps} />);
      
      // Switch to PAT tab
      const patTab = screen.getByRole('tab', { name: /Personal Token/i });
      await user.click(patTab);
      
      const tokenInput = screen.getByLabelText('Personal Access Token');
      await user.type(tokenInput, 'ghp_invalidtoken');
      
      const validateButton = screen.getByRole('button', { name: /Validar e Salvar Token/i });
      await user.click(validateButton);
      
      await waitFor(() => {
        expect(screen.getByText('Token de acesso inválido ou expirado.')).toBeInTheDocument();
      });
    });

    it('should display "validation failed" error message', async () => {
      const user = userEvent.setup();
      mockInvoke.mockResolvedValue({
        data: { success: false, error: 'validation failed for key' },
        error: null,
      });
      
      render(<CreateDeployKeyModal {...defaultProps} />);
      
      const titleInput = screen.getByLabelText('Título');
      const keyInput = screen.getByLabelText('Chave Pública SSH');
      
      await user.type(titleInput, 'Test Key');
      await user.type(keyInput, 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAItest test@host');
      
      const createButton = screen.getByRole('button', { name: /Criar Deploy Key/i });
      await user.click(createButton);
      
      await waitFor(() => {
        expect(screen.getByText('A chave SSH fornecida é inválida. Verifique o formato.')).toBeInTheDocument();
      });
    });

    it('should display "not found" error message', async () => {
      const user = userEvent.setup();
      mockInvoke.mockResolvedValue({
        data: { success: false, error: 'not found' },
        error: null,
      });
      
      render(<CreateDeployKeyModal {...defaultProps} />);
      
      const titleInput = screen.getByLabelText('Título');
      const keyInput = screen.getByLabelText('Chave Pública SSH');
      
      await user.type(titleInput, 'Test Key');
      await user.type(keyInput, 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAItest test@host');
      
      const createButton = screen.getByRole('button', { name: /Criar Deploy Key/i });
      await user.click(createButton);
      
      await waitFor(() => {
        expect(screen.getByText('Repositório não encontrado ou sem permissão de acesso.')).toBeInTheDocument();
      });
    });

    it('should display 401 authentication error', async () => {
      const user = userEvent.setup();
      mockInvoke.mockResolvedValue({
        data: { success: false, error: '401 Unauthorized' },
        error: null,
      });
      
      render(<CreateDeployKeyModal {...defaultProps} />);
      
      const titleInput = screen.getByLabelText('Título');
      const keyInput = screen.getByLabelText('Chave Pública SSH');
      
      await user.type(titleInput, 'Test Key');
      await user.type(keyInput, 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAItest test@host');
      
      const createButton = screen.getByRole('button', { name: /Criar Deploy Key/i });
      await user.click(createButton);
      
      await waitFor(() => {
        expect(screen.getByText('Autenticação falhou. Verifique o token de acesso.')).toBeInTheDocument();
      });
    });

    it('should display 403 permission error', async () => {
      const user = userEvent.setup();
      mockInvoke.mockResolvedValue({
        data: { success: false, error: '403 Forbidden' },
        error: null,
      });
      
      render(<CreateDeployKeyModal {...defaultProps} />);
      
      const titleInput = screen.getByLabelText('Título');
      const keyInput = screen.getByLabelText('Chave Pública SSH');
      
      await user.type(titleInput, 'Test Key');
      await user.type(keyInput, 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAItest test@host');
      
      const createButton = screen.getByRole('button', { name: /Criar Deploy Key/i });
      await user.click(createButton);
      
      await waitFor(() => {
        expect(screen.getByText('Sem permissão para adicionar chaves ao repositório.')).toBeInTheDocument();
      });
    });

    it('should display generic 422 error', async () => {
      const user = userEvent.setup();
      mockInvoke.mockResolvedValue({
        data: { success: false, error: '422 Unprocessable Entity' },
        error: null,
      });
      
      render(<CreateDeployKeyModal {...defaultProps} />);
      
      const titleInput = screen.getByLabelText('Título');
      const keyInput = screen.getByLabelText('Chave Pública SSH');
      
      await user.type(titleInput, 'Test Key');
      await user.type(keyInput, 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAItest test@host');
      
      const createButton = screen.getByRole('button', { name: /Criar Deploy Key/i });
      await user.click(createButton);
      
      await waitFor(() => {
        expect(screen.getByText('Dados inválidos. Verifique a chave e o título.')).toBeInTheDocument();
      });
    });

    it('should display generic error for unknown errors', async () => {
      const user = userEvent.setup();
      mockInvoke.mockResolvedValue({
        data: { success: false, error: 'Something completely unexpected happened' },
        error: null,
      });
      
      render(<CreateDeployKeyModal {...defaultProps} />);
      
      const titleInput = screen.getByLabelText('Título');
      const keyInput = screen.getByLabelText('Chave Pública SSH');
      
      await user.type(titleInput, 'Test Key');
      await user.type(keyInput, 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAItest test@host');
      
      const createButton = screen.getByRole('button', { name: /Criar Deploy Key/i });
      await user.click(createButton);
      
      await waitFor(() => {
        expect(screen.getByText('Something completely unexpected happened')).toBeInTheDocument();
      });
    });
  });

  // ============================================
  // User Interaction Tests
  // ============================================
  describe('User Interactions', () => {
    it('should call onSuccess after successful deploy key creation', async () => {
      const user = userEvent.setup();
      mockInvoke.mockResolvedValue({
        data: { success: true },
        error: null,
      });
      
      render(<CreateDeployKeyModal {...defaultProps} />);
      
      const titleInput = screen.getByLabelText('Título');
      const keyInput = screen.getByLabelText('Chave Pública SSH');
      
      await user.type(titleInput, 'Test Key');
      await user.type(keyInput, 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAItest test@host');
      
      const createButton = screen.getByRole('button', { name: /Criar Deploy Key/i });
      await user.click(createButton);
      
      await waitFor(() => {
        expect(defaultProps.onSuccess).toHaveBeenCalled();
        expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false);
        expect(mockToast.success).toHaveBeenCalledWith('Deploy key criada com sucesso!');
      });
    });

    it('should call onSuccess after successful token validation and save', async () => {
      const user = userEvent.setup();
      mockInvoke
        .mockResolvedValueOnce({
          data: { success: true, data: { login: 'testuser' } },
          error: null,
        })
        .mockResolvedValueOnce({
          data: { success: true },
          error: null,
        });
      
      render(<CreateDeployKeyModal {...defaultProps} />);
      
      // Switch to PAT tab
      const patTab = screen.getByRole('tab', { name: /Personal Token/i });
      await user.click(patTab);
      
      const tokenInput = screen.getByLabelText('Personal Access Token');
      await user.type(tokenInput, 'ghp_validtokentestxxxxxxxxxxxxxxxxxxxx');
      
      const validateButton = screen.getByRole('button', { name: /Validar e Salvar Token/i });
      await user.click(validateButton);
      
      await waitFor(() => {
        expect(mockToast.success).toHaveBeenCalledWith('Token válido! Autenticado como: testuser');
      });
      
      await waitFor(() => {
        expect(mockToast.success).toHaveBeenCalledWith('Token salvo com sucesso!');
        expect(defaultProps.onSuccess).toHaveBeenCalled();
      });
    });

    it('should reset form when modal is closed via Cancel', async () => {
      const user = userEvent.setup();
      render(<CreateDeployKeyModal {...defaultProps} />);
      
      const titleInput = screen.getByLabelText('Título');
      await user.type(titleInput, 'Test Title');
      
      const cancelButton = screen.getByRole('button', { name: /Cancelar/i });
      await user.click(cancelButton);
      
      expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false);
    });

    it('should show loading state during deploy key creation', async () => {
      const user = userEvent.setup();
      mockInvoke.mockImplementation(() => new Promise(() => {})); // Never resolves
      
      render(<CreateDeployKeyModal {...defaultProps} />);
      
      const titleInput = screen.getByLabelText('Título');
      const keyInput = screen.getByLabelText('Chave Pública SSH');
      
      await user.type(titleInput, 'Test Key');
      await user.type(keyInput, 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAItest test@host');
      
      const createButton = screen.getByRole('button', { name: /Criar Deploy Key/i });
      await user.click(createButton);
      
      expect(await screen.findByText('Criando...')).toBeInTheDocument();
    });

    it('should show validation state during token validation', async () => {
      const user = userEvent.setup();
      mockInvoke.mockImplementation(() => new Promise(() => {})); // Never resolves
      
      render(<CreateDeployKeyModal {...defaultProps} />);
      
      // Switch to PAT tab
      const patTab = screen.getByRole('tab', { name: /Personal Token/i });
      await user.click(patTab);
      
      const tokenInput = screen.getByLabelText('Personal Access Token');
      await user.type(tokenInput, 'ghp_testtoken');
      
      const validateButton = screen.getByRole('button', { name: /Validar e Salvar Token/i });
      await user.click(validateButton);
      
      expect(await screen.findByText('Validando...')).toBeInTheDocument();
    });

    it('should clear validation error when key input changes', async () => {
      const user = userEvent.setup();
      render(<CreateDeployKeyModal {...defaultProps} />);
      
      const titleInput = screen.getByLabelText('Título');
      const keyInput = screen.getByLabelText('Chave Pública SSH');
      
      await user.type(titleInput, 'Test Key');
      await user.type(keyInput, 'invalid-key');
      
      const createButton = screen.getByRole('button', { name: /Criar Deploy Key/i });
      await user.click(createButton);
      
      expect(screen.getByText(/Formato de chave SSH inválido/)).toBeInTheDocument();
      
      // Type in the key field to clear the error
      await user.type(keyInput, 'more-text');
      
      expect(screen.queryByText(/Formato de chave SSH inválido/)).not.toBeInTheDocument();
    });

    it('should disable buttons during loading', async () => {
      const user = userEvent.setup();
      mockInvoke.mockImplementation(() => new Promise(() => {})); // Never resolves
      
      render(<CreateDeployKeyModal {...defaultProps} />);
      
      const titleInput = screen.getByLabelText('Título');
      const keyInput = screen.getByLabelText('Chave Pública SSH');
      
      await user.type(titleInput, 'Test Key');
      await user.type(keyInput, 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAItest test@host');
      
      const createButton = screen.getByRole('button', { name: /Criar Deploy Key/i });
      await user.click(createButton);
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Criando.../i })).toBeDisabled();
        expect(screen.getByRole('button', { name: /Cancelar/i })).toBeDisabled();
      });
    });

    it('should handle Edge Function error response', async () => {
      const user = userEvent.setup();
      mockInvoke.mockResolvedValue({
        data: null,
        error: new Error('Edge Function error: Invalid request'),
      });
      
      render(<CreateDeployKeyModal {...defaultProps} />);
      
      const titleInput = screen.getByLabelText('Título');
      const keyInput = screen.getByLabelText('Chave Pública SSH');
      
      await user.type(titleInput, 'Test Key');
      await user.type(keyInput, 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAItest test@host');
      
      const createButton = screen.getByRole('button', { name: /Criar Deploy Key/i });
      await user.click(createButton);
      
      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalled();
      });
    });
  });

  // ============================================
  // getErrorMessage Function Tests
  // ============================================
  describe('getErrorMessage Coverage', () => {
    it('should handle Error objects', async () => {
      const user = userEvent.setup();
      mockInvoke.mockRejectedValue(new Error('key is already in use'));
      
      render(<CreateDeployKeyModal {...defaultProps} />);
      
      const titleInput = screen.getByLabelText('Título');
      const keyInput = screen.getByLabelText('Chave Pública SSH');
      
      await user.type(titleInput, 'Test Key');
      await user.type(keyInput, 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAItest test@host');
      
      const createButton = screen.getByRole('button', { name: /Criar Deploy Key/i });
      await user.click(createButton);
      
      await waitFor(() => {
        expect(screen.getByText('Esta chave SSH já está em uso em outro repositório. Use uma chave diferente.')).toBeInTheDocument();
      });
    });

    it('should handle non-Error objects (strings)', async () => {
      const user = userEvent.setup();
      mockInvoke.mockRejectedValue('validation failed');
      
      render(<CreateDeployKeyModal {...defaultProps} />);
      
      const titleInput = screen.getByLabelText('Título');
      const keyInput = screen.getByLabelText('Chave Pública SSH');
      
      await user.type(titleInput, 'Test Key');
      await user.type(keyInput, 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAItest test@host');
      
      const createButton = screen.getByRole('button', { name: /Criar Deploy Key/i });
      await user.click(createButton);
      
      await waitFor(() => {
        expect(screen.getByText('A chave SSH fornecida é inválida. Verifique o formato.')).toBeInTheDocument();
      });
    });
  });
});
