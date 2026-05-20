import pool from '../db.js';

export const assignAsset = async (req, res) => {
    const { assetId, userId, remarks, assignedBy } = req.body;
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // Add to user_asset_assignment
        await connection.query(`
            INSERT INTO user_asset_assignment (user_id, asset_id, assigned_date)
            VALUES (?, ?, NOW())
        `, [userId, assetId]);

        // Add to history
        await connection.query(`
            INSERT INTO asset_assignment_history (asset_id, user_id, assigned_date, assignment_status, remarks, assigned_by)
            VALUES (?, ?, NOW(), 'Assigned', ?, ?)
        `, [assetId, userId, remarks || 'Asset assigned to user', assignedBy || 'Admin']);

        // Update asset status
        const [[status]] = await connection.query('SELECT status_id FROM asset_status WHERE status_name = "Assigned"');
        await connection.query('UPDATE assets SET status_id = ? WHERE asset_id = ?', [status.status_id, assetId]);

        await connection.commit();
        res.json({ message: 'Asset assigned successfully' });
    } catch (err) {
        await connection.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        connection.release();
    }
};

export const returnAsset = async (req, res) => {
    const { assetId, remarks, returnedTo } = req.body;
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // Find active assignment
        const [assignments] = await connection.query(`
            SELECT assignment_id, user_id FROM user_asset_assignment 
            WHERE asset_id = ? AND returned_date IS NULL
        `, [assetId]);

        if (assignments.length === 0) {
            throw new Error('Asset is not currently assigned');
        }
        
        const assignmentId = assignments[0].assignment_id;
        const userId = assignments[0].user_id;

        // Update assignment
        await connection.query('UPDATE user_asset_assignment SET returned_date = NOW() WHERE assignment_id = ?', [assignmentId]);

        // Add to history
        await connection.query(`
            INSERT INTO asset_assignment_history (asset_id, user_id, returned_date, assignment_status, remarks, returned_to_store)
            VALUES (?, ?, NOW(), 'Returned', ?, TRUE)
        `, [assetId, userId, remarks || 'Asset returned to store']);

        // Update asset status
        const [[status]] = await connection.query('SELECT status_id FROM asset_status WHERE status_name = "Available"');
        await connection.query('UPDATE assets SET status_id = ? WHERE asset_id = ?', [status.status_id, assetId]);

        await connection.commit();
        res.json({ message: 'Asset returned successfully' });
    } catch (err) {
        await connection.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        connection.release();
    }
};

export const getHistory = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                h.history_id as id,
                h.asset_id as assetId,
                u.employee_name as user,
                DATE_FORMAT(h.assigned_date, '%Y-%m-%d %H:%i') as assignedDate,
                DATE_FORMAT(h.returned_date, '%Y-%m-%d %H:%i') as returnedDate,
                h.assignment_status as status,
                h.remarks,
                h.assigned_by as assignedBy
            FROM asset_assignment_history h
            LEFT JOIN users u ON h.user_id = u.user_id
            ORDER BY h.history_id DESC
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
