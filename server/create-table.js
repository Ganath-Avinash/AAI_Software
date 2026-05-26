import pool from './db.js';

async function createTable() {
  const query = `
    CREATE TABLE IF NOT EXISTS withdrawn_reports (
      report_id INT AUTO_INCREMENT PRIMARY KEY,
      sl_no INT,
      user_name VARCHAR(100),
      department VARCHAR(100),
      model VARCHAR(150),
      items INT,
      cwn VARCHAR(100),
      cpu_id VARCHAR(50),
      monitor_id VARCHAR(50),
      keyboard_id VARCHAR(50),
      mouse_id VARCHAR(50),
      ups_id VARCHAR(50),
      printer_id VARCHAR(50),
      scanner_id VARCHAR(50),
      lap_id VARCHAR(50),
      lap_adap VARCHAR(50),
      lap_bag VARCHAR(50),
      lap_mse VARCHAR(50),
      wo VARCHAR(50),
      headset VARCHAR(50),
      webcam VARCHAR(50),
      remarks TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  try {
    await pool.query(query);
    console.log('Table withdrawn_reports created successfully.');
  } catch (error) {
    console.error('Error creating table:', error);
  } finally {
    process.exit();
  }
}

createTable();
