const { connectToDatabase } = require('../database');
const bcrypt = require('bcrypt');

class userModel {
  constructor() {
    this.db = connectToDatabase();
  }

  // Create a new user
  async create(username, password, phone_number, email, zipcode, profile_description, account_type, profile_picture_link) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = 'INSERT INTO User (user_id, username, password, phone_number, email, zipcode, profile_description, account_type, profile_picture_link) VALUES (NULL, ?, ?, ?, ?, ?, ?, ?, ?)';

    // The `prepare()` method compiles the SQL query, making it ready to execute.
    const stmt = this.db.prepare(query);

    // The `run()` method executes the prepared query, replacing the `?` placeholders with actual values.
    const info = stmt.run(username, hashedPassword, phone_number, email, zipcode, profile_description, account_type, profile_picture_link);

    // Returning the new user data, including the generated user ID and the creation timestamp.
    return { id: info.lastInsertRowid, username, password: hashedPassword, phone_number, email, zipcode, profile_description, account_type, profile_picture_link };
  }

  delete(user_id){
    // get the user's info before deletion to return to the user
    const deleted_user_info = this.getById(user_id);

    const query = 'DELETE FROM User WHERE user_id = ?';

    // compile the query
    const stmt = this.db.prepare(query);

    // execute the query with replacing the placeholder
    const info = stmt.run(user_id);

    // return the deleted user info
    return deleted_user_info;
  }

  getById(user_id) {
    const query = 'SELECT * FROM User WHERE user_id = ?';

    const stmt = this.db.prepare(query);

    const info = stmt.get(user_id);

    return info;
  }

  getByUsername(username){
    const query = 'SELECT * FROM User WHERE username = ?';

    const stmt = this.db.prepare(query);

    const info = stmt.get(username);

    return info;
  }

  getByPhoneNumber(phone_number){
    const query = 'SELECT * FROM User WHERE phone_number = ?';

    const stmt = this.db.prepare(query);

    const info = stmt.get(phone_number);

    return info;
  }

  getByEmail(email){
    const query = 'SELECT * FROM User WHERE email = ?';

    const stmt = this.db.prepare(query);

    const info = stmt.get(email);

    return info;
  }

  // Authenticate user by username or email and password
  async authenticate(identifier, password) {
    // First try to find by username
    let user = this.getByUsername(identifier);

    // If not found by username, try by email
    if (!user) {
      user = this.getByEmail(identifier);
    }

    // Check if user exists and password matches
    if (user && await bcrypt.compare(password, user.password)) {
      return user;
    }

    return null;
  }

  getAll(){
    const query = 'SELECT * FROM User';

    const stmt = this.db.prepare(query);

    const info = stmt.all();

    return info;
  }


  update(user_id, password, phone_number, email, zipcode, profile_description, account_type, profile_picture_link) {
    const query = 'UPDATE User SET password = ?, phone_number = ?, email = ?, zipcode = ?, profile_description = ?, account_type = ?, profile_picture_link = ? WHERE user_id = ?';

    const stmt = this.db.prepare(query);

    const info = stmt.run(password, phone_number, email, zipcode, profile_description, account_type, profile_picture_link, user_id);

    return this.getById(user_id);
  }

}

module.exports = userModel;