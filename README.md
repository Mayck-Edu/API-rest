
# 🔒 API REST de Autenticação com Firebase (Node.js/Express)

Este projeto implementa uma API REST de backend para gerenciamento de autenticação de usuários utilizando o **Firebase Authentication** e o **Firebase Admin SDK**. Ele foi construído com **Node.js** e o framework **Express.js**, demonstrando como proteger rotas da API verificando `idTokens` gerados pelo Firebase Client SDK no frontend.

## ✨ Features

*   **Autenticação Segura com Firebase:** Utiliza o Firebase Admin SDK para verificar tokens de ID (JWTs) gerados pelo Firebase Authentication.
*   **Rotas Protegidas:** Exemplo de rotas que só podem ser acessadas por usuários autenticados.
*   **Registro de Usuário (Admin-side):** Uma rota para criar usuários diretamente via API (útil para cenários de administração ou migração).
*   **Autorização por Custom Claims (Exemplo):** Demonstra como verificar `custom claims` (como `role: 'admin'`) para controle de acesso baseado em funções.
*   **Middleware de Autenticação:** Um middleware reusável para proteger múltiplas rotas.
*   **Gerenciamento de Variáveis de Ambiente:** Uso do `dotenv` para configuração segura.
*   **CORS Habilitado:** Configuração para permitir requisições de diferentes origens (frontend).
*   **Tratamento de Erros:** Middleware de erro genérico e tratamento de erros específicos do Firebase.
*   **Frontend de Exemplo:** Inclui um arquivo `index.html` e `client.js` simples para testar a integração.

## 🚀 Tecnologias Utilizadas

*   **Node.js**: Ambiente de execução JavaScript.
*   **Express.js**: Framework web para Node.js.
*   **Firebase Admin SDK**: SDK para interagir com o Firebase a partir de um ambiente de servidor.
*   **Firebase Client SDK**: Usado no frontend para autenticação do usuário.
*   **dotenv**: Para carregar variáveis de ambiente.
*   **cors**: Middleware para Cross-Origin Resource Sharing.

## 📁 Estrutura do Projeto


API-REST/ </br>
├── config/</br>
│ ├── firebase-service-account.json # ⚠️ CHAVE SECRETA DO FIREBASE! NÃO VERSIONAR!</br>
│ └── firebaseConfig.js # Inicialização do Firebase Admin SDK</br>
├── middleware/</br>
│ └── authMiddleware.js # Middleware para verificar tokens JWT</br>
├── node_modules/ # Dependências do Node.js</br>
├── public/ # Arquivos estáticos do frontend (HTML, CSS, JS)</br>
│ ├── client.js # Lógica do frontend para Firebase Auth e chamadas à API</br>
│ └── index.html # Interface de usuário de exemplo</br>
├── routes/</br>
│ └── auth.js # Definição das rotas da API</br>
├── .env # Variáveis de ambiente</br>
├── .gitignore # Arquivos e pastas a ignorar pelo Git</br>
├── package.json # Metadados do projeto e dependências</br>
├── server.js # Ponto de entrada do servidor Express</br>
└── README.md # Este arquivo!</br>

## ⚙️ Como Começar

### Pré-requisitos

*   Node.js (versão 14 ou superior recomendada)
*   npm (gerenciador de pacotes do Node.js)
*   Uma conta e um projeto no Firebase

### 1. Configuração do Projeto Firebase

1.  **Crie um Projeto Firebase:**
    *   Acesse o [Console do Firebase](https://console.firebase.google.com/).
    *   Crie um novo projeto ou selecione um existente.
2.  **Habilite o Método de Autenticação:**
    *   No Console do Firebase, navegue até **"Build" > "Authentication"**.
    *   Na aba **"Sign-in method"**, habilite **"Email/Password"**.
3.  **Gere a Chave da Conta de Serviço:**
    *   Nas **"Project settings"** (ícone de engrenagem) > aba **"Service accounts"**.
    *   Clique em **"Generate new private key"**. Isso fará o download de um arquivo JSON.
    *   **⚠️ Mantenha este arquivo EXTREMAMENTE SEGURO! NUNCA o exponha publicamente (ex: no GitHub).**
    *   Renomeie o arquivo para `firebase-service-account.json` e **coloque-o dentro da pasta `config/`** do seu projeto `API-REST/`.
4.  **Obtenha as Configurações do Firebase Client SDK:**
    *   Nas **"Project settings"** > aba **"General"**.
    *   Role para baixo até a seção **"Your apps"**. Se você não tiver um aplicativo web registrado, clique no ícone `</>` (Web) para adicionar um.
    *   Copie o objeto `firebaseConfig` que ele fornece. Você precisará colá-lo no `public/client.js`.

### 2. Configuração Local da API

1.  **Clone o Repositório:** (Ou crie a estrutura manualmente se não for um clone)
    ```bash
    git clone https://github.com/seu-usuario/API-REST.git # Substitua pelo seu link
    cd API-REST
    ```
2.  **Instale as Dependências:**
    ```bash
    npm install
    ```
3.  **Crie o Arquivo `.env`:**
    *   Na raiz do seu projeto (`API-REST/`), crie um arquivo chamado `.env`.
    *   Adicione o seguinte conteúdo, garantindo que o caminho para o arquivo JSON está **correto e relativo à pasta `config/`**:
        ```dotenv
        PORT=3000
        FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
        ```
    *   **Nota importante:** O caminho no `.env` é avaliado em relação ao arquivo `firebaseConfig.js`. Se `firebaseConfig.js` está em `config/`, e seu arquivo JSON está também em `config/`, o caminho relativo dentro de `config/` é simplesmente `./firebase-service-account.json`.

4.  **Configure o Frontend (`public/client.js`):**
    *   Abra `public/client.js`.
    *   Cole o objeto `firebaseConfig` que você obteve do Console do Firebase no início do arquivo, substituindo o placeholder existente.
    *   **Verifique e remova quaisquer imports do tipo `import { initializeApp } from "firebase/app";` e `const app = initializeApp(firebaseConfig);` etc.** Para este exemplo, estamos usando a versão compatível do SDK do Firebase carregada via CDN no HTML, que espera o `firebase.initializeApp()` global.

### 3. Rodando o Servidor

1.  **Inicie o servidor Node.js** na raiz do seu projeto:
    ```bash
    node server.js
    ```
    Você deverá ver mensagens no console indicando que o Firebase Admin SDK foi inicializado e que o servidor está rodando na porta 3000.

## 🚀 Uso da API

### Acessando o Frontend de Exemplo

Com o servidor rodando, abra seu navegador e acesse:
IGNORE_WHEN_COPYING_START
content_copy
download
Use code with caution.
IGNORE_WHEN_COPYING_END

http://localhost:3000/index.html

Você poderá testar o registro, login e o acesso às rotas protegidas diretamente no navegador.

### Endpoints da API

A API base está disponível em `http://localhost:3000/api/auth`.

| Método | Endpoint                    | Descrição                                                                                                                                                                                                                                           | Autenticação Necessária | Body (JSON) Exemplo                                        |
| :----- | :-------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------- | :--------------------------------------------------------- |
| `POST` | `/api/auth/register`        | **Admin-side User Registration:** Cria um novo usuário no Firebase Authentication. Ideal para cenários onde seu backend precisa gerenciar usuários (ex: painel de administração). Para auto-registro, use o Firebase Client SDK no frontend. | Nenhuma                 | `{ "email": "novo@example.com", "password": "senhasegura123" }` |
| `POST` | `/api/auth/login`           | **NOTA IMPORTANTE:** Esta rota é um placeholder. O processo de `login` (obtenção do `idToken`) deve ser realizado pelo **frontend** usando o **Firebase Client SDK**. Sua API apenas verifica o token recebido.                                  | Nenhuma                 | `{}` (Requisição será negada com aviso)                          |
| `GET`  | `/api/auth/protected-data`  | Retorna dados de exemplo que só podem ser acessados por usuários autenticados.                                                                                                                                                                      | **Sim**                 | N/A                                                        |
| `POST` | `/api/auth/create-item`     | Exemplo de rota que permite a um usuário autenticado criar um item.                                                                                                                                                                                 | **Sim**                 | `{ "itemName": "Meu Novo Item" }`                          |
| `GET`  | `/api/auth/admin-only-data` | Retorna dados que só podem ser acessados por usuários com a `custom claim` `role: 'admin'`.                                                                                                                                                         | **Sim**                 | N/A                                                        |

### Como enviar o ID Token para Rotas Protegidas

Após o login bem-sucedido no frontend (usando o Firebase Client SDK), você obterá um `idToken`. Este token deve ser enviado para sua API no cabeçalho `Authorization` no formato `Bearer <idToken>`.

**Exemplo (usando cURL):**

```bash
curl -X GET \
  http://localhost:3000/api/auth/protected-data \
  -H 'Authorization: Bearer SEU_ID_TOKEN_AQUI'
IGNORE_WHEN_COPYING_START
content_copy
download
Use code with caution.
IGNORE_WHEN_COPYING_END
```
Substitua SEU_ID_TOKEN_AQUI pelo token real obtido do seu frontend.

## ⚠️ Notas Importantes e Boas Práticas

Segurança da Chave da Conta de Serviço (firebase-service-account.json):

Este arquivo concede acesso de administrador ao seu projeto Firebase. NUNCA o inclua em seu repositório Git público. O .gitignore já está configurado para isso.

Mantenha-o seguro em seu ambiente de produção (ex: como uma variável de ambiente criptografada ou um secret management service).

Fluxo de Autenticação Firebase (Cliente vs. Admin):

O Firebase Client SDK (no frontend) é responsável pelo createUserWithEmailAndPassword, signInWithEmailAndPassword e pela geração inicial dos idTokens.

O Firebase Admin SDK (no backend) é usado para verificar a validade desses idTokens e para tarefas administrativas (criar/gerenciar usuários programaticamente, adicionar custom claims, etc.).

Tokens Expirados: Os idTokens têm uma vida útil curta (geralmente 1 hora). O Firebase Client SDK (no frontend) lida automaticamente com a renovação desses tokens em segundo plano, gerando um novo idToken para o usuário ativo. Seu backend apenas verifica o token que recebe.

Autorização com Custom Claims: Para a rota /admin-only-data funcionar, você precisará adicionar a custom claim role: 'admin' a um usuário no Firebase Auth usando o Firebase Admin SDK (isso geralmente é feito em um script separado ou em um painel de administração, não na API pública).
```bash
// Exemplo de como definir um custom claim para um usuário (Execute uma única vez)
const admin = require('firebase-admin'); // Certifique-se de inicializar o admin SDK primeiro
const userUid = 'ID_UNICO_DO_USUARIO_FIREBASE_AQUI'; // Encontre o UID no console do Firebase Auth

admin.auth().setCustomUserClaims(userUid, { role: 'admin' })
    .then(() => {
        console.log(`Custom claim 'role: admin' adicionada ao usuário: ${userUid}`);
        // O usuário precisará fazer LOGIN NOVAMENTE no frontend para que o novo token
        // com a claim seja gerado e enviado para sua API.
    })
    .catch(error => console.error('Erro ao adicionar custom claim:', error));
IGNORE_WHEN_COPYING_START
content_copy
download
Use code with caution.
JavaScript
IGNORE_WHEN_COPYING_END
```
Validação de Entrada: Para APIs de produção, é crucial adicionar validação robusta para todos os dados de entrada (req.body, req.query, req.params) usando bibliotecas como Joi ou express-validator.

Deploy em Produção:

Sempre use HTTPS.

Configure as variáveis de ambiente (PORT, FIREBASE_SERVICE_ACCOUNT_PATH) diretamente na sua plataforma de deploy (Heroku, Vercel, AWS Lambda, Google Cloud Run, etc.) e nunca exponha o arquivo JSON da conta de serviço.

Considere otimizações de segurança como o middleware helmet para Express.

## 🤝 Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues para bugs ou sugestões de melhoria, ou enviar pull requests.


