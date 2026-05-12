const assert = require('assert');
const { connectTestDatabase } = require('../../test-database');
const ReviewModel = require('../../models/reviewModel');

describe('ReviewModel', function () {
    let db;
    let reviewModel;

    before(function () {
        db = connectTestDatabase();

        // Seed User
        db.prepare(`INSERT INTO User (user_id, username, password, phone_number, email, zipcode, account_type) VALUES (1, 'alice', 'pw', '1111111111', 'alice@example.com', 10001, 'user')`).run();
        db.prepare(`INSERT INTO User (user_id, username, password, phone_number, email, zipcode, account_type) VALUES (2, 'bob', 'pw', '2222222222', 'bob@example.com', 10002, 'user')`).run();

        // Seed JobContent
        db.prepare(`INSERT INTO JobContent (job_id, description, datetime, duration, zipcode, employee_num, job_filled, job_completed) VALUES (1, 'Dog walking', '2025-01-01 09:00', 60, 10001, 1, 0, 0)`).run();
        db.prepare(`INSERT INTO JobContent (job_id, description, datetime, duration, zipcode, employee_num, job_filled, job_completed) VALUES (2, 'Cat sitting', '2025-01-02 10:00', 120, 10002, 1, 0, 0)`).run();

        // Seed ReviewContent
        db.prepare(`INSERT INTO ReviewContent (review_id, punctuality, quality, friendliness, comments, datetime, verified) VALUES (1, 5, 5, 5, 'Great', '2025-01-01', 0)`).run();
        db.prepare(`INSERT INTO ReviewContent (review_id, punctuality, quality, friendliness, comments, datetime, verified) VALUES (2, 4, 4, 4, 'Good', '2025-01-02', 1)`).run();
        db.prepare(`INSERT INTO ReviewContent (review_id, punctuality, quality, friendliness, comments, datetime, verified) VALUES (3, 3, 3, 3, 'Okay', '2025-01-03', 0)`).run();

        // Seed JobReview
        db.prepare(`INSERT INTO JobReview (review_id, job_id) VALUES (1, 1)`).run();
        db.prepare(`INSERT INTO JobReview (review_id, job_id) VALUES (2, 1)`).run();
        db.prepare(`INSERT INTO JobReview (review_id, job_id) VALUES (3, 2)`).run();

        // Seed UserReview (required for the JOIN in reviewModel)
        db.prepare(`INSERT INTO UserReview (review_id, user_id) VALUES (1, 1)`).run();
        db.prepare(`INSERT INTO UserReview (review_id, user_id) VALUES (2, 2)`).run();
        db.prepare(`INSERT INTO UserReview (review_id, user_id) VALUES (3, 1)`).run();

        reviewModel = new ReviewModel(db);
    });

    after(function () {
        db.close();
    });

    // -----------------------------------------------------------------------
    describe('getReviewsByJobId()', function () {
        it('should return all reviews for a given job', function () {
            const results = reviewModel.getReviewsByJobId(1);

            assert.ok(Array.isArray(results));
            assert.strictEqual(results.length, 2);
        });

        it('should return one review for job 2', function () {
            const results = reviewModel.getReviewsByJobId(2);

            assert.ok(Array.isArray(results));
            assert.strictEqual(results.length, 1);
        });

        it('should return an empty array for a job with no reviews', function () {
            const results = reviewModel.getReviewsByJobId(99999);

            assert.ok(Array.isArray(results));
            assert.strictEqual(results.length, 0);
        });

        it('should include username, punctuality, quality, friendliness, comments, datetime, and verified', function () {
            const results = reviewModel.getReviewsByJobId(1);

            results.forEach(row => {
                assert.ok(Object.prototype.hasOwnProperty.call(row, 'username'));
                assert.ok(Object.prototype.hasOwnProperty.call(row, 'punctuality'));
                assert.ok(Object.prototype.hasOwnProperty.call(row, 'quality'));
                assert.ok(Object.prototype.hasOwnProperty.call(row, 'friendliness'));
                assert.ok(Object.prototype.hasOwnProperty.call(row, 'comments'));
                assert.ok(Object.prototype.hasOwnProperty.call(row, 'datetime'));
                assert.ok(Object.prototype.hasOwnProperty.call(row, 'verified'));
            });
        });

        it('should return the correct username for each review', function () {
            const results = reviewModel.getReviewsByJobId(1);
            const usernames = results.map(r => r.username);

            assert.ok(usernames.includes('alice'));
            assert.ok(usernames.includes('bob'));
        });
    });
});
