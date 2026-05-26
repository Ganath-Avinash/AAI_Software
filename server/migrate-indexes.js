import pool from './db.js';

async function migrate() {
    try {
        console.log("Starting index migration...");

        // helper to safely add index
        const addIndex = async (table, indexName, columns) => {
            try {
                await pool.query(`ALTER TABLE ${table} ADD INDEX ${indexName} (${columns})`);
                console.log(`Added index ${indexName} to ${table}`);
            } catch (err) {
                if (err.code === 'ER_DUP_KEYNAME') {
                    console.log(`Index ${indexName} already exists on ${table}, skipping.`);
                } else {
                    throw err;
                }
            }
        };

        // users indexes
        // emp_id is already UNIQUE, so no need for explicit index, but we'll try just in case it wasn't
        await addIndex('users', 'idx_employee_name', 'employee_name');
        await addIndex('users', 'idx_department_id', 'department_id');
        await addIndex('users', 'idx_status', 'status');

        // assets indexes
        await addIndex('assets', 'idx_serial_number', 'serial_number');
        await addIndex('assets', 'idx_status_id', 'status_id');
        await addIndex('assets', 'idx_location_id', 'location_id');

        // user_asset_assignment indexes
        await addIndex('user_asset_assignment', 'idx_user_id', 'user_id');
        await addIndex('user_asset_assignment', 'idx_asset_id', 'asset_id');
        await addIndex('user_asset_assignment', 'idx_returned_date', 'returned_date');

        console.log("Migration completed successfully!");
    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        pool.end();
    }
}

migrate();
