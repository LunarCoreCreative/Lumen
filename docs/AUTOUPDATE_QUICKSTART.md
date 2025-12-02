# 🚀 Guia Rápido - Autoupdate do Lumen

## ⚡ Desenvolvimento

```bash
# Modo desenvolvimento (sem autoupdate)
npm run electron:dev
```

## 📦 Build Local

```bash
# Build completo (Vite + Electron)
npm run build:win
```

Arquivos gerados em `dist-electron/`:
- `Lumen Setup 0.1.0.exe` - Instalador
- `latest.yml` - Metadados de update

## 🎯 Publicar Nova Versão

### 1. Configure o Token do GitHub

```bash
# PowerShell
$env:GH_TOKEN="seu_token_aqui"
```

Obtenha o token em: https://github.com/settings/tokens (permissão `repo`)

### 2. Atualize a Versão

```bash
# Correção de bug: 0.1.0 -> 0.1.1
npm version patch

# Nova funcionalidade: 0.1.0 -> 0.2.0
npm version minor

# Mudança major: 0.1.0 -> 1.0.0
npm version major
```

### 3. Push para o GitHub

```bash
git push
git push --tags
```

### 4. Publique

```bash
npm run publish:win
```

Isso irá:
- ✅ Build do app
- ✅ Criar instalador
- ✅ Upload para GitHub Releases
- ✅ Usuários receberão notificação de atualização automaticamente

## 🧪 Testar Autoupdate

1. Instale a versão atual do app
2. Incremente a versão e publique
3. Abra o app instalado
4. Aguarde 5 segundos
5. Notificação de atualização deve aparecer

## 📚 Documentação Completa

Veja `docs/RELEASE_PROCESS.md` para detalhes completos.

## ⚠️ Importante

- Autoupdate **NÃO funciona** em modo desenvolvimento (`npm run electron:dev`)
- Autoupdate **APENAS funciona** no app instalado
- Sempre teste a atualização antes de publicar para usuários finais
