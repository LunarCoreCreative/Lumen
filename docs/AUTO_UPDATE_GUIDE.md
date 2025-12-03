# 🚀 Sistema de Auto-Update Automatizado

## ✨ O que mudou?

Agora você **NÃO precisa mais** copiar manualmente SHA512 e URLs! Tudo é automático! 🎉

## 📦 Como publicar uma nova versão

### 1️⃣ Atualize a versão no `package.json`
```json
"version": "0.0.11"  // Mude para a nova versão
```

### 2️⃣ Execute UM ÚNICO comando
```bash
.\publicar_release.bat
```

**Isso vai:**
- ✅ Fazer build do app
- ✅ Criar o instalador
- ✅ Publicar no GitHub Releases
- ✅ **Automaticamente** ler o SHA512 do `latest.yml`
- ✅ **Automaticamente** atualizar o Firestore com SHA512 + URL

### 3️⃣ Pronto! 🎉
Os usuários receberão a atualização automaticamente!

---

## 🔧 Configuração Inicial (Apenas uma vez)

Você precisa configurar as credenciais do Firebase. Siga o guia completo:

📖 **[FIREBASE_AUTO_UPDATE_SETUP.md](./docs/FIREBASE_AUTO_UPDATE_SETUP.md)**

**Resumo rápido:**
1. Baixe o Service Account JSON do Firebase Console
2. Configure 3 variáveis de ambiente:
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_CLIENT_EMAIL`
   - `FIREBASE_PRIVATE_KEY`

---

## 🛠️ Comandos Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run build:win` | Apenas cria o instalador (sem publicar) |
| `npm run publish:win` | Publica no GitHub |
| `npm run update-firestore` | Atualiza Firestore com dados do último build |
| `.\publicar_release.bat` | **Faz tudo automaticamente** ⭐ |

---

## 🔍 Como funciona?

1. O `electron-builder` gera um arquivo `latest.yml` com:
   ```yaml
   version: 0.0.11
   files:
     - url: Lumen-Setup-0.0.11.exe
       sha512: abc123def456...
       size: 123456789
   ```

2. O script `update-firestore-from-release.js`:
   - Lê o `latest.yml`
   - Extrai SHA512, tamanho, nome do arquivo
   - Constrói a URL do GitHub automaticamente
   - Atualiza o Firestore via REST API

3. O app dos usuários:
   - Verifica o Firestore periodicamente
   - Compara versões
   - Baixa e instala automaticamente! 🚀

---

## 🎯 Estrutura do Firestore

O documento `config/updates` fica assim:

```javascript
{
  currentVersion: "0.0.11",
  releaseDate: "2025-12-03T12:00:00.000Z",
  downloadUrl: "https://github.com/LunarCoreCreative/Lumen/releases/download/v0.0.11/Lumen-Setup-0.0.11.exe",
  sha512: "abc123def456...",
  fileSize: 123456789,
  changelog: "Release v0.0.11",
  fileName: "Lumen-Setup-0.0.11.exe"
}
```

**Tudo preenchido automaticamente!** ✨

---

## 🐛 Troubleshooting

### "Credenciais do Firebase não configuradas"
→ Configure as variáveis de ambiente (veja o guia completo)

### "latest.yml não encontrado"
→ Execute `npm run build:win` primeiro

### "Firestore update falhou: 401"
→ Verifique se a chave privada do Firebase está correta

---

## 📚 Arquivos Importantes

- `scripts/update-firestore-from-release.js` - Script principal de atualização
- `publicar_release.bat` - Automação completa
- `docs/FIREBASE_AUTO_UPDATE_SETUP.md` - Guia de configuração
- `electron-builder.yml` - Configuração do builder

---

**Feito com ❤️ para simplificar sua vida!**
