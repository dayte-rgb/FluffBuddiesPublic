const assert = require('assert');
const {registerUser, removeUser, getSocket} = require('../socket_connections');

const WebSocket = require('ws');

// Create a server on a random available port
describe('Socket Connection Maps Tests', function () {
    // create a mini test server so we can have an actual socket
    let wss;
    let mockSocket;

    before((done) => {
        wss = new WebSocket.Server({ port: 0 });
        const { port } = wss.address();
        mockSocket = new WebSocket(`ws://localhost:${port}`);
        mockSocket.on('open', done);
    });

    after((done) => {
        mockSocket.close();
        wss.close(done);
    });

    afterEach(() => {
        removeUser(2);
    });

    describe('registerUser()', function () {
        it('should add the socket to use map', function () {
            registerUser(2, mockSocket);
            assert.ok(getSocket(2) instanceof WebSocket);
        });


        it('should return with no error upon string for socket', function () {
            assert.doesNotThrow(() => {
                registerUser(2, "mockSocket");
            });
        });

        it('should return with no error upon null for socket', function () {
            assert.doesNotThrow(() => {
                registerUser(2, null);
            });
        });

        it('should return with no error upon invalid types for both', function () {
            assert.doesNotThrow(() => {
                registerUser("2", null);
            });
        });
    });

    describe('removeUser', function () {
        it('should remove the mockSocket', function () {
            registerUser(2, mockSocket);
            removeUser(2);
            assert.strictEqual(getSocket(2), null);
        });

        it('should return null when a user with no socket is removed', function () {
            assert.strictEqual(removeUser(6), null);
        });

        it('should return null when null is inserted for userId', function () {
            assert.strictEqual(removeUser(null), null);
        });
    });

    describe('getSocket', function () {
        it('should remove the mockSocket', function () {
            registerUser(2, mockSocket);
            assert.strictEqual(getSocket(2), mockSocket);
            removeUser(2);
        });

        it('should return null when a user with no socket is requested', function () {
            assert.strictEqual(getSocket(6),  null);
        });

        it('should return null when null is inserted for userId', function () {
            assert.strictEqual(getSocket(null), null);
        });
    });
});