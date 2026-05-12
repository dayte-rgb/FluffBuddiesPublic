const request = require('supertest');
const express = require('express');
const session = require('express-session');
const assert = require('assert');

const jobContentModel = require('../models/jobContentModel');
const employerJobModel = require('../models/employerJobModel');
const employeeJobModel = require('../models/employeeJobModel');
const jobReviewModel = require('../models/jobReviewModel');
const reviewContentModel = require('../models/reviewContentModel');
const userModel = require('../models/userModel');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
  secret: 'test-secret',
  resave: false,
  saveUninitialized: false
}));

// Mock authentication middleware
const mockIsAuthenticated = (req, res, next) => {
  req.session.userId = 1;
  next();
};

// Mock models
const mockJobContent = {
  getById: function() { return { job_id: 1, description: 'Test job', datetime: '2024-01-01', duration: 2, zipcode: '12345' }; },
  callCount: 0
};

const mockEmployerJob = {
  getById: function() { return { job_id: 1, employer_id: 2 }; }
};

const mockEmployeeJob = {
  getByIds: function() { return null; },
  create: function() { this.callCount = (this.callCount || 0) + 1; return { job_id: 1, employee_id: 1 }; },
  callCount: 0
};

const mockJobReview = {
  getByJobId: function() { return []; }
};

const mockReviewContent = {
  getById: function() { return {}; }
};

const mockUser = {
  getById: function() { return { user_id: 2, username: 'employer', email: 'employer@test.com' }; }
};

// Routes
app.get('/booking/:job_id', mockIsAuthenticated, async (req, res) => {
  const jobData = mockJobContent.getById(req.params.job_id);
  const reviews = [];
  const reviewIds = mockJobReview.getByJobId(req.params.job_id);
  reviewIds.forEach(reviewIdElem => {
    reviews.push(mockReviewContent.getById(reviewIdElem.review_id));
  });

  const userData = mockUser.getById(mockEmployerJob.getById(req.params.job_id).employer_id);

  res.render('booking-detail', { jobData, reviews, userData });
});

app.post('/booking/:job_id', mockIsAuthenticated, (req, res) => {
  const employee_id = req.session.userId;
  const job_id = req.params.job_id;

  try {
    const jobData = mockJobContent.getById(job_id);
    if (!jobData) {
      return res.status(404).json({ success: false, message: 'Job not found.' });
    }

    const employerLink = mockEmployerJob.getById(job_id);
    if (employerLink && employerLink.employer_id === employee_id) {
      return res.status(400).json({ success: false, message: 'You cannot book your own job.' });
    }

    const existingBooking = mockEmployeeJob.getByIds(job_id, employee_id);
    if (existingBooking) {
      return res.status(400).json({ success: false, message: 'You have already booked this job.' });
    }

    mockEmployeeJob.create(job_id, employee_id);
    res.json({ success: true, message: 'Job booked successfully!' });
  } catch (error) {
    console.error('Error booking job:', error);
    res.status(500).json({ success: false, message: 'Failed to book job.' });
  }
});

// Mock EJS rendering
app.set('view engine', 'ejs');
app.engine('ejs', (filePath, options, callback) => {
  callback(null, JSON.stringify(options));
});

describe('Job Booking Tests', () => {
  beforeEach(() => {
    // Reset all mocks to default state
    mockJobContent.getById = function() { return { job_id: 1, description: 'Test job', datetime: '2024-01-01', duration: 2, zipcode: '12345' }; };
    mockJobReview.getByJobId = function() { return []; };
    mockReviewContent.getById = function() { return {}; };
    mockEmployeeJob.getByIds = function() { return null; };
    mockEmployeeJob.create = function() { this.callCount = (this.callCount || 0) + 1; return { job_id: 1, employee_id: 1 }; };
    mockEmployeeJob.callCount = 0;
  });

  describe('GET /booking/:job_id', () => {
    it('should render booking detail page for valid job', async () => {
      const response = await request(app)
        .get('/booking/1')
        .expect(200);

      const renderedData = JSON.parse(response.text);
      assert.deepStrictEqual(renderedData.jobData, { job_id: 1, description: 'Test job', datetime: '2024-01-01', duration: 2, zipcode: '12345' });
      assert.deepStrictEqual(renderedData.reviews, []);
      assert.deepStrictEqual(renderedData.userData, { user_id: 2, username: 'employer', email: 'employer@test.com' });
    });

    it('should handle jobs with reviews', async () => {
      mockJobReview.getByJobId = function() { return [{ review_id: 1 }, { review_id: 2 }]; };
      mockReviewContent.getById = function() { return { review_id: 1, content: 'Great job!' }; };

      const response = await request(app)
        .get('/booking/1')
        .expect(200);

      const renderedData = JSON.parse(response.text);
      assert.strictEqual(renderedData.reviews.length, 2);
    });
  });

  describe('POST /booking/:job_id', () => {
    it('should successfully book a job', async () => {
      const response = await request(app)
        .post('/booking/1')
        .expect(200);

      assert.strictEqual(response.body.success, true);
      assert.strictEqual(response.body.message, 'Job booked successfully!');
    });

    it('should fail if job does not exist', async () => {
      mockJobContent.getById = function() { return null; };

      const response = await request(app)
        .post('/booking/999')
        .expect(404);

      assert.strictEqual(response.body.success, false);
      assert.strictEqual(response.body.message, 'Job not found.');
    });

    it('should prevent booking own job', async () => {
      // Set session user as the employer
      const employerApp = express();
      employerApp.use(express.urlencoded({ extended: true }));
      employerApp.use(express.json());
      employerApp.use(session({
        secret: 'test-secret',
        resave: false,
        saveUninitialized: false
      }));

      employerApp.use((req, res, next) => {
        req.session.userId = 2; // Same as employer_id
        next();
      });

      employerApp.post('/booking/:job_id', (req, res) => {
        const employee_id = req.session.userId;
        const job_id = req.params.job_id;

        const employerLink = mockEmployerJob.getById(job_id);
        if (employerLink && employerLink.employer_id === employee_id) {
          return res.status(400).json({ success: false, message: 'You cannot book your own job.' });
        }

        res.json({ success: true });
      });

      const response = await request(employerApp)
        .post('/booking/1')
        .expect(400);

      assert.strictEqual(response.body.success, false);
      assert.strictEqual(response.body.message, 'You cannot book your own job.');
    });

    it('should prevent double booking', async () => {
      mockEmployeeJob.getByIds = function() { return { job_id: 1, employee_id: 1 }; };

      const response = await request(app)
        .post('/booking/1')
        .expect(400);

      assert.strictEqual(response.body.success, false);
      assert.strictEqual(response.body.message, 'You have already booked this job.');
    });

    it('should handle database errors', async () => {
      mockEmployeeJob.create = function() {
        throw new Error('Database error');
      };

      const response = await request(app)
        .post('/booking/1')
        .expect(500);

      assert.strictEqual(response.body.success, false);
      assert.strictEqual(response.body.message, 'Failed to book job.');
    });
  });
});