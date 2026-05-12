const { connectToDatabase } = require('../database');

class passwordResetModel {
  constructor(db = undefined) {
    if(db == undefined){
      this.db = connectToDatabase();
    }else{
      this.db = db; //store the db connection
    }

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS PasswordResetToken (
        email TEXT PRIMARY KEY,
        code TEXT NOT NULL,
        expires_at TEXT NOT NULL
      )
    `);
  }

  create(email, code, expiresAt) {
    const query = 'INSERT OR REPLACE INTO PasswordResetToken (email, code, expires_at) VALUES (?, ?, ?)';
    const stmt = this.db.prepare(query);
    stmt.run(email, code, expiresAt);
  }

  getByEmail(email) {
    const query = 'SELECT * FROM PasswordResetToken WHERE email = ?';
    const stmt = this.db.prepare(query);
    return stmt.get(email);
  }

  deleteByEmail(email) {
    const query = 'DELETE FROM PasswordResetToken WHERE email = ?';
    const stmt = this.db.prepare(query);
    stmt.run(email);
  }
}

module.exports = passwordResetModel;
