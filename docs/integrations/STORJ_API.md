# Integração com Storj (Backup na Nuvem)

**Tipo:** Documentação de Integração
**Serviço:** Storj
**Versão:** 1.0.0

---

## 1. Visão Geral

O TSiJUKEBOX utiliza o **Storj** como sua solução principal para backups automáticos e manuais na nuvem. Storj é uma plataforma de armazenamento de objetos descentralizada que oferece segurança, privacidade e economia superiores em comparação com provedores de nuvem tradicionais.

### Por que Storj?

-   **Descentralização:** Os arquivos são criptografados, divididos em pedaços e distribuídos por uma rede global de nós, eliminando pontos únicos de falha.
-   **Segurança e Privacidade:** A criptografia é ponta-a-ponta (end-to-end) e ocorre no lado do cliente. Apenas o usuário, com seu `Access Grant`, pode acessar os dados. Nem mesmo a Storj pode ver o conteúdo dos arquivos.
-   **Compatibilidade S3:** A API do Storj é compatível com a API do Amazon S3, o que facilita a integração usando bibliotecas e ferramentas existentes.
-   **Custo-Benefício:** Geralmente oferece preços mais baixos para armazenamento e, principalmente, para tráfego de saída (egress) do que os grandes provedores de nuvem.

---

## 2. Arquitetura da Integração

A funcionalidade de backup é gerenciada por um serviço de backend no TSiJUKEBOX, que se comunica diretamente com a API do Storj.

1.  **Coleta de Dados:** O serviço de backup coleta os dados a serem salvos (configurações, banco de dados SQLite, playlists, etc.) e os comprime em um único arquivo (ex: `backup-20241225-030000.tar.gz`).
2.  **Criptografia no Cliente:** Antes do upload, este arquivo comprimido é criptografado usando AES-256. A chave de criptografia é derivada do `Access Grant` do usuário, garantindo que apenas ele possa descriptografar os dados.
3.  **Upload para o Storj:** Usando a biblioteca compatível com S3 (como `aws-sdk` ou `minio-js`), o arquivo criptografado é enviado para o bucket `tsijukebox-backup` no Storj.
4.  **Restauração:** O processo inverso é realizado para a restauração. O arquivo é baixado do Storj, descriptografado no lado do cliente e, em seguida, descomprimido para restaurar os dados da aplicação.

### Componentes Envolvidos:

-   **Frontend:** A interface de usuário em **Configurações > Backup** permite que o administrador configure o `Access Grant`, agende backups, inicie backups manuais e restaure a partir de um backup existente.
-   **Backend (API Local):**
    -   Expõe endpoints para o frontend gerenciar as operações de backup.
    -   Contém a lógica para agendamento de tarefas (usando `cron` ou similar).
    -   Implementa o fluxo de coleta, compressão, criptografia, upload, download e restauração.

---

## 3. Configuração

A configuração da integração com o Storj é um pré-requisito para usar a funcionalidade de backup na nuvem.

### Passo 1: Obter um Access Grant no Storj

1.  **Crie uma Conta:** Registre-se em [storj.io](https://www.storj.io).
2.  **Crie um Bucket:** No painel do Storj, crie um novo bucket (ex: `tsijukebox-backup`).
3.  **Crie Credenciais S3:** Na seção "Access", crie um novo conjunto de credenciais S3. É crucial definir as permissões corretamente, limitando o acesso apenas ao bucket criado.
4.  **Copie as Credenciais:** Guarde o `Access Key ID`, `Secret Access Key` e o `Endpoint` do gateway S3.

### Passo 2: Configurar no TSiJUKEBOX

1.  Navegue até **Configurações > Backup > Provedores de Nuvem**.
2.  Selecione **Storj (S3 Compatible)**.
3.  Insira as credenciais obtidas no passo anterior.
4.  Clique em **"Testar Conexão"** para verificar se o TSiJUKEBOX consegue se comunicar com o seu bucket.
5.  Salve as configurações.

---

## 4. Uso da API e Bibliotecas

O backend do TSiJUKEBOX utiliza bibliotecas padrão compatíveis com S3 para interagir com o Storj. Em um backend Node.js, por exemplo, o cliente S3 da AWS SDK v3 seria configurado da seguinte forma:

```typescript
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";

// Configuração do cliente S3 para apontar para o gateway do Storj
const s3Client = new S3Client({
  endpoint: "https://gateway.storjshare.io",
  region: "us-east-1", // A região pode ser um valor padrão
  credentials: {
    accessKeyId: "YOUR_ACCESS_KEY_ID",
    secretAccessKey: "YOUR_SECRET_ACCESS_KEY",
  },
});

// Função para fazer upload de um backup
async function uploadBackup(filePath: string, bucketName: string) {
  const fileStream = fs.createReadStream(filePath);
  const uploadParams = {
    Bucket: bucketName,
    Key: `backups/${new Date().toISOString()}.tar.gz.enc`,
    Body: fileStream,
  };

  try {
    const data = await s3Client.send(new PutObjectCommand(uploadParams));
    console.log("Upload bem-sucedido:", data);
  } catch (err) {
    console.error("Erro no upload:", err);
  }
}
```

---

## 5. Segurança e Boas Práticas

-   **Princípio do Menor Privilégio:** Ao criar as credenciais no Storj, conceda apenas as permissões estritamente necessárias (leitura, escrita, exclusão) e restrinja o acesso apenas ao bucket de backup.
-   **Proteção das Credenciais:** As credenciais de acesso ao Storj são informações sensíveis e devem ser armazenadas de forma segura no backend (ex: usando variáveis de ambiente ou um serviço de gerenciamento de segredos), nunca expostas no frontend.
-   **Monitoramento:** Monitore regularmente o uso do seu bucket no painel do Storj para controlar custos e detectar atividades anormais.
-   **Testes de Restauração:** Realize testes de restauração periodicamente para garantir que os backups estão íntegros e que o processo de recuperação funciona como esperado.
