const { connectToDatabase } = require('../database');

class organizationMemberModel {
  constructor(db = undefined) {
    if(db == undefined){
      this.db = connectToDatabase();
    }else{
      this.db = db; //store the db connection
    }
  }

  create(org_id, user_id){
    const query = "INSERT INTO OrganizationMember (org_id, user_id) VALUES (?, ?)";

    const stmt = this.db.prepare(query);

    const info = stmt.run(org_id, user_id);

    return {org_id, user_id};
  }

  getByIds(org_id, user_id){
    const query = "SELECT * FROM OrganizationMember WHERE org_id = ? AND user_id = ?";

    const stmt = this.db.prepare(query);

    const info = stmt.get(org_id, user_id);

    return info
  }

  getAll(){
    const query = 'SELECT * FROM OrganizationMember';

    const stmt = this.db.prepare(query);

    const info = stmt.all();

    return info;
  }

  delete(org_id, user_id){
    const query = "DELETE FROM OrganizationMember WHERE org_id = ? AND user_id = ?";

    const stmt = this.db.prepare(query);

    const old_info = this.getByIds(org_id, user_id);

    const info = stmt.run(org_id, user_id);

    return old_info;
  }
}

module.exports = organizationMemberModel;