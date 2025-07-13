const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.pagina) || 1;
        const limit = 12; // 12 veículos por página
        const offset = (page - 1) * limit;

        const { busca, ordenar } = req.query;

        let countQuery = 'SELECT COUNT(*) FROM veiculos';
        let baseQuery = 'SELECT * FROM veiculos';
        const queryParams = [];
        const whereClauses = [];

        if (busca) {
            whereClauses.push(`(marca ILIKE $1 OR modelo ILIKE $1 OR caracteristicas ILIKE $1)`);
            queryParams.push(`%${busca}%`);
        }
        
        if (whereClauses.length > 0) {
            const whereString = ` WHERE ${whereClauses.join(' AND ')}`;
            baseQuery += whereString;
            countQuery += whereString;
        }

        const totalResult = await req.db.query(countQuery, queryParams);
        const totalItems = parseInt(totalResult.rows[0].count, 10);
        const totalPages = Math.ceil(totalItems / limit);

        const sortOptions = {
            'preco_asc': 'ORDER BY preco ASC',
            'preco_desc': 'ORDER BY preco DESC',
            'ano_recente': 'ORDER BY ano DESC',
            'ano_antigo': 'ORDER BY ano ASC',
            'recentes': 'ORDER BY id DESC',
            'antigos': 'ORDER BY id ASC'
        };
        const orderByClause = sortOptions[ordenar] || 'ORDER BY id DESC';
        baseQuery += ` ${orderByClause}`;

        const limitParamIndex = queryParams.length + 1;
        const offsetParamIndex = queryParams.length + 2;
        baseQuery += ` LIMIT $${limitParamIndex} OFFSET $${offsetParamIndex}`;
        queryParams.push(limit, offset);

        const result = await req.db.query(baseQuery, queryParams);
        
        const pagination = {
            totalItems,
            totalPages,
            currentPage: page,
            limit,
            hasPrevPage: page > 1,
            hasNextPage: page < totalPages,
            prevPage: page - 1,
            nextPage: page + 1,
            pages: Array.from({ length: totalPages }, (_, i) => i + 1),
            show: totalPages > 1
        };
        
        res.render('index', {
            veiculos: result.rows,
            pageTitle: 'Veículos em Estoque',
            busca: busca,
            ordenar: ordenar,
            pagination: pagination
        });

    } catch (err) {
        console.error("Erro ao buscar/filtrar veículos:", err);
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
