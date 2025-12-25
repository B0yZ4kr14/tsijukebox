/**
 * TSiJUKEBOX - Database Settings Component
 * =========================================
 * Aba de configuração de Banco de Dados Avançado
 * Seguindo as diretrizes do tema Stage Neon Metallic
 * 
 * Cores:
 * - Background: #0a0a1a, #1a0a2e, #2a1040
 * - Accent Primary: #00FFFF (Cyan)
 * - Accent Secondary: #FF00D4 (Magenta)
 * - Accent Tertiary: #FFD700 (Gold)
 * - Success: #00FF44
 * - Warning: #FFD700
 * 
 * @author B0.y_Z4kr14
 * @license Public Domain
 */

import React, { useState } from 'react';
import { 
  Database, 
  Settings, 
  Wrench, 
  ArrowRightLeft, 
  FileCode, 
  BookOpen,
  Check,
  AlertTriangle,
  ChevronUp,
  ChevronDown
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════

type DatabaseEngine = 'sqlite' | 'postgresql' | 'mariadb' | 'firebird';
type TabId = 'motor' | 'config' | 'reparo' | 'migracao' | 'templates' | 'docs';

interface DatabaseOption {
  id: DatabaseEngine;
  name: string;
  port?: number;
  description: string;
  icon: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// DADOS DOS BANCOS DE DADOS
// ═══════════════════════════════════════════════════════════════════════════

const databaseOptions: DatabaseOption[] = [
  {
    id: 'sqlite',
    name: 'SQLite',
    description: 'Banco de dados leve em arquivo único, ideal para instalações single-node',
    icon: '🗄️',
  },
  {
    id: 'postgresql',
    name: 'PostgreSQL',
    port: 5432,
    description: 'Banco de dados robusto e escalável para ambientes corporativos',
    icon: '🐘',
  },
  {
    id: 'mariadb',
    name: 'MariaDB',
    port: 3306,
    description: 'Fork do MySQL com melhor performance e compatibilidade',
    icon: '🐬',
  },
  {
    id: 'firebird',
    name: 'Firebird',
    port: 3050,
    description: 'Banco de dados legado multiplataforma com modo embedded',
    icon: '🔥',
  },
];

const sqliteDetails = {
  whenToUse: [
    'Instalações single-node (1 terminal)',
    'Ambientes offline sem rede',
    'Backup fácil (apenas copiar arquivo)',
    'Desenvolvimento e testes',
  ],
  limitations: [
    'Limite de conexões simultâneas',
    'Não recomendado para múltiplos clientes',
    'Sem replicação nativa',
  ],
  features: [
    'Zero configuração',
    'Arquivo único portátil',
    'Sem servidor externo',
    'Transações ACID',
    'Full-text search',
  ],
};

const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'motor', label: 'Motor', icon: <Settings className="w-4 h-4" /> },
  { id: 'config', label: 'Config', icon: <Database className="w-4 h-4" /> },
  { id: 'reparo', label: 'Reparo', icon: <Wrench className="w-4 h-4" /> },
  { id: 'migracao', label: 'Migração', icon: <ArrowRightLeft className="w-4 h-4" /> },
  { id: 'templates', label: 'Templates', icon: <FileCode className="w-4 h-4" /> },
  { id: 'docs', label: 'Docs', icon: <BookOpen className="w-4 h-4" /> },
];

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════

export const DatabaseSettings: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>('motor');
  const [selectedEngine, setSelectedEngine] = useState<DatabaseEngine>('sqlite');

  return (
    <div 
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #0a0a1a 0%, #1a0a2e 50%, #2a1040 100%)',
        border: '1px solid rgba(0, 255, 255, 0.2)',
        boxShadow: '0 0 30px rgba(0, 255, 255, 0.1)',
      }}
    >
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-6 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #00FFFF 0%, #FF00D4 100%)',
              boxShadow: '0 0 20px rgba(0, 255, 255, 0.4)',
            }}
          >
            <Database className="w-6 h-6 text-white" />
          </div>
          <div className="text-left">
            <h2 
              className="text-2xl font-bold"
              style={{ 
                color: '#FFD700',
                textShadow: '0 0 10px rgba(255, 215, 0, 0.5)',
              }}
            >
              Banco de Dados Avançado
            </h2>
            <p style={{ color: '#B0B0B0' }}>
              Configure o motor e conexão do banco de dados
            </p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-6 h-6" style={{ color: '#00FFFF' }} />
        ) : (
          <ChevronDown className="w-6 h-6" style={{ color: '#00FFFF' }} />
        )}
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="px-6 pb-6">
          {/* Tabs */}
          <div 
            className="flex gap-2 p-1 rounded-xl mb-6"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm
                  transition-all duration-300
                `}
                style={{
                  backgroundColor: activeTab === tab.id ? '#FFD700' : 'transparent',
                  color: activeTab === tab.id ? '#0a0a1a' : '#B0B0B0',
                  boxShadow: activeTab === tab.id ? '0 0 15px rgba(255, 215, 0, 0.5)' : 'none',
                }}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Motor Tab Content */}
          {activeTab === 'motor' && (
            <>
              {/* Database Engine Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {databaseOptions.map((db) => (
                  <button
                    key={db.id}
                    onClick={() => setSelectedEngine(db.id)}
                    className={`
                      relative p-4 rounded-xl text-left transition-all duration-300
                    `}
                    style={{
                      backgroundColor: 'rgba(26, 10, 46, 0.8)',
                      border: selectedEngine === db.id 
                        ? '2px solid #00FFFF' 
                        : '2px solid rgba(255, 255, 255, 0.1)',
                      boxShadow: selectedEngine === db.id 
                        ? '0 0 20px rgba(0, 255, 255, 0.3)' 
                        : 'none',
                    }}
                  >
                    {/* Selected indicator */}
                    {selectedEngine === db.id && (
                      <div 
                        className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: '#00FFFF' }}
                      >
                        <Check className="w-4 h-4" style={{ color: '#0a0a1a' }} />
                      </div>
                    )}

                    <div className="flex items-center gap-3 mb-2">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                        style={{ 
                          backgroundColor: 'rgba(0, 255, 255, 0.1)',
                          border: '1px solid rgba(0, 255, 255, 0.3)',
                        }}
                      >
                        {db.icon}
                      </div>
                      <div>
                        <h3 
                          className="font-bold"
                          style={{ color: '#FFFFFF' }}
                        >
                          {db.name}
                        </h3>
                        {db.port && (
                          <span 
                            className="text-xs"
                            style={{ color: '#808080' }}
                          >
                            Porta: {db.port}
                          </span>
                        )}
                      </div>
                    </div>
                    <p 
                      className="text-sm"
                      style={{ color: '#B0B0B0' }}
                    >
                      {db.description}
                    </p>
                  </button>
                ))}
              </div>

              {/* SQLite Details Panel */}
              {selectedEngine === 'sqlite' && (
                <div 
                  className="rounded-xl p-5"
                  style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(255, 215, 0, 0.3)',
                  }}
                >
                  <h3 
                    className="flex items-center gap-2 text-lg font-bold mb-4"
                    style={{ color: '#FFD700' }}
                  >
                    <Database className="w-5 h-5" />
                    SQLite - Detalhes
                  </h3>

                  <div className="grid grid-cols-2 gap-6">
                    {/* Quando usar */}
                    <div>
                      <h4 
                        className="flex items-center gap-2 font-semibold mb-3"
                        style={{ color: '#00FF44' }}
                      >
                        <Check className="w-4 h-4" />
                        Quando usar:
                      </h4>
                      <ul className="space-y-2">
                        {sqliteDetails.whenToUse.map((item, i) => (
                          <li 
                            key={i}
                            className="flex items-start gap-2 text-sm"
                            style={{ color: '#B0B0B0' }}
                          >
                            <span style={{ color: '#00FFFF' }}>•</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Limitações */}
                    <div>
                      <h4 
                        className="flex items-center gap-2 font-semibold mb-3"
                        style={{ color: '#FFD700' }}
                      >
                        <AlertTriangle className="w-4 h-4" />
                        Limitações:
                      </h4>
                      <ul className="space-y-2">
                        {sqliteDetails.limitations.map((item, i) => (
                          <li 
                            key={i}
                            className="flex items-start gap-2 text-sm"
                            style={{ color: '#B0B0B0' }}
                          >
                            <span style={{ color: '#FF00D4' }}>•</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Recursos */}
                  <div className="mt-5">
                    <h4 
                      className="flex items-center gap-2 font-semibold mb-3"
                      style={{ color: '#FF00D4' }}
                    >
                      <Wrench className="w-4 h-4" />
                      Recursos:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {sqliteDetails.features.map((feature, i) => (
                        <span
                          key={i}
                          className="px-3 py-1.5 rounded-lg text-sm font-medium"
                          style={{
                            backgroundColor: 'rgba(0, 255, 255, 0.15)',
                            border: '1px solid rgba(0, 255, 255, 0.4)',
                            color: '#00FFFF',
                          }}
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Config Tab */}
          {activeTab === 'config' && (
            <div 
              className="rounded-xl p-5"
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(0, 255, 255, 0.2)',
              }}
            >
              <h3 
                className="text-lg font-bold mb-4"
                style={{ color: '#00FFFF' }}
              >
                Configuração de Conexão
              </h3>
              
              <div className="space-y-4">
                {/* SQLite Path */}
                <div>
                  <label 
                    className="block text-sm font-medium mb-2"
                    style={{ color: '#B0B0B0' }}
                  >
                    Caminho do Banco de Dados
                  </label>
                  <input
                    type="text"
                    defaultValue="/var/lib/tsijukebox/data.db"
                    className="w-full px-4 py-3 rounded-lg text-sm"
                    style={{
                      backgroundColor: 'rgba(26, 10, 46, 0.8)',
                      border: '1px solid rgba(0, 255, 255, 0.3)',
                      color: '#FFFFFF',
                    }}
                  />
                </div>

                {/* Backup Path */}
                <div>
                  <label 
                    className="block text-sm font-medium mb-2"
                    style={{ color: '#B0B0B0' }}
                  >
                    Diretório de Backup
                  </label>
                  <input
                    type="text"
                    defaultValue="/var/lib/tsijukebox/backups/"
                    className="w-full px-4 py-3 rounded-lg text-sm"
                    style={{
                      backgroundColor: 'rgba(26, 10, 46, 0.8)',
                      border: '1px solid rgba(0, 255, 255, 0.3)',
                      color: '#FFFFFF',
                    }}
                  />
                </div>

                {/* Auto Backup */}
                <div className="flex items-center justify-between">
                  <div>
                    <label 
                      className="block text-sm font-medium"
                      style={{ color: '#B0B0B0' }}
                    >
                      Backup Automático
                    </label>
                    <span 
                      className="text-xs"
                      style={{ color: '#808080' }}
                    >
                      Realiza backup diário às 03:00
                    </span>
                  </div>
                  <button
                    className="w-12 h-6 rounded-full relative transition-colors"
                    style={{
                      backgroundColor: '#00FFFF',
                      boxShadow: '0 0 10px rgba(0, 255, 255, 0.5)',
                    }}
                  >
                    <span 
                      className="absolute right-1 top-1 w-4 h-4 rounded-full"
                      style={{ backgroundColor: '#0a0a1a' }}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Placeholder for other tabs */}
          {['reparo', 'migracao', 'templates', 'docs'].includes(activeTab) && (
            <div 
              className="rounded-xl p-8 text-center"
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <p style={{ color: '#808080' }}>
                Conteúdo da aba "{tabs.find(t => t.id === activeTab)?.label}" em desenvolvimento...
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DatabaseSettings;
