const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

function connectTestDatabase() {
  // Create an in-memory database
  const db = new Database(':memory:');
  db.exec('PRAGMA foreign_keys = ON;');

  // Option B: Load your external .sql file for table creation
  const sqlFilePath = path.join(__dirname, '..', 'sql','create_tables.sql');
  const sql = fs.readFileSync(sqlFilePath, 'utf8');
  db.exec(sql);

  console.log('In-memory test database initialized.');
  return db;
}

module.exports = { connectTestDatabase };