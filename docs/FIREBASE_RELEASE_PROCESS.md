# Processo de Release com Firebase

## 1. Build Local
```bash
npm run build:win
```

Isso irá gerar o arquivo `.exe` em `dist-electron/`

## 2. Upload para Firebase

```bash
npm run upload-build <versão> <caminho-do-exe> "<changelog>"
```

**Exemplo:**
```bash
npm run upload-build 0.0.7 "./dist-electron/Lumen Setup 0.0.7.exe" "Bug fixes e melhorias de performance"
```

## 3. Verificar

- O script irá fazer upload para Firebase Storage
- Atualizará o Firestore com os metadados
- Criará e enviará o arquivo `latest.yml`

## 4. Testar

1. Instale uma versão antiga do app
2. Abra o app
3. Aguarde ~5 segundos
4. Deve aparecer notificação de nova versão

---

## Configuração Inicial (Uma Vez)

### 1. Obter Service Account do Firebase

1. Acesse: https://console.firebase.google.com/
2. Selecione seu projeto "Lumen"
3. Vá em **⚙️ Configurações do Projeto** → **Contas de Serviço**
4. Clique em **Gerar nova chave privada**
5. Salve o arquivo JSON baixado

### 2. Configurar Service Account

Copie o conteúdo do arquivo JSON baixado e cole em:
```
scripts/firebase-service-account.json
```

### 3. Instalar Dependências

```bash
npm install
```

### 4. Configurar Storage Rules (Firebase Console)

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /releases/{allPaths=**} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

### 5. Configurar Firestore Rules (Firebase Console)

```javascript
match /config/updates {
  allow read: if true;
  allow write: if false;
}
```

---

## Troubleshooting

### Erro: "Service account not found"
- Verifique se `scripts/firebase-service-account.json` existe
- Verifique se o JSON está válido

### Erro: "Permission denied"
- Verifique as regras do Storage
- Verifique se a service account tem permissões de Admin

### Update não aparece no app
- Verifique se o documento `config/updates` foi criado no Firestore
- Verifique se a versão no Firestore é maior que a do app
- Verifique os logs do Electron: `%APPDATA%/Lumen/logs/`
