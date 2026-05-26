import pool from './db.js';

async function updateDb() {
  try {
    console.log('Creating app_users table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS app_users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'regular',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Inserting default users...');
    await pool.query(`
      INSERT IGNORE INTO app_users (username, password_hash, role) VALUES 
      ('admin', '$2b$10$n9exzPQP0mgCD0V.AbgCaeM8VDTX6NSkq3GOpdszgpCyv2Ce..8Mq', 'admin'),
      ('regular', '$2b$10$2yO5TbpDvUhghGQB7qz7QepQtCuTSZoV/S4i5hLANgN5VZWxOH52q', 'regular')
    `);

    console.log('Database updated successfully.');
  } catch (error) {
    console.error('Error updating database:', error);
  } finally {
    process.exit();
  }
}

updateDb();
