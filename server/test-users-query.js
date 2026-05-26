import pool from './db.js';

async function testQuery() {
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
                u.status,
                (
                    SELECT JSON_ARRAYAGG(uaa.asset_id) 
                    FROM user_asset_assignment uaa 
                    WHERE uaa.user_id = u.user_id AND uaa.returned_date IS NULL
                ) as assetIdsStr,
                (
                    SELECT JSON_ARRAYAGG(uaa.asset_id) 
                    FROM user_asset_assignment uaa 
                    WHERE uaa.user_id = u.user_id AND uaa.returned_date IS NOT NULL
                ) as pastAssetIdsStr
            FROM users u
            LEFT JOIN departments d ON u.department_id = d.department_id
            LEFT JOIN designations des ON u.designation_id = des.designation_id
            LEFT JOIN locations l ON u.location_id = l.location_id
            LEFT JOIN employee_types et ON u.employee_type_id = et.employee_type_id
            LIMIT 5
        `;
        const [rows] = await pool.query(query);
        console.log("Query executed successfully. Found rows:", rows.length);
        if (rows.length > 0) {
            console.log("Sample first row:", rows[0]);
        }
    } catch (e) {
        console.error("Query failed:", e);
    } finally {
        pool.end();
    }
}
testQuery();
