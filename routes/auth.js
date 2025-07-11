const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');

const saltRounds = 10;

router.get('/login', (req, res) => {
    res.render('login', { layout: 'main', pageTitle: 'Login' });
});

router.post('/login', (req, res) => {
    const { email, senha } = req.body;
    req.db.get("SELECT * FROM usuarios WHERE email = ?", [email], async (err, user) => {
        if (err) return res.status(500).send("Erro no servidor.");
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
    });
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

    const novaSenhaHash = await bcrypt.hash(nova_senha, saltRounds);
    req.db.run(
        "UPDATE usuarios SET senha_hash = ?, senha_alterada = 1 WHERE id = ?",
        [novaSenhaHash, req.session.userId],
        function(err) {
            if (err) return res.status(500).send("Erro ao atualizar a senha.");
            req.session.senha_alterada = 1;
            res.redirect('/admin');
        }
    );
});

router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) return res.redirect('/admin');
        res.clearCookie('connect.sid');
        res.redirect('/login');
    });
});

module.exports = router;

