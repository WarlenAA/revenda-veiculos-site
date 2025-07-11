const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const isAuthenticated = (req, res, next) => {
    if (!req.session.userId) return res.redirect('/login');
    if (req.session.senha_alterada === 0 && req.path !== '/primeiro-acesso') return res.redirect('/primeiro-acesso');
    next();
};
router.use(isAuthenticated);

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../public/uploads');
        fs.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage: storage, limits: { files: 8 } });

router.get('/', (req, res) => {
    req.db.all("SELECT * FROM veiculos ORDER BY id DESC", [], (err, rows) => {
        if (err) return res.status(500).send("Erro ao buscar veículos.");
        res.render('admin', { veiculos: rows, pageTitle: 'Painel do Vendedor' });
    });
});

router.get('/adicionar', (req, res) => {
    res.render('admin-adicionar', { pageTitle: 'Adicionar Novo Veículo' });
});

router.post('/adicionar', upload.array('fotos', 8), (req, res) => {
    const { marca, modelo, ano, preco, quilometragem, caracteristicas } = req.body;
    const fotos = req.files.map(file => `/uploads/${file.filename}`).join(',');
    const sql = `INSERT INTO veiculos (marca, modelo, ano, preco, quilometragem, caracteristicas, fotos) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    req.db.run(sql, [marca, modelo, ano, preco, quilometragem, caracteristicas, fotos], (err) => {
        if (err) return res.status(500).send("Erro ao adicionar veículo.");
        res.redirect('/admin');
    });
});

router.get('/editar/:id', (req, res) => {
    const id = req.params.id;
    req.db.get("SELECT * FROM veiculos WHERE id = ?", [id], (err, veiculo) => {
        if (err) return res.status(500).send("Erro ao buscar veículo.");
        if (!veiculo) return res.status(404).send("Veículo não encontrado.");
        res.render('admin-editar', { veiculo, pageTitle: 'Editar Veículo' });
    });
});

router.post('/editar/:id', upload.array('fotos', 8), (req, res) => {
    const id = req.params.id;
    const { marca, modelo, ano, preco, quilometragem, caracteristicas, fotos_existentes } = req.body;
    
    let novasFotos = [];
    if (req.files && req.files.length > 0) {
        novasFotos = req.files.map(file => `/uploads/${file.filename}`);
    }
    
    const fotosFinais = [].concat(fotos_existentes || [], novasFotos).join(',');

    const sql = `UPDATE veiculos SET marca = ?, modelo = ?, ano = ?, preco = ?, quilometragem = ?, caracteristicas = ?, fotos = ? WHERE id = ?`;
    req.db.run(sql, [marca, modelo, ano, preco, quilometragem, caracteristicas, fotosFinais, id], (err) => {
        if (err) return res.status(500).send("Erro ao atualizar o veículo.");
        res.redirect('/admin');
    });
});

router.post('/deletar/:id', (req, res) => {
    const id = req.params.id;
    req.db.get("SELECT fotos FROM veiculos WHERE id = ?", [id], (err, row) => {
        if (err) { return res.status(500).send("Erro ao encontrar o veículo."); }
        if (row && row.fotos) {
            row.fotos.split(',').forEach(fotoPath => {
                const fullPath = path.join(__dirname, '../public', fotoPath);
                if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
            });
        }
        req.db.run(`DELETE FROM veiculos WHERE id = ?`, [id], (err) => {
            if (err) { return res.status(500).send("Erro ao deletar o veículo."); }
            res.redirect('/admin');
        });
    });
});

module.exports = router;

