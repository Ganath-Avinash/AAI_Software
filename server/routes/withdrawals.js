import express from 'express';
import pool from '../db.js';

const router = express.Router();

// GET all withdrawn reports
router.get('/reports', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM withdrawn_reports ORDER BY report_id ASC');
        // Map database columns to camelCase frontend schema
        const mapped = rows.map(r => ({
            id: r.report_id.toString(),
            slNo: r.sl_no,
            user: r.user_name,
            dept: r.department,
            model: r.model,
            items: r.items,
            cwn: r.cwn,
            cpuId: r.cpu_id,
            monitorId: r.monitor_id,
            keyboardId: r.keyboard_id,
            mouseId: r.mouse_id,
            upsId: r.ups_id,
            printerId: r.printer_id,
            scannerId: r.scanner_id,
            lapId: r.lap_id,
            lapAdap: r.lap_adap,
            lapBag: r.lap_bag,
            lapMse: r.lap_mse,
            wo: r.wo,
            headset: r.headset,
            webcam: r.webcam,
            remarks: r.remarks
        }));
        res.json(mapped);
    } catch (error) {
        console.error('Error fetching withdrawn reports:', error);
        res.status(500).json({ error: 'Failed to fetch reports' });
    }
});

// POST a new withdrawn report
router.post('/reports', async (req, res) => {
    try {
        const data = req.body;
        // Generate sl_no logic: MAX + 1
        const [maxRes] = await pool.query('SELECT MAX(sl_no) as maxSlNo FROM withdrawn_reports');
        const slNo = (maxRes[0].maxSlNo || 0) + 1;

        const query = `
            INSERT INTO withdrawn_reports (
                sl_no, user_name, department, model, items, cwn,
                cpu_id, monitor_id, keyboard_id, mouse_id, ups_id, printer_id,
                scanner_id, lap_id, lap_adap, lap_bag, lap_mse, wo, headset, webcam, remarks
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [
            slNo,
            data.user || '',
            data.dept || '',
            data.model || '',
            data.items || 1,
            data.cwn || '',
            data.cpuId || '',
            data.monitorId || '',
            data.keyboardId || '',
            data.mouseId || '',
            data.upsId || '',
            data.printerId || '',
            data.scannerId || '',
            data.lapId || '',
            data.lapAdap || '',
            data.lapBag || '',
            data.lapMse || '',
            data.wo || '',
            data.headset || '',
            data.webcam || '',
            data.remarks || ''
        ];

        const [result] = await pool.query(query, values);
        res.status(201).json({ id: result.insertId.toString(), slNo, ...data });
    } catch (error) {
        console.error('Error creating withdrawn report:', error);
        res.status(500).json({ error: 'Failed to create report' });
    }
});

export default router;
