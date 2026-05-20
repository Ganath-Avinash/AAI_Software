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
        res.json(rows);
    } catch (err) {
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
