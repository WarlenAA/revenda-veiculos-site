// Arquivo: server.js (FINAL E CORRIGIDO PARA DEPLOY)

require('dotenv').config();

const express = require('express');
const { engine } = require('express-handlebars');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const session = require('express-session');
const cookieParser = require('cookie-parser');
const fs = require('fs'); // Módulo File System para criar pastas

const app = express();
const PORT = process.env.PORT || 3000;

// Garante que a pasta do banco de dados exista antes de conectar
const db_path = path.join(__dirname, 'database');
fs.mkdirSync(db_path, { recursive: true });
const db_file = path.join(db_path, 'revenda.db');

const db = new sqlite3.Database(db_file, (err) => {
    if (err) {
        return console.error('Erro ao ABRIR o banco de dados:', err.message);
    }
    console.log('Conectado ao banco de dados SQLite.');

    // O servidor SÓ COMEÇA a ser configurado DEPOIS que a conexão com o DB é bem-sucedida
    db.serialize(() => {
        db.run(`CREATE TABLE IF NOT EXISTS veiculos (id INTEGER PRIMARY KEY AUTOINCREMENT, marca TEXT NOT NULL, modelo TEXT NOT NULL, ano INTEGER NOT NULL, preco REAL NOT NULL, quilometragem INTEGER, caracteristicas TEXT, fotos TEXT)`);
        db.run(`CREATE TABLE IF NOT EXISTS usuarios (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT NOT NULL UNIQUE, senha_hash TEXT NOT NULL, senha_alterada INTEGER DEFAULT 0)`);
        console.log("Tabelas verificadas/criadas com sucesso.");
    });

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
        req.db = db;
        next();
    });

    app.engine('hbs', engine({
        extname: '.hbs',
        defaultLayout: 'main',
        helpers: {
          formatarPreco: (preco) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(preco),
          getFotos: (fotos) => (fotos && typeof fotos === 'string') ? fotos.split(',') : [],
          getWhatsapp: () => process.env.VENDEDOR_WHATSAPP
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
        console.log(`🚀 Servidor rodando na porta ${PORT}. Acesse http://localhost:${PORT}`);
    });
});
