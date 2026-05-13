const Database = require('better-sqlite3');

// Function to create and return a database connection
function connectToDatabase() {
  const db = new Database('./website.db');
  
  // Enable foreign keys
  db.exec('PRAGMA foreign_keys = ON');
  
  return db;
}

// Function to close the database connection
function closeDatabase(db) {
  if(db == undefined || !(db instanceof Database)){
    console.log("[ERROR] Attempted to close the database, but the database was undefined");
    return;
  }
  db.close();
}

module.exports = {
  connectToDatabase,
  closeDatabase
};
