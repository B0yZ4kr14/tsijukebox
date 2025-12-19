import { Page, Locator, expect } from '@playwright/test';

export class PlayerPage {
  readonly page: Page;
  
  // Player Controls
  readonly playPauseButton: Locator;
  readonly nextButton: Locator;
  readonly prevButton: Locator;
  readonly stopButton: Locator;
  
  // Volume Controls
  readonly volumeSlider: Locator;
  readonly muteButton: Locator;
  readonly volumeValue: Locator;
  
  // Playback Controls
  readonly shuffleButton: Locator;
  readonly repeatButton: Locator;
  readonly queueButton: Locator;
  
  // Queue Panel
  readonly queuePanel: Locator;
  readonly queueCloseButton: Locator;
  readonly queueClearButton: Locator;
  readonly queueEmpty: Locator;
  
  // Progress Bar
  readonly progressBar: Locator;
  readonly progressCurrent: Locator;
  readonly progressDuration: Locator;
  
  // Now Playing
  readonly nowPlaying: Locator;
  readonly trackCover: Locator;
  readonly trackTitle: Locator;
  readonly trackArtist: Locator;
  readonly trackAlbum: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Player Controls
    this.playPauseButton = page.getByTestId('player-play-pause');
    this.nextButton = page.getByTestId('player-next');
    this.prevButton = page.getByTestId('player-prev');
    this.stopButton = page.getByTestId('player-stop');
    
    // Volume Controls
    this.volumeSlider = page.getByTestId('volume-slider');
    this.muteButton = page.getByTestId('volume-mute-toggle');
    this.volumeValue = page.getByTestId('volume-value');
    
    // Playback Controls
    this.shuffleButton = page.getByTestId('playback-shuffle');
    this.repeatButton = page.getByTestId('playback-repeat');
    this.queueButton = page.getByTestId('playback-queue');
    
    // Queue Panel
    this.queuePanel = page.getByTestId('queue-panel');
    this.queueCloseButton = page.getByTestId('queue-close');
    this.queueClearButton = page.getByTestId('queue-clear');
    this.queueEmpty = page.getByTestId('queue-empty');
    
    // Progress Bar
    this.progressBar = page.getByTestId('progress-bar');
    this.progressCurrent = page.getByTestId('progress-current');
    this.progressDuration = page.getByTestId('progress-duration');
    
    // Now Playing
    this.nowPlaying = page.getByTestId('now-playing');
    this.trackCover = page.getByTestId('track-cover');
    this.trackTitle = page.getByTestId('track-title');
    this.trackArtist = page.getByTestId('track-artist');
    this.trackAlbum = page.getByTestId('track-album');
  }

  async goto() {
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');
  }

  async enableDemoMode() {
    // Check if demo mode toggle exists in settings or use localStorage
    await this.page.evaluate(() => {
      localStorage.setItem('tsi-jukebox-demo-mode', 'true');
    });
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');
  }

  // Player control actions
  async play() {
    await this.playPauseButton.click();
  }

  async pause() {
    await this.playPauseButton.click();
  }

  async next() {
    await this.nextButton.click();
  }

  async prev() {
    await this.prevButton.click();
  }

  async stop() {
    await this.stopButton.click();
  }

  // Volume actions
  async setVolume(value: number) {
    const slider = this.volumeSlider.locator('input[type="range"]');
    await slider.fill(String(value));
  }

  async toggleMute() {
    await this.muteButton.click();
  }

  async getVolumeValue(): Promise<number> {
    const value = await this.volumeValue.textContent();
    return parseInt(value?.replace('%', '') ?? '0');
  }

  // Playback control actions
  async toggleShuffle() {
    await this.shuffleButton.click();
  }

  async toggleRepeat() {
    await this.repeatButton.click();
  }

  async openQueue() {
    await this.queueButton.click();
  }

  async closeQueue() {
    await this.queueCloseButton.click();
  }

  async clearQueue() {
    await this.queueClearButton.click();
  }

  // State checkers
  async isShuffleActive(): Promise<boolean> {
    const pressed = await this.shuffleButton.getAttribute('aria-pressed');
    return pressed === 'true';
  }

  async getRepeatMode(): Promise<'off' | 'track' | 'context'> {
    const pressed = await this.repeatButton.getAttribute('aria-pressed');
    if (pressed !== 'true') return 'off';
    
    const badge = this.repeatButton.locator('.absolute.-top-1.-right-1');
    const isVisible = await badge.isVisible();
    if (!isVisible) return 'context';
    
    const text = await badge.textContent();
    return text === '1' ? 'track' : 'context';
  }

  async getTrackInfo() {
    return {
      title: await this.trackTitle.textContent(),
      artist: await this.trackArtist.textContent(),
      album: await this.trackAlbum.textContent().catch(() => null),
    };
  }

  async getProgressTimes() {
    return {
      current: await this.progressCurrent.textContent(),
      duration: await this.progressDuration.textContent(),
    };
  }

  // Queue actions
  async getQueueItem(id: string): Locator {
    return this.page.getByTestId(`queue-item-${id}`);
  }

  async isQueueEmpty(): Promise<boolean> {
    return await this.queueEmpty.isVisible();
  }
}

export { expect };
