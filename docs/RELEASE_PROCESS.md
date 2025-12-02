# Processo de Release - Lumen

Este documento descreve o processo completo para criar e distribuir novas versões do Lumen com autoupdate.

## 📋 Pré-requisitos

1. **GitHub Personal Access Token**
   - Acesse: https://github.com/settings/tokens
   - Clique em "Generate new token (classic)"
   - Marque a permissão `repo` (acesso completo a repositórios)
   - Copie o token gerado
   - Configure a variável de ambiente:
     ```bash
     # Windows (PowerShell)
     $env:GH_TOKEN="seu_token_aqui"
     
     # Windows (CMD)
     set GH_TOKEN=seu_token_aqui
     ```

2. **Código commitado e pushed**
   - Certifique-se de que todas as alterações estão commitadas
   - Push para o repositório GitHub

## 🚀 Criando uma Nova Release

### Passo 1: Atualizar a Versão

Escolha o tipo de atualização:

```bash
# Para correções de bugs (0.1.0 -> 0.1.1)
npm version patch

# Para novas funcionalidades (0.1.0 -> 0.2.0)
npm version minor

# Para mudanças incompatíveis (0.1.0 -> 1.0.0)
npm version major
```

Isso irá:
- Atualizar a versão no `package.json`
- Criar um commit automático
- Criar uma tag git

### Passo 2: Push das Mudanças

```bash
git push
git push --tags
```

### Passo 3: Build e Publicação

**Opção A: Publicação Automática (Recomendado)**
```bash
npm run publish:win
```

Isso irá:
1. Fazer build do Vite (frontend)
2. Fazer build do Electron (app nativo)
3. Criar o instalador NSIS
4. Fazer upload automático para GitHub Releases

**Opção B: Build Local (Para Testes)**
```bash
npm run build:win
```

Os arquivos gerados estarão em `dist-electron/`:
- `Lumen Setup 0.1.0.exe` - Instalador completo
- `latest.yml` - Arquivo de metadados para autoupdate

### Passo 4: Verificar a Release

1. Acesse: https://github.com/RimuSrPao/Lumen/releases
2. Verifique se a release foi criada automaticamente
3. Edite a release para adicionar notas de versão (changelog)
4. Publique a release (se estiver como draft)

## 🧪 Testando Atualizações Localmente

### Teste 1: Instalação Inicial

1. Instale a versão atual do app
2. Execute o app e verifique se funciona

### Teste 2: Atualização

1. Incremente a versão (ex: 0.1.0 -> 0.1.1)
2. Faça build e publique a nova versão
3. Abra o app da versão anterior
4. Aguarde 5 segundos (verificação automática)
5. Deve aparecer a notificação de atualização
6. Clique em "Baixar Agora"
7. Aguarde o download completar
8. Clique em "Instalar e Reiniciar"
9. Verifique se o app reiniciou com a nova versão

## 📝 Versionamento Semântico

Siga o padrão [SemVer](https://semver.org/):

- **MAJOR** (1.0.0): Mudanças incompatíveis na API
- **MINOR** (0.1.0): Novas funcionalidades compatíveis
- **PATCH** (0.0.1): Correções de bugs compatíveis

### Exemplos:

```
0.1.0 -> 0.1.1  (Correção de bug)
0.1.1 -> 0.2.0  (Nova funcionalidade)
0.2.0 -> 1.0.0  (Primeira versão estável)
```

## 🔧 Troubleshooting

### Erro: "GH_TOKEN not set"

**Problema**: Token do GitHub não configurado

**Solução**:
```bash
$env:GH_TOKEN="seu_token_aqui"
```

### Erro: "Cannot find module electron-updater"

**Problema**: Dependência não instalada

**Solução**:
```bash
npm install
```

### Erro: "ENOENT: no such file or directory, open 'dist/index.html'"

**Problema**: Build do Vite não foi executado

**Solução**:
```bash
npm run build
npm run build:win
```

### App não detecta atualizações

**Possíveis causas**:
1. Está em modo desenvolvimento (autoupdate desabilitado)
2. Versão instalada é igual ou maior que a disponível
3. Arquivo `latest.yml` não foi publicado no GitHub
4. Token do GitHub expirou ou sem permissões

**Solução**:
1. Verifique se está executando o app instalado (não `npm run electron:dev`)
2. Verifique a versão no `package.json` vs versão instalada
3. Verifique se a release tem o arquivo `latest.yml`
4. Gere um novo token do GitHub

## 📦 Estrutura de Arquivos da Release

Cada release no GitHub deve conter:

```
Lumen Setup 0.1.0.exe       # Instalador completo (~100-200MB)
latest.yml                   # Metadados para autoupdate
```

O arquivo `latest.yml` contém:
```yaml
version: 0.1.0
files:
  - url: Lumen Setup 0.1.0.exe
    sha512: [hash do arquivo]
    size: [tamanho em bytes]
path: Lumen Setup 0.1.0.exe
sha512: [hash do arquivo]
releaseDate: 2024-12-02T12:00:00.000Z
```

## 🎯 Boas Práticas

1. **Sempre teste localmente** antes de publicar
2. **Escreva notas de versão claras** no GitHub
3. **Incremente a versão corretamente** (SemVer)
4. **Mantenha um CHANGELOG.md** com todas as mudanças
5. **Teste a atualização** de versões anteriores
6. **Não delete releases antigas** (usuários podem estar usando)

## 🔄 Workflow Recomendado

```bash
# 1. Desenvolver e testar
npm run electron:dev

# 2. Commitar mudanças
git add .
git commit -m "feat: nova funcionalidade X"

# 3. Atualizar versão
npm version minor

# 4. Push
git push
git push --tags

# 5. Publicar
$env:GH_TOKEN="seu_token"
npm run publish:win

# 6. Verificar release no GitHub
# 7. Adicionar notas de versão
# 8. Publicar release
```

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs em `%APPDATA%/Lumen/logs/`
2. Consulte a documentação do electron-updater
3. Verifique issues no GitHub do projeto
