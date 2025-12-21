
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = path.join(process.cwd(), 'storage', 'database.sqlite');
const STORAGE_DIR = path.join(process.cwd(), 'storage', 'fonts');

// Ensure storage directories exist
if (!fs.existsSync(path.join(process.cwd(), 'storage'))) {
  fs.mkdirSync(path.join(process.cwd(), 'storage'));
}
if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR);
}

const db = new Database(DB_PATH);

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    original_filename TEXT NOT NULL,
    subset_text TEXT NOT NULL,
    original_size INTEGER,
    subset_size INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

export default db;
export { STORAGE_DIR };
