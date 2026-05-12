const { connectToDatabase } = require('../database');

class MeetupVerificationModel {
  constructor(db = undefined) {
    if(db == undefined){
      this.db = connectToDatabase();
    }else{
     
      this.db = db; //store the db connection
    }
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS MeetupVerification (
        job_id INTEGER PRIMARY KEY NOT NULL,
        code TEXT NOT NULL,
        expires_at TEXT NOT NULL,
        verified INTEGER NOT NULL DEFAULT 0 CHECK(verified IN (0,1))
      )
    `);
  }

  create(job_id, code, expires_at) {
    const stmt = this.db.prepare('INSERT OR REPLACE INTO MeetupVerification (job_id, code, expires_at, verified) VALUES (?, ?, ?, 0)');
    stmt.run(job_id, code, expires_at);
  }

  getByJobId(job_id) {
    const stmt = this.db.prepare('SELECT * FROM MeetupVerification WHERE job_id = ?');
    return stmt.get(job_id);
  }

  markVerified(job_id) {
    const stmt = this.db.prepare('UPDATE MeetupVerification SET verified = 1 WHERE job_id = ?');
    stmt.run(job_id);
  }

  deleteByJobId(job_id) {
    const stmt = this.db.prepare('DELETE FROM MeetupVerification WHERE job_id = ?');
    stmt.run(job_id);
  }
}

module.exports = MeetupVerificationModel;
