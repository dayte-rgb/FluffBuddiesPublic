const { connectToDatabase } = require('../database');

class userSpeciesModel {
  constructor() {
    this.db = connectToDatabase();
  }

  create(user_id, species){
    const query = "INSERT INTO UserSpecies (user_id, species) VALUES (?, ?)";

    const stmt = this.db.prepare(query);

    const info = stmt.run(user_id, species);

    return {user_id, species};
  }

  retrieve(user_id){
    const query = "SELECT * FROM UserSpecies WHERE user_id = ?";

    const stmt = this.db.prepare(query);

    const info = stmt.get(user_id);

    return info;
  }

  update(user_id, new_species){
    const query = "UPDATE UserSpecies SET species = ? WHERE user_id = ?";

    const old_info = this.retrieve(user_id);

    if(new_species == null){
        new_species = old_info.species;
    }

    const stmt = this.db.prepare(query);

    const info = stmt.run(new_species, user_id);

    return this.retrieve(user_id);
  }

  delete(user_id){
    const query = "DELETE FROM UserSpecies WHERE user_id = ?";

    const old_info = this.retrieve(user_id);

    const stmt = this.db.prepare(query);

    const info = stmt.run(user_id);

    return old_info;
  }
}

module.exports = userSpeciesModel;