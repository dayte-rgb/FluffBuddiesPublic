const request = require('supertest');
const express = require('express');
const session = require('express-session');

// Mock the database and models
jest.mock('../database', () => ({
  connectToDatabase: jest.fn(() => ({
    prepare: jest.fn(() => ({
      all: jest.fn(() => []),
      get: jest.fn(() => ({ job_id: 1, employer_id: 2, description: 'Test job' })),
      run: jest.fn(() => ({ lastInsertRowid: 1 }))
    }))
  }))
}));

const jobContentModel = require('../models/jobContentModel');
const employerJobModel = require('../models/employerJobModel');
const employeeJobModel = require('../models/employeeJobModel');
const jobReviewModel = require('../models/jobReviewModel');
const reviewContentModel = require('../models/reviewContentModel');
const userModel = require('../models/userModel');

// jest.mock('../models/jobContentModel');
// jest.mock('../models/employerJobModel');
// jest.mock('../models/employeeJobModel');
// jest.mock('../models/jobReviewModel');
// jest.mock('../models/reviewContentModel');
// jest.mock('../models/userModel');

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
  getById: jest.fn(() => ({ job_id: 1, description: 'Test job', datetime: '2024-01-01', duration: 2, zipcode: '12345' }))
};

const mockEmployerJob = {
  getById: jest.fn(() => ({ job_id: 1, employer_id: 2 }))
};

const mockEmployeeJob = {
  getByIds: jest.fn(() => null),
  create: jest.fn(() => ({ job_id: 1, employee_id: 1 }))
};

const mockJobReview = {
  getByJobId: jest.fn(() => [])
};

const mockReviewContent = {
  getById: jest.fn(() => ({}))
};

const mockUser = {
  getById: jest.fn(() => ({ user_id: 2, username: 'employer', email: 'employer@test.com' }))
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
    jest.clearAllMocks();
  });

  describe('GET /booking/:job_id', () => {
    test('should render booking detail page for valid job', async () => {
      const response = await request(app)
        .get('/booking/1')
        .expect(200);

      const renderedData = JSON.parse(response.text);
      expect(renderedData.jobData).toEqual({ job_id: 1, description: 'Test job', datetime: '2024-01-01', duration: 2, zipcode: '12345' });
      expect(renderedData.reviews).toEqual([]);
      expect(renderedData.userData).toEqual({ user_id: 2, username: 'employer', email: 'employer@test.com' });
    });

    test('should handle jobs with reviews', async () => {
      mockJobReview.getByJobId.mockReturnValueOnce([{ review_id: 1 }, { review_id: 2 }]);
      mockReviewContent.getById.mockReturnValue({ review_id: 1, content: 'Great job!' });

      const response = await request(app)
        .get('/booking/1')
        .expect(200);

      const renderedData = JSON.parse(response.text);
      expect(renderedData.reviews).toHaveLength(2);
      expect(mockReviewContent.getById).toHaveBeenCalledTimes(2);
    });
  });

  describe('POST /booking/:job_id', () => {
    test('should successfully book a job', async () => {
      const response = await request(app)
        .post('/booking/1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Job booked successfully!');
      expect(mockEmployeeJob.create).toHaveBeenCalledWith("1", 1);
    });

    test('should fail if job does not exist', async () => {
      mockJobContent.getById.mockReturnValueOnce(null);

      const response = await request(app)
        .post('/booking/999')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Job not found.');
      expect(mockEmployeeJob.create).not.toHaveBeenCalled();
    });

    test('should prevent booking own job', async () => {
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

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('You cannot book your own job.');
    });

    test('should prevent double booking', async () => {
      mockEmployeeJob.getByIds.mockReturnValueOnce({ job_id: 1, employee_id: 1 });

      const response = await request(app)
        .post('/booking/1')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('You have already booked this job.');
      expect(mockEmployeeJob.create).not.toHaveBeenCalled();
    });

    test('should handle database errors', async () => {
      mockEmployeeJob.create.mockImplementationOnce(() => {
        throw new Error('Database error');
      });

      const response = await request(app)
        .post('/booking/1')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Failed to book job.');
    });
  });
});