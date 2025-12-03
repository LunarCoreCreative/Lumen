# 🚀 Guia Rápido - Publicação de Release

## ☁️ Você já tem as credenciais configuradas no GitHub!

Como você mencionou que já configurou os secrets no GitHub, o processo é ainda mais simples:

### 🤖 **Opção 1: Automático via GitHub Actions (Recomendado)**

1. **Atualize a versão** no `package.json`:
   ```json
   "version": "0.0.11"
   ```

2. **Commit e crie uma tag**:
   ```bash
   git add .
   git commit -m "Release v0.0.11"
   git tag v0.0.11
   git push origin main
   git push origin v0.0.11
   ```

3. **Pronto!** 🎉
   - O GitHub Actions vai:
     - ✅ Fazer build automaticamente
     - ✅ Criar o instalador
     - ✅ Publicar no GitHub Releases
     - ✅ Atualizar o Firestore com SHA512 e URL
   
   Acompanhe em: https://github.com/LunarCoreCreative/Lumen/actions

---

### 💻 **Opção 2: Local (Para testes)**

Se você quiser testar localmente antes de publicar:

#### Configurar credenciais localmente (apenas uma vez):

**Windows PowerShell:**
```powershell
# Abra PowerShell e execute:
$env:FIREBASE_PROJECT_ID = "seu-projeto-id"
$env:FIREBASE_CLIENT_EMAIL = "firebase-adminsdk-xxxxx@seu-projeto.iam.gserviceaccount.com"
$env:FIREBASE_PRIVATE_KEY = "-----BEGIN PRIVATE KEY-----
...sua chave aqui...
-----END PRIVATE KEY-----"
```

> 💡 **Dica:** Pegue esses valores dos secrets do GitHub ou do Service Account JSON

#### Publicar:
```bash
.\publicar_release.bat
```

---

## 📊 Fluxo Completo (GitHub Actions)

```mermaid
graph LR
    A[Criar tag v0.0.11] --> B[Push para GitHub]
    B --> C[GitHub Actions inicia]
    C --> D[npm install]
    D --> E[npm run build]
    E --> F[electron-builder]
    F --> G[Gera latest.yml com SHA512]
    G --> H[Script lê latest.yml]
    H --> I[Atualiza Firestore]
    I --> J[Publica Release no GitHub]
    J --> K[✅ Usuários recebem update!]
```

---

## 🎯 Resumo

| Ação | Comando |
|------|---------|
| **Publicar via GitHub** | `git tag v0.0.X && git push origin v0.0.X` |
| **Publicar localmente** | `.\publicar_release.bat` |
| **Apenas build local** | `npm run build:win` |
| **Testar update Firestore** | `npm run update-firestore` |

---

## ✅ Checklist de Release

- [ ] Atualizar versão no `package.json`
- [ ] Testar o app localmente (`npm run electron:dev`)
- [ ] Commit das mudanças
- [ ] Criar tag `v0.0.X`
- [ ] Push da tag para o GitHub
- [ ] Aguardar GitHub Actions concluir
- [ ] Verificar release em: https://github.com/LunarCoreCreative/Lumen/releases
- [ ] Testar auto-update abrindo o app

---

## 🔍 Verificar se funcionou

1. **GitHub Actions:** https://github.com/LunarCoreCreative/Lumen/actions
   - Deve mostrar ✅ em todas as etapas

2. **GitHub Releases:** https://github.com/LunarCoreCreative/Lumen/releases
   - Deve ter o arquivo `.exe` disponível para download

3. **Firestore Console:** 
   - Vá em `config/updates`
   - Deve mostrar a nova versão, SHA512 e URL

4. **No App:**
   - Abra o Lumen
   - Deve detectar a atualização automaticamente
   - Baixar e instalar ao fechar o app

---

**Tudo pronto! Agora é só criar a tag e deixar a mágica acontecer! 🪄✨**
