// routes/auth.js
const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware'); // Nosso middleware de autenticação
const authController = require('../controllers/authController'); // NOVO: Importa o controlador

// Rotas de Autenticação
router.post('/register', authController.register); // Chama o método register do controller
router.post('/login', authController.login);       // Chama o método login do controller (apenas aviso)

// Rotas Protegidas (aplicam o middleware authenticateToken antes de chamar o controller)
router.get('/protected-data', authenticateToken, authController.getProtectedData);
router.post('/create-item', authenticateToken, authController.createItem);
router.get('/admin-only-data', authenticateToken, authController.getAdminOnlyData);

module.exports = router;