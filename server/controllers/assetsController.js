import pool from '../db.js';
import crypto from 'crypto';

export const getAssets = async (req, res) => {
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
                v.vendor_name as vendor,
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
            LEFT JOIN vendors v ON a.vendor_id = v.vendor_id
        `;
        const [rows] = await pool.query(query);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getAssetById = async (req, res) => {
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
                v.vendor_name as vendor,
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
            LEFT JOIN vendors v ON a.vendor_id = v.vendor_id
            WHERE a.asset_id = ?
        `;
        const [rows] = await pool.query(query, [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Asset not found' });
        
        const asset = rows[0];
        
        // Fetch history
        const [history] = await pool.query(`
            SELECT 
                DATE_FORMAT(assigned_date, '%Y-%m-%d') as date, 
                remarks as action, 
                assigned_by as by_user 
            FROM asset_assignment_history 
            WHERE asset_id = ? 
            ORDER BY assigned_date DESC
        `, [asset.id]);
        asset.history = history.map(h => ({ date: h.date, action: h.action, by: h.by_user }));

        // Fetch Specs
        const [cpu] = await pool.query(`
            SELECT p.processor_name, c.ram_size, c.storage_size, o.os_name, o.os_version
            FROM cpu_details c
            LEFT JOIN processors p ON c.processor_id = p.processor_id
            LEFT JOIN operating_systems o ON c.os_id = o.os_id
            WHERE c.asset_id = ?
        `, [asset.id]);
        
        const [laptop] = await pool.query(`
            SELECT p.processor_name, l.ram_size, l.storage_size, o.os_name, o.os_version
            FROM laptop_details l
            LEFT JOIN processors p ON l.processor_id = p.processor_id
            LEFT JOIN operating_systems o ON l.os_id = o.os_id
            WHERE l.asset_id = ?
        `, [asset.id]);

        const specRow = cpu[0] || laptop[0];
        if (specRow) {
            const specs = {};
            if (specRow.processor_name) specs.Processor = specRow.processor_name;
            if (specRow.ram_size) specs.RAM = specRow.ram_size;
            if (specRow.storage_size) specs.Storage = specRow.storage_size;
            if (specRow.os_name) specs.OS = specRow.os_name + (specRow.os_version ? ' ' + specRow.os_version : '');
            if (Object.keys(specs).length > 0) asset.specs = specs;
        }

        // Fetch Network
        const [network] = await pool.query(`
            SELECT ip_address as ip, hostname, vlan, mac_ethernet as macEthernet, mac_wifi as macWifi, mac_bluetooth as macBluetooth
            FROM network_details WHERE asset_id = ?
        `, [asset.id]);
        if (network[0]) {
            asset.network = network[0];
            asset.network.online = true; // Mock online status for UI
        }

        res.json(asset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const createAsset = async (req, res) => {
    const { type, make, model, serial, purchaseDate, warrantyUntil, status, location, assignedTo, specs, network, vendor } = req.body;
    const id = req.body.id || crypto.randomUUID();
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const [[aty]] = await connection.query('SELECT asset_type_id FROM asset_types WHERE asset_type_name = ?', [type]);
        
        // Ensure brand and model exist, this is simplified for now
        const [[b]] = await connection.query('SELECT brand_id FROM brands WHERE brand_name = ?', [make]);
        let brandId = b?.brand_id;
        if (!brandId && make) {
             const [bres] = await connection.query('INSERT INTO brands (brand_name) VALUES (?)', [make]);
             brandId = bres.insertId;
        }

        const [[dm]] = await connection.query('SELECT model_id FROM device_models WHERE model_name = ? AND brand_id = ?', [model, brandId]);
        let modelId = dm?.model_id;
        if (!modelId && model && brandId) {
             const [mres] = await connection.query('INSERT INTO device_models (brand_id, model_name) VALUES (?, ?)', [brandId, model]);
             modelId = mres.insertId;
        }

        const [[ast]] = await connection.query('SELECT status_id FROM asset_status WHERE status_name = ?', [status || 'Available']);
        const [[loc]] = await connection.query('SELECT location_id FROM locations WHERE location_name = ?', [location]);

        let vendorId = null;
        if (vendor) {
            const [[v]] = await connection.query('SELECT vendor_id FROM vendors WHERE vendor_name = ?', [vendor]);
            if (v) vendorId = v.vendor_id;
            else {
                 const [vres] = await connection.query('INSERT INTO vendors (vendor_name) VALUES (?)', [vendor]);
                 vendorId = vres.insertId;
            }
        }

        await connection.query(`
            INSERT INTO assets (asset_id, asset_type_id, model_id, vendor_id, serial_number, purchase_date, warranty_end_date, status_id, location_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            id, aty?.asset_type_id, modelId, vendorId, serial, purchaseDate, warrantyUntil, ast?.status_id, loc?.location_id
        ]);
        
        await connection.query(`
            INSERT INTO asset_assignment_history (asset_id, assigned_date, assignment_status, remarks, assigned_by)
            VALUES (?, NOW(), 'Created', 'Asset procured and added to inventory', 'Admin')
        `, [id]);

        if (assignedTo) {
             await connection.query(`
                 INSERT INTO user_asset_assignment (user_id, asset_id, assigned_date) 
                 VALUES (?, ?, NOW())
             `, [assignedTo, id]);
             
             await connection.query(`
                INSERT INTO asset_assignment_history (asset_id, user_id, assigned_date, assignment_status, remarks, assigned_by)
                VALUES (?, ?, NOW(), 'Assigned', ?, 'Admin')
            `, [id, assignedTo, `Assigned on creation`]);
            
            const [[assignedStatus]] = await connection.query("SELECT status_id FROM asset_status WHERE status_name = 'Assigned'");
            await connection.query('UPDATE assets SET status_id = ? WHERE asset_id = ?', [assignedStatus.status_id, id]);
        }

        // Specs
        if (specs && (type === 'Laptop' || type === 'Desktop CPU')) {
            let procId = null;
            if (specs.Processor) {
                const [[proc]] = await connection.query('SELECT processor_id FROM processors WHERE processor_name = ?', [specs.Processor]);
                if (proc) procId = proc.processor_id;
                else {
                    const [pres] = await connection.query('INSERT INTO processors (processor_name) VALUES (?)', [specs.Processor]);
                    procId = pres.insertId;
                }
            }
            
            let osId = null;
            if (specs.OS) {
                const [[os]] = await connection.query('SELECT os_id FROM operating_systems WHERE os_name = ?', [specs.OS]);
                if (os) osId = os.os_id;
                else {
                    const [ores] = await connection.query('INSERT INTO operating_systems (os_name) VALUES (?)', [specs.OS]);
                    osId = ores.insertId;
                }
            }

            const table = type === 'Laptop' ? 'laptop_details' : 'cpu_details';
            await connection.query(`
                INSERT INTO ${table} (asset_id, processor_id, ram_size, storage_size, os_id)
                VALUES (?, ?, ?, ?, ?)
            `, [id, procId, specs.RAM || null, specs.Storage || null, osId]);
        }

        // Network
        if (network && (network.ip || network.hostname || network.macEthernet || network.macWifi)) {
            await connection.query(`
                INSERT INTO network_details (asset_id, ip_address, hostname, vlan, mac_ethernet, mac_wifi, mac_bluetooth)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [id, network.ip || null, network.hostname || null, network.vlan || null, network.macEthernet || null, network.macWifi || null, network.macBluetooth || null]);
        }

        await connection.commit();
        res.status(201).json({ message: 'Asset created successfully', id });
    } catch (err) {
        await connection.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        connection.release();
    }
};

export const updateAsset = async (req, res) => {
    const { id } = req.params;
    const { type, make, model, serial, purchaseDate, warrantyUntil, status, location, specs, network, vendor } = req.body;
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const [[aty]] = await connection.query('SELECT asset_type_id FROM asset_types WHERE asset_type_name = ?', [type]);
        
        let brandId = null;
        if (make) {
            const [[b]] = await connection.query('SELECT brand_id FROM brands WHERE brand_name = ?', [make]);
            if (b) brandId = b.brand_id;
            else {
                 const [bres] = await connection.query('INSERT INTO brands (brand_name) VALUES (?)', [make]);
                 brandId = bres.insertId;
            }
        }

        let modelId = null;
        if (model && brandId) {
            const [[dm]] = await connection.query('SELECT model_id FROM device_models WHERE model_name = ? AND brand_id = ?', [model, brandId]);
            if (dm) modelId = dm.model_id;
            else {
                 const [mres] = await connection.query('INSERT INTO device_models (brand_id, model_name) VALUES (?, ?)', [brandId, model]);
                 modelId = mres.insertId;
            }
        }

        const [[ast]] = await connection.query('SELECT status_id FROM asset_status WHERE status_name = ?', [status]);
        const [[loc]] = await connection.query('SELECT location_id FROM locations WHERE location_name = ?', [location]);

        let vendorId = null;
        if (vendor) {
            const [[v]] = await connection.query('SELECT vendor_id FROM vendors WHERE vendor_name = ?', [vendor]);
            if (v) vendorId = v.vendor_id;
            else {
                 const [vres] = await connection.query('INSERT INTO vendors (vendor_name) VALUES (?)', [vendor]);
                 vendorId = vres.insertId;
            }
        }

        await connection.query(`
            UPDATE assets SET 
                asset_type_id = ?, model_id = ?, vendor_id = ?, serial_number = ?, 
                purchase_date = ?, warranty_end_date = ?, status_id = ?, location_id = ?
            WHERE asset_id = ?
        `, [aty?.asset_type_id, modelId, vendorId, serial, purchaseDate, warrantyUntil, ast?.status_id, loc?.location_id, id]);

        // Specs Update (simplistic: delete and insert)
        await connection.query('DELETE FROM cpu_details WHERE asset_id = ?', [id]);
        await connection.query('DELETE FROM laptop_details WHERE asset_id = ?', [id]);
        
        if (specs && (type === 'Laptop' || type === 'Desktop CPU')) {
            let procId = null;
            if (specs.Processor) {
                const [[proc]] = await connection.query('SELECT processor_id FROM processors WHERE processor_name = ?', [specs.Processor]);
                if (proc) procId = proc.processor_id;
                else {
                    const [pres] = await connection.query('INSERT INTO processors (processor_name) VALUES (?)', [specs.Processor]);
                    procId = pres.insertId;
                }
            }
            
            let osId = null;
            if (specs.OS) {
                const [[os]] = await connection.query('SELECT os_id FROM operating_systems WHERE os_name = ?', [specs.OS]);
                if (os) osId = os.os_id;
                else {
                    const [ores] = await connection.query('INSERT INTO operating_systems (os_name) VALUES (?)', [specs.OS]);
                    osId = ores.insertId;
                }
            }

            const table = type === 'Laptop' ? 'laptop_details' : 'cpu_details';
            await connection.query(`
                INSERT INTO ${table} (asset_id, processor_id, ram_size, storage_size, os_id)
                VALUES (?, ?, ?, ?, ?)
            `, [id, procId, specs.RAM || null, specs.Storage || null, osId]);
        }

        // Network Update
        await connection.query('DELETE FROM network_details WHERE asset_id = ?', [id]);
        if (network && (network.ip || network.hostname || network.macEthernet || network.macWifi)) {
            await connection.query(`
                INSERT INTO network_details (asset_id, ip_address, hostname, vlan, mac_ethernet, mac_wifi, mac_bluetooth)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [id, network.ip || null, network.hostname || null, network.vlan || null, network.macEthernet || null, network.macWifi || null, network.macBluetooth || null]);
        }

        await connection.commit();
        res.json({ message: 'Asset updated successfully' });
    } catch (err) {
        await connection.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        connection.release();
    }
}
