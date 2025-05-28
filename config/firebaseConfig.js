// config/firebaseConfig.js
const admin = require('firebase-admin');
require('dotenv').config(); // 1. Carrega as variáveis de ambiente do .env

// 2. Define o caminho para o arquivo da conta de serviço a partir das variáveis de ambiente
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

// 3. Tenta carregar o arquivo JSON. O caminho é relativo ao diretório onde o Node.js está sendo executado.
//    Usamos um bloco try-catch para lidar com o erro caso o arquivo não seja encontrado.
let serviceAccount;
try {
    // require() vai procurar o arquivo JSON no caminho especificado e parseá-lo
    serviceAccount = require(serviceAccountPath);
} catch (error) {
    console.error('\n-------------------------------------------------------------');
    console.error('ERRO CRÍTICO: Não foi possível carregar o arquivo da conta de serviço do Firebase.');
    console.error(`Caminho configurado no .env: ${serviceAccountPath}`);
    console.error(`Detalhes do erro: ${error.message}`);
    console.error('Certifique-se de que o arquivo JSON foi baixado e está no caminho correto.');
    console.error('Este arquivo é ESSENCIAL para a API funcionar.');
    console.error('-------------------------------------------------------------\n');
    process.exit(1); // Encerra o processo da aplicação se não conseguir carregar o arquivo
}

// 4. Inicializa o Firebase Admin SDK com as credenciais da conta de serviço
//    A função admin.credential.cert() cria um objeto de credencial a partir do JSON.
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

console.log('Firebase Admin SDK inicializado com sucesso.');

// 5. Exporta a instância 'admin' para ser usada em outros módulos da API
module.exports = admin;