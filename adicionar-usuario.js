// Arquivo: adicionar-usuario.js
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');

const db_file = path.join(__dirname, 'database', 'revenda.db');
const db = new sqlite3.Database(db_file);

const email = process.argv[2];
const senha = process.argv[3];
const saltRounds = 10;

if (!email || !senha) {
    console.log("Uso: node adicionar-usuario.js <email> <senha>");
    process.exit(1);
}

bcrypt.hash(senha, saltRounds, (err, hash) => {
    if (err) throw err;
    db.run(
        'INSERT INTO usuarios (email, senha_hash) VALUES (?, ?)',
        [email, hash],
        function(err) {
            if (err) {
                return console.error("Erro ao adicionar usuário (talvez o email já exista?):", err.message);
            }
            console.log(`Usuário ${email} adicionado com sucesso! ID: ${this.lastID}`);
        }
    );
    db.close();
});

