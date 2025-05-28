// routes/auth.js
const express = require('express');
const router = express.Router(); // Cria um novo objeto router para lidar com as rotas
const admin = require('../config/firebaseConfig'); // Importa a instância do admin
const authenticateToken = require('../middleware/authMiddleware'); // Importa nosso middleware

// --- Rotas de Autenticação (Observações MUITO Importantes Abaixo) ---

/**
 * @route POST /api/auth/register
 * @desc  Registra um novo usuário no Firebase Auth (ADMIN-SIDE).
 *        Esta rota é usada para cenários onde seu backend precisa criar usuários
 *        diretamente (ex: painel de administração, migração de usuários).
 *        Para auto-registro de usuários (quando o usuário se cadastra),
 *        o Firebase RECOMENDA o uso do Firebase Client SDK no frontend.
 * @access Public (mas você pode adicionar um middleware de admin aqui se for o caso)
 */
router.post('/register', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email e senha são obrigatórios.', code: 'missing_credentials' });
    }

    // Validações básicas (você pode adicionar mais, ex: Regex para email)
    if (password.length < 6) {
        return res.status(400).json({ message: 'A senha deve ter pelo menos 6 caracteres.', code: 'weak_password' });
    }

    try {
        // admin.auth().createUser é para criar usuários ADMIN-SIDE
        const userRecord = await admin.auth().createUser({
            email: email,
            password: password,
            emailVerified: false, // Defina como true se o email já foi verificado por outro meio
            disabled: false,      // Defina como true para desabilitar o usuário
        });

        console.log('Usuário registrado via Admin SDK:', userRecord.uid);

        // IMPORTANTE: Esta rota NÃO retorna um ID Token para o cliente,
        // pois o login inicial (e a geração do token) é uma responsabilidade do CLIENTE
        // usando o Firebase Client SDK.
        // O cliente precisará fazer login separadamente para obter um token após o registro.
        res.status(201).json({
            message: 'Usuário registrado com sucesso (via Admin SDK). O cliente precisará fazer login.',
            uid: userRecord.uid,
            email: userRecord.email
        });
    } catch (error) {
        console.error('Erro ao registrar usuário (Admin SDK):', error.message);
        let errorMessage = 'Erro interno ao registrar usuário.';
        let errorCode = 'server_error';

        if (error.code === 'auth/email-already-in-use') {
            errorMessage = 'Este email já está em uso.';
            errorCode = 'email_already_in_use';
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = 'O formato do email é inválido.';
            errorCode = 'invalid_email';
        } else if (error.code === 'auth/weak-password') {
            errorMessage = 'A senha fornecida é muito fraca. Deve ter pelo menos 6 caracteres.';
            errorCode = 'weak_password';
        }
        res.status(400).json({ error: errorMessage, code: errorCode });
    }
});


/**
 * @route POST /api/auth/login
 * @desc  MUITO IMPORTANTE: O login (com email/senha) DEVE ser feito no frontend
 *        usando o Firebase Client SDK. O Firebase Admin SDK NÃO oferece um método
 *        signInWithEmailAndPassword para o backend.
 *        Esta rota serve APENAS para ilustrar que o backend não lida com este processo.
 * @access Public (mas serve como aviso)
 */
router.post('/login', (req, res) => {
    // O login real (ex: com email/senha) acontece no CLIENTE (frontend)
    // usando o Firebase Client SDK (firebase.auth().signInWithEmailAndPassword).
    // Após o login bem-sucedido, o CLIENTE obtém um idToken e o envia
    // para as rotas protegidas da sua API no cabeçalho Authorization.
    res.status(400).json({
        message: 'O login (com email/senha) deve ser feito no frontend usando o Firebase Client SDK. Após o login, envie o idToken obtido para as rotas protegidas da API para verificação.',
        code: 'login_client_side_only'
    });
});


// --- Rotas Protegidas (Exemplos) ---
// Qualquer rota que use 'authenticateToken' será protegida.

/**
 * @route GET /api/auth/protected-data
 * @desc  Exemplo de rota que só pode ser acessada por usuários autenticados.
 * @access Private (Requer token Firebase válido)
 */
router.get('/protected-data', authenticateToken, (req, res) => {
    // Se o middleware `authenticateToken` passou, `req.user` estará preenchido
    // com as informações do usuário decodificadas do token.
    console.log(`Usuário autenticado acessou dados protegidos: UID=${req.user.uid}, Email=${req.user.email}`);

    res.status(200).json({
        message: 'Dados protegidos acessados com sucesso!',
        userData: {
            uid: req.user.uid,
            email: req.user.email,
            // Você pode retornar outras informações do token se desejar
            // ex: name: req.user.name,
            //     picture: req.user.picture,
            //     customClaims: req.user.yourCustomClaim
        }
    });
});

/**
 * @route POST /api/auth/create-item
 * @desc  Exemplo de rota que permite a um usuário autenticado criar um item.
 * @access Private (Requer token Firebase válido)
 */
router.post('/create-item', authenticateToken, (req, res) => {
    const { itemName } = req.body;

    if (!itemName) {
        return res.status(400).json({ message: 'Nome do item é obrigatório.', code: 'missing_item_name' });
    }

    // Aqui você faria a lógica para salvar o item no banco de dados,
    // associando-o ao usuário autenticado (req.user.uid).
    console.log(`Usuário ${req.user.email} (UID: ${req.user.uid}) criou o item: "${itemName}"`);

    res.status(201).json({
        message: `Item '${itemName}' criado com sucesso para o usuário ${req.user.email}!`,
        createdBy: req.user.uid,
        itemId: `item_${Date.now()}` // Exemplo de ID gerado
    });
});


// --- Exemplo de Rota com Custom Claims (Autorização) ---
// Para esta rota funcionar, você precisaria adicionar um 'role' como 'admin'
// a um usuário no Firebase Auth usando o Admin SDK (fora desta API, em um script à parte,
// ou em uma rota de administração interna):
//
// Exemplo de como adicionar um custom claim 'admin':
// admin.auth().setCustomUserClaims(uid, { role: 'admin' })
//   .then(() => { /* novo token deve ser re-obtido pelo cliente */ });

router.get('/admin-only-data', authenticateToken, (req, res) => {
    // Verifica se o usuário tem a custom claim 'role: admin'
    if (req.user.role === 'admin') {
        res.status(200).json({
            message: 'Dados confidenciais de administrador acessados com sucesso!',
            adminData: {
                totalUsers: 1000,
                activeUsers: 850,
                accessedBy: req.user.email
            }
        });
    } else {
        res.status(403).json({
            message: 'Acesso negado. Apenas administradores podem acessar esta rota.',
            code: 'forbidden_access'
        });
    }
});


module.exports = router;