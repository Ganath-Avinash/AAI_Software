import pool from './db.js';

async function insertAMCAsset() {
    try {
        const [[maintStatus]] = await pool.query("SELECT status_id FROM asset_status WHERE status_name = 'Maintenance'");
        const [[aty]] = await pool.query("SELECT asset_type_id FROM asset_types WHERE asset_type_name = 'Laptop'");
        
        let [[b]] = await pool.query("SELECT brand_id FROM brands WHERE brand_name = 'Dell'");
        if (!b) {
            const [bres] = await pool.query("INSERT INTO brands (brand_name) VALUES ('Dell')");
            b = { brand_id: bres.insertId };
        }
        
        let [[dm]] = await pool.query("SELECT model_id FROM device_models WHERE model_name = 'Latitude 5430' AND brand_id = ?", [b.brand_id]);
        if (!dm) {
            const [dres] = await pool.query("INSERT INTO device_models (model_name, brand_id) VALUES ('Latitude 5430', ?)", [b.brand_id]);
            dm = { model_id: dres.insertId };
        }
        
        let [[loc]] = await pool.query("SELECT location_id FROM locations WHERE location_name = 'ADMIN-TF'");
        if (!loc) {
            const [lres] = await pool.query("INSERT INTO locations (location_name) VALUES ('ADMIN-TF')");
            loc = { location_id: lres.insertId };
        }
        
        let [[wt]] = await pool.query("SELECT warranty_type_id FROM warranty_types WHERE warranty_type_name = 'AMC'");
        if (!wt) {
            const [wres] = await pool.query("INSERT INTO warranty_types (warranty_type_name) VALUES ('AMC')");
            wt = { warranty_type_id: wres.insertId };
        }
        
        // Also ensure Maintenance status exists
        let statusId = maintStatus?.status_id;
        if (!statusId) {
            const [sres] = await pool.query("INSERT INTO asset_status (status_name) VALUES ('Maintenance')");
            statusId = sres.insertId;
        }

        await pool.query(`
            INSERT IGNORE INTO assets (asset_id, asset_type_id, model_id, serial_number, purchase_date, warranty_type_id, warranty_end_date, status_id, location_id, remarks)
            VALUES (?, ?, ?, ?, DATE_SUB(NOW(), INTERVAL 4 YEAR), ?, DATE_SUB(NOW(), INTERVAL 1 MONTH), ?, ?, 'Under AMC after initial warranty expired')
        `, ['AAI-AST-AMC-001', aty?.asset_type_id, dm?.model_id, 'SN-AMC-EXPIRED', wt.warranty_type_id, statusId, loc?.location_id]);

        console.log('Inserted AMC Mock Asset successfully.');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

insertAMCAsset();
