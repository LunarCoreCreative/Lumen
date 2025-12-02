# Auto-Update com Cloudinary 🔥

## Setup Inicial (Uma Vez)

### 1. Criar Upload Preset no Cloudinary

1. Acesse: https://cloudinary.com/console
2. Vá em **Settings** → **Upload**
3. Role até **Upload presets**
4. Clique em **Add upload preset**
5. Configure:
   - **Preset name:** `lumen_builds`
   - **Signing Mode:** Unsigned
   - **Folder:** `lumen/releases` (opcional)
6. Salve

### 2. Configurar Firestore Rules

No Firebase Console, adicione esta regra ao Firestore:

```javascript
match /config/updates {
  allow read: if true;   // Público para leitura
  allow write: if false; // Apenas via scripts
}
```

---

## Como Usar - Criar Release

### 1. Build Local
```bash
npm run build:win
```

Isso gera o `.exe` em `dist-electron/`

### 2. Upload para Cloudinary
```bash
npm run upload-build <versão> "<caminho-do-exe>" "<changelog>"
```

**Exemplo:**
```bash
npm run upload-build 0.0.7 "./dist-electron/Lumen Setup 0.0.7.exe" "Bug fixes e melhorias"
```

### 3. O que acontece automaticamente:
- ✅ Calcula SHA512 do arquivo
- ✅ Upload para Cloudinary
- ✅ Atualiza Firestore com metadados
- ✅ Usuários recebem notificação de update

---

## Testar o Sistema

### 1. Criar primeira release
```bash
npm run build:win
npm run upload-build 0.0.7 "./dist-electron/Lumen Setup 0.0.7.exe" "Teste Cloudinary"
```

### 2. Instalar versão antiga (0.0.6)
- Instale a versão atual do app

### 3. Verificar update
- Abra o app
- Aguarde ~5 segundos
- Deve aparecer notificação de atualização para v0.0.7

### 4. Baixar e instalar
- Clique em "Baixar Agora"
- Aguarde download
- Clique em "Instalar e Reiniciar"
- App reinicia com nova versão!

---

## Vantagens do Cloudinary

✅ **Grátis:** 10GB storage + 25GB bandwidth/mês  
✅ **Rápido:** CDN global  
✅ **Confiável:** 99.9% uptime  
✅ **Simples:** Você já usa para imagens  
✅ **Sem Billing:** Não precisa adicionar cartão  

---

## Troubleshooting

### Erro: "Upload preset not found"
- Crie o preset `lumen_builds` no Cloudinary
- Certifique-se que é **Unsigned**

### Erro: "Firestore permission denied"
- Verifique as regras do Firestore
- Confirme que `config/updates` permite leitura pública

### Update não aparece no app
- Verifique se o documento `config/updates` foi criado
- Confirme que a versão no Firestore é maior que a local
- Veja os logs: `%APPDATA%/Lumen/logs/main.log`

### Download muito lento
- Normal em primeira tentativa (Cloudinary faz cache)
- Downloads subsequentes são muito mais rápidos

---

## Estrutura no Cloudinary

```
lumen/releases/
  ├── v0.0.7/
  │   └── Lumen_Setup_0.0.7.exe
  ├── v0.0.8/
  │   └── Lumen_Setup_0.0.8.exe
  ...
```

---

## Firestore - Documento `config/updates`

```json
{
  "currentVersion": "0.0.7",
  "releaseDate": "2025-12-02T19:50:00Z",
  "downloadUrl": "https://res.cloudinary.com/dasntpbd3/raw/upload/...",
  "sha512": "abc123...",
  "fileSize": 123456789,
  "changelog": "Bug fixes e melhorias",
  "fileName": "Lumen Setup 0.0.7.exe"
}
```
