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

const mockIsAuthenticated = (req, res, next) => {
    req.session.userId = 1;
    next();
};

const mockEmployeeJob = {
    getBookingsByEmployeeId: function () { return []; },
    getAll: function () { return []; }
};

const mockEmployerJob = {
    getJobsByEmployerId: function () { return []; },
    getById: function () { return null; }
};

const mockJobContent = {
    getById: function () { return null; }
};

const mockJobReview = {
    getAllByJobId: function () { return []; }
};

const mockReviewContent = {
    getById: function () { return null; }
};

const mockUser = {
    getByUsername: function () { return null; },
    getByEmail: function () { return null; },
    create: async function () { return { id: 1, username: 'princessG', email: 'PrincessG@test.com', account_type: 'user' }; }
};

app.get('/notifications', mockIsAuthenticated, (req, res) => {
    const userId = req.session.userId;
    const bookingNotifications = [];
    const reviewNotifications = [];

    const myBookings = mockEmployeeJob.getBookingsByEmployeeId(userId);
    myBookings.forEach(booking => {
        const jobData = mockJobContent.getById(booking.job_id);
        if (!jobData) return;

        const reviewIds = mockJobReview.getAllByJobId(booking.job_id);
        if (reviewIds) {
            reviewIds.forEach(r => {
                const review = mockReviewContent.getById(r.review_id);
                if (review) {
                    const employerLink = mockEmployerJob.getById(booking.job_id);
                    const employer = employerLink ? mockUser.getById(employerLink.employer_id) : null;
                    const employerName = employer ? employer.username : 'Someone';
                    reviewNotifications.push({
                        type: 'review',
                        message: employerName + ' left a review on your job: ' + jobData.description,
                        punctuality: review.punctuality,
                        quality: review.quality,
                        friendliness: review.friendliness,
                        comments: review.comments,
                        datetime: review.datetime
                    });
                }
            });
        }
    });

    const myJobs = mockEmployerJob.getJobsByEmployerId(userId);
    myJobs.forEach(job => {
        const jobData = mockJobContent.getById(job.job_id);
        if (!jobData) return;

        const allBookings = mockEmployeeJob.getAll().filter(b => b.job_id === job.job_id);
        allBookings.forEach(b => {
            const booker = mockUser.getById(b.employee_id);
            if (booker) {
                bookingNotifications.push({
                    type: 'booking',
                    message: booker.username + ' booked your job: ' + jobData.description,
                    datetime: jobData.datetime
                });
            }
        });
    });

    const notifications = bookingNotifications.concat(reviewNotifications);
    res.render('notifications', { notifications });
});

app.set('view engine', 'ejs');
app.engine('ejs', (filePath, options, callback) => {
    callback(null, JSON.stringify(options || {}));
});

describe('Notification System Tests', () => {
    beforeEach(() => {
        mockEmployeeJob.getBookingsByEmployeeId = function () { return []; };
        mockEmployeeJob.getAll = function () { return []; };
        mockEmployerJob.getJobsByEmployerId = function () { return []; };
        mockEmployerJob.getById = function () { return null; };
        mockJobContent.getById = function () { return null; };
        mockJobReview.getAllByJobId = function () { return []; };
        mockReviewContent.getById = function () { return null; };
        mockUser.getById = function () { return null; };
    });

    describe('GET /notifications', () => {
        it('should return empty notif when user has no jobs/bookings', async () => {
            const response = await request(app)
                .get('/notifications')
                .expect(200);

            const renderedData = JSON.parse(response.text);
            assert.deepStrictEqual(renderedData.notifications, []);
        });

        it('should show booking notification when sb books your job', async () => {
            mockEmployerJob.getJobsByEmployerId = function () {
                return [{ job_id: 1 }];
            };
            mockJobContent.getById = function () {
                return { job_id: 1, description: 'Dog walking', datetime: '2024-01-01' };
            };
            mockEmployeeJob.getAll = function () {
                return [{ job_id: 1, employee_id: 2 }];
            };
            mockUser.getById = function () {
                return { user_id: 2, username: 'booker' };
            };

            const response = await request(app)
                .get('/notifications')
                .expect(200);

            const renderedData = JSON.parse(response.text);
            assert.strictEqual(renderedData.notifications.length, 1);
            assert.strictEqual(renderedData.notifications[0].type, 'booking');
            assert.ok(renderedData.notifications[0].message.includes('booker'));
        });

        it('should show review notif when employer reviews your job', async () => {
            mockEmployeeJob.getBookingsByEmployeeId = function () {
                return [{ job_id: 1, employee_id: 1 }];
            };
            mockJobContent.getById = function () {
                return { job_id: 1, description: 'Shopping', datetime: '2024-01-01' };
            };
            mockJobReview.getAllByJobId = function () {
                return [{ review_id: 1 }];
            };
            mockReviewContent.getById = function () {
                return { review_id: 1, punctuality: 5, quality: 5, friendliness: 5, comments: 'super fun!', datetime: '2024-01-02' };
            };
            mockEmployerJob.getById = function () {
                return { job_id: 1, employer_id: 2 };
            };
            mockUser.getById = function () {
                return { user_id: 2, username: 'employer' };
            };

            const response = await request(app)
                .get('/notifications')
                .expect(200);

            const renderedData = JSON.parse(response.text);
            assert.strictEqual(renderedData.notifications.length, 1);
            assert.strictEqual(renderedData.notifications[0].type, 'review');
            assert.ok(renderedData.notifications[0].message.includes('employer'));
        });
    });
});