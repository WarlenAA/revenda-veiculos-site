const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// --- Configuração do Cloudinary ---
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// --- Configuração do Multer para enviar para o Cloudinary ---
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'revenda-veiculos',
        allowed_formats: ['jpg', 'png', 'jpeg'],
        transformation: [{ width: 1024, height: 768, crop: 'limit' }]
    }
});

const upload = multer({ storage: storage });

// Middleware para proteger as rotas
const isAuthenticated = (req, res, next) => {
    if (!req.session.userId) return res.redirect('/login');
    if (req.session.senha_alterada === 0 && req.path !== '/primeiro-acesso') return res.redirect('/primeiro-acesso');
    next();
};
router.use(isAuthenticated);

// --- ROTAS ---

// Rota para o painel principal
router.get('/', async (req, res) => {
    try {
        const result = await req.db.query("SELECT * FROM veiculos ORDER BY id DESC");
        res.render('admin', { veiculos: result.rows, pageTitle: 'Painel do Vendedor' });
    } catch (err) {
        console.error("Erro ao buscar veículos:", err);
        res.status(500).send("Erro ao buscar veículos.");
    }
});

// Rota para a página de adicionar
router.get('/adicionar', (req, res) => {
    // Linha de debug para sabermos que a rota foi acessada corretamente
    console.log("Acessando a rota GET /admin/adicionar. Renderizando a página...");
    res.render('admin-adicionar', { pageTitle: 'Adicionar Novo Veículo' });
});

// Rota para processar a adição de um novo veículo
router.post('/adicionar', upload.array('fotos', 8), async (req, res) => {
    const { marca, modelo, ano, cor, preco, quilometragem, caracteristicas } = req.body;
    
    const precoLimpo = String(preco).replace(/\./g, '').replace(',', '.');
    const kmLimpo = String(quilometragem).replace(/\./g, '');
    const fotos = req.files.map(file => file.path).join(',');
    
    const sql = `INSERT INTO veiculos (marca, modelo, ano, cor, preco, quilometragem, caracteristicas, fotos) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`;
    const params = [marca, modelo, ano, cor, precoLimpo, kmLimpo, caracteristicas, fotos];
    
    try {
        await req.db.query(sql, params);
        res.redirect('/admin');
    } catch (err) {
        console.error("Erro ao adicionar veículo:", err);
        res.status(500).send("Erro ao adicionar veículo.");
    }
});

// Rota para a página de edição
router.get('/editar/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const result = await req.db.query("SELECT * FROM veiculos WHERE id = $1", [id]);
        if (result.rows.length === 0) return res.status(404).send("Veículo não encontrado.");
        res.render('admin-editar', { veiculo: result.rows[0], pageTitle: 'Editar Veículo' });
    } catch (err) {
        console.error("Erro ao buscar veículo para edição:", err);
        res.status(500).send("Erro ao buscar veículo.");
    }
});

// Rota para processar a edição de um veículo
router.post('/editar/:id', upload.array('fotos', 8), async (req, res) => {
    const id = req.params.id;
    const { marca, modelo, ano, cor, preco, quilometragem, caracteristicas, fotos_existentes } = req.body;
    
    const precoLimpo = String(preco).replace(/\./g, '').replace(',', '.');
    const kmLimpo = String(quilometragem).replace(/\./g, '');
    
    const novasFotos = req.files ? req.files.map(file => file.path) : [];
    const fotosFinais = [].concat(fotos_existentes || [], novasFotos).join(',');

    const sql = `UPDATE veiculos SET marca = $1, modelo = $2, ano = $3, cor = $4, preco = $5, quilometragem = $6, caracteristicas = $7, fotos = $8 WHERE id = $9`;
    const params = [marca, modelo, ano, cor, precoLimpo, kmLimpo, caracteristicas, fotosFinais, id];
    
    try {
        await req.db.query(sql, params);
        res.redirect('/admin');
    } catch (err) {
        console.error("Erro ao atualizar o veículo:", err);
        res.status(500).send("Erro ao atualizar o veículo.");
    }
});

// Rota para deletar um veículo
router.post('/deletar/:id', async (req, res) => {
    const id = req.params.id;
    try {
        await req.db.query(`DELETE FROM veiculos WHERE id = $1`, [id]);
        res.redirect('/admin');
    } catch (err) {
        console.error("Erro ao deletar o veículo:", err);
        res.status(500).send("Erro ao deletar o veículo.");
    }
});

module.exports = router;
