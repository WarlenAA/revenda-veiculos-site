const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const result = await req.db.query("SELECT * FROM veiculos ORDER BY id DESC");
        res.render('index', { veiculos: result.rows, pageTitle: 'Veículos em Estoque' });
    } catch (err) {
        res.status(500).send("Erro ao buscar veículos.");
    }
});

router.get('/veiculo/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const result = await req.db.query("SELECT * FROM veiculos WHERE id = $1", [id]);
        if (result.rows.length === 0) return res.status(404).send("Veículo não encontrado.");
        res.render('veiculo', { veiculo: result.rows[0], pageTitle: `${result.rows[0].marca} ${result.rows[0].modelo}` });
    } catch (err) {
        res.status(500).send("Erro ao buscar o veículo.");
    }
});

module.exports = router;
