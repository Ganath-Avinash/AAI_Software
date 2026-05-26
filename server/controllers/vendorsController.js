import pool from '../db.js';

export const getVendors = async (req, res) => {
    try {
        const query = `
            SELECT 
                v.vendor_id as id,
                v.vendor_name as name,
                COUNT(a.asset_id) as assetsSupplied
            FROM vendors v
            LEFT JOIN assets a ON v.vendor_id = a.vendor_id
            GROUP BY v.vendor_id
            ORDER BY v.vendor_name ASC
        `;
        const [rows] = await pool.query(query);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getVendorById = async (req, res) => {
    try {
        const query = `
            SELECT 
                v.vendor_id as id,
                v.vendor_name as name,
                COUNT(a.asset_id) as assetsSupplied
            FROM vendors v
            LEFT JOIN assets a ON v.vendor_id = a.vendor_id
            WHERE v.vendor_id = ?
            GROUP BY v.vendor_id
        `;
        const [rows] = await pool.query(query, [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Vendor not found' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getVendorAssets = async (req, res) => {
    try {
        const query = `
            SELECT 
                a.asset_id as id,
                aty.asset_type_name as type,
                b.brand_name as make,
                dm.model_name as model,
                a.serial_number as serial,
                DATE_FORMAT(a.purchase_date, '%Y-%m-%d') as purchaseDate,
                DATE_FORMAT(a.warranty_end_date, '%Y-%m-%d') as warrantyUntil,
                ast.status_name as status,
                l.location_name as location,
                (
                    SELECT user_id 
                    FROM user_asset_assignment 
                    WHERE asset_id = a.asset_id AND returned_date IS NULL 
                    ORDER BY assigned_date DESC LIMIT 1
                ) as assignedTo
            FROM assets a
            LEFT JOIN asset_types aty ON a.asset_type_id = aty.asset_type_id
            LEFT JOIN device_models dm ON a.model_id = dm.model_id
            LEFT JOIN brands b ON dm.brand_id = b.brand_id
            LEFT JOIN asset_status ast ON a.status_id = ast.status_id
            LEFT JOIN locations l ON a.location_id = l.location_id
            WHERE a.vendor_id = ?
        `;
        const [rows] = await pool.query(query, [req.params.id]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
