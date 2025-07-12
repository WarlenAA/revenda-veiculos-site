const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');

const saltRounds = 10;

router.get('/login', (req, res) => {
    res.render('login', { layout: 'main', pageTitle: 'Login' });
});

router.post('/login', async (req, res) => {
    const { email, senha } = req.body;
    try {
        const result = await req.db.query("SELECT * FROM usuarios WHERE email = $1", [email]);
        const user = result.rows[0];
        if (!user) return res.render('login', { error: "Email ou senha inválidos." });

        const match = await bcrypt.compare(senha, user.senha_hash);
        if (match) {
            req.session.userId = user.id;
            req.session.email = user.email;
            req.session.senha_alterada = user.senha_alterada;

            if (user.senha_alterada === 0) {
                res.redirect('/primeiro-acesso');
            } else {
                res.redirect('/admin');
            }
        } else {
            res.render('login', { error: "Email ou senha inválidos." });
        }
    } catch (err) {
        res.status(500).send("Erro no servidor.");
    }
});

router.get('/primeiro-acesso', (req, res) => {
    if (!req.session.userId) return res.redirect('/login');
    res.render('primeiro-acesso', { pageTitle: 'Alterar Senha' });
});

router.post('/primeiro-acesso', async (req, res) => {
    if (!req.session.userId) return res.redirect('/login');
    const { nova_senha, confirmar_senha } = req.body;
    if (nova_senha !== confirmar_senha) {
        return res.render('primeiro-acesso', { error: 'As senhas não coincidem.' });
    }

    try {
        const novaSenhaHash = await bcrypt.hash(nova_senha, saltRounds);
        await req.db.query(
            "UPDATE usuarios SET senha_hash = $1, senha_alterada = 1 WHERE id = $2",
            [novaSenhaHash, req.session.userId]
        );
        req.session.senha_alterada = 1;
        res.redirect('/admin');
    } catch (err) {
        res.status(500).send("Erro ao atualizar a senha.");
    }
});

router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) return res.redirect('/admin');
        res.clearCookie('connect.sid');
        res.redirect('/login');
    });
});

module.exports = router;
