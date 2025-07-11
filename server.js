require('dotenv').config();

const express = require('express');
const { engine } = require('express-handlebars');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const session = require('express-session');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const bcrypt = require('bcrypt'); // Adicionado aqui para o usuário padrão

const app = express();
const PORT = process.env.PORT || 3000;

const db_path = path.join(__dirname, 'database');
fs.mkdirSync(db_path, { recursive: true });
const db_file = path.join(db_path, 'revenda.db');

const db = new sqlite3.Database(db_file, (err) => {
    if (err) return console.error('Erro ao ABRIR o banco de dados:', err.message);
    console.log('Conectado ao banco de dados SQLite.');

    db.serialize(() => {
        db.run(`CREATE TABLE IF NOT EXISTS veiculos (id INTEGER PRIMARY KEY AUTOINCREMENT, marca TEXT NOT NULL, modelo TEXT NOT NULL, ano INTEGER NOT NULL, preco REAL NOT NULL, quilometragem INTEGER, caracteristicas TEXT, fotos TEXT)`);
        db.run(`CREATE TABLE IF NOT EXISTS usuarios (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT NOT NULL UNIQUE, senha_hash TEXT NOT NULL, senha_alterada INTEGER DEFAULT 0)`);
        console.log("Tabelas verificadas/criadas com sucesso.");

        // Bloco para criar o usuário administrador padrão
        const adminEmail = 'admin@suarevenda.com';
        const adminSenhaPadrao = 'admin123';
        const saltRounds = 10;

        bcrypt.hash(adminSenhaPadrao, saltRounds, (err, hash) => {
            if (err) return console.error('Erro ao gerar hash da senha:', err.message);

            const sql = `INSERT OR IGNORE INTO usuarios (email, senha_hash, senha_alterada) VALUES (?, ?, 0)`;
            db.run(sql, [adminEmail, hash], function(err) {
                if (err) return console.error('Erro ao inserir usuário padrão:', err.message);
                if (this.changes > 0) {
                    console.log(`Usuário administrador padrão '${adminEmail}' criado com sucesso.`);
                } else {
                    console.log(`Usuário administrador padrão '${adminEmail}' já existe.`);
                }
            });
        });
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
