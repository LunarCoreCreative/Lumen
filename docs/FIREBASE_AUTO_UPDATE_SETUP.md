# 🔥 Configuração do Firebase para Auto-Update

Este guia explica como configurar as credenciais do Firebase para que o sistema de auto-update funcione automaticamente.

## 📋 O que você precisa

1. **Service Account do Firebase** (arquivo JSON com credenciais)
2. **Variáveis de ambiente** configuradas no seu sistema

---

## 🔑 Passo 1: Obter Service Account

1. Acesse o [Firebase Console](https://console.firebase.google.com/)
2. Selecione seu projeto **Lumen**
3. Vá em **⚙️ Configurações do Projeto** > **Contas de serviço**
4. Clique em **Gerar nova chave privada**
5. Salve o arquivo JSON em um local seguro (NÃO commite no Git!)

O arquivo terá este formato:
```json
{
  "type": "service_account",
  "project_id": "seu-projeto-id",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@seu-projeto.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "...",
  "token_uri": "...",
  "auth_provider_x509_cert_url": "...",
  "client_x509_cert_url": "..."
}
```

---

## 🪟 Passo 2: Configurar Variáveis de Ambiente (Windows)

### Opção A: Configuração Permanente (Recomendado)

1. Pressione `Win + R` e digite: `sysdm.cpl`
2. Vá na aba **Avançado** > **Variáveis de Ambiente**
3. Em **Variáveis do usuário**, clique em **Novo** e adicione:

   **Variável 1:**
   - Nome: `FIREBASE_PROJECT_ID`
   - Valor: `seu-projeto-id` (do arquivo JSON)

   **Variável 2:**
   - Nome: `FIREBASE_CLIENT_EMAIL`
   - Valor: `firebase-adminsdk-xxxxx@seu-projeto.iam.gserviceaccount.com` (do arquivo JSON)

   **Variável 3:**
   - Nome: `FIREBASE_PRIVATE_KEY`
   - Valor: Cole a chave privada completa (incluindo `-----BEGIN PRIVATE KEY-----` e `-----END PRIVATE KEY-----`)

4. Clique em **OK** em todas as janelas
5. **IMPORTANTE:** Reinicie o PowerShell/Terminal para aplicar as mudanças

### Opção B: Configuração Temporária (Para testes)

Abra o PowerShell e execute:

```powershell
$env:FIREBASE_PROJECT_ID = "seu-projeto-id"
$env:FIREBASE_CLIENT_EMAIL = "firebase-adminsdk-xxxxx@seu-projeto.iam.gserviceaccount.com"
$env:FIREBASE_PRIVATE_KEY = "-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...
-----END PRIVATE KEY-----"
```

> ⚠️ **Nota:** Esta configuração só vale para a sessão atual do PowerShell.

---

## ✅ Passo 3: Verificar Configuração

Execute este comando para testar:

```bash
npm run update-firestore
```

Se estiver tudo certo, você verá:
```
🚀 Iniciando atualização do Firestore...
📦 Versão detectada: 0.0.10
✅ latest.yml encontrado
...
✅ Firestore atualizado com sucesso!
```

---

## 🚀 Como Usar

### Publicar uma nova versão:

1. **Atualize a versão** no `package.json`:
   ```json
   "version": "0.0.11"
   ```

2. **Execute o script de publicação**:
   ```bash
   .\publicar_release.bat
   ```

   Ou manualmente:
   ```bash
   npm run publish:win
   npm run update-firestore
   ```

3. **Pronto!** O Firestore será atualizado automaticamente com:
   - ✅ SHA512 do instalador
   - ✅ URL de download do GitHub
   - ✅ Tamanho do arquivo
   - ✅ Data de release

---

## 🤖 GitHub Actions (CI/CD)

Para automatizar no GitHub Actions, adicione as variáveis como **Secrets**:

1. Vá em **Settings** > **Secrets and variables** > **Actions**
2. Adicione os secrets:
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_CLIENT_EMAIL`
   - `FIREBASE_PRIVATE_KEY`

O workflow já está configurado para usar essas variáveis automaticamente.

---

## 🔒 Segurança

- ❌ **NUNCA** commite o arquivo JSON do Service Account
- ❌ **NUNCA** commite as variáveis de ambiente
- ✅ Adicione `*.json` no `.gitignore` (já está configurado)
- ✅ Use secrets do GitHub para CI/CD

---

## 🐛 Troubleshooting

### Erro: "Credenciais do Firebase não configuradas"
- Verifique se as variáveis de ambiente estão definidas
- Reinicie o terminal/PowerShell
- Verifique se não há espaços extras nos valores

### Erro: "Firestore update falhou: 401"
- Verifique se a chave privada está completa (incluindo BEGIN/END)
- Confirme que o Service Account tem permissões de escrita no Firestore

### Erro: "latest.yml não encontrado"
- Execute `npm run build:win` primeiro para gerar o instalador

---

## 📚 Referências

- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Electron Builder](https://www.electron.build/)
- [Electron Updater](https://www.electron.build/auto-update)
