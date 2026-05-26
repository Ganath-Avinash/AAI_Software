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
                DATE_FORMAT(a.install_date, '%Y-%m-%d') as installDate,
                a.supply_order_no as supplyOrderNo,
                wt.warranty_type_name as warrantyType,
                DATE_FORMAT(a.warranty_end_date, '%Y-%m-%d') as warrantyUntil,
                a.remarks,
                a.custom_fields as customFields,
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
            LEFT JOIN warranty_types wt ON a.warranty_type_id = wt.warranty_type_id
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
                DATE_FORMAT(a.install_date, '%Y-%m-%d') as installDate,
                a.supply_order_no as supplyOrderNo,
                wt.warranty_type_name as warrantyType,
                DATE_FORMAT(a.warranty_end_date, '%Y-%m-%d') as warrantyUntil,
                a.remarks,
                a.custom_fields as customFields,
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
            LEFT JOIN warranty_types wt ON a.warranty_type_id = wt.warranty_type_id
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
            SELECT p.processor_name, c.ram_size, c.storage_size, o.os_name, o.os_version, c.keyboard_id, c.keyboard_serial, c.keyboard_make, c.keyboard_model, c.mouse_id, c.mouse_serial, c.mouse_make, c.mouse_model,
                   c.processor_speed, c.chipset, c.ram_speed, c.ram_slots, c.storage_make_model, c.cd_drive, c.speaker, c.os_key, c.office_suite, c.office_suite_key, c.adobe_acrobat, c.adobe_acrobat_key
            FROM cpu_details c
            LEFT JOIN processors p ON c.processor_id = p.processor_id
            LEFT JOIN operating_systems o ON c.os_id = o.os_id
            WHERE c.asset_id = ?
        `, [asset.id]);
        
        const [laptop] = await pool.query(`
            SELECT p.processor_name, l.ram_size, l.storage_size, o.os_name, o.os_version,
                   l.processor_speed, l.chipset, l.ram_speed, l.ram_slots, l.storage_make_model, l.cd_drive, l.dvd_drive, l.speaker
            FROM laptop_details l
            LEFT JOIN processors p ON l.processor_id = p.processor_id
            LEFT JOIN operating_systems o ON l.os_id = o.os_id
            WHERE l.asset_id = ?
        `, [asset.id]);

        const [equipment] = await pool.query(`
            SELECT capacity, technology, data_field
            FROM equipment_specs
            WHERE asset_id = ?
        `, [asset.id]);

        const specRow = cpu[0] || laptop[0] || equipment[0];
        if (specRow) {
            const specs = {};
            if (specRow.processor_name) specs.Processor = specRow.processor_name;
            if (specRow.ram_size) specs.RAM = specRow.ram_size;
            if (specRow.storage_size) specs.Storage = specRow.storage_size;
            if (specRow.os_name) specs.OS = specRow.os_name + (specRow.os_version ? ' ' + specRow.os_version : '');
            if (specRow.keyboard_id) specs.KeyboardID = specRow.keyboard_id;
            if (specRow.keyboard_serial) specs.KeyboardSerial = specRow.keyboard_serial;
            if (specRow.keyboard_make) specs.KeyboardMake = specRow.keyboard_make;
            if (specRow.keyboard_model) specs.KeyboardModel = specRow.keyboard_model;
            if (specRow.mouse_id) specs.MouseID = specRow.mouse_id;
            if (specRow.mouse_serial) specs.MouseSerial = specRow.mouse_serial;
            if (specRow.mouse_make) specs.MouseMake = specRow.mouse_make;
            if (specRow.mouse_model) specs.MouseModel = specRow.mouse_model;
            
            if (specRow.processor_speed) specs.ProcessorSpeed = specRow.processor_speed;
            if (specRow.chipset) specs.Chipset = specRow.chipset;
            if (specRow.ram_speed) specs.RAMSpeed = specRow.ram_speed;
            if (specRow.ram_slots) specs.RAMSlots = specRow.ram_slots;
            if (specRow.storage_make_model) specs.StorageMakeModel = specRow.storage_make_model;
            if (specRow.cd_drive) specs.CDDrive = specRow.cd_drive;
            if (specRow.dvd_drive) specs.DVDDrive = specRow.dvd_drive;
            if (specRow.speaker) specs.Speaker = specRow.speaker;
            
            if (specRow.os_key) specs.OSKey = specRow.os_key;
            if (specRow.office_suite) specs.OfficeSuite = specRow.office_suite;
            if (specRow.office_suite_key) specs.OfficeSuiteKey = specRow.office_suite_key;
            if (specRow.adobe_acrobat) specs.AdobeAcrobat = specRow.adobe_acrobat;
            if (specRow.adobe_acrobat_key) specs.AdobeAcrobatKey = specRow.adobe_acrobat_key;

            if (specRow.capacity) specs.Capacity = specRow.capacity;
            if (specRow.technology) specs.Technology = specRow.technology;
            if (specRow.data_field) specs.Data = specRow.data_field;

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
        
        if (asset.customFields && typeof asset.customFields === 'string') {
            try { asset.customFields = JSON.parse(asset.customFields); } catch(e) {}
        }

        res.json(asset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const createAsset = async (req, res) => {
    const { type, make, model, serial, purchaseDate, installDate, supplyOrderNo, warrantyType, warrantyUntil, remarks, status, location, assignedTo, specs, network, vendor, customFields } = req.body;
    const id = req.body.id || crypto.randomUUID();
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const [[aty]] = await connection.query('SELECT asset_type_id FROM asset_types WHERE asset_type_name = ?', [type]);
        
        // Ensure brand and model exist
        const getBrand = async () => (await connection.query('SELECT brand_id FROM brands WHERE brand_name = ?', [make]))[0][0];
        let b = await getBrand();
        let brandId = b?.brand_id;
        if (!brandId && make) {
             try {
                 const [bres] = await connection.query('INSERT INTO brands (brand_name) VALUES (?)', [make]);
                 brandId = bres.insertId;
             } catch (e) {
                 if (e.code === 'ER_DUP_ENTRY') { b = await getBrand(); brandId = b?.brand_id; }
                 else throw e;
             }
        }

        const getModel = async () => (await connection.query('SELECT model_id FROM device_models WHERE model_name = ? AND brand_id = ?', [model, brandId]))[0][0];
        let dm = await getModel();
        let modelId = dm?.model_id;
        if (!modelId && model && brandId) {
             try {
                 const [mres] = await connection.query('INSERT INTO device_models (brand_id, model_name) VALUES (?, ?)', [brandId, model]);
                 modelId = mres.insertId;
             } catch (e) {
                 if (e.code === 'ER_DUP_ENTRY') { dm = await getModel(); modelId = dm?.model_id; }
                 else throw e;
             }
        }

        const [[ast]] = await connection.query('SELECT status_id FROM asset_status WHERE status_name = ?', [status || 'Available']);
        const [[loc]] = await connection.query('SELECT location_id FROM locations WHERE location_name = ?', [location]);

        let vendorId = null;
        if (vendor) {
            const getVendor = async () => (await connection.query('SELECT vendor_id FROM vendors WHERE vendor_name = ?', [vendor]))[0][0];
            let v = await getVendor();
            if (v) vendorId = v.vendor_id;
            else {
                 try {
                     const [vres] = await connection.query('INSERT INTO vendors (vendor_name) VALUES (?)', [vendor]);
                     vendorId = vres.insertId;
                 } catch (e) {
                     if (e.code === 'ER_DUP_ENTRY') { v = await getVendor(); vendorId = v?.vendor_id; }
                     else throw e;
                 }
            }
        }

        let warrantyTypeId = null;
        if (warrantyType) {
            const getWT = async () => (await connection.query('SELECT warranty_type_id FROM warranty_types WHERE warranty_type_name = ?', [warrantyType]))[0][0];
            let wt = await getWT();
            if (wt) warrantyTypeId = wt.warranty_type_id;
            else {
                try {
                    const [wtres] = await connection.query('INSERT INTO warranty_types (warranty_type_name) VALUES (?)', [warrantyType]);
                    warrantyTypeId = wtres.insertId;
                } catch (e) {
                    if (e.code === 'ER_DUP_ENTRY') { wt = await getWT(); warrantyTypeId = wt?.warranty_type_id; }
                    else throw e;
                }
            }
        }

        await connection.query(`
            INSERT INTO assets (asset_id, asset_type_id, model_id, vendor_id, serial_number, purchase_date, install_date, supply_order_no, warranty_type_id, warranty_end_date, remarks, status_id, location_id, custom_fields)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            id, aty?.asset_type_id, modelId, vendorId, serial, purchaseDate || null, installDate || null, supplyOrderNo || null, warrantyTypeId, warrantyUntil || null, remarks || null, ast?.status_id, loc?.location_id, customFields ? JSON.stringify(customFields) : null
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
        if (specs && (type === 'Laptop' || type === 'Desktop CPU' || type === 'AllINONE')) {
            let procId = null;
            if (specs.Processor) {
                const getProc = async () => (await connection.query('SELECT processor_id FROM processors WHERE processor_name = ?', [specs.Processor]))[0][0];
                let proc = await getProc();
                if (proc) procId = proc.processor_id;
                else {
                    try {
                        const [pres] = await connection.query('INSERT INTO processors (processor_name) VALUES (?)', [specs.Processor]);
                        procId = pres.insertId;
                    } catch (e) {
                        if (e.code === 'ER_DUP_ENTRY') { proc = await getProc(); procId = proc?.processor_id; }
                        else throw e;
                    }
                }
            }
            
            let osId = null;
            if (specs.OS) {
                const getOs = async () => (await connection.query('SELECT os_id FROM operating_systems WHERE os_name = ?', [specs.OS]))[0][0];
                let os = await getOs();
                if (os) osId = os.os_id;
                else {
                    try {
                        const [ores] = await connection.query('INSERT INTO operating_systems (os_name) VALUES (?)', [specs.OS]);
                        osId = ores.insertId;
                    } catch (e) {
                        if (e.code === 'ER_DUP_ENTRY') { os = await getOs(); osId = os?.os_id; }
                        else throw e;
                    }
                }
            }

            const table = type === 'Laptop' ? 'laptop_details' : 'cpu_details';
            if (table === 'cpu_details') {
                await connection.query(`
                    INSERT INTO ${table} (asset_id, processor_id, ram_size, storage_size, os_id, keyboard_id, keyboard_serial, keyboard_make, keyboard_model, mouse_id, mouse_serial, mouse_make, mouse_model, processor_speed, chipset, ram_speed, ram_slots, storage_make_model, cd_drive, speaker, os_key, office_suite, office_suite_key, adobe_acrobat, adobe_acrobat_key)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [id, procId, specs.RAM || null, specs.Storage || null, osId, specs.KeyboardID || null, specs.KeyboardSerial || null, specs.KeyboardMake || null, specs.KeyboardModel || null, specs.MouseID || null, specs.MouseSerial || null, specs.MouseMake || null, specs.MouseModel || null, specs.ProcessorSpeed || null, specs.Chipset || null, specs.RAMSpeed || null, specs.RAMSlots || null, specs.StorageMakeModel || null, specs.CDDrive || null, specs.Speaker || null, specs.OSKey || null, specs.OfficeSuite || null, specs.OfficeSuiteKey || null, specs.AdobeAcrobat || null, specs.AdobeAcrobatKey || null]);
            } else {
                await connection.query(`
                    INSERT INTO ${table} (asset_id, processor_id, ram_size, storage_size, os_id, processor_speed, chipset, ram_speed, ram_slots, storage_make_model, cd_drive, dvd_drive, speaker)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [id, procId, specs.RAM || null, specs.Storage || null, osId, specs.ProcessorSpeed || null, specs.Chipset || null, specs.RAMSpeed || null, specs.RAMSlots || null, specs.StorageMakeModel || null, specs.CDDrive || null, specs.DVDDrive || null, specs.Speaker || null]);
            }
        } else if (specs && (type === 'UPS' || type === 'Switch' || type === 'Monitor' || type === 'HDD')) {
            await connection.query(`
                INSERT INTO equipment_specs (asset_id, capacity, technology, data_field)
                VALUES (?, ?, ?, ?)
            `, [id, specs.Capacity || null, specs.Technology || null, specs.Data || null]);
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
    const { type, make, model, serial, purchaseDate, installDate, supplyOrderNo, warrantyType, warrantyUntil, remarks, status, location, specs, network, vendor, assignedTo, customFields } = req.body;
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

        let warrantyTypeId = null;
        if (warrantyType) {
            const [[wt]] = await connection.query('SELECT warranty_type_id FROM warranty_types WHERE warranty_type_name = ?', [warrantyType]);
            if (wt) warrantyTypeId = wt.warranty_type_id;
            else {
                 const [wtres] = await connection.query('INSERT INTO warranty_types (warranty_type_name) VALUES (?)', [warrantyType]);
                 warrantyTypeId = wtres.insertId;
            }
        }

        await connection.query(`
            UPDATE assets SET 
                asset_type_id = ?, model_id = ?, vendor_id = ?, serial_number = ?, 
                purchase_date = ?, install_date = ?, supply_order_no = ?, warranty_type_id = ?, warranty_end_date = ?, remarks = ?, status_id = ?, location_id = ?, custom_fields = ?
            WHERE asset_id = ?
        `, [aty?.asset_type_id, modelId, vendorId, serial, purchaseDate || null, installDate || null, supplyOrderNo || null, warrantyTypeId, warrantyUntil || null, remarks || null, ast?.status_id, loc?.location_id, customFields ? JSON.stringify(customFields) : null, id]);

        // Handle Assignment changes
        const [currentAssignments] = await connection.query(`
            SELECT assignment_id, user_id FROM user_asset_assignment 
            WHERE asset_id = ? AND returned_date IS NULL
        `, [id]);
        
        const currentUserId = currentAssignments.length > 0 ? currentAssignments[0].user_id : null;
        
        if (assignedTo && assignedTo !== currentUserId) {
            // Return from current user if assigned to someone else
            if (currentUserId) {
                await connection.query('UPDATE user_asset_assignment SET returned_date = NOW() WHERE assignment_id = ?', [currentAssignments[0].assignment_id]);
                await connection.query(`
                    INSERT INTO asset_assignment_history (asset_id, user_id, returned_date, assignment_status, remarks, returned_to_store)
                    VALUES (?, ?, NOW(), 'Returned', 'Reassigned during asset update', TRUE)
                `, [id, currentUserId]);
            }
            
            // Assign to new user
            await connection.query(`
                INSERT INTO user_asset_assignment (user_id, asset_id, assigned_date) 
                VALUES (?, ?, NOW())
            `, [assignedTo, id]);
            
            await connection.query(`
                INSERT INTO asset_assignment_history (asset_id, user_id, assigned_date, assignment_status, remarks, assigned_by)
                VALUES (?, ?, NOW(), 'Assigned', 'Assigned during asset update', 'Admin')
            `, [id, assignedTo]);
            
            // Force status to Assigned
            const [[assignedStatus]] = await connection.query("SELECT status_id FROM asset_status WHERE status_name = 'Assigned'");
            await connection.query('UPDATE assets SET status_id = ? WHERE asset_id = ?', [assignedStatus.status_id, id]);
            
        } else if (!assignedTo && currentUserId) {
            // Unassigned from current user
            await connection.query('UPDATE user_asset_assignment SET returned_date = NOW() WHERE assignment_id = ?', [currentAssignments[0].assignment_id]);
            await connection.query(`
                INSERT INTO asset_assignment_history (asset_id, user_id, returned_date, assignment_status, remarks, returned_to_store)
                VALUES (?, ?, NOW(), 'Returned', 'Unassigned during asset update', TRUE)
            `, [id, currentUserId]);
            
            // Force status to Available
            const [[availableStatus]] = await connection.query("SELECT status_id FROM asset_status WHERE status_name = 'Available'");
            await connection.query('UPDATE assets SET status_id = ? WHERE asset_id = ?', [availableStatus.status_id, id]);
        }

        // Specs Update (simplistic: delete and insert)
        await connection.query('DELETE FROM cpu_details WHERE asset_id = ?', [id]);
        await connection.query('DELETE FROM laptop_details WHERE asset_id = ?', [id]);
        await connection.query('DELETE FROM equipment_specs WHERE asset_id = ?', [id]);
        
        if (specs && (type === 'Laptop' || type === 'Desktop CPU' || type === 'AllINONE')) {
            let procId = null;
            if (specs.Processor) {
                const getProc = async () => (await connection.query('SELECT processor_id FROM processors WHERE processor_name = ?', [specs.Processor]))[0][0];
                let proc = await getProc();
                if (proc) procId = proc.processor_id;
                else {
                    try {
                        const [pres] = await connection.query('INSERT INTO processors (processor_name) VALUES (?)', [specs.Processor]);
                        procId = pres.insertId;
                    } catch (e) {
                        if (e.code === 'ER_DUP_ENTRY') { proc = await getProc(); procId = proc?.processor_id; }
                        else throw e;
                    }
                }
            }
            
            let osId = null;
            if (specs.OS) {
                const getOs = async () => (await connection.query('SELECT os_id FROM operating_systems WHERE os_name = ?', [specs.OS]))[0][0];
                let os = await getOs();
                if (os) osId = os.os_id;
                else {
                    try {
                        const [ores] = await connection.query('INSERT INTO operating_systems (os_name) VALUES (?)', [specs.OS]);
                        osId = ores.insertId;
                    } catch (e) {
                        if (e.code === 'ER_DUP_ENTRY') { os = await getOs(); osId = os?.os_id; }
                        else throw e;
                    }
                }
            }

            const table = type === 'Laptop' ? 'laptop_details' : 'cpu_details';
            if (table === 'cpu_details') {
                await connection.query(`
                    INSERT INTO ${table} (asset_id, processor_id, ram_size, storage_size, os_id, keyboard_id, keyboard_serial, keyboard_make, keyboard_model, mouse_id, mouse_serial, mouse_make, mouse_model, processor_speed, chipset, ram_speed, ram_slots, storage_make_model, cd_drive, speaker, os_key, office_suite, office_suite_key, adobe_acrobat, adobe_acrobat_key)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [id, procId, specs.RAM || null, specs.Storage || null, osId, specs.KeyboardID || null, specs.KeyboardSerial || null, specs.KeyboardMake || null, specs.KeyboardModel || null, specs.MouseID || null, specs.MouseSerial || null, specs.MouseMake || null, specs.MouseModel || null, specs.ProcessorSpeed || null, specs.Chipset || null, specs.RAMSpeed || null, specs.RAMSlots || null, specs.StorageMakeModel || null, specs.CDDrive || null, specs.Speaker || null, specs.OSKey || null, specs.OfficeSuite || null, specs.OfficeSuiteKey || null, specs.AdobeAcrobat || null, specs.AdobeAcrobatKey || null]);
            } else {
                await connection.query(`
                    INSERT INTO ${table} (asset_id, processor_id, ram_size, storage_size, os_id, processor_speed, chipset, ram_speed, ram_slots, storage_make_model, cd_drive, dvd_drive, speaker)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [id, procId, specs.RAM || null, specs.Storage || null, osId, specs.ProcessorSpeed || null, specs.Chipset || null, specs.RAMSpeed || null, specs.RAMSlots || null, specs.StorageMakeModel || null, specs.CDDrive || null, specs.DVDDrive || null, specs.Speaker || null]);
            }
        } else if (specs && (type === 'UPS' || type === 'Switch' || type === 'Monitor' || type === 'HDD')) {
            await connection.query(`DELETE FROM equipment_specs WHERE asset_id = ?`, [id]);
            await connection.query(`
                INSERT INTO equipment_specs (asset_id, capacity, technology, data_field)
                VALUES (?, ?, ?, ?)
            `, [id, specs.Capacity || null, specs.Technology || null, specs.Data || null]);
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
