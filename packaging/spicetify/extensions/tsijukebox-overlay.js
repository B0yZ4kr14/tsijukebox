// TSiJUKEBOX Spicetify Extension - Overlay com QR Code e Fila
// Adiciona overlay customizado ao Spotify com QR Code dinâmico

(function TSiJUKEBOXOverlay() {
  'use strict';

  const CONFIG = {
    overlayPosition: 'bottom-right', // bottom-right, bottom-left, top-right, top-left
    qrCodeSize: 120,
    showQueue: true,
    maxQueueItems: 5,
    updateInterval: 5000, // ms
    serverUrl: 'http://tsijukebox.local',
  };

  let overlayElement = null;
  let updateTimer = null;

  // Gerar QR Code via API
  function generateQRCodeUrl(data) {
    const encoded = encodeURIComponent(data);
    return `https://api.qrserver.com/v1/create-qr-code/?size=${CONFIG.qrCodeSize}x${CONFIG.qrCodeSize}&data=${encoded}&bgcolor=1a1a2e&color=1DB954`;
  }

  // Criar elemento do overlay
  function createOverlay() {
    if (overlayElement) return;

    overlayElement = document.createElement('div');
    overlayElement.id = 'tsijukebox-overlay';
    overlayElement.innerHTML = `
      <style>
        #tsijukebox-overlay {
          position: fixed;
          ${CONFIG.overlayPosition.includes('bottom') ? 'bottom: 100px;' : 'top: 20px;'}
          ${CONFIG.overlayPosition.includes('right') ? 'right: 20px;' : 'left: 20px;'}
          z-index: 9999;
          background: rgba(26, 26, 46, 0.95);
          border-radius: 12px;
          padding: 16px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(29, 185, 84, 0.3);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          min-width: 200px;
          backdrop-filter: blur(10px);
          transition: opacity 0.3s, transform 0.3s;
        }

        #tsijukebox-overlay:hover {
          transform: scale(1.02);
          border-color: rgba(29, 185, 84, 0.6);
        }

        #tsijukebox-overlay .tsi-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
          padding-bottom: 8px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        #tsijukebox-overlay .tsi-logo {
          font-size: 14px;
          font-weight: bold;
          color: #1DB954;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        #tsijukebox-overlay .tsi-qr-section {
          text-align: center;
          margin-bottom: 12px;
        }

        #tsijukebox-overlay .tsi-qr-code {
          width: ${CONFIG.qrCodeSize}px;
          height: ${CONFIG.qrCodeSize}px;
          border-radius: 8px;
          background: #fff;
          padding: 4px;
        }

        #tsijukebox-overlay .tsi-qr-label {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.7);
          margin-top: 8px;
        }

        #tsijukebox-overlay .tsi-queue-section {
          margin-top: 12px;
        }

        #tsijukebox-overlay .tsi-queue-title {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.6);
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        #tsijukebox-overlay .tsi-queue-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        #tsijukebox-overlay .tsi-queue-item:last-child {
          border-bottom: none;
        }

        #tsijukebox-overlay .tsi-queue-number {
          font-size: 10px;
          color: rgba(255, 255, 255, 0.4);
          min-width: 16px;
        }

        #tsijukebox-overlay .tsi-queue-track {
          flex: 1;
          min-width: 0;
        }

        #tsijukebox-overlay .tsi-queue-track-name {
          font-size: 12px;
          color: #fff;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        #tsijukebox-overlay .tsi-queue-track-artist {
          font-size: 10px;
          color: rgba(255, 255, 255, 0.5);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        #tsijukebox-overlay .tsi-stats {
          margin-top: 12px;
          padding-top: 8px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          font-size: 10px;
          color: rgba(255, 255, 255, 0.5);
          text-align: center;
        }

        #tsijukebox-overlay .tsi-minimize {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          border: none;
          cursor: pointer;
          color: rgba(255, 255, 255, 0.5);
          font-size: 12px;
          line-height: 20px;
          text-align: center;
        }

        #tsijukebox-overlay .tsi-minimize:hover {
          background: rgba(255, 255, 255, 0.2);
          color: #fff;
        }

        #tsijukebox-overlay.minimized .tsi-content {
          display: none;
        }

        #tsijukebox-overlay.minimized {
          min-width: auto;
          padding: 8px 12px;
        }
      </style>

      <button class="tsi-minimize" onclick="document.getElementById('tsijukebox-overlay').classList.toggle('minimized')">−</button>
      
      <div class="tsi-header">
        <span class="tsi-logo">🎵 TSiJUKEBOX</span>
      </div>

      <div class="tsi-content">
        <div class="tsi-qr-section">
          <img class="tsi-qr-code" id="tsi-qr-code" src="${generateQRCodeUrl(CONFIG.serverUrl)}" alt="QR Code" />
          <div class="tsi-qr-label">Escaneie para controlar</div>
        </div>

        <div class="tsi-queue-section" id="tsi-queue-section">
          <div class="tsi-queue-title">📋 Próximas</div>
          <div id="tsi-queue-list"></div>
        </div>

        <div class="tsi-stats" id="tsi-stats">
          Carregando estatísticas...
        </div>
      </div>
    `;

    document.body.appendChild(overlayElement);
    console.log('[TSiJUKEBOX] Overlay criado');
  }

  // Atualizar fila de reprodução
  function updateQueue() {
    if (!Spicetify.Queue) return;

    const queueList = document.getElementById('tsi-queue-list');
    if (!queueList) return;

    const nextTracks = Spicetify.Queue.nextTracks?.slice(0, CONFIG.maxQueueItems) || [];

    if (nextTracks.length === 0) {
      queueList.innerHTML = '<div style="font-size: 11px; color: rgba(255,255,255,0.4); text-align: center;">Fila vazia</div>';
      return;
    }

    queueList.innerHTML = nextTracks.map((track, i) => `
      <div class="tsi-queue-item">
        <span class="tsi-queue-number">${i + 1}</span>
        <div class="tsi-queue-track">
          <div class="tsi-queue-track-name">${track.contextTrack?.metadata?.title || 'Desconhecido'}</div>
          <div class="tsi-queue-track-artist">${track.contextTrack?.metadata?.artist_name || ''}</div>
        </div>
      </div>
    `).join('');
  }

  // Atualizar estatísticas
  function updateStats() {
    const statsEl = document.getElementById('tsi-stats');
    if (!statsEl) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    statsEl.innerHTML = `🕐 ${timeStr} • Powered by TSiJUKEBOX`;
  }

  // Iniciar atualizações periódicas
  function startUpdates() {
    updateQueue();
    updateStats();

    updateTimer = setInterval(() => {
      updateQueue();
      updateStats();
    }, CONFIG.updateInterval);

    // Escutar mudanças na fila
    Spicetify.Player.addEventListener('songchange', updateQueue);
  }

  // Inicialização
  function init() {
    if (!Spicetify.Player || !Spicetify.Queue) {
      setTimeout(init, 300);
      return;
    }

    console.log('[TSiJUKEBOX] Iniciando overlay...');
    createOverlay();
    startUpdates();
    console.log('[TSiJUKEBOX] Overlay ativo!');
  }

  // Aguardar Spicetify estar pronto
  if (document.readyState === 'complete') {
    init();
  } else {
    window.addEventListener('load', init);
  }
})();
