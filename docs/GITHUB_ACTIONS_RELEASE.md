# GitHub Actions - Auto-Build e Upload 🚀

## Como Funciona

1. **Você cria uma tag** (ex: `v0.0.7`)
2. **GitHub Actions roda automaticamente** em servidor Windows
3. **Faz build** do `.exe`
4. **Upload para Cloudinary** automaticamente
5. **Atualiza Firestore** com metadados
6. **Usuários recebem notificação** de update!

---

## Setup Inicial (Uma Vez)

### 1. Configurar Secrets no GitHub

Acesse: `https://github.com/LunarCoreCreative/Lumen/settings/secrets/actions`

Adicione os seguintes secrets:

#### **Cloudinary:**
- `CLOUDINARY_CLOUD_NAME` = `dasntpbd3`
- `CLOUDINARY_API_KEY` = (encontre em https://cloudinary.com/console)
- `CLOUDINARY_API_SECRET` = (encontre em https://cloudinary.com/console)

#### **Firebase:**
- `FIREBASE_PROJECT_ID` = `lumen-b4bf0`
- `FIREBASE_CLIENT_EMAIL` = (do arquivo service account JSON)
- `FIREBASE_PRIVATE_KEY` = (do arquivo service account JSON, a chave completa incluindo `-----BEGIN PRIVATE KEY-----`)

### 2. Criar Upload Preset no Cloudinary (se ainda não criou)

1. Acesse: https://cloudinary.com/console
2. **Settings** → **Upload** → **Upload presets**
3. **Add upload preset**
4. Nome: `lumen_builds`
5. Signing Mode: **Signed** (não unsigned!)
6. Salvar

### 3. Configurar Firestore Rules

```javascript
match /config/updates {
  allow read: if true;
  allow write: if false;
}
```

---

## Como Criar uma Release

É **super simples**! Apenas 3 comandos:

```bash
# 1. Atualizar versão no package.json
# Edite manualmente ou use:
npm version 0.0.7 --no-git-tag-version

# 2. Commit
git add .
git commit -m "chore: release v0.0.7"

# 3. Criar tag e enviar
git tag v0.0.7
git push origin main --tags
```

**Pronto!** O GitHub Actions faz todo o resto automaticamente! 🎉

---

## Acompanhar o Progresso

Acesse: `https://github.com/LunarCoreCreative/Lumen/actions`

Você verá:
- ✅ Build em progresso
- ✅ Upload para Cloudinary
- ✅ Update do Firestore
- ✅ Criação do Release no GitHub (opcional)

Leva ~5 minutos total.

---

## Testar o Auto-Update

### 1. Criar release de teste
```bash
npm version 0.0.7 --no-git-tag-version
git commit -am "chore: release v0.0.7"
git tag v0.0.7
git push origin main --tags
```

### 2. Aguardar build (~5 min)
- Verifique no GitHub Actions

### 3. Instalar versão antiga
- Instale a v0.0.6 (ou anterior)

### 4. Abrir app
- Aguarde ~5 segundos
- Deve aparecer notificação de v0.0.7!

### 5. Atualizar
- Clique "Baixar Agora"
- Aguarde download
- Clique "Instalar e Reiniciar"
- App reinicia com v0.0.7! ✨

---

## Troubleshooting

### Build falhou no GitHub Actions
- Verifique os logs em `Actions`
- Confirme que todos os secrets estão configurados

### Upload para Cloudinary falhou
- Verifique API Key e Secret
- Confirme que o upload preset existe
- Mode deve ser **Signed** (não unsigned)

### Firestore não atualiza
- Verifique se o Private Key está correto
- Confirme o Project ID
- Veja logs do GitHub Actions para detalhes

### App não detecta update
- Confirme que documento `config/updates` existe no Firestore
- Verifique se a versão é maior que a instalada
- Veja logs: `%APPDATA%/Lumen/logs/main.log`

---

## Vantagens deste Sistema

✅ **Totalmente Automático** - Só criar tag!  
✅ **Funciona em VM** - Build roda no GitHub  
✅ **Confiável** - Cloudinary + Firebase  
✅ **Grátis** - 2000 min/mês GitHub Actions  
✅ **Profissional** - Pipeline completo de CI/CD  
✅ **Controle Total** - Nosso código, sem bugs de terceiros  
