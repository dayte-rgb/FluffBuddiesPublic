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
    create: async function () { return { id: 1, username: 'PrincessG', email: 'PinkissoPretty@test.com', account_type: 'user' }; }
};

const mockIsNotAuthenticated = (req, res, next) => next();

app.post('/signup', mockIsNotAuthenticated, async (req, res) => {
    const { username, email, password, phone_number, zipcode, account_type } = req.body;

    if (!username || !email || !password || !phone_number || !zipcode || !account_type) {
        return res.render('signup', { error: 'All fields are required.' });
    }

    const validAccountTypes = ['pet', 'owner', 'organization', 'user'];
    if (!validAccountTypes.includes(account_type)) {
        return res.render('signup', { error: 'Invalid account type selected.' });
    }

    const existingUser = mockUser.getByUsername(username);
    if (existingUser) {
        return res.render('signup', { error: 'Username already exists. Please choose a different one.' });
    }

    const existingEmail = mockUser.getByEmail(email);
    if (existingEmail) {
        return res.render('signup', { error: 'Email already exists. Please use a different one.' });
    }

    const newUser = await mockUser.create(username, password, phone_number, email, zipcode, '', account_type, null);
    req.session.userId = newUser.id;
    req.session.username = newUser.username;
    req.session.email = newUser.email;
    req.session.accountType = newUser.account_type;

    res.json({ success: true, message: 'Account created successfully' });
});

app.set('view engine', 'ejs');
app.engine('ejs', (filePath, options, callback) => {
    callback(null, JSON.stringify(options || {}));
});

describe('Signup System Tests', () => {
    beforeEach(() => {
        mockUser.getByUsername = function () { return null; };
        mockUser.getByEmail = function () { return null; };
        mockUser.create = async function () { return { id: 1, username: 'PrincessG', email: 'PinkissoPretty@test.com', account_type: 'user' }; };
    });

    describe('POST /signup', () => {
        it('should create account with valid data', async () => {
            const response = await request(app)
                .post('/signup')
                .send({
                    username: 'newuser',
                    email: 'new@test.com',
                    password: 'password123',
                    phone_number: '1234567890',
                    zipcode: '12345',
                    account_type: 'user'
                })
                .expect(200);

            assert.strictEqual(response.body.success, true);
        });

        it('should fail with missing fields', async () => {
            const response = await request(app)
                .post('/signup')
                .send({ username: 'newuser', email: 'new@test.com' })
                .expect(200);

            const renderedData = JSON.parse(response.text);
            assert.strictEqual(renderedData.error, 'All fields are required.');
        });

        it('should fail with invalid account type', async () => {
            const response = await request(app)
                .post('/signup')
                .send({
                    username: 'newuser',
                    email: 'new@test.com',
                    password: 'password123',
                    phone_number: '1234567890',
                    zipcode: '12345',
                    account_type: 'invalidtype'
                })
                .expect(200);

            const renderedData = JSON.parse(response.text);
            assert.strictEqual(renderedData.error, 'Invalid account type selected.');
        });

        it('should fail with duplicate username', async () => {
            mockUser.getByUsername = function () { return { user_id: 1, username: 'existinguser' }; };

            const response = await request(app)
                .post('/signup')
                .send({
                    username: 'existinguser',
                    email: 'new@test.com',
                    password: 'password123',
                    phone_number: '1234567890',
                    zipcode: '12345',
                    account_type: 'user'
                })
                .expect(200);

            const renderedData = JSON.parse(response.text);
            assert.strictEqual(renderedData.error, 'Username already exists. Please choose a different one.');
        });

        it('should fail with duplicate email', async () => {
            mockUser.getByEmail = function () { return { user_id: 1, email: 'existing@test.com' }; };

            const response = await request(app)
                .post('/signup')
                .send({
                    username: 'newuser',
                    email: 'existing@test.com',
                    password: 'password123',
                    phone_number: '1234567890',
                    zipcode: '12345',
                    account_type: 'user'
                })
                .expect(200);

            const renderedData = JSON.parse(response.text);
            assert.strictEqual(renderedData.error, 'Email already exists. Please use a different one.');
        });
    });
});