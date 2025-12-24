import { test, expect } from '../fixtures/auth';
import { PlayerHelper } from '../helpers/player';

/**
 * E2E Test: Player - Full Workflow
 * 
 * Testa o fluxo completo de uso do player:
 * 1. Buscar música
 * 2. Adicionar à fila
 * 3. Reproduzir
 * 4. Controlar reprodução (pause, skip, volume)
 * 5. Gerenciar fila
 * 
 * @group player
 * @group critical
 */

test.describe('Player - Full Workflow', () => {
  let player: PlayerHelper;
  
  test.beforeEach(async ({ authenticatedPage }) => {
    player = new PlayerHelper(authenticatedPage);
    
    // Navegar para o player
    await authenticatedPage.goto('/player');
    await expect(authenticatedPage).toHaveURL('/player');
    
    // Aguardar player carregar
    await expect(authenticatedPage.getByTestId('player-container')).toBeVisible();
  });
  
  test('should complete full playback workflow', async ({ authenticatedPage }) => {
    // ========================================
    // 1. BUSCAR MÚSICA
    // ========================================
    await test.step('Search for music', async () => {
      const searchInput = authenticatedPage.getByPlaceholder('Search music');
      await searchInput.fill('Bohemian Rhapsody');
      await searchInput.press('Enter');
      
      // Aguardar resultados
      await expect(authenticatedPage.getByText('Bohemian Rhapsody')).toBeVisible();
    });
    
    // ========================================
    // 2. ADICIONAR À FILA
    // ========================================
    await test.step('Add tracks to queue', async () => {
      // Adicionar 3 músicas
      await player.addToQueue('Bohemian Rhapsody');
      await player.addToQueue('We Will Rock You');
      await player.addToQueue('We Are The Champions');
      
      // Verificar fila
      await player.assertQueueSize(3);
    });
    
    // ========================================
    // 3. REPRODUZIR
    // ========================================
    await test.step('Play first track', async () => {
      await player.play();
      await player.assertIsPlaying();
      await player.assertCurrentTrack('Bohemian Rhapsody');
    });
    
    // ========================================
    // 4. CONTROLAR REPRODUÇÃO
    // ========================================
    await test.step('Control playback', async () => {
      // Pausar
      await player.pause();
      await player.assertIsPaused();
      
      // Retomar
      await player.play();
      await player.assertIsPlaying();
      
      // Ajustar volume
      await player.setVolume(75);
      await player.assertVolume(75);
      
      // Buscar posição
      await player.seekTo(60); // 1 minuto
      
      // Pular para próxima
      await player.skipToNext();
      await player.assertCurrentTrack('We Will Rock You');
    });
    
    // ========================================
    // 5. SHUFFLE E REPEAT
    // ========================================
    await test.step('Toggle shuffle and repeat', async () => {
      // Ativar shuffle
      await player.toggleShuffle();
      await player.assertShuffleActive();
      
      // Ativar repeat
      await player.toggleRepeat();
      await player.assertRepeatActive();
    });
    
    // ========================================
    // 6. GERENCIAR FILA
    // ========================================
    await test.step('Manage queue', async () => {
      // Abrir fila
      await player.openQueue();
      
      // Verificar itens
      const queueItems = authenticatedPage.getByTestId('queue-item');
      await expect(queueItems).toHaveCount(3);
      
      // Remover item
      await queueItems.first().hover();
      await authenticatedPage.getByLabel('Remove from queue').first().click();
      await expect(queueItems).toHaveCount(2);
      
      // Reordenar (drag and drop)
      const firstItem = queueItems.first();
      const lastItem = queueItems.last();
      await firstItem.dragTo(lastItem);
      
      // Fechar fila
      await player.closeQueue();
    });
    
    // ========================================
    // 7. PARAR REPRODUÇÃO
    // ========================================
    await test.step('Stop playback', async () => {
      await player.stop();
      await player.assertIsPaused();
    });
  });
  
  test('should handle keyboard shortcuts', async ({ authenticatedPage }) => {
    await player.playTrack('Test Track');
    
    // Space - Play/Pause
    await authenticatedPage.keyboard.press('Space');
    await player.assertIsPaused();
    
    await authenticatedPage.keyboard.press('Space');
    await player.assertIsPlaying();
    
    // Arrow Right - Skip forward
    await authenticatedPage.keyboard.press('ArrowRight');
    
    // Arrow Left - Skip backward
    await authenticatedPage.keyboard.press('ArrowLeft');
    
    // Arrow Up - Volume up
    await authenticatedPage.keyboard.press('ArrowUp');
    
    // Arrow Down - Volume down
    await authenticatedPage.keyboard.press('ArrowDown');
    
    // M - Mute/Unmute
    await authenticatedPage.keyboard.press('m');
    
    // S - Shuffle
    await authenticatedPage.keyboard.press('s');
    await player.assertShuffleActive();
    
    // R - Repeat
    await authenticatedPage.keyboard.press('r');
    await player.assertRepeatActive();
  });
  
  test('should persist player state across page reloads', async ({ authenticatedPage }) => {
    // Configurar estado
    await player.playTrack('Test Track');
    await player.setVolume(50);
    await player.toggleShuffle();
    
    // Recarregar página
    await authenticatedPage.reload();
    
    // Verificar estado persistido
    await player.assertCurrentTrack('Test Track');
    await player.assertVolume(50);
    await player.assertShuffleActive();
  });
  
  test('should handle errors gracefully', async ({ authenticatedPage }) => {
    // Simular erro de rede
    await authenticatedPage.route('**/api/player/play', route => 
      route.abort('failed')
    );
    
    // Tentar reproduzir
    await player.playButton.click();
    
    // Verificar mensagem de erro
    await expect(authenticatedPage.getByText(/Failed to play/i)).toBeVisible();
    
    // Verificar botão de retry
    const retryButton = authenticatedPage.getByRole('button', { name: 'Retry' });
    await expect(retryButton).toBeVisible();
    
    // Remover mock e tentar novamente
    await authenticatedPage.unroute('**/api/player/play');
    await retryButton.click();
    
    // Verificar sucesso
    await player.assertIsPlaying();
  });
  
  test('should display correct time formatting', async ({ authenticatedPage }) => {
    await player.playTrack('Long Track'); // 5 minutos
    
    // Verificar formato de tempo
    const currentTime = authenticatedPage.getByTestId('current-time');
    const duration = authenticatedPage.getByTestId('duration');
    
    await expect(currentTime).toHaveText(/\d:\d{2}/); // 0:00
    await expect(duration).toHaveText(/\d:\d{2}/);    // 5:00
    
    // Buscar para 2:30
    await player.seekTo(150);
    await expect(currentTime).toHaveText('2:30');
  });
  
  test('should handle rapid interactions', async ({ authenticatedPage }) => {
    await player.playTrack('Test Track');
    
    // Clicar rapidamente em play/pause
    for (let i = 0; i < 5; i++) {
      await player.pauseButton.click({ force: true });
      await player.playButton.click({ force: true });
    }
    
    // Verificar que ainda está funcionando
    await player.assertIsPlaying();
    
    // Pular rapidamente entre faixas
    for (let i = 0; i < 3; i++) {
      await player.nextButton.click({ force: true });
    }
    
    // Verificar que ainda está funcionando
    await player.assertIsPlaying();
  });
});
