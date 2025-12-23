import { Page, Locator, expect } from '@playwright/test';

/**
 * Deploy Key Fixture - Page Object para testes E2E do fluxo Deploy Key
 * 
 * Cobre:
 * - CreateDeployKeyModal
 * - Deploy Key tab
 * - Personal Access Token (PAT) tab
 * - Validações de formulário
 * - Estados de loading/success/error
 */
export class DeployKeyFixture {
  readonly page: Page;
  
  // Modal principal
  readonly modal: Locator;
  readonly modalTitle: Locator;
  readonly closeButton: Locator;
  
  // Tabs
  readonly deployKeyTab: Locator;
  readonly patTab: Locator;
  
  // Deploy Key form
  readonly titleInput: Locator;
  readonly keyInput: Locator;
  readonly readOnlySwitch: Locator;
  readonly readOnlyWarning: Locator;
  readonly createButton: Locator;
  
  // PAT form
  readonly tokenNameInput: Locator;
  readonly patInput: Locator;
  readonly validateButton: Locator;
  
  // Status elements
  readonly loadingSpinner: Locator;
  readonly errorMessage: Locator;
  readonly successMessage: Locator;
  
  // Key list
  readonly keysList: Locator;
  readonly keyItem: Locator;
  readonly deleteKeyButton: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Modal
    this.modal = page.getByRole('dialog').filter({ hasText: /Deploy Key|Chave de Deploy/i });
    this.modalTitle = this.modal.getByRole('heading');
    this.closeButton = this.modal.getByRole('button', { name: /close|fechar/i });
    
    // Tabs
    this.deployKeyTab = this.modal.getByRole('tab', { name: /Deploy Key|Chave SSH/i });
    this.patTab = this.modal.getByRole('tab', { name: /Personal|Token|PAT/i });
    
    // Deploy Key form fields
    this.titleInput = this.modal.getByLabel(/título|title|nome da chave/i);
    this.keyInput = this.modal.getByLabel(/chave ssh|ssh key|public key/i);
    this.readOnlySwitch = this.modal.locator('[role="switch"]');
    this.readOnlyWarning = this.modal.locator('text=/write access|acesso de escrita|warning/i');
    this.createButton = this.modal.getByRole('button', { name: /criar|create|adicionar|add/i });
    
    // PAT form fields
    this.tokenNameInput = this.modal.getByLabel(/nome do token|token name/i);
    this.patInput = this.modal.getByLabel(/personal access token|pat|token/i);
    this.validateButton = this.modal.getByRole('button', { name: /validar|validate|salvar|save/i });
    
    // Status elements
    this.loadingSpinner = this.modal.locator('[data-testid="loading-spinner"], .animate-spin');
    this.errorMessage = this.modal.locator('[role="alert"], .text-destructive, .error-message');
    this.successMessage = this.modal.locator('.text-green, .success-message, [data-testid="success"]');
    
    // Key list
    this.keysList = page.locator('[data-testid="deploy-keys-list"], .keys-list');
    this.keyItem = this.keysList.locator('[data-testid="key-item"], .key-item');
    this.deleteKeyButton = page.getByRole('button', { name: /delete|remover|excluir/i });
  }

  /**
   * Navega para a página de configurações/GitHub e abre o modal
   */
  async goto(): Promise<void> {
    await this.page.goto('/settings');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Abre o modal de criar Deploy Key
   */
  async openModal(): Promise<void> {
    const createKeyButton = this.page.getByRole('button', { name: /criar deploy key|add deploy key|nova chave/i });
    await createKeyButton.click();
    await expect(this.modal).toBeVisible({ timeout: 5000 });
  }

  /**
   * Fecha o modal
   */
  async closeModal(): Promise<void> {
    const closeBtn = this.modal.getByRole('button').filter({ has: this.page.locator('svg[class*="x"], [data-lucide="x"]') }).first();
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
    } else {
      // Fallback: pressionar Escape
      await this.page.keyboard.press('Escape');
    }
    await expect(this.modal).not.toBeVisible({ timeout: 3000 });
  }

  /**
   * Alterna para a tab de Deploy Key
   */
  async switchToDeployKeyTab(): Promise<void> {
    await this.deployKeyTab.click();
    await expect(this.titleInput).toBeVisible();
  }

  /**
   * Alterna para a tab de PAT
   */
  async switchToPATTab(): Promise<void> {
    await this.patTab.click();
    await expect(this.patInput).toBeVisible();
  }

  /**
   * Preenche o formulário de Deploy Key
   */
  async fillDeployKeyForm(title: string, sshKey: string, readOnly = true): Promise<void> {
    await this.titleInput.fill(title);
    await this.keyInput.fill(sshKey);
    
    const isCurrentlyChecked = await this.readOnlySwitch.getAttribute('data-state') === 'checked';
    if (isCurrentlyChecked !== readOnly) {
      await this.readOnlySwitch.click();
    }
  }

  /**
   * Submete o formulário de Deploy Key
   */
  async submitDeployKey(title: string, sshKey: string, readOnly = true): Promise<void> {
    await this.fillDeployKeyForm(title, sshKey, readOnly);
    await this.createButton.click();
  }

  /**
   * Preenche e submete o formulário de PAT
   */
  async submitPAT(token: string, tokenName?: string): Promise<void> {
    await this.switchToPATTab();
    
    if (tokenName) {
      await this.tokenNameInput.fill(tokenName);
    }
    await this.patInput.fill(token);
    await this.validateButton.click();
  }

  /**
   * Verifica se há mensagem de erro visível
   */
  async expectError(messagePattern?: string | RegExp): Promise<void> {
    await expect(this.errorMessage).toBeVisible({ timeout: 5000 });
    
    if (messagePattern) {
      await expect(this.errorMessage).toContainText(messagePattern);
    }
  }

  /**
   * Verifica se há indicação de sucesso
   */
  async expectSuccess(): Promise<void> {
    // O modal deve fechar ou mostrar mensagem de sucesso
    const modalHidden = await this.modal.isHidden().catch(() => false);
    const successVisible = await this.successMessage.isVisible().catch(() => false);
    const toastVisible = await this.page.locator('[data-sonner-toast]').isVisible().catch(() => false);
    
    expect(modalHidden || successVisible || toastVisible).toBeTruthy();
  }

  /**
   * Verifica estado de loading
   */
  async expectLoading(): Promise<void> {
    const spinnerVisible = await this.loadingSpinner.isVisible().catch(() => false);
    const buttonDisabled = await this.createButton.isDisabled().catch(() => false);
    
    expect(spinnerVisible || buttonDisabled).toBeTruthy();
  }

  /**
   * Espera o loading terminar
   */
  async waitForLoadingComplete(): Promise<void> {
    await expect(this.loadingSpinner).not.toBeVisible({ timeout: 10000 });
  }

  /**
   * Verifica se o aviso de write access aparece quando read-only está desativado
   */
  async expectWriteAccessWarning(): Promise<void> {
    await expect(this.readOnlyWarning).toBeVisible();
  }

  /**
   * Verifica se o aviso de write access NÃO aparece
   */
  async expectNoWriteAccessWarning(): Promise<void> {
    await expect(this.readOnlyWarning).not.toBeVisible();
  }

  /**
   * Obtém o número de chaves listadas
   */
  async getKeysCount(): Promise<number> {
    return this.keyItem.count();
  }

  /**
   * Deleta uma chave pelo índice
   */
  async deleteKey(index: number): Promise<void> {
    const key = this.keyItem.nth(index);
    const deleteBtn = key.getByRole('button', { name: /delete|remover/i });
    await deleteBtn.click();
    
    // Confirmar deleção se houver dialog
    const confirmBtn = this.page.getByRole('button', { name: /confirm|confirmar|sim/i });
    if (await confirmBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
      await confirmBtn.click();
    }
  }
}

/**
 * Mock de respostas da API para testes
 */
export const deployKeyMocks = {
  validSSHKeys: {
    rsa: 'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQC7vbqajDRjvE5x user@host',
    ed25519: 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIGVLbh user@host',
    ecdsa: 'ecdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTI user@host',
  },
  
  invalidSSHKeys: {
    empty: '',
    noPrefix: 'AAAAB3NzaC1yc2EAAAADAQABAAABgQC7vbqajDRjvE5x user@host',
    wrongPrefix: 'invalid-key AAAAB3NzaC1yc2EAAAADAQABAAAB user@host',
    tooShort: 'ssh-rsa AAAA',
  },
  
  validPATs: {
    ghp: 'ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    github_pat: 'github_pat_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  },
  
  invalidPATs: {
    empty: '',
    wrongPrefix: 'gho_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    tooShort: 'ghp_xxx',
  },
  
  apiResponses: {
    success: {
      id: 12345,
      title: 'Lovable Deploy Key',
      read_only: true,
      created_at: new Date().toISOString(),
    },
    keyAlreadyInUse: {
      error: 'key is already in use',
      code: 'KEY_ALREADY_IN_USE',
    },
    keyAlreadyExists: {
      error: 'key_already_exists',
      code: 'KEY_ALREADY_EXISTS',
    },
    badCredentials: {
      error: 'Bad credentials',
      code: 'BAD_CREDENTIALS',
    },
    notFound: {
      error: 'Not Found',
      code: 'NOT_FOUND',
    },
    forbidden: {
      error: 'Must have admin rights to Repository',
      code: 'FORBIDDEN',
    },
  },
};

/**
 * Factory para criar fixture já navegado
 */
export async function createDeployKeyFixture(page: Page): Promise<DeployKeyFixture> {
  const fixture = new DeployKeyFixture(page);
  await fixture.goto();
  return fixture;
}
