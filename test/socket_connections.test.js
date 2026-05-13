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

    describe('registerUser()', function () {
        it('should add the socket to use map', function () {
            registerUser(2, mockSocket);
            assert.ok(getSocket(2) instanceof WebSocket);
        });
    });
});