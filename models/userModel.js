const { connectToDatabase } = require('../database');

class userModel {
  constructor() {
    this.db = connectToDatabase();
  }

  // Create a new user
  create(username, password, phone_number, email, zipcode, profile_description, account_type, profile_picture_link) {
    const query = 'INSERT INTO User (user_id, username, password, phone_number, email, zipcode, profile_description, account_type, profile_picture_link) VALUES (NULL, ?, ?, ?, ?, ?, ?, ?, ?)';
    
    // The `prepare()` method compiles the SQL query, making it ready to execute.
    const stmt = this.db.prepare(query);

    // The `run()` method executes the prepared query, replacing the `?` placeholders with actual values.
    const info = stmt.run(username, password, phone_number, email, zipcode, profile_description, account_type, profile_picture_link);

    // Returning the new user data, including the generated user ID and the creation timestamp.
    return { id: info.lastInsertRowid, username, password, phone_number, email, zipcode, profile_description, account_type, profile_picture_link };
  }

  delete(user_id){
    // get the user's info before deletion to return to the user
    const deleted_user_info = this.retrieve(user_id);

    const query = 'DELETE FROM User WHERE user_id = ?';

    // compile the query
    const stmt = this.db.prepare(query);

    // execute the query with replacing the placeholder
    const info = stmt.run(user_id);

    // return the deleted user info
    return deleted_user_info;
  }

  retrieve(user_id) {
    const query = 'SELECT * FROM User WHERE user_id = ?';

    const stmt = this.db.prepare(query);

    const info = stmt.get(user_id);

    return info;
  }
  
  update(user_id, new_username = null, new_password = null, new_phone_number = null, new_email = null, new_zipcode = null, new_profile_description = null, new_account_type = null, new_profile_picture_link = null) {
    const query = 'UPDATE User SET username = ?, password = ?, phone_number = ?, email = ?, zipcode = ?, profile_description = ?, account_type = ?, profile_picture_link = ? WHERE user_id = ?';

    const user_info = this.retrieve(user_id);
    
    if(new_username == null){
      new_username = user_info.username;
    }

    if(new_password == null){
      new_password = user_info.password;
    }

    if(new_phone_number == null){
      new_phone_number = user_info.phone_number;
    }

    if(new_email == null){
      new_email = user_info.email;
    }

    if(new_zipcode == null){
      new_zipcode = user_info.zipcode;
    }

    if(new_profile_description == null){
      new_profile_description = user_info.profile_description;
    }

    if(new_account_type == null){
      new_account_type = user_info.account_type;
    }

    if(new_profile_picture_link == null){
      new_profile_picture_link = user_info.profile_picture_link;
    }

    const stmt = this.db.prepare(query);

    const info = stmt.run(new_username, new_password, new_phone_number, new_email, new_zipcode, new_profile_description, new_account_type, new_profile_picture_link, user_id);

    return this.retrieve(user_id);
  }
  

  get_user_id(username){
    const query = 'SELECT user_id FROM User WHERE username = ?';

    const stmt = this.db.prepare(query);

    const info = stmt.get(username);

    // tries to access user_id, but if there is no username associated with a tuple,
    // returns null instead
    try{
      return info.user_id;
    } catch(error){
      return null;
    }
    
  }
}

module.exports = userModel;