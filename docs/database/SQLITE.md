_# Suporte a Banco de Dados: SQLite

**Tipo:** Documentação de Banco de Dados  
**Sistema:** SQLite  
**Versão:** 3.x

---

## 1. Visão Geral

O **SQLite** é o sistema de gerenciamento de banco de dados (SGBD) padrão do TSiJUKEBOX. Ele foi escolhido como padrão por sua simplicidade, portabilidade e por não exigir um processo de servidor separado, o que o torna ideal para instalações standalone e embarcadas.

### Características Principais:

-   **Serverless:** O banco de dados é um único arquivo no sistema de arquivos local, eliminando a necessidade de um serviço de banco de dados em execução.
-   **Zero Configuração:** Funciona "out-of-the-box" sem necessidade de configuração inicial.
-   **Portabilidade:** O arquivo do banco de dados pode ser facilmente copiado e movido entre sistemas.
-   **Confiabilidade:** O SQLite é transacional (ACID), garantindo a integridade dos dados mesmo em caso de falhas.

### Uso no TSiJUKEBOX:

O SQLite armazena todas as informações persistentes da aplicação, incluindo:

-   Configurações do usuário
-   Playlists locais
-   Histórico de reprodução
-   Estatísticas de uso
-   Cache de metadados de músicas

---

## 2. Configuração

A configuração do SQLite é gerenciada através do arquivo `/etc/jukebox/database.json`. Uma configuração típica se parece com isto:

```json
{
  "type": "sqlite",
  "path": "/var/lib/jukebox/jukebox.db",
  "options": {
    "journal_mode": "WAL",
    "synchronous": "NORMAL",
    "cache_size": -2000
  }
}
```

### Parâmetros de Configuração:

-   `"type"`: Deve ser sempre `"sqlite"`.
-   `"path"`: O caminho absoluto para o arquivo do banco de dados. O padrão é `/var/lib/jukebox/jukebox.db`.
-   `"options"`: Opções de performance e confiabilidade (PRAGMAs) do SQLite.
    -   `"journal_mode": "WAL"` (Write-Ahead Logging): É o modo recomendado. Permite leituras e escritas concorrentes, melhorando significativamente a performance em comparação com o modo `DELETE` padrão.
    -   `"synchronous": "NORMAL"`: Um bom equilíbrio entre segurança e performance. Garante que as escritas sejam confirmadas no disco, mas de forma menos agressiva que o modo `FULL`.
    -   `"cache_size": -2000`: Define o tamanho do cache de página. Um valor negativo (ex: -2000) indica o tamanho em KiB (neste caso, 2MB). Um cache maior pode melhorar a performance de leitura.

---

## 3. Gerenciamento e Manutenção

O TSiJUKEBOX fornece ferramentas na interface de usuário para gerenciar o banco de dados SQLite, localizadas em **Configurações > Sistema > Banco de Dados**.

### Operações Disponíveis:

-   **Backup:** Cria uma cópia de segurança do arquivo do banco de dados. O TSiJUKEBOX utiliza a API de backup online do SQLite, que permite fazer cópias a quente sem interromper o uso da aplicação.
-   **VACUUM:** Otimiza o arquivo do banco de dados, reconstruindo-o do zero. Isso remove espaços vazios deixados por dados deletados, reduzindo o tamanho do arquivo e melhorando a performance de acesso.
-   **Verificar Integridade:** Executa o comando `PRAGMA integrity_check` para verificar se há corrupção no arquivo do banco de dados.
-   **Reindexar:** Recria todos os índices do banco de dados. Útil se houver suspeita de que os índices estão corrompidos ou não otimizados.

---

## 4. Vantagens e Desvantagens

### Vantagens:

-   **Simplicidade:** Extremamente fácil de configurar e manter.
-   **Performance:** Para aplicações com concorrência de escrita baixa a moderada, como o TSiJUKEBOX, o modo WAL oferece excelente performance.
-   **Backup Fácil:** Fazer backup é tão simples quanto copiar um arquivo.

### Desvantagens:

-   **Concorrência de Escrita:** Embora o modo WAL ajude, o SQLite não é ideal para cenários com um número muito alto de escritas concorrentes. Nesses casos, um SGBD cliente-servidor como PostgreSQL ou MariaDB é mais indicado.
-   **Escalabilidade:** Não escala horizontalmente. A performance está limitada aos recursos (I/O do disco, CPU) de uma única máquina.
-   **Ferramentas de Rede:** Por ser um banco de dados embarcado, não pode ser acessado diretamente pela rede por ferramentas de administração de banco de dados, a menos que se use um proxy ou uma camada de API.

Para a grande maioria dos casos de uso do TSiJUKEBOX, o SQLite é a escolha perfeita, oferecendo um ótimo equilíbrio entre simplicidade, performance e confiabilidade._
