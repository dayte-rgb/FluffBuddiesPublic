const assert = require('assert');
const { connectTestDatabase } = require('../test-database');
const Database = require('better-sqlite3');
const fs = require('fs');
const { create } = require('domain');

describe('Test Database Connection Tests', function () {
    describe('connectTestDatabase()', function() {
        //check to ensure that a Database object is returned
        it('should return an open in-memory database object', function (){
            const db = connectTestDatabase();
            assert.ok(db.memory == true);
            assert.ok(db.open == true);
        });

        //check to make sure that foreign_keys is on
        it('should have foreign keys on', function() {
            const db = connectTestDatabase();
            const fkIsEnabled = db.pragma('foreign_keys', { simple: true });
            assert.ok(fkIsEnabled == true);
        });

        //check to make sure that website.db is the database accessed
        it('should create tables in create_tables.sql', function() {
            const db = connectTestDatabase();
            //fetches the SQL used to create the table
            const create_tables_string = fs.readFileSync('sql/create_tables.sql', 'utf8');

            //ensures that the names of the tables are all present in the in-memory database
            const tables = db.prepare(`SELECT name FROM sqlite_master WHERE type = 'table'`).all();
            tables.forEach((row) => {
                assert.ok(create_tables_string.includes(row.name));
            });
        });

        
    });
});