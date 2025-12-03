# Lumen 🌟

> **O Hub Social Definitivo para Programadores e Gamers**

O **Lumen** é uma plataforma centralizada projetada para conectar mentes criativas e jogadores apaixonados. Mais do que uma rede social, é um hub onde código e jogos se encontram.

🚧 **Status do Projeto**: *Em Desenvolvimento Ativo* 🚧

## 🚀 Sobre o Projeto

O Lumen visa criar um ambiente amigável e produtivo onde você pode:
-   **Conectar-se**: Encontre parceiros de código ou de equipe para seus jogos favoritos.
-   **Compartilhar**: Mostre seus projetos, snippets de código ou clipes de jogos.
-   **Interagir**: Chat em tempo real, sistema de amigos e feed de atualizações.

## ✨ Funcionalidades Principais

### 🎮 Gaming Hub
Um espaço dedicado para suas comunidades de jogos favoritas.
-   **No Man's Sky**: Compartilhe e descubra receitas de refinamento, coordenadas e dicas.
-   **Em Breve**: Suporte para mais jogos e ferramentas comunitárias.

### 📰 News Feed & Dashboard
Mantenha-se atualizado com o que está acontecendo.
-   **Feed de Notícias**: Artigos e novidades sobre desenvolvimento e jogos.
-   **Postagens**: Compartilhe seus pensamentos com suporte a markdown e blocos de código.
-   **Comentários**: Interaja com a comunidade através de threads de comentários.

### 👥 Social & Perfil
-   **Sistema de Amigos**: Adicione amigos, veja status online/offline em tempo real.
-   **Perfil Personalizável**: Altere seu avatar, banner e informações pessoais.
-   **Chat em Tempo Real**: Converse com seus amigos instantaneamente.

### 🛡️ Administração
-   **Owner Panel**: Ferramentas exclusivas para gerenciamento da plataforma.
-   **Moderação**: Controle de conteúdo e usuários para manter a comunidade segura.

## 🛠️ Tecnologias Utilizadas

Este projeto é construído com uma stack moderna e performática:

-   **Frontend**: [React](https://react.dev/)
-   **Desktop App**: [Electron](https://www.electronjs.org/)
-   **Build Tool**: [Vite](https://vitejs.dev/)
-   **Backend/Database**: [Firebase](https://firebase.google.com/) (Firestore, Auth, Storage)

## 📦 Como Rodar o Projeto

Para rodar o Lumen localmente em sua máquina:

1.  **Clone o repositório**:
    ```bash
    git clone https://github.com/RimuSrPao/Lumen.git
    cd Lumen
    ```

2.  **Instale as dependências**:
    ```bash
    npm install
    ```

3.  **Configure o Firebase**:
    - Crie um projeto no Firebase Console.
    - Crie um arquivo `.env` na raiz do projeto com suas credenciais.

4.  **Inicie o modo de desenvolvimento**:
    ```bash
    npm run dev
    ```
    *Isso abrirá a versão web no seu navegador.*

5.  **Para rodar a versão Desktop (Electron)**:
    ```bash
    npm run electron:dev
    # ou use o script iniciar_app.bat no Windows
    ```

## 🔄 Sistema de Auto-Update

O Lumen possui um sistema de atualização automática integrado! Quando uma nova versão é lançada:

1. ✅ O app detecta automaticamente a atualização
2. ✅ Baixa em segundo plano
3. ✅ Instala ao fechar o app
4. ✅ Notifica o usuário de forma sutil

### 📦 Publicar uma Nova Versão

**Via GitHub Actions (Recomendado):**

1. Atualize a versão no `package.json`
2. Execute:
   ```bash
   .\criar_release.bat
   ```
3. O GitHub Actions fará automaticamente:
   - Build do instalador
   - Publicação no GitHub Releases
   - Atualização do Firestore com SHA512 e URL

**Documentação completa:** [`docs/RELEASE_GUIDE.md`](docs/RELEASE_GUIDE.md)

## 📚 Documentação Adicional

- 🚀 **[Guia de Release](docs/RELEASE_GUIDE.md)** - Como publicar novas versões
- 🔄 **[Auto-Update Guide](docs/AUTO_UPDATE_GUIDE.md)** - Sistema de atualização automática
- 🔥 **[Firebase Setup](docs/FIREBASE_AUTO_UPDATE_SETUP.md)** - Configuração do Firebase para updates


## 🤝 Contribuindo

O projeto ainda está em estágios iniciais. Sugestões e pull requests são bem-vindos!

---
*Desenvolvido com 💜 por RimuSrPao*
