import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y, getViolations } from 'axe-playwright';

/**
 * E2E Test: Accessibility - Complete Audit
 * 
 * Testa conformidade com WCAG 2.1 Level AA usando axe-core.
 * Verifica todas as páginas principais da aplicação.
 * 
 * @group a11y
 * @group critical
 */

test.describe('Accessibility - Complete Audit', () => {
  test.beforeEach(async ({ page }) => {
    // Injetar axe-core em todas as páginas
    await page.goto('/');
    await injectAxe(page);
  });
  
  test('Landing Page should be accessible', async ({ page }) => {
    await page.goto('/');
    await injectAxe(page);
    
    // Verificar acessibilidade
    await checkA11y(page, null, {
      detailedReport: true,
      detailedReportOptions: {
        html: true,
      },
    });
  });
  
  test('Dashboard should be accessible', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password').fill('password');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForURL('/dashboard');
    
    await injectAxe(page);
    await checkA11y(page);
  });
  
  test('Player should be accessible', async ({ page }) => {
    await page.goto('/player');
    await injectAxe(page);
    
    // Verificar acessibilidade do player
    await checkA11y(page, '#player-container', {
      rules: {
        // Regras específicas para o player
        'color-contrast': { enabled: true },
        'button-name': { enabled: true },
        'aria-required-attr': { enabled: true },
      },
    });
  });
  
  test('Settings should be accessible', async ({ page }) => {
    await page.goto('/settings');
    await injectAxe(page);
    await checkA11y(page);
  });
  
  test('should have no critical violations across all pages', async ({ page }) => {
    const pages = [
      '/',
      '/dashboard',
      '/player',
      '/settings',
      '/spotify',
      '/youtube',
      '/jam',
      '/help',
    ];
    
    for (const url of pages) {
      await page.goto(url);
      await injectAxe(page);
      
      const violations = await getViolations(page, null, {
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
        },
      });
      
      // Filtrar apenas violações críticas
      const criticalViolations = violations.filter(v => 
        v.impact === 'critical' || v.impact === 'serious'
      );
      
      expect(criticalViolations, `Critical violations found on ${url}`).toHaveLength(0);
    }
  });
  
  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Verificar hierarquia de headings
    const h1 = await page.locator('h1').count();
    const h2 = await page.locator('h2').count();
    const h3 = await page.locator('h3').count();
    
    // Deve ter exatamente um H1
    expect(h1).toBe(1);
    
    // Deve ter pelo menos um H2
    expect(h2).toBeGreaterThan(0);
    
    // H3 só deve existir se houver H2
    if (h3 > 0) {
      expect(h2).toBeGreaterThan(0);
    }
  });
  
  test('should have proper landmark regions', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Verificar landmarks obrigatórios
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('nav')).toBeVisible();
    
    // Verificar aria-labels em landmarks múltiplos
    const navs = await page.locator('nav').count();
    if (navs > 1) {
      const navsWithLabel = await page.locator('nav[aria-label]').count();
      expect(navsWithLabel).toBe(navs);
    }
  });
  
  test('should have skip links', async ({ page }) => {
    await page.goto('/');
    
    // Tab para o primeiro elemento (skip link)
    await page.keyboard.press('Tab');
    
    // Verificar se é o skip link
    const focused = page.locator(':focus');
    await expect(focused).toHaveText(/skip|pular/i);
    
    // Pressionar Enter
    await page.keyboard.press('Enter');
    
    // Verificar se pulou para o conteúdo principal
    const mainFocused = page.locator('main :focus');
    await expect(mainFocused).toBeVisible();
  });
});
