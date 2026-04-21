const { connectToDatabase } = require('../database');

class petOwnerModel {
  constructor() {
    this.db = connectToDatabase();
  }

  create(owner_id, pet_id){
    const query = "INSERT INTO PetOwner (owner_id, pet_id) VALUES (?, ?)";

    const stmt = this.db.prepare(query);

    const info = stmt.run(owner_id, pet_id);

    return {owner_id, pet_id};
  }

  getByIds(owner_id, pet_id){
    const query = "SELECT * FROM PetOwner WHERE owner_id = ? AND pet_id = ?";

    const stmt = this.db.prepare(query);

    const info = stmt.run(owner_id, pet_id);

    return info;
  }

  getAll(){
    const query = 'SELECT * FROM PetOwner';

    const stmt = this.db.prepare(query);

    const info = stmt.all();

    return info;
  }

  delete(owner_id, pet_id){
    const query = "DELETE FROM PetOwner WHERE owner_id = ? AND pet_id = ?";

    const stmt = this.db.prepare(query);

    const old_info = this.getByIds(owner_id, pet_id);

    const info = stmt.run(owner_id, pet_id);

    return old_info;
  }
}

module.exports = petOwnerModel;