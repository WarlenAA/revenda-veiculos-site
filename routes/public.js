const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    req.db.all("SELECT * FROM veiculos ORDER BY id DESC", [], (err, rows) => {
        if (err) return res.status(500).send("Erro ao buscar veículos.");
        res.render('index', { veiculos: rows, pageTitle: 'Veículos em Estoque' });
    });
});

router.get('/veiculo/:id', (req, res) => {
    const id = req.params.id;
    req.db.get("SELECT * FROM veiculos WHERE id = ?", [id], (err, row) => {
        if (err) return res.status(500).send("Erro ao buscar o veículo.");
        if (!row) return res.status(404).send("Veículo não encontrado.");
        res.render('veiculo', { veiculo: row, pageTitle: `${row.marca} ${row.modelo}` });
    });
});

module.exports = router;

