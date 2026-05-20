import pool from './db.js';
import crypto from 'crypto';

const locations = [
    'ADMIN-TF',
    'ADMIN-GF',
    'ADMIN-SF',
    'ADMIN-FF',
    'CNS Stores',
    'ATS-FF',
    'Red store',
    'Vellore'
];

async function seedDummyData() {
    console.log('Starting dummy data seeding...');
    try {
        // 1. Insert Locations
        for (const loc of locations) {
            await pool.query('INSERT IGNORE INTO locations (location_name) VALUES (?)', [loc]);
        }
        console.log('Inserted locations.');

        // 2. Insert Dummy Users
        const users = [
            { id: crypto.randomUUID(), empId: 'EMP101', name: 'John Doe', email: 'john.doe@aai.aero', dept: 'IT Operations', loc: 'ADMIN-FF' },
            { id: crypto.randomUUID(), empId: 'EMP102', name: 'Jane Smith', email: 'jane.smith@aai.aero', dept: 'Air Traffic Control', loc: 'ATS-FF' },
            { id: crypto.randomUUID(), empId: 'EMP103', name: 'Ravi Kumar', email: 'ravi.kumar@aai.aero', dept: 'Engineering', loc: 'CNS Stores' }
        ];

        for (const u of users) {
            const [[d]] = await pool.query('SELECT department_id FROM departments WHERE department_name = ?', [u.dept]);
            const [[l]] = await pool.query('SELECT location_id FROM locations WHERE location_name = ?', [u.loc]);
            
            await pool.query(`
                INSERT IGNORE INTO users (user_id, emp_id, employee_name, email, department_id, location_id, status)
                VALUES (?, ?, ?, ?, ?, ?, 'Active')
            `, [u.id, u.empId, u.name, u.email, d?.department_id, l?.location_id]);
        }
        console.log('Inserted dummy users.');

        // 3. Insert Dummy Assets
        const assets = [
            { id: 'AAI-AST-001', type: 'Laptop', make: 'Dell', model: 'Latitude 5430', serial: 'SN-DLL-001', loc: 'ADMIN-FF', assignedTo: users[0].id, specs: { Processor: 'Intel Core i7', RAM: '16GB', OS: 'Windows 11 Pro' } },
            { id: 'AAI-AST-002', type: 'Desktop CPU', make: 'HP', model: 'ProDesk 600', serial: 'SN-HP-002', loc: 'ATS-FF', assignedTo: users[1].id, specs: { Processor: 'Intel Core i5', RAM: '8GB', OS: 'Windows 10 Pro' } },
            { id: 'AAI-AST-003', type: 'Router', make: 'Cisco', model: 'Catalyst 9300', serial: 'SN-CSC-003', loc: 'Red store', assignedTo: null, specs: null }
        ];

        const [[availableStatus]] = await pool.query("SELECT status_id FROM asset_status WHERE status_name = 'Available'");
        const [[assignedStatus]] = await pool.query("SELECT status_id FROM asset_status WHERE status_name = 'Assigned'");

        for (const a of assets) {
            const [[aty]] = await pool.query('SELECT asset_type_id FROM asset_types WHERE asset_type_name = ?', [a.type]);
            const [[b]] = await pool.query('SELECT brand_id FROM brands WHERE brand_name = ?', [a.make]);
            const [[dm]] = await pool.query('SELECT model_id FROM device_models WHERE model_name = ? AND brand_id = ?', [a.model, b?.brand_id]);
            const [[loc]] = await pool.query('SELECT location_id FROM locations WHERE location_name = ?', [a.loc]);

            const statusId = a.assignedTo ? assignedStatus.status_id : availableStatus.status_id;

            await pool.query(`
                INSERT IGNORE INTO assets (asset_id, asset_type_id, model_id, serial_number, purchase_date, warranty_end_date, status_id, location_id)
                VALUES (?, ?, ?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 3 YEAR), ?, ?)
            `, [a.id, aty?.asset_type_id, dm?.model_id, a.serial, statusId, loc?.location_id]);

            if (a.specs) {
                // Insert simplistic specs mapping
                const table = a.type === 'Laptop' ? 'laptop_details' : 'cpu_details';
                await pool.query(`INSERT IGNORE INTO ${table} (asset_id, ram_size) VALUES (?, ?)`, [a.id, a.specs.RAM]);
            }

            if (a.assignedTo) {
                await pool.query(`
                    INSERT IGNORE INTO user_asset_assignment (user_id, asset_id, assigned_date)
                    VALUES (?, ?, NOW())
                `, [a.assignedTo, a.id]);

                await pool.query(`
                    INSERT IGNORE INTO asset_assignment_history (asset_id, user_id, assigned_date, assignment_status, remarks, assigned_by)
                    VALUES (?, ?, NOW(), 'Assigned', 'Initial dummy data allocation', 'System')
                `, [a.id, a.assignedTo]);
            }
        }
        console.log('Inserted dummy assets.');
        console.log('Seeding complete!');
        process.exit(0);

    } catch (err) {
        console.error('Seeding failed:', err);
        process.exit(1);
    }
}

seedDummyData();
