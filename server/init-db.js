import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runScript(filePath) {
    console.log(`Running script: ${filePath}`);
    const sql = fs.readFileSync(filePath, 'utf8');
    
    // Strip out comments
    const sqlNoComments = sql.replace(/--.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
    
    // Split by semicolons
    const statements = sqlNoComments
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0);
        
    for (let i = 0; i < statements.length; i++) {
        try {
            await pool.query(statements[i]);
        } catch (err) {
            console.error(`Error executing statement: ${statements[i]}`);
            console.error(err);
            process.exit(1);
        }
    }
}

async function initDB() {
    try {
        console.log("Starting DB Initialization...");
        await runScript(path.join(__dirname, 'schema.sql'));
        console.log("Schema created successfully.");
        
        console.log("Seeding master tables...");
        await runScript(path.join(__dirname, 'seed.sql'));
        console.log("Seeding completed successfully.");
        
    } catch (err) {
        console.error("Initialization failed:", err);
    } finally {
        pool.end();
        console.log("DB connection closed.");
    }
}

initDB();
