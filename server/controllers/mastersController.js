import pool from '../db.js';

export const getDepartments = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM departments');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getLocations = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM locations');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getDesignations = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM designations');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getAssetTypes = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM asset_types');
        res.json(rows.map(r => ({
            id: r.asset_type_id,
            name: r.asset_type_name,
            schema: r.custom_schema ? (typeof r.custom_schema === 'string' ? JSON.parse(r.custom_schema) : r.custom_schema) : null
        })));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const createAssetType = async (req, res) => {
    const { name, schema } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });
    try {
        const [result] = await pool.query('INSERT INTO asset_types (asset_type_name, custom_schema) VALUES (?, ?)', [
            name, schema ? JSON.stringify(schema) : null
        ]);
        res.status(201).json({ id: result.insertId, name, schema });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Asset type already exists' });
        res.status(500).json({ error: err.message });
    }
};

export const deleteAssetType = async (req, res) => {
    const { id } = req.params;
    try {
        // Only allow deleting types that have a custom_schema (meaning they were user-created)
        const [rows] = await pool.query('SELECT custom_schema FROM asset_types WHERE asset_type_id = ?', [id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Asset type not found' });
        if (rows[0].custom_schema === null) return res.status(403).json({ error: 'Cannot delete default asset types' });

        await pool.query('DELETE FROM asset_types WHERE asset_type_id = ?', [id]);
        res.json({ message: 'Asset type deleted successfully' });
    } catch (err) {
        if (err.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).json({ error: 'Cannot delete this asset type because there are assets assigned to it.' });
        }
        res.status(500).json({ error: err.message });
    }
};

export const getAssetStatus = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM asset_status');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getBrands = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM brands');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getModelsByBrand = async (req, res) => {
    const { brandId } = req.params;
    try {
        let query = 'SELECT * FROM device_models';
        let params = [];
        if (brandId) {
            query += ' WHERE brand_id = ?';
            params.push(brandId);
        }
        const [rows] = await pool.query(query, params);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
