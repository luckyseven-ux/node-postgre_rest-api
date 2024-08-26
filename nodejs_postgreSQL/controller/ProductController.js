const db = require('../services/db')

exports.getAllProduct = async (req, res) => {
    try {
        const result = await db.pool.query(`
        SELECT p.id, p.name, p.description, p.price, p.currency, p.quantity,
            p.active, p.created_date, p.updated_date,
            (SELECT ROW_TO_JSON(category_obj) FROM (
                SELECT id, name FROM category WHERE id = p.category_id
            ) category_obj) AS category
        FROM product p`);
        return res.status(200).json(result.rows.map(row => ({
            ...row,
            created_date: row.created_date.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }),
            updated_date: row.updated_date.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }),
        })));
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

exports.createProduct = async (req, res) => {
    try {
        if (!req.body.name) {
            return res.status(422).json({ error: 'Name perlu dimasukan' });
        }

        if (!req.body.price) {
            return res.status(422).json({ error: 'Price perlu dimasukan' });
        }

        if (!req.body.category_id) {
            return res.status(422).json({ error: 'Category id perlu dimasukan' });
        } else {
            const existsResult = await db.pool.query({
                text: 'SELECT EXISTS (SELECT * FROM category WHERE id = $1)',
                values: [req.body.category_id]
            });

            if (!existsResult.rows[0].exists) {
                return res.status(422).json({ error: 'Category id tidak ditemukan!!' });
            }
        }

        const result = await db.pool.query({
            text: `
                INSERT INTO product (name, description, price, currency, quantity, active, category_id, created_date, updated_date)
                VALUES ($1, $2, $3, $4, $5, $6, $7, current_timestamp AT TIME ZONE 'Asia/Jakarta', current_timestamp AT TIME ZONE 'Asia/Jakarta')
                RETURNING *`,
            values: [
                req.body.name,
                req.body.description ? req.body.description : null,
                req.body.price,
                req.body.currency ? req.body.currency : 'Rp',
                req.body.quantity ? req.body.quantity : 0,
                'active' in req.body ? req.body.active : true,
                req.body.category_id
            ]
        });

        return res.status(201).json(result.rows[0]);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

exports.updateProduct = async (req, res) => {
    try {
        if (!req.body.name || !req.body.description || !req.body.price || !req.body.currency || !req.body.quantity || !req.body.active || !req.body.category_id) {
            return res.status(422).json({ error: 'All fields are required' });
        }

        const existsResult = await db.pool.query({
            text: 'SELECT EXISTS (SELECT * FROM product WHERE name = $1)',
            values: [req.body.name]
        });

        if (existsResult.rows[0].exists) {
            return res.status(409).json({ error: `peringatan!! product ${req.body.name} sudah ada !!` });
        }

        const result = await db.pool.query({
            text: `
                UPDATE product
                SET name = $1, description = $2, price = $3, currency = $4, quantity = $5, active = $6, category_id = $7, updated_date = current_timestamp AT TIME ZONE 'Asia/Jakarta'
                WHERE id = $8
                RETURNING *
            `,
            values: [
                req.body.name,
                req.body.description,
                req.body.price,
                req.body.currency,
                req.body.quantity,
                req.body.active,
                req.body.category_id,
                req.params.id
            ]
        });

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'maaf product tidak ditemukan!!' });
        }

        return res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error updating product:', error);
        return res.status(500).json({ error: 'Terjadi kesalahan saat memperbarui product' });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const result = await db.pool.query({
            text: 'DELETE FROM product WHERE id = $1',
            values: [req.params.id]
        });

        if (result.rowCount == 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        return res.status(204).send();
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

exports.getProductById = async (req, res) => {
    try {
        const result = await db.pool.query({
            text: `
            SELECT p.id, p.name, p.description, p.price, p.currency, 
                p.quantity, p.active, p.created_date, p.updated_date,
                
                (SELECT ROW_TO_JSON(category_obj) FROM (
                    SELECT id, name FROM category WHERE id = p.category_id
                ) category_obj) AS category
                
            FROM product p   
            WHERE p.id = $1`,
            values: [req.params.id]
        });

        if (result.rowCount == 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        return res.status(200).json({
            ...result.rows[0],
            created_date: result.rows[0].created_date.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }),
            updated_date: result.rows[0].updated_date.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

exports.getProductsByCategoryId = async (req, res) => {
    try {
        const existsResult = await db.pool.query({
            text: 'SELECT EXISTS (SELECT * FROM category WHERE id = $1)',
            values: [req.params.categoryId]
        });

        if (!existsResult.rows[0].exists) {
            return res.status(404).json({ error: 'Category not found' });
        }

        const result = await db.pool.query({
            text: `
            SELECT p.id, p.name, p.description, p.price, p.currency, 
                p.quantity, p.active, p.created_date, p.updated_date,
                
                (SELECT ROW_TO_JSON(category_obj) FROM (
                    SELECT id, name FROM category WHERE id = p.category_id
                ) category_obj) AS category
                
            FROM product p   
            WHERE p.category_id = $1`,
            values: [req.params.categoryId]
        });

        return res.status(200).json(result.rows.map(row => ({
            ...row,
            created_date: row.created_date.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }),
            updated_date: row.updated_date.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })
        })));
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}