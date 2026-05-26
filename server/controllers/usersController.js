import pool from '../db.js';
import crypto from 'crypto';

export const getUsers = async (req, res) => {
    try {
        const query = `
            SELECT 
                u.user_id as id,
                u.emp_id as empId,
                u.employee_name as name,
                u.email,
                d.department_name as department,
                des.designation_name as designation,
                l.location_name as location,
                u.intercom,
                et.employee_type_name as employeeType,
                u.status
            FROM users u
            LEFT JOIN departments d ON u.department_id = d.department_id
            LEFT JOIN designations des ON u.designation_id = des.designation_id
            LEFT JOIN locations l ON u.location_id = l.location_id
            LEFT JOIN employee_types et ON u.employee_type_id = et.employee_type_id
        `;
        const [rows] = await pool.query(query);
        
        // Fetch assigned assets for each user
        for (let user of rows) {
            const [assetRows] = await pool.query(`
                SELECT a.asset_id 
                FROM user_asset_assignment uaa
                JOIN assets a ON uaa.asset_id = a.asset_id
                WHERE uaa.user_id = ? AND uaa.returned_date IS NULL
            `, [user.id]);
            user.assetIds = assetRows.map(a => a.asset_id);

            const [pastAssetRows] = await pool.query(`
                SELECT a.asset_id 
                FROM user_asset_assignment uaa
                JOIN assets a ON uaa.asset_id = a.asset_id
                WHERE uaa.user_id = ? AND uaa.returned_date IS NOT NULL
            `, [user.id]);
            user.pastAssetIds = pastAssetRows.map(a => a.asset_id);
        }
        
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getUserById = async (req, res) => {
    try {
        // Similar to getUsers but with WHERE u.user_id = ?
        const query = `
            SELECT 
                u.user_id as id,
                u.emp_id as empId,
                u.employee_name as name,
                u.email,
                d.department_name as department,
                des.designation_name as designation,
                l.location_name as location,
                u.intercom,
                et.employee_type_name as employeeType,
                u.status
            FROM users u
            LEFT JOIN departments d ON u.department_id = d.department_id
            LEFT JOIN designations des ON u.designation_id = des.designation_id
            LEFT JOIN locations l ON u.location_id = l.location_id
            LEFT JOIN employee_types et ON u.employee_type_id = et.employee_type_id
            WHERE u.user_id = ?
        `;
        const [rows] = await pool.query(query, [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
        
        const user = rows[0];
        
        const [assetRows] = await pool.query(`
            SELECT a.asset_id 
            FROM user_asset_assignment uaa
            JOIN assets a ON uaa.asset_id = a.asset_id
            WHERE uaa.user_id = ? AND uaa.returned_date IS NULL
        `, [user.id]);
        user.assetIds = assetRows.map(a => a.asset_id);
        
        const [pastAssetRows] = await pool.query(`
            SELECT a.asset_id 
            FROM user_asset_assignment uaa
            JOIN assets a ON uaa.asset_id = a.asset_id
            WHERE uaa.user_id = ? AND uaa.returned_date IS NOT NULL
        `, [user.id]);
        user.pastAssetIds = pastAssetRows.map(a => a.asset_id);
        
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const createUser = async (req, res) => {
    const { empId, name, email, department, designation, location, intercom, employeeType, status } = req.body;
    const id = req.body.id || crypto.randomUUID();
    try {
        // Find IDs for master table values
        const [[dept]] = await pool.query('SELECT department_id FROM departments WHERE department_name = ?', [department]);
        const [[desig]] = await pool.query('SELECT designation_id FROM designations WHERE designation_name = ?', [designation]);
        const [[loc]] = await pool.query('SELECT location_id FROM locations WHERE location_name = ?', [location]);
        const [[etype]] = await pool.query('SELECT employee_type_id FROM employee_types WHERE employee_type_name = ?', [employeeType]);
        
        await pool.query(`
            INSERT INTO users (user_id, emp_id, employee_name, email, department_id, designation_id, location_id, intercom, employee_type_id, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            id, empId, name, email, 
            dept?.department_id, desig?.designation_id, loc?.location_id, 
            intercom, etype?.employee_type_id, status || 'Active'
        ]);
        
        res.status(201).json({ message: 'User created successfully', id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const updateUser = async (req, res) => {
    const { id } = req.params;
    const { empId, name, email, department, designation, location, intercom, employeeType, status } = req.body;
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const [[dept]] = await connection.query('SELECT department_id FROM departments WHERE department_name = ?', [department]);
        const [[desig]] = await connection.query('SELECT designation_id FROM designations WHERE designation_name = ?', [designation]);
        const [[loc]] = await connection.query('SELECT location_id FROM locations WHERE location_name = ?', [location]);
        const [[etype]] = await connection.query('SELECT employee_type_id FROM employee_types WHERE employee_type_name = ?', [employeeType]);

        await connection.query(`
            UPDATE users SET 
                emp_id = ?, employee_name = ?, email = ?, 
                department_id = ?, designation_id = ?, location_id = ?, 
                intercom = ?, employee_type_id = ?, status = ?
            WHERE user_id = ?
        `, [
            empId, name, email, 
            dept?.department_id, desig?.designation_id, loc?.location_id, 
            intercom, etype?.employee_type_id, status, 
            id
        ]);
        
        if (status === 'Inactive') {
            const [assignments] = await connection.query(`
                SELECT assignment_id, asset_id FROM user_asset_assignment 
                WHERE user_id = ? AND returned_date IS NULL
            `, [id]);

            if (assignments.length > 0) {
                const [[availableStatus]] = await connection.query('SELECT status_id FROM asset_status WHERE status_name = "Available"');

                for (const assignment of assignments) {
                    await connection.query('UPDATE user_asset_assignment SET returned_date = NOW() WHERE assignment_id = ?', [assignment.assignment_id]);

                    await connection.query(`
                        INSERT INTO asset_assignment_history (asset_id, user_id, returned_date, assignment_status, remarks, returned_to_store)
                        VALUES (?, ?, NOW(), 'Returned', 'Auto-returned due to user becoming inactive', TRUE)
                    `, [assignment.asset_id, id]);

                    if (availableStatus) {
                        await connection.query('UPDATE assets SET status_id = ? WHERE asset_id = ?', [availableStatus.status_id, assignment.asset_id]);
                    }
                }
            }
        }

        await connection.commit();
        res.json({ message: 'User updated successfully' });
    } catch (err) {
        if (connection) await connection.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) connection.release();
    }
};
