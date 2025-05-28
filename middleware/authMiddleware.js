// middleware/authMiddleware.js
const admin = require('../config/firebaseConfig'); // Importa a instância inicializada do admin

const authenticateToken = async (req, res, next) => {
    // 1. Obtém o cabeçalho 'Authorization' da requisição.
    //    É onde o idToken do Firebase será enviado pelo cliente.
    const authHeader = req.headers.authorization;

    // 2. Verifica se o cabeçalho 'Authorization' existe e se começa com 'Bearer '
    //    O padrão para JWTs é "Bearer <token>".
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            message: 'Acesso negado. Token de autenticação não fornecido ou formato incorreto (esperado: "Bearer <token>").',
            code: 'no_token_provided'
        });
    }

    // 3. Extrai o ID Token removendo o prefixo 'Bearer '
    const idToken = authHeader.split(' ')[1]; // Ex: "Bearer <token>" -> ["Bearer", "<token>"]

    try {
        // 4. Verifica o ID Token usando o Firebase Admin SDK.
        //    Esta é a parte crucial. O Firebase Admin SDK se comunica com os servidores do Firebase
        //    para validar a assinatura, a data de expiração, o emissor e a integridade do token.
        const decodedToken = await admin.auth().verifyIdToken(idToken);

        // 5. Se o token for válido, `decodedToken` conterá informações do usuário, como:
        //    - uid: ID único do usuário Firebase.
        //    - email: Email do usuário.
        //    - iat: Tempo em que o token foi emitido (issued at).
        //    - exp: Tempo de expiração do token.
        //    - aud: Audiência do token (geralmente o ID do seu projeto Firebase).
        //    - iss: Emissor do token (Firebase).
        //    - ...e quaisquer custom claims que você tenha adicionado.
        //    Anexamos essas informações ao objeto `req` para que as rotas subsequentes
        //    possam acessar os dados do usuário autenticado.
        req.user = decodedToken;

        // 6. Chama `next()` para passar o controle para a próxima função middleware
        //    ou para a função de tratamento da rota real.
        next();
    } catch (error) {
        console.error('Erro ao verificar o token Firebase:', error.message);
        let errorMessage = 'Token de autenticação inválido.';
        let errorCode = 'invalid_token';

        // Tratamento de erros específicos do Firebase Admin SDK
        if (error.code === 'auth/id-token-expired') {
            errorMessage = 'Token expirado. Por favor, faça login novamente.';
            errorCode = 'token_expired';
        } else if (error.code === 'auth/argument-error') {
            // Este erro pode ocorrer se o token estiver malformado
            errorMessage = 'Token malformado ou inválido.';
            errorCode = 'malformed_token';
        } else if (error.code === 'auth/invalid-credential') {
            // Pode ocorrer se o token não for de um usuário Firebase válido
            errorMessage = 'Credencial Firebase inválida.';
            errorCode = 'invalid_credential';
        }

        // Retorna uma resposta de erro 401 (Unauthorized)
        return res.status(401).json({ message: errorMessage, code: errorCode });
    }
};

module.exports = authenticateToken;