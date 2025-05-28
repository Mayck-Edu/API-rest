// server.js
const express = require('express');
const cors = require('cors'); // Importa o middleware CORS
require('dotenv').config(); // Carrega as variáveis de ambiente do .env
const authRoutes = require('./routes/auth'); // Importa as rotas de autenticação

// 1. Inicializa o aplicativo Express
const app = express();
const PORT = process.env.PORT || 3000; // Define a porta, usando a do .env ou 3000 como fallback

// 2. Middleware para habilitar CORS (Cross-Origin Resource Sharing)
//    Isso permite que seu frontend (rodando em um domínio/porta diferente)
//    possa fazer requisições para sua API sem ser bloqueado pelo navegador.
//    Para produção, você pode configurar o CORS para permitir apenas domínios específicos:
//    ex: app.use(cors({ origin: 'https://seu-dominio-frontend.com' }));
app.use(cors());

// 3. Middleware para parsear o corpo das requisições como JSON
//    Isso permite que você acesse `req.body` nas rotas com dados JSON enviados pelo cliente.
app.use(express.json());

// 4. Conecta as rotas de autenticação sob o prefixo '/api/auth'
//    Todas as rotas definidas em auth.js serão acessíveis via /api/auth/...
app.use('/api/auth', authRoutes);

// 5. Rota de teste simples para verificar se a API está rodando
app.get('/', (req, res) => {
    res.status(200).json({ message: 'API de Login com Firebase - Rodando e pronta!' });
});

// 6. Middleware para tratamento de rotas não encontradas (404 Not Found)
//    Este middleware é executado se nenhuma das rotas acima corresponder à requisição.
app.use((req, res, next) => {
    const error = new Error(`Rota não encontrada: ${req.originalUrl}`);
    error.status = 404;
    // Passa o erro para o próximo middleware de tratamento de erros
    next(error);
});

// 7. Middleware de tratamento de erros genérico
//    Captura qualquer erro que tenha sido passado via `next(error)` ou que ocorra nas rotas.
app.use((error, req, res, next) => {
    // Define o status HTTP da resposta, usando o status do erro ou 500 (Erro Interno do Servidor)
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message,
            // Em ambiente de produção, você pode não querer expor o stack trace
            // stack: process.env.NODE_ENV === 'production' ? null : error.stack
        }
    });
});

// 8. Inicia o servidor Express
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Acesse: http://localhost:${PORT}`);
    // No futuro, você pode querer adicionar mais logs aqui, como a versão da API.
});