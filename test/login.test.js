const request = require('supertest');
const express = require('express');
const session = require('express-session');
const assert = require('assert');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
    secret: 'test-secret',
    resave: false,
    saveUninitialized: false
}));

const mockUser = {
    getByUsername: function () { return null; },
    getByEmail: function () { return null; },
    create: async function () { return { id: 1, username: 'princessG', email: 'PrincessG@test.com', account_type: 'user' }; }
};

const mockIsNotAuthenticated = (req, res, next) => next();

app.post('/login', mockIsNotAuthenticated, async (req, res) => {
    const { username, password } = req.body;
    const authenticatedUser = await mockUser.authenticate(username, password);

    if (authenticatedUser) {
        req.session.userId = authenticatedUser.user_id;
        req.session.username = authenticatedUser.username;
        req.session.email = authenticatedUser.email;
        req.session.accountType = authenticatedUser.account_type;
        res.json({ success: true, message: 'Logged in successfully' });
    } else {
        res.status(401).json({ success: false, message: 'Invalid username/email or password' });
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.json({ success: true, message: 'Logged out successfully' });
    });
});

app.set('view engine', 'ejs');
app.engine('ejs', (filePath, options, callback) => {
    callback(null, JSON.stringify(options || {}));
});

describe('Login System Tests', () => {
    beforeEach(() => {
        mockUser.authenticate = async function () { return null; };
    });

    describe('POST /login', () => {
        it('should pass with valid credentials', async () => {
            mockUser.authenticate = async function () {
                return { user_id: 1, username: 'testuser', email: 'test@test.com', account_type: 'user' };
            };

            const response = await request(app)
                .post('/login')
                .send({ username: 'testuser', password: 'password123' })
                .expect(200);

            assert.strictEqual(response.body.success, true);
        });

        it('should fail with wrong password', async () => {
            const response = await request(app)
                .post('/login')
                .send({ username: 'testuser', password: 'wrongpass' })
                .expect(401);

            assert.strictEqual(response.body.success, false);
            assert.strictEqual(response.body.message, 'Invalid username/email or password');
        });

        it('should fail with wrong username', async () => {
            const response = await request(app)
                .post('/login')
                .send({ username: 'wronguser', password: 'password123' })
                .expect(401);

            assert.strictEqual(response.body.success, false);
        });

        it('should fail with missing username', async () => {
            const response = await request(app)
                .post('/login')
                .send({ password: 'password123' })
                .expect(401);

            assert.strictEqual(response.body.success, false);
        });

        it('should fail with missing password', async () => {
            const response = await request(app)
                .post('/login')
                .send({ username: 'testuser' })
                .expect(401);

            assert.strictEqual(response.body.success, false);
        });
    });

    describe('GET /logout', () => {
        it('should log out successfully', async () => {
            const response = await request(app)
                .get('/logout')
                .expect(200);

            assert.strictEqual(response.body.success, true);
        });
    });
});