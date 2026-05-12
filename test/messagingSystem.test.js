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
    const agent = request.agent(app); // persist cookies between requests
    
    before(async () => {
        // create in-memory database
        db = connectTestDatabase();

        // send db to server.js
        app.initModels(db);

        // initialize logger
        logger = new Log('test_temp.log', true, false);

        // populate database with env data
        userModel = new UserModel(db);
        messageContentModel = new MessageContentModel(db);
        userMessageModel = new UserMessageModel(db);

        logger.write(userModel.create('alice', 'password123', '1234561234', 'alice@gmail.com', '63522', 'test', 'user', null));
        userModel.create('tim', 'password123', '9999999999', 'tim@gmail.com', '11111', 'test2', 'user', null);
        logger.write(JSON.stringify(userModel.getAll()));
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
        // await Promise.all([
        //     fs.promises.unlink("test_temp.log", (err) =>{}), //removes temp log file for this test, should resolve Promise to fulfilled
        //     fs.promises.unlink("test_requests.log", (err) =>{}) //removes temp log file for server for this test, should resolve Promise to fulfilled
        // ]);
        
        db.close();
    });

    // Tests the /inbox Route, Method: GET -------------------------------------------------------------------------------------------------------------------
    describe('GET /inbox', function() {
        it('should render the inbox page', function(done) {
            request(app)
                .get('/inbox')
                .expect(200)
                .expect('Content-Type', /html/)
                .end(function(err, res) {
                    if(err) return done(err);
                    assert.ok(res.text.includes('<title>Inbox</title>'));
                    assert.ok(res.text.includes('tim'));
                });
        });
    });
});