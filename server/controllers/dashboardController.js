import pool from '../db.js';

export const getDashboardStats = async (req, res) => {
    try {
        // Total Assets
        const [[{ total_assets }]] = await pool.query('SELECT COUNT(*) as total_assets FROM assets');
        
        // Assigned Assets
        const [[{ assigned_assets }]] = await pool.query(`
            SELECT COUNT(*) as assigned_assets 
            FROM assets a 
            JOIN asset_status ast ON a.status_id = ast.status_id 
            WHERE ast.status_name = 'Assigned'
        `);
        
        // Available Assets
        const [[{ available_assets }]] = await pool.query(`
            SELECT COUNT(*) as available_assets 
            FROM assets a 
            JOIN asset_status ast ON a.status_id = ast.status_id 
            WHERE ast.status_name = 'Available'
        `);
        
        // Maintenance Assets
        const [[{ maintenance_assets }]] = await pool.query(`
            SELECT COUNT(*) as maintenance_assets 
            FROM assets a 
            JOIN asset_status ast ON a.status_id = ast.status_id 
            WHERE ast.status_name = 'Maintenance'
        `);
        
        // Warranty Expiring
        const [[{ warranty_expiring }]] = await pool.query(`
            SELECT COUNT(*) as warranty_expiring 
            FROM assets 
            WHERE warranty_end_date < DATE_ADD(CURDATE(), INTERVAL 6 MONTH)
        `);

        // Users
        const [[{ total_users }]] = await pool.query('SELECT COUNT(*) as total_users FROM users');
        const [[{ active_users }]] = await pool.query("SELECT COUNT(*) as active_users FROM users WHERE status = 'Active'");

        res.json({
            total: total_assets,
            assigned: assigned_assets,
            available: available_assets,
            maintenance: maintenance_assets,
            warrantyExpiring: warranty_expiring,
            users: total_users,
            activeUsers: active_users,
            networkDevices: 0 // placeholder
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
