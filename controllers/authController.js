// controllers/authController.js
const admin = require('../config/firebaseConfig'); // Importa a instância inicializada do admin

// O objeto authController conterá as funções de cada rota
const authController = {

    /**
     * Lógica para registrar um novo usuário via Admin SDK.
     * Ideal para painéis de administração ou importação de usuários.
     * O auto-registro do usuário deve ser feito pelo Firebase Client SDK no frontend.
     */
    register: async (req, res) => {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email e senha são obrigatórios.', code: 'missing_credentials' });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: 'A senha deve ter pelo menos 6 caracteres.', code: 'weak_password' });
        }

        try {
            const userRecord = await admin.auth().createUser({
                email: email,
                password: password,
                emailVerified: false,
                disabled: false,
            });
            res.status(201).json({
                message: 'Usuário registrado com sucesso (via Admin SDK).',
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
    },

    /**
     * Informa que o login deve ser feito no frontend.
     * Este endpoint não processa credenciais de login.
     */
    login: (req, res) => {
        res.status(400).json({
            message: 'O login (com email/senha) deve ser feito no frontend usando o Firebase Client SDK. Após o login, envie o idToken obtido para as rotas protegidas da API para verificação.',
            code: 'login_client_side_only'
        });
    },

    /**
     * Lógica para obter dados protegidos.
     * Requer que o usuário esteja autenticado via token Firebase.
     */
    getProtectedData: (req, res) => {
        console.log(`Usuário autenticado acessou dados protegidos: UID=${req.user.uid}, Email=${req.user.email}`);
        res.status(200).json({
            message: 'Dados protegidos acessados com sucesso!',
            userData: {
                uid: req.user.uid,
                email: req.user.email,
                // Outras informações do token podem ser acessadas aqui
            }
        });
    },

    /**
     * Lógica para criar um novo item.
     * Requer que o usuário esteja autenticado.
     */
    createItem: (req, res) => {
        const { itemName } = req.body;
        if (!itemName) {
            return res.status(400).json({ message: 'Nome do item é obrigatório.', code: 'missing_item_name' });
        }
        console.log(`Usuário ${req.user.email} (UID: ${req.user.uid}) criou o item: "${itemName}"`);
        res.status(201).json({
            message: `Item '${itemName}' criado com sucesso para o usuário ${req.user.email}!`,
            createdBy: req.user.uid,
            itemId: `item_${Date.now()}`
        });
    },

    /**
     * Lógica para acessar dados apenas para administradores.
     * Requer que o usuário esteja autenticado E tenha o custom claim 'role: admin'.
     */
    getAdminOnlyData: (req, res) => {
        // req.user contém os custom claims decodificados pelo verifyIdToken
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
    }
};

module.exports = authController;