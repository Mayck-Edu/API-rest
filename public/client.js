// client.js

// 1. CONFIGURAÇÃO DO FIREBASE CLIENT SDK
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCnIlztK9JaVduun0SeGsVeaerq2y4s8wo",
  authDomain: "k25-45f7e.firebaseapp.com",
  projectId: "k25-45f7e",
  storageBucket: "k25-45f7e.firebasestorage.app",
  messagingSenderId: "814011394790",
  appId: "1:814011394790:web:19733291d5cfb2fbffe927",
  measurementId: "G-N9YN1F9HHK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);


// Inicializa o Firebase no cliente
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth(); // Obtém a instância do serviço de autenticação

// URL base da sua API de backend
const API_BASE_URL = 'http://localhost:3000/api/auth';

let currentIdToken = null; // Armazena o ID Token do usuário logado

// Monitora o estado de autenticação para manter o token atualizado
auth.onAuthStateChanged(async (user) => {
    if (user) {
        // Se houver um usuário logado, obtenha o ID Token.
        // getIdToken(true) força a atualização do token se ele estiver próximo da expiração.
        currentIdToken = await user.getIdToken(true);
        console.log('Firebase User State Changed. Current ID Token:', currentIdToken);
        document.getElementById('currentIdTokenDisplay').textContent = currentIdToken.substring(0, 30) + '...';
    } else {
        currentIdToken = null;
        console.log('Firebase User State Changed. No user is logged in.');
        document.getElementById('currentIdTokenDisplay').textContent = 'N/A';
    }
});


// --- Funções de Autenticação (usando Firebase Client SDK) ---

// Função para registrar um novo usuário
async function registerUser() {
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const statusDiv = document.getElementById('registerStatus');
    statusDiv.className = 'status'; // Reseta classes

    try {
        // firebase.auth().createUserWithEmailAndPassword é um método do CLIENT-SIDE
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        statusDiv.textContent = `Registro bem-sucedido para: ${userCredential.user.email}`;
        statusDiv.classList.add('success');
        console.log('User registered:', userCredential.user);

        // Opcional: fazer login automático após o registro e obter o token
        currentIdToken = await userCredential.user.getIdToken();
        console.log('ID Token after register (auto-login):', currentIdToken);

    } catch (error) {
        statusDiv.textContent = `Erro no registro: ${error.message}`;
        statusDiv.classList.add('error');
        console.error('Registration Error:', error);
    }
}

// Função para fazer login
async function loginUser() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const statusDiv = document.getElementById('loginStatus');
    statusDiv.className = 'status'; // Reseta classes

    try {
        // firebase.auth().signInWithEmailAndPassword é um método do CLIENT-SIDE
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        statusDiv.textContent = `Login bem-sucedido para: ${userCredential.user.email}`;
        statusDiv.classList.add('success');
        console.log('User logged in:', userCredential.user);

        // Obtém o ID Token após o login bem-sucedido
        currentIdToken = await userCredential.user.getIdToken();
        console.log('ID Token after login:', currentIdToken);

    } catch (error) {
        statusDiv.textContent = `Erro no login: ${error.message}`;
        statusDiv.classList.add('error');
        console.error('Login Error:', error);
    }
}

// --- Funções para Chamar a API de Backend ---

// Função auxiliar para fazer requisições à API com o token
async function callApi(endpoint, method = 'GET', body = null) {
    const headers = {
        'Content-Type': 'application/json',
    };

    if (currentIdToken) {
        // Anexa o ID Token ao cabeçalho Authorization para rotas protegidas
        headers['Authorization'] = `Bearer ${currentIdToken}`;
    }

    const options = {
        method: method,
        headers: headers,
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    const data = await response.json();
    return { response, data };
}


// Função para obter dados protegidos da API
async function getProtectedData() {
    const statusDiv = document.getElementById('protectedDataStatus');
    statusDiv.className = 'status'; // Reseta classes

    if (!currentIdToken) {
        statusDiv.textContent = 'Por favor, faça login primeiro para obter um token.';
        statusDiv.classList.add('error');
        return;
    }

    try {
        const { response, data } = await callApi('/protected-data', 'GET');

        if (response.ok) {
            statusDiv.textContent = `Sucesso! Mensagem: ${data.message} | User: ${data.userData.email}`;
            statusDiv.classList.add('success');
            console.log('Protected Data:', data);
        } else {
            statusDiv.textContent = `Erro (${response.status}): ${data.message || data.error}`;
            statusDiv.classList.add('error');
            console.error('Error accessing protected data:', data);
        }
    } catch (error) {
        statusDiv.textContent = `Erro de rede: ${error.message}`;
        statusDiv.classList.add('error');
        console.error('Network Error:', error);
    }
}

// Função para criar um item na API (rota protegida)
async function createItem() {
    const itemName = document.getElementById('itemName').value;
    const statusDiv = document.getElementById('createItemStatus');
    statusDiv.className = 'status'; // Reseta classes

    if (!currentIdToken) {
        statusDiv.textContent = 'Por favor, faça login primeiro para criar um item.';
        statusDiv.classList.add('error');
        return;
    }

    if (!itemName) {
        statusDiv.textContent = 'Por favor, insira o nome do item.';
        statusDiv.classList.add('error');
        return;
    }

    try {
        const { response, data } = await callApi('/create-item', 'POST', { itemName });

        if (response.ok) {
            statusDiv.textContent = `Sucesso! Mensagem: ${data.message}`;
            statusDiv.classList.add('success');
            console.log('Item created:', data);
        } else {
            statusDiv.textContent = `Erro (${response.status}): ${data.message || data.error}`;
            statusDiv.classList.add('error');
            console.error('Error creating item:', data);
        }
    } catch (error) {
        statusDiv.textContent = `Erro de rede: ${error.message}`;
        statusDiv.classList.add('error');
        console.error('Network Error:', error);
    }
}


// Função para acessar dados apenas para admin
async function getAdminOnlyData() {
    const statusDiv = document.getElementById('adminOnlyDataStatus');
    statusDiv.className = 'status'; // Reseta classes

    if (!currentIdToken) {
        statusDiv.textContent = 'Por favor, faça login primeiro.';
        statusDiv.classList.add('error');
        return;
    }

    try {
        const { response, data } = await callApi('/admin-only-data', 'GET');

        if (response.ok) {
            statusDiv.textContent = `Sucesso! Mensagem: ${data.message} | Admin: ${data.adminData.accessedBy}`;
            statusDiv.classList.add('success');
            console.log('Admin Only Data:', data);
        } else {
            statusDiv.textContent = `Erro (${response.status}): ${data.message || data.error}`;
            statusDiv.classList.add('error');
            console.error('Error accessing admin data:', data);
        }
    } catch (error) {
        statusDiv.textContent = `Erro de rede: ${error.message}`;
        statusDiv.classList.add('error');
        console.error('Network Error:', error);
    }
}