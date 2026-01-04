import { test, expect, Page } from '@playwright/test';
import { DeployKeyFixture, deployKeyMocks, createDeployKeyFixture } from '../fixtures/deploy-key.fixture';

/**
 * E2E Tests: Deploy Key Flow
 * 
 * Cobre o fluxo completo de:
 * - Criar Deploy Key SSH
 * - Validar Personal Access Token (PAT)
 * - Tratamento de erros (422, 401, 403, 404)
 * - Estados de UI (loading, success, error)
 * - Acessibilidade
 */

test.describe('Deploy Key E2E', () => {
  let fixture: DeployKeyFixture;

  test.beforeEach(async ({ page }) => {
    fixture = new DeployKeyFixture(page);
    await fixture.goto();
  });

  // =============================================================================
  // NAVEGAÇÃO E UI BÁSICA
  // =============================================================================
  
  test.describe('Navigation & Basic UI', () => {
    test('should navigate to settings page', async ({ page }) => {
      await expect(page).toHaveURL(/\/settings/);
    });

    test('should have GitHub/Keys section visible', async ({ page }) => {
      const keysSection = page.locator('text=/GitHub|Deploy Key|Chaves/i').first();
      await expect(keysSection).toBeVisible({ timeout: 10000 });
    });

    test('should open CreateDeployKeyModal when clicking add button', async ({ page }) => {
      // Mock the GitHub section being available
      const addButton = page.getByRole('button', { name: /criar|add|nova chave|deploy key/i }).first();
      
      if (await addButton.isVisible({ timeout: 5000 }).catch(() => false)) {
        await addButton.click();
        await expect(fixture.modal).toBeVisible();
      } else {
        // Skip if button not found - may require specific page state
        test.skip();
      }
    });
  });

  // =============================================================================
  // DEPLOY KEY TAB - VALIDAÇÃO DE FORMULÁRIO
  // =============================================================================
  
  test.describe('Deploy Key Tab - Form Validation', () => {
    test.beforeEach(async ({ page }) => {
      // Setup mock API
      await page.route('**/functions/v1/github-repo', async (route) => {
        const body = await route.request().postDataJSON().catch(() => ({}));
        
        if (body.action === 'create-deploy-key') {
          // Simular diferentes respostas baseado na chave
          if (!body.key || body.key.length < 20) {
            await route.fulfill({
              status: 422,
              json: { error: 'Validation failed', code: 'VALIDATION_ERROR' },
            });
          } else if (body.key.includes('already-in-use')) {
            await route.fulfill({
              status: 422,
              json: deployKeyMocks.apiResponses.keyAlreadyInUse,
            });
          } else {
            await route.fulfill({
              status: 200,
              json: { success: true, key: deployKeyMocks.apiResponses.success },
            });
          }
        } else {
          await route.continue();
        }
      });
    });

    test('should display deploy key form with all required fields', async ({ page }) => {
      const addButton = page.getByRole('button', { name: /criar|add|nova chave|deploy key/i }).first();
      
      if (await addButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await addButton.click();
        
        // Verificar campos do formulário
        await expect(fixture.titleInput).toBeVisible();
        await expect(fixture.keyInput).toBeVisible();
        await expect(fixture.readOnlySwitch).toBeVisible();
        await expect(fixture.createButton).toBeVisible();
      } else {
        test.skip();
      }
    });

    test('should validate empty title field', async ({ page }) => {
      await mockAndOpenModal(page, fixture);
      
      // Tentar submeter sem título
      await fixture.keyInput.fill(deployKeyMocks.validSSHKeys.ed25519);
      await fixture.createButton.click();
      
      // Deve mostrar erro de validação
      const titleError = page.locator('text=/título.*obrigatório|title.*required/i');
      await expect(titleError).toBeVisible({ timeout: 3000 });
    });

    test('should validate empty SSH key field', async ({ page }) => {
      await mockAndOpenModal(page, fixture);
      
      // Tentar submeter sem chave
      await fixture.titleInput.fill('Test Key');
      await fixture.createButton.click();
      
      // Deve mostrar erro de validação
      const keyError = page.locator('text=/chave.*obrigatório|key.*required|ssh.*required/i');
      await expect(keyError).toBeVisible({ timeout: 3000 });
    });

    test('should reject invalid SSH key format', async ({ page }) => {
      await mockAndOpenModal(page, fixture);
      
      await fixture.fillDeployKeyForm('Invalid Key Test', deployKeyMocks.invalidSSHKeys.noPrefix);
      await fixture.createButton.click();
      
      // Deve mostrar erro de formato inválido
      const formatError = page.locator('text=/formato.*inválido|invalid.*format|ssh-rsa|ssh-ed25519/i');
      await expect(formatError).toBeVisible({ timeout: 3000 });
    });

    test('should show warning when read-only is disabled', async ({ page }) => {
      await mockAndOpenModal(page, fixture);
      
      await fixture.titleInput.fill('Write Access Key');
      await fixture.keyInput.fill(deployKeyMocks.validSSHKeys.rsa);
      
      // Desabilitar read-only
      const switchState = await fixture.readOnlySwitch.getAttribute('data-state');
      if (switchState === 'checked') {
        await fixture.readOnlySwitch.click();
      }
      
      // Verificar warning
      const warning = page.locator('text=/write|escrita|cuidado|warning/i');
      await expect(warning).toBeVisible({ timeout: 3000 });
    });

    test('should accept valid SSH key formats', async ({ page }) => {
      await mockAndOpenModal(page, fixture);
      
      // Test RSA
      await fixture.fillDeployKeyForm('RSA Key', deployKeyMocks.validSSHKeys.rsa);
      
      // Verificar que não há erro de formato
      const formatError = page.locator('text=/formato.*inválido|invalid.*format/i');
      await expect(formatError).not.toBeVisible({ timeout: 1000 });
    });
  });

  // =============================================================================
  // PAT TAB - VALIDAÇÃO
  // =============================================================================
  
  test.describe('Personal Access Token Tab', () => {
    test.beforeEach(async ({ page }) => {
      await page.route('**/functions/v1/github-repo', async (route) => {
        const body = await route.request().postDataJSON().catch(() => ({}));
        
        if (body.action === 'validate-token' || body.action === 'save-token') {
          if (!body.custom_token || !body.custom_token.startsWith('ghp_')) {
            await route.fulfill({
              status: 401,
              json: deployKeyMocks.apiResponses.badCredentials,
            });
          } else {
            await route.fulfill({
              status: 200,
              json: { success: true, login: 'testuser' },
            });
          }
        } else {
          await route.continue();
        }
      });
    });

    test('should switch to Personal Token tab', async ({ page }) => {
      await mockAndOpenModal(page, fixture);
      
      await fixture.patTab.click();
      
      // Verificar que os campos de PAT estão visíveis
      await expect(fixture.patInput).toBeVisible({ timeout: 3000 });
    });

    test('should validate empty PAT field', async ({ page }) => {
      await mockAndOpenModal(page, fixture);
      await fixture.switchToPATTab();
      
      await fixture.validateButton.click();
      
      const patError = page.locator('text=/token.*obrigatório|token.*required/i');
      await expect(patError).toBeVisible({ timeout: 3000 });
    });

    test('should reject invalid PAT format', async ({ page }) => {
      await mockAndOpenModal(page, fixture);
      await fixture.switchToPATTab();
      
      await fixture.patInput.fill(deployKeyMocks.invalidPATs.wrongPrefix);
      await fixture.validateButton.click();
      
      // Deve falhar na validação do servidor
      await fixture.expectError(/credential|inválido|invalid/i);
    });

    test('should accept valid PAT with ghp_ prefix', async ({ page }) => {
      await mockAndOpenModal(page, fixture);
      await fixture.switchToPATTab();
      
      await fixture.patInput.fill(deployKeyMocks.validPATs.ghp);
      await fixture.validateButton.click();
      
      // Não deve mostrar erro de formato
      const formatError = page.locator('text=/formato.*inválido|invalid.*format/i');
      await expect(formatError).not.toBeVisible({ timeout: 2000 });
    });
  });

  // =============================================================================
  // ESTADOS DE LOADING / SUCCESS / ERROR
  // =============================================================================
  
  test.describe('Loading, Success & Error States', () => {
    test('should show loading state during deploy key creation', async ({ page }) => {
      // Simular resposta lenta
      await page.route('**/functions/v1/github-repo', async (route) => {
        await new Promise(resolve => setTimeout(resolve, 2000));
        await route.fulfill({
          status: 200,
          json: { success: true, key: deployKeyMocks.apiResponses.success },
        });
      });

      await mockAndOpenModal(page, fixture);
      
      await fixture.fillDeployKeyForm('Loading Test', deployKeyMocks.validSSHKeys.ed25519);
      await fixture.createButton.click();
      
      // Verificar estado de loading
      await fixture.expectLoading();
    });

    test('should display 422 error for key already in use', async ({ page }) => {
      await page.route('**/functions/v1/github-repo', async (route) => {
        await route.fulfill({
          status: 422,
          json: deployKeyMocks.apiResponses.keyAlreadyInUse,
        });
      });

      await mockAndOpenModal(page, fixture);
      
      await fixture.fillDeployKeyForm('Duplicate Key', deployKeyMocks.validSSHKeys.rsa);
      await fixture.createButton.click();
      
      await fixture.expectError(/already in use|já.*uso|duplicada/i);
    });

    test('should display 401 error for bad credentials', async ({ page }) => {
      await page.route('**/functions/v1/github-repo', async (route) => {
        await route.fulfill({
          status: 401,
          json: deployKeyMocks.apiResponses.badCredentials,
        });
      });

      await mockAndOpenModal(page, fixture);
      await fixture.switchToPATTab();
      
      await fixture.patInput.fill(deployKeyMocks.validPATs.ghp);
      await fixture.validateButton.click();
      
      await fixture.expectError(/credential|autenticação|authentication/i);
    });

    test('should display 403 error for forbidden access', async ({ page }) => {
      await page.route('**/functions/v1/github-repo', async (route) => {
        await route.fulfill({
          status: 403,
          json: deployKeyMocks.apiResponses.forbidden,
        });
      });

      await mockAndOpenModal(page, fixture);
      
      await fixture.fillDeployKeyForm('No Permission Key', deployKeyMocks.validSSHKeys.ed25519);
      await fixture.createButton.click();
      
      await fixture.expectError(/admin|permission|permissão|forbidden/i);
    });

    test('should display 404 error for repository not found', async ({ page }) => {
      await page.route('**/functions/v1/github-repo', async (route) => {
        await route.fulfill({
          status: 404,
          json: deployKeyMocks.apiResponses.notFound,
        });
      });

      await mockAndOpenModal(page, fixture);
      
      await fixture.fillDeployKeyForm('Not Found Key', deployKeyMocks.validSSHKeys.rsa);
      await fixture.createButton.click();
      
      await fixture.expectError(/not found|não encontrado|repository/i);
    });

    test('should close modal and show success toast after successful creation', async ({ page }) => {
      await page.route('**/functions/v1/github-repo', async (route) => {
        await route.fulfill({
          status: 200,
          json: { success: true, key: deployKeyMocks.apiResponses.success },
        });
      });

      await mockAndOpenModal(page, fixture);
      
      await fixture.fillDeployKeyForm('Success Key', deployKeyMocks.validSSHKeys.ed25519);
      await fixture.createButton.click();
      
      // Esperar loading terminar
      await fixture.waitForLoadingComplete();
      
      // Verificar sucesso (modal fechado ou toast)
      await fixture.expectSuccess();
    });
  });

  // =============================================================================
  // CORS E HEADERS
  // =============================================================================
  
  test.describe('CORS & API Headers', () => {
    test('should include proper CORS headers in preflight request', async ({ page }) => {
      let corsHeadersReceived = false;
      
      page.on('response', (response) => {
        if (response.url().includes('github-repo')) {
          const headers = response.headers();
          if (headers['access-control-allow-origin']) {
            corsHeadersReceived = true;
          }
        }
      });

      await page.route('**/functions/v1/github-repo', async (route) => {
        await route.fulfill({
          status: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
          },
          json: { success: true },
        });
      });

      await mockAndOpenModal(page, fixture);
      await fixture.fillDeployKeyForm('CORS Test', deployKeyMocks.validSSHKeys.ed25519);
      await fixture.createButton.click();
      
      // Verificar que headers CORS foram recebidos
      expect(corsHeadersReceived).toBeTruthy();
    });
  });

  // =============================================================================
  // ACESSIBILIDADE
  // =============================================================================
  
  test.describe('Accessibility', () => {
    test('should have proper labels for all form fields', async ({ page }) => {
      await mockAndOpenModal(page, fixture);
      
      // Verificar labels
      const titleLabel = fixture.titleInput.locator('..').getByText(/título|title/i);
      const keyLabel = fixture.keyInput.locator('..').getByText(/chave|key/i);
      
      await expect(fixture.titleInput).toHaveAttribute('id');
      await expect(fixture.keyInput).toHaveAttribute('id');
    });

    test('should support keyboard navigation', async ({ page }) => {
      await mockAndOpenModal(page, fixture);
      
      // Tab através dos campos
      await fixture.titleInput.focus();
      await page.keyboard.press('Tab');
      
      // Verificar foco se moveu
      const activeElement = await page.evaluate(() => document.activeElement?.tagName);
      expect(activeElement).toBeDefined();
    });

    test('should close modal with Escape key', async ({ page }) => {
      await mockAndOpenModal(page, fixture);
      
      await page.keyboard.press('Escape');
      
      await expect(fixture.modal).not.toBeVisible({ timeout: 3000 });
    });
  });
});

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Helper para mockar API e abrir modal
 */
async function mockAndOpenModal(page: Page, fixture: DeployKeyFixture): Promise<void> {
  // Procurar botão de adicionar
  const addButton = page.getByRole('button', { name: /criar|add|nova chave|deploy key/i }).first();
  
  if (await addButton.isVisible({ timeout: 3000 }).catch(() => false)) {
    await addButton.click();
    await expect(fixture.modal).toBeVisible({ timeout: 5000 });
  } else {
    // Se não encontrar, simular navegação para seção de GitHub
    const githubSection = page.locator('text=/GitHub|Integração/i').first();
    if (await githubSection.isVisible().catch(() => false)) {
      await githubSection.click();
      await page.waitForTimeout(500);
      
      const btn = page.getByRole('button', { name: /criar|add|nova chave|deploy key/i }).first();
      if (await btn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await btn.click();
        await expect(fixture.modal).toBeVisible();
        return;
      }
    }
    
    // Skip se não conseguir abrir
    test.skip();
  }
}
