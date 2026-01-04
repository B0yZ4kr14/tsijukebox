/**
 * TSiJUKEBOX Status Badges
 * Integração com Design System Moderno (Dark Neon Gold Black)
 */

(function() {
    // 1. Injetar CSS do Design System
    const style = document.createElement('style');
    style.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;500;700&family=Inter:wght@400;600&family=JetBrains+Mono:wght@400;700&display=swap');
        @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css');

        :root {
            --bg-primary: #000000;
            --bg-secondary: #111111;
            --accent-gold: #FFD700;
            --accent-cyan: #00d4ff;
            --accent-green: #22c55e;
            --accent-red: #ef4444;
            --text-primary: #FFFFFF;
            --text-secondary: #AAAAAA;
            --glass-bg: rgba(26, 26, 26, 0.6);
            --glass-border: rgba(255, 255, 255, 0.1);
        }

        .tsijukebox-status-container {
            font-family: 'Inter', sans-serif;
            background: var(--bg-primary);
            color: var(--text-primary);
            padding: 20px;
            border-radius: 12px;
            border: 1px solid var(--glass-border);
            max-width: 800px;
            margin: 20px auto;
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
        }

        .status-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 20px;
            border-bottom: 1px solid var(--glass-border);
            padding-bottom: 15px;
        }

        .status-title {
            font-family: 'Space Grotesk', sans-serif;
            font-size: 24px;
            font-weight: 700;
            color: var(--accent-gold);
            text-transform: uppercase;
            letter-spacing: 1px;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .status-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
        }

        /* Badge Component */
        .tsi-badge {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 6px 12px;
            border-radius: 9999px;
            font-family: 'JetBrains Mono', monospace;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            transition: all 0.2s ease;
            cursor: default;
            border: 1px solid transparent;
        }

        .tsi-badge:hover {
            transform: translateY(-1px);
            filter: brightness(1.1);
        }

        /* Variants */
        .tsi-badge-success {
            background: rgba(34, 197, 94, 0.1);
            color: var(--accent-green);
            border-color: rgba(34, 197, 94, 0.2);
            box-shadow: 0 0 10px rgba(34, 197, 94, 0.1);
        }

        .tsi-badge-warning {
            background: rgba(251, 191, 36, 0.1);
            color: var(--accent-gold);
            border-color: rgba(251, 191, 36, 0.2);
            box-shadow: 0 0 10px rgba(251, 191, 36, 0.1);
        }

        .tsi-badge-error {
            background: rgba(239, 68, 68, 0.1);
            color: var(--accent-red);
            border-color: rgba(239, 68, 68, 0.2);
            box-shadow: 0 0 10px rgba(239, 68, 68, 0.1);
        }

        .tsi-badge-info {
            background: rgba(0, 212, 255, 0.1);
            color: var(--accent-cyan);
            border-color: rgba(0, 212, 255, 0.2);
            box-shadow: 0 0 10px rgba(0, 212, 255, 0.1);
        }

        .tsi-badge-outline {
            background: transparent;
            color: var(--text-secondary);
            border-color: var(--glass-border);
        }

        .tsi-badge-gold {
            background: linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 215, 0, 0.05));
            color: var(--accent-gold);
            border-color: var(--accent-gold);
            box-shadow: 0 0 15px rgba(255, 215, 0, 0.2);
        }

        /* Card Style */
        .status-card {
            background: var(--glass-bg);
            border: 1px solid var(--glass-border);
            padding: 15px;
            border-radius: 8px;
            display: flex;
            flex-direction: column;
            gap: 10px;
        }

        .card-label {
            font-size: 12px;
            color: var(--text-secondary);
            text-transform: uppercase;
        }
    `;
    document.head.appendChild(style);

    // 2. Criar Container
    const container = document.createElement('div');
    container.className = 'tsijukebox-status-container';

    // 3. Renderizar Conteúdo
    container.innerHTML = `
        <div class="status-header">
            <div class="status-title">
                <i class="fas fa-shield-alt"></i>
                TSiJUKEBOX Status
            </div>
            <div class="tsi-badge tsi-badge-gold">
                <i class="fas fa-check-circle"></i>
                System Online
            </div>
        </div>

        <div class="status-grid">
            <!-- Build Status -->
            <div class="status-card">
                <span class="card-label">Build Status</span>
                <div class="tsi-badge tsi-badge-success">
                    <i class="fas fa-code-branch"></i>
                    Passing
                </div>
            </div>

            <!-- License -->
            <div class="status-card">
                <span class="card-label">License</span>
                <div class="tsi-badge tsi-badge-info">
                    <i class="fas fa-balance-scale"></i>
                    Public Domain
                </div>
            </div>

            <!-- Version -->
            <div class="status-card">
                <span class="card-label">Version</span>
                <div class="tsi-badge tsi-badge-outline">
                    <i class="fas fa-tag"></i>
                    v2.5.0-beta
                </div>
            </div>

            <!-- Security -->
            <div class="status-card">
                <span class="card-label">Security Audit</span>
                <div class="tsi-badge tsi-badge-warning">
                    <i class="fas fa-user-secret"></i>
                    Pending
                </div>
            </div>
            
            <!-- Sovereignity -->
            <div class="status-card" style="grid-column: span 2;">
                <span class="card-label">Intellectual Sovereignty</span>
                <div class="tsi-badge tsi-badge-gold" style="width: 100%; justify-content: center;">
                    <i class="fas fa-flag"></i>
                    Don't Tread On Me
                </div>
            </div>
        </div>
    `;

    // 4. Injetar no DOM (procura por um elemento alvo ou adiciona ao body)
    const target = document.getElementById('tsijukebox-status-widget') || document.body;
    target.appendChild(container);

})();
