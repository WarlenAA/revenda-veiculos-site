require('dotenv').config();

const express = require('express');
const { engine } = require('express-handlebars');
const path = require('path');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const bcrypt = require('bcrypt');
const { Pool } = require('pg'); // Importa o driver do PostgreSQL

const app = express();
const PORT = process.env.PORT || 3000;

// --- INICIALIZAÇÃO DO BANCO DE DADOS POSTGRESQL ---
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // Necessário para conexões com o Render
    }
});

// Função para criar as tabelas se não existirem
const criarTabelas = async () => {
    const queryCriarTabelaVeiculos = `
        CREATE TABLE IF NOT EXISTS veiculos (
            id SERIAL PRIMARY KEY,
            marca VARCHAR(255) NOT NULL,
            modelo VARCHAR(255) NOT NULL,
            ano INT NOT NULL,
            cor VARCHAR(100),
            preco NUMERIC(10, 2) NOT NULL,
            quilometragem INT,
            caracteristicas TEXT,
            fotos TEXT
        );
    `;
    const queryCriarTabelaUsuarios = `
        CREATE TABLE IF NOT EXISTS usuarios (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) NOT NULL UNIQUE,
            senha_hash VARCHAR(255) NOT NULL,
            senha_alterada INT DEFAULT 0
        );
    `;
    try {
        await pool.query(queryCriarTabelaVeiculos);
        await pool.query(queryCriarTabelaUsuarios);
        console.log("Tabelas verificadas/criadas com sucesso no PostgreSQL.");

        // Bloco para criar o usuário administrador padrão a partir do .env
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminSenhaPadrao = process.env.ADMIN_DEFAULT_PASSWORD;

        // Só tenta criar o usuário se as variáveis estiverem definidas no .env
        if (adminEmail && adminSenhaPadrao) {
            const saltRounds = 10;
            const hash = await bcrypt.hash(adminSenhaPadrao, saltRounds);
            
            const sql = `INSERT INTO usuarios (email, senha_hash, senha_alterada) VALUES ($1, $2, 0) ON CONFLICT (email) DO NOTHING`;
            const result = await pool.query(sql, [adminEmail, hash]);

            if (result.rowCount > 0) {
                console.log(`Usuário administrador padrão '${adminEmail}' criado com sucesso.`);
            } else {
                console.log(`Usuário administrador padrão '${adminEmail}' já existe.`);
            }
        }

    } catch (err) {
        console.error("Erro ao criar tabelas ou usuário padrão:", err);
    }
};

criarTabelas();

// --- CONFIGURAÇÃO DO EXPRESS ---
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }
}));

app.use((req, res, next) => {
    res.locals.session = req.session;
    req.db = pool; // Passa o pool de conexões para todas as rotas
    next();
});

app.engine('hbs', engine({
    extname: '.hbs',
    defaultLayout: 'main',
    helpers: {
      formatarPreco: (preco) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(preco),
      formatarMilhar: (numero) => {
        if (!numero && numero !== 0) return '';
        return new Intl.NumberFormat('pt-BR').format(numero);
      },
      getFotos: (fotos) => (fotos && typeof fotos === 'string') ? fotos.split(',') : [],
      getWhatsapp: () => process.env.VENDEDOR_WHATSAPP,
      // NOVA FUNÇÃO HELPER ABAIXO
      isSelected: (valor1, valor2) => {
          return valor1 === valor2 ? 'selected' : '';
      }
    }
}));

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

const publicRoutes = require('./routes/public');
const adminRoutes = require('./routes/admin');
const authRoutes = require('./routes/auth');

app.use('/', publicRoutes);
app.use('/admin', adminRoutes);
app.use('/', authRoutes);

app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}.`);
});
