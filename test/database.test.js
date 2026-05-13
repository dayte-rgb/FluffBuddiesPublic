const assert = require('assert');
const { connectTestDatabase } = require('../test-database');
const { connectToDatabase } = require('../database');
const { closeDatabase } = require('../database');
const Database = require('better-sqlite3');

describe('Database Connection Tests', function () {
    describe('connectToDatabase()', function() {
        //check to ensure that a Database object is returned
        it('should return an open database object', function (){
            const db = connectToDatabase();
            assert.ok(db instanceof Database);
            assert.ok(db.open == true);
        });

        //check to make sure that foreign_keys is on
        it('should have foreign keys on', function() {
            const db = connectToDatabase();
            const fkIsEnabled = db.pragma('foreign_keys', { simple: true });
            assert.ok(fkIsEnabled == true);
        });

        //check to make sure that website.db is the database accessed
        it('should access database at ./website.db', function() {
            const db = connectToDatabase();
            assert.strictEqual(db.name, './website.db');
        });
    });

    describe('closeDatabase()', function () {

        //check for standard behavior
        it('should close the database', function () {
            const db = connectToDatabase();
            closeDatabase(db);
            assert.throws(() => {
                db.prepare('SELECT * FROM User');
            }, TypeError);
        });

        //check for null handling
        it('should return when providing null', function() {
            assert.doesNotThrow(() => {
                closeDatabase(null);
            }, TypeError);
        });

        //check for String handling
        it('should return when providing a String', function() {
            assert.doesNotThrow(() => {
                closeDatabase('Test');
            }, TypeError);
        });

        //check for int handling 
        it('should return when providing an int', function() {
            assert.doesNotThrow(() => {
                closeDatabase(7);
            }, TypeError);
        });
    });
});