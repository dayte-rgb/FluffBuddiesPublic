const assert = require('assert');
const {registerUser, removeUser, getSocket} = require('../socket_connections');

const WebSocket = require('ws');

// Create a server on a random available port
const wss = new WebSocket.Server({ port: 0 });


describe('Socket Connection Maps Tests', function () {
    const mock_socket = Object.create(WebSocket.prototype);
    describe('registerUser()', function () {
        it('should add the socket to use map', function () {
            registerUser(2, mock_socket);
            assert.ok(getSocket(2) instanceof WebSocket.prototype);
        });
    });
});