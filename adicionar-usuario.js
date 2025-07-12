require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const email = process.argv[2];
const senha = process.argv[3];
const saltRounds = 10;

if (!email || !senha) {
    console.log("Uso: node adicionar-usuario.js <email> <senha>");
    process.exit(1);
}

const adicionar = async () => {
    try {
        const hash = await bcrypt.hash(senha, saltRounds);
        const sql = `INSERT INTO usuarios (email, senha_hash) VALUES ($1, $2)`;
        await pool.query(sql, [email, hash]);
        console.log(`Usuário ${email} adicionado com sucesso!`);
    } catch (err) {
        console.error("Erro ao adicionar usuário (talvez o email já exista?):", err.message);
    } finally {
        await pool.end();
    }
};

adicionar();
