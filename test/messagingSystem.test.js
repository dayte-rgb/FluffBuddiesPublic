const app = require('../server'); // This is the exported app from server.js
const assert = require('assert');
const { connectTestDatabase } = require('../test-database');
const Log= require('../tools/log');
const path = require('path');
const request = require('supertest');
const fs = require('fs');
const UserModel = require('../models/userModel.js');
const MessageContentModel = require('../models/messageContentModel.js');
const UserMessageModel = require('../models/userMessageModel.js');

describe('Messaging System Express Route Tests', function() {
    let db;
    let logger;
    let userModel;
    let messageContentModel;
    let userMessageModel;
    const log_path = path.join(__dirname, '../test_temp.log');
    const agent = request.agent(app); // persist cookies between requests
    
    before(async () => {
        // create in-memory database
        db = connectTestDatabase();

        // send db to server.js
        app.initModels(db, "test_temp.log", false);

        // initialize logger
        logger = new Log('test_temp.log', true, false);

        // populate database with env data
        userModel = new UserModel(db);
        messageContentModel = new MessageContentModel(db);
        userMessageModel = new UserMessageModel(db);

        await userModel.create('alice', 'password123', '1234561234', 'alice@gmail.com', 63522, 'test', 'user', 'fwfwf');
        await userModel.create('tim', 'password123', '9999999999', 'tim@gmail.com', 11111, 'test2', 'user', 'wfwfw');

        messageContentModel.create('test message');
        userMessageModel.create(1, 1, 2);

        // log in once to create the cookie 
        await agent
            .post('/login')
            .send({username: 'alice', password: 'password123'})
            .expect(200);
    });

    after(async () => {
        //Promise.all returns a single Promise from the list of promises for fs.promise.unlink, which should resolve to fulfilled
        // fs.promises.unlink is an async function, so we use await to ensure that all functions are done before closing the database
        await Promise.all([
            fs.promises.unlink("test_temp.log", (err) =>{}), //removes temp log file for this test, should resolve Promise to fulfilled
        ]);
        
        db.close();

        // Stop the setInterval
        clearInterval(badgeInterval); // need to export the interval reference
    });

    // Tests the /inbox Route, Method: GET -------------------------------------------------------------------------------------------------------------------
    describe('GET /inbox', function() {
        it('should render the inbox page and log the connection', function(done) {
            agent //using agent instead of request(app) uses our cookie
                .get('/inbox')
                .expect(200)
                .expect('Content-Type', /html/)
                .end(function(err, res) {
                    if(err) return done(err);
                    assert.ok(res.text.includes('<title>Inbox</title>'));

                    // test that the logger works correctly
                    const content = fs.readFileSync(log_path, 'utf8');
                    assert.ok(content.includes("[INFO] Route: /inbox Method: GET"));
                    return done();
                });
        });
    });

    //tests the isAuthenticated functionality
    describe('GET /inbox', function() {
        it('should redirect the user to the login page', function(done) {
            request(app)
                .get('/inbox')
                .redirects(1)
                .expect(200)
                .expect('Content-Type', /html/)
                .end(function(err, res) {
                    if(err) return done(err);
                    assert.ok(res.text.includes('<title>Login - Paw Patrol</title>'));

                    // test that logger works and confirmation of redirection to /login
                    const content = fs.readFileSync(log_path, 'utf8');
                    assert.ok(content.includes("[INFO] Route: /login Method: GET"));
                    return done();
                });
        });
    });
});