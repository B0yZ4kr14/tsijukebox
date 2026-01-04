# Integração com Arquivos Locais

**Tipo:** Documentação de Integração
**Serviço:** Sistema de Arquivos Local
**Versão:** 1.0.0

---

## 1. Visão Geral

Além das integrações com serviços de streaming, o TSiJUKEBOX oferece suporte robusto para a reprodução de arquivos de música armazenados localmente. Essa funcionalidade é essencial para usuários que possuem sua própria coleção de músicas e desejam integrá-la ao sistema, garantindo acesso mesmo em ambientes sem conexão com a internet.

O sistema é capaz de escanear diretórios especificados, extrair metadados das faixas e adicioná-las à biblioteca do Jukebox.

### Formatos Suportados:

-   MP3
-   FLAC
-   AAC
-   OGG
-   WAV
-   OPUS

---

## 2. Como Funciona

A integração com arquivos locais é gerenciada por um serviço de backend que realiza as seguintes tarefas:

1.  **Monitoramento de Diretórios:** O serviço monitora as pastas de música configuradas pelo usuário em busca de novos arquivos, modificações ou exclusões.
2.  **Escaneamento e Indexação:** Quando novos arquivos são detectados, o serviço os escaneia para extrair metadados (tags ID3, etc.), como título, artista, álbum e arte da capa.
3.  **Armazenamento no Banco de Dados:** As informações extraídas são salvas no banco de dados local (SQLite) do TSiJUKEBOX, criando uma biblioteca de mídia local pesquisável.
4.  **Extração de Arte da Capa:** Se a arte da capa estiver embutida no arquivo de áudio, ela é extraída e armazenada em um diretório de cache para acesso rápido pela interface.

### Arquitetura:

-   **Frontend:** A interface permite ao usuário adicionar e gerenciar os diretórios de música através da página de configurações.
-   **Backend (API Local):**
    -   Expõe endpoints para o frontend gerenciar os diretórios (adicionar, remover, forçar re-scan).
    -   Executa um serviço em segundo plano (`FileWatcherService`) que utiliza bibliotecas como `watchdog` (em Python) ou `chokidar` (em Node.js) para monitorar o sistema de arquivos de forma eficiente.
    -   Utiliza bibliotecas como `mutagen` (Python) ou `music-metadata` (Node.js) para ler os metadados dos arquivos de áudio.

---

## 3. Configuração

O usuário pode configurar os diretórios de música de forma simples através da interface.

1.  **Acesse as Configurações:** Navegue até **Configurações > Fontes de Música > Arquivos Locais**.
2.  **Adicione um Diretório:** Clique em "Adicionar Diretório" e selecione a pasta que contém suas músicas.
3.  **Inicie o Escaneamento:** O sistema iniciará automaticamente o processo de escaneamento. O progresso será exibido na tela.

Uma vez que o escaneamento inicial é concluído, o diretório será monitorado continuamente, e quaisquer novas músicas adicionadas à pasta aparecerão automaticamente na biblioteca.

<div align="center">
  <img src="../../public/screenshots/preview-local-files-setup.png" alt="Configuração de Arquivos Locais" width="700">
  <p><em>Interface para adicionar e gerenciar diretórios de música local.</em></p>
</div>

---

## 4. Acesso e Reprodução

As músicas da biblioteca local são integradas de forma transparente ao resto da aplicação:

-   **Busca:** As faixas locais aparecem nos resultados da busca global.
-   **Biblioteca:** Uma seção dedicada na biblioteca permite navegar por artistas, álbuns e músicas da coleção local.
-   **Reprodução:** A reprodução é feita diretamente pelo navegador usando um player de áudio HTML5 padrão, que busca o arquivo diretamente do servidor de backend do TSiJUKEBOX.

---

## 5. Considerações de Performance

-   **Escaneamento Inicial:** O primeiro escaneamento de uma biblioteca muito grande pode consumir recursos significativos de CPU e I/O. O processo é executado em segundo plano para não impactar a performance da interface.
-   **Monitoramento:** O monitoramento de arquivos é projetado para ser leve, utilizando os mecanismos de notificação de eventos do sistema operacional sempre que possível para evitar a varredura constante dos diretórios.
-   **Cache de Arte da Capa:** Armazenar as artes de capa em cache evita a necessidade de extraí-las repetidamente dos arquivos de áudio, melhorando significativamente a velocidade de carregamento da interface.
