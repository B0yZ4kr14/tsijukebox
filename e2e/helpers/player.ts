import { Page, expect, Locator } from '@playwright/test';

/**
 * Player Helper - TSiJUKEBOX E2E Tests
 * 
 * Helper class para interagir com o player de música nos testes E2E.
 * Encapsula ações comuns do player para reutilização.
 * 
 * @example
 * ```typescript
 * const player = new PlayerHelper(page);
 * await player.playTrack('Bohemian Rhapsody');
 * await player.setVolume(75);
 * await player.skipToNext();
 * ```
 */
export class PlayerHelper {
  constructor(private page: Page) {}
  
  // ========================================
  // LOCATORS
  // ========================================
  
  get playButton(): Locator {
    return this.page.getByLabel('Play', { exact: true });
  }
  
  get pauseButton(): Locator {
    return this.page.getByLabel('Pause', { exact: true });
  }
  
  get stopButton(): Locator {
    return this.page.getByLabel('Stop', { exact: true });
  }
  
  get nextButton(): Locator {
    return this.page.getByLabel('Next track');
  }
  
  get previousButton(): Locator {
    return this.page.getByLabel('Previous track');
  }
  
  get shuffleButton(): Locator {
    return this.page.getByLabel(/shuffle/i);
  }
  
  get repeatButton(): Locator {
    return this.page.getByLabel(/repeat/i);
  }
  
  get volumeSlider(): Locator {
    return this.page.getByLabel('Volume');
  }
  
  get progressBar(): Locator {
    return this.page.getByRole('slider', { name: /progress/i });
  }
  
  get queueButton(): Locator {
    return this.page.getByLabel('Open queue');
  }
  
  get nowPlayingTitle(): Locator {
    return this.page.getByTestId('now-playing-title');
  }
  
  get nowPlayingArtist(): Locator {
    return this.page.getByTestId('now-playing-artist');
  }
  
  // ========================================
  // ACTIONS
  // ========================================
  
  /**
   * Reproduzir uma faixa específica
   */
  async playTrack(trackName: string) {
    await this.page.getByText(trackName, { exact: false }).click();
    await this.playButton.click();
    await expect(this.pauseButton).toBeVisible({ timeout: 5000 });
  }
  
  /**
   * Pausar reprodução
   */
  async pause() {
    await this.pauseButton.click();
    await expect(this.playButton).toBeVisible();
  }
  
  /**
   * Retomar reprodução
   */
  async play() {
    await this.playButton.click();
    await expect(this.pauseButton).toBeVisible();
  }
  
  /**
   * Parar reprodução
   */
  async stop() {
    await this.stopButton.click();
    await expect(this.playButton).toBeVisible();
  }
  
  /**
   * Pular para próxima faixa
   */
  async skipToNext() {
    const currentTrack = await this.nowPlayingTitle.textContent();
    await this.nextButton.click();
    
    // Aguardar mudança de faixa
    await this.page.waitForFunction(
      (oldTrack) => {
        const newTrack = document.querySelector('[data-testid="now-playing-title"]')?.textContent;
        return newTrack !== oldTrack;
      },
      currentTrack,
      { timeout: 5000 }
    );
  }
  
  /**
   * Voltar para faixa anterior
   */
  async skipToPrevious() {
    const currentTrack = await this.nowPlayingTitle.textContent();
    await this.previousButton.click();
    
    await this.page.waitForFunction(
      (oldTrack) => {
        const newTrack = document.querySelector('[data-testid="now-playing-title"]')?.textContent;
        return newTrack !== oldTrack;
      },
      currentTrack,
      { timeout: 5000 }
    );
  }
  
  /**
   * Definir volume (0-100)
   */
  async setVolume(volume: number) {
    if (volume < 0 || volume > 100) {
      throw new Error('Volume must be between 0 and 100');
    }
    
    await this.volumeSlider.fill(volume.toString());
    
    // Verificar se o volume foi aplicado
    const actualVolume = await this.volumeSlider.inputValue();
    expect(parseInt(actualVolume)).toBe(volume);
  }
  
  /**
   * Silenciar/Dessilenciar
   */
  async toggleMute() {
    const muteButton = this.page.getByLabel(/mute|unmute/i);
    await muteButton.click();
  }
  
  /**
   * Ativar/Desativar shuffle
   */
  async toggleShuffle() {
    await this.shuffleButton.click();
  }
  
  /**
   * Alternar modo de repetição
   */
  async toggleRepeat() {
    await this.repeatButton.click();
  }
  
  /**
   * Buscar posição na faixa (em segundos)
   */
  async seekTo(seconds: number) {
    await this.progressBar.fill(seconds.toString());
  }
  
  /**
   * Adicionar faixa à fila
   */
  async addToQueue(trackName: string) {
    await this.page.getByText(trackName).hover();
    await this.page.getByLabel('Add to queue').click();
    
    // Verificar toast de confirmação
    await expect(this.page.getByText(/added to queue/i)).toBeVisible();
  }
  
  /**
   * Abrir painel de fila
   */
  async openQueue() {
    await this.queueButton.click();
    await expect(this.page.getByTestId('queue-panel')).toBeVisible();
  }
  
  /**
   * Fechar painel de fila
   */
  async closeQueue() {
    await this.page.getByLabel('Close queue').click();
    await expect(this.page.getByTestId('queue-panel')).not.toBeVisible();
  }
  
  /**
   * Limpar fila
   */
  async clearQueue() {
    await this.openQueue();
    await this.page.getByRole('button', { name: 'Clear queue' }).click();
    await expect(this.page.getByText('Queue is empty')).toBeVisible();
  }
  
  // ========================================
  // ASSERTIONS
  // ========================================
  
  /**
   * Verificar se está reproduzindo
   */
  async assertIsPlaying() {
    await expect(this.pauseButton).toBeVisible();
    
    // Verificar se o progresso está avançando
    const initialProgress = await this.progressBar.inputValue();
    await this.page.waitForTimeout(1000);
    const newProgress = await this.progressBar.inputValue();
    
    expect(parseInt(newProgress)).toBeGreaterThan(parseInt(initialProgress));
  }
  
  /**
   * Verificar se está pausado
   */
  async assertIsPaused() {
    await expect(this.playButton).toBeVisible();
  }
  
  /**
   * Verificar faixa atual
   */
  async assertCurrentTrack(trackName: string) {
    await expect(this.nowPlayingTitle).toHaveText(trackName);
  }
  
  /**
   * Verificar artista atual
   */
  async assertCurrentArtist(artistName: string) {
    await expect(this.nowPlayingArtist).toHaveText(artistName);
  }
  
  /**
   * Verificar volume
   */
  async assertVolume(volume: number) {
    const actualVolume = await this.volumeSlider.inputValue();
    expect(parseInt(actualVolume)).toBe(volume);
  }
  
  /**
   * Verificar se shuffle está ativo
   */
  async assertShuffleActive() {
    await expect(this.shuffleButton).toHaveAttribute('aria-pressed', 'true');
  }
  
  /**
   * Verificar se repeat está ativo
   */
  async assertRepeatActive() {
    await expect(this.repeatButton).toHaveAttribute('aria-pressed', 'true');
  }
  
  /**
   * Verificar tamanho da fila
   */
  async assertQueueSize(size: number) {
    await this.openQueue();
    const queueItems = this.page.getByTestId('queue-item');
    await expect(queueItems).toHaveCount(size);
  }
}
