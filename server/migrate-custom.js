import pool from './db.js';

async function migrateDatabase() {
  const connection = await pool.getConnection();
  try {
    console.log('Adding custom_schema to asset_types...');
    try {
      await connection.query('ALTER TABLE asset_types ADD COLUMN custom_schema JSON DEFAULT NULL');
      console.log('Successfully added custom_schema.');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') console.log('Column custom_schema already exists.');
      else throw e;
    }

    console.log('Adding custom_fields to assets...');
    try {
      await connection.query('ALTER TABLE assets ADD COLUMN custom_fields JSON DEFAULT NULL');
      console.log('Successfully added custom_fields.');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') console.log('Column custom_fields already exists.');
      else throw e;
    }

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    connection.release();
    process.exit();
  }
}

migrateDatabase();
