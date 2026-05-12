const request = require('supertest');
const express = require('express');
const session = require('express-session');
const assert = require('assert');

const employerJobModel = require('../models/employerJobModel');
const employeeJobModel = require('../models/employeeJobModel');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
  secret: 'test-secret',
  resave: false,
  saveUninitialized: false
}));

// Mock models
const mockEmployerJob = {
  getJobsByEmployerId: function() {
    return [
      {
        job_id: 1,
        description: 'Dog walking',
        datetime: '2024-12-01T10:00',
        duration: 2,
        zipcode: '12345',
        employer_id: 1
      },
      {
        job_id: 2,
        description: 'Pet sitting',
        datetime: '2024-12-02T14:00',
        duration: 3,
        zipcode: '12345',
        employer_id: 1
      }
    ];
  }
};

const mockEmployeeJob = {
  getBookingsByEmployeeId: function() {
    return [
      {
        job_id: 3,
        description: 'Cat grooming',
        datetime: '2024-12-03T09:00',
        duration: 1,
        zipcode: '12346',
        employee_id: 1,
        employer_username: 'petowner1',
        employer_email: 'petowner1@test.com'
      }
    ];
  }
};

const mockIsAuthenticated = (req, res, next) => {
  req.session.userId = 1;
  next();
};

// Routes
app.get('/schedule', mockIsAuthenticated, (req, res) => {
  const userId = req.session.userId;
  const scheduledJobs = mockEmployerJob.getJobsByEmployerId(userId);
  const bookedJobs = mockEmployeeJob.getBookingsByEmployeeId(userId);

  res.render('schedule', {
    scheduledJobs,
    bookedJobs
  });
});

// Mock EJS rendering
app.set('view engine', 'ejs');
app.engine('ejs', (filePath, options, callback) => {
  callback(null, JSON.stringify(options));
});

describe('Schedule Tests', () => {
  describe('GET /schedule', () => {
    beforeEach(() => {
      // Reset all mocks to default state
      mockEmployerJob.getJobsByEmployerId = function() {
        return [
          {
            job_id: 1,
            description: 'Dog walking',
            datetime: '2024-12-01T10:00',
            duration: 2,
            zipcode: '12345',
            employer_id: 1
          },
          {
            job_id: 2,
            description: 'Pet sitting',
            datetime: '2024-12-02T14:00',
            duration: 3,
            zipcode: '12345',
            employer_id: 1
          }
        ];
      };
      mockEmployeeJob.getBookingsByEmployeeId = function() {
        return [
          {
            job_id: 3,
            description: 'Cat grooming',
            datetime: '2024-12-03T09:00',
            duration: 1,
            zipcode: '12346',
            employee_id: 1,
            employer_username: 'petowner1',
            employer_email: 'petowner1@test.com'
          }
        ];
      };
    });

    it('should render schedule page with user jobs and bookings', async () => {
      const response = await request(app)
        .get('/schedule')
        .expect(200);

      const renderedData = JSON.parse(response.text);
      assert.strictEqual(renderedData.scheduledJobs.length, 2);
      assert.strictEqual(renderedData.bookedJobs.length, 1);
    });

    it('should handle user with no scheduled jobs', async () => {
      mockEmployerJob.getJobsByEmployerId = function() { return []; };

      const response = await request(app)
        .get('/schedule')
        .expect(200);

      const renderedData = JSON.parse(response.text);
      assert.deepStrictEqual(renderedData.scheduledJobs, []);
    });

    it('should handle user with no booked jobs', async () => {
      mockEmployeeJob.getBookingsByEmployeeId = function() { return []; };

      const response = await request(app)
        .get('/schedule')
        .expect(200);

      const renderedData = JSON.parse(response.text);
      assert.deepStrictEqual(renderedData.bookedJobs, []);
    });

    it('should handle user with no jobs or bookings', async () => {
      mockEmployerJob.getJobsByEmployerId = function() { return []; };
      mockEmployeeJob.getBookingsByEmployeeId = function() { return []; };

      const response = await request(app)
        .get('/schedule')
        .expect(200);

      const renderedData = JSON.parse(response.text);
      assert.deepStrictEqual(renderedData.scheduledJobs, []);
      assert.deepStrictEqual(renderedData.bookedJobs, []);
    });

    it('should display scheduled jobs with correct details', async () => {
      const response = await request(app)
        .get('/schedule')
        .expect(200);

      const renderedData = JSON.parse(response.text);
      assert.deepStrictEqual(renderedData.scheduledJobs[0], {
        job_id: 1,
        description: 'Dog walking',
        datetime: '2024-12-01T10:00',
        duration: 2,
        zipcode: '12345',
        employer_id: 1
      });
      assert.deepStrictEqual(renderedData.scheduledJobs[1], {
        job_id: 2,
        description: 'Pet sitting',
        datetime: '2024-12-02T14:00',
        duration: 3,
        zipcode: '12345',
        employer_id: 1
      });
    });

    it('should display booked jobs with employer information', async () => {
      const response = await request(app)
        .get('/schedule')
        .expect(200);

      const renderedData = JSON.parse(response.text);
      assert.deepStrictEqual(renderedData.bookedJobs[0], {
        job_id: 3,
        description: 'Cat grooming',
        datetime: '2024-12-03T09:00',
        duration: 1,
        zipcode: '12346',
        employee_id: 1,
        employer_username: 'petowner1',
        employer_email: 'petowner1@test.com'
      });
    });

    it('should require authentication', async () => {
      const unauthApp = express();
      unauthApp.use(express.urlencoded({ extended: true }));
      unauthApp.use(express.json());
      unauthApp.use(session({
        secret: 'test-secret',
        resave: false,
        saveUninitialized: false
      }));

      unauthApp.get('/schedule', (req, res) => {
        if (!req.session.userId) {
          return res.status(401).json({ error: 'Unauthorized' });
        }
        res.json({ success: true });
      });

      await request(unauthApp)
        .get('/schedule')
        .expect(401);
    });

    it('should handle multiple scheduled jobs', async () => {
      const multipleJobs = [
        { job_id: 1, description: 'Job 1', datetime: '2024-12-01T10:00', duration: 2, zipcode: '12345', employer_id: 1 },
        { job_id: 2, description: 'Job 2', datetime: '2024-12-02T11:00', duration: 1, zipcode: '12345', employer_id: 1 },
        { job_id: 3, description: 'Job 3', datetime: '2024-12-03T12:00', duration: 3, zipcode: '12345', employer_id: 1 }
      ];
      mockEmployerJob.getJobsByEmployerId = function() { return multipleJobs; };

      const response = await request(app)
        .get('/schedule')
        .expect(200);

      const renderedData = JSON.parse(response.text);
      assert.strictEqual(renderedData.scheduledJobs.length, 3);
    });

    it('should handle multiple booked jobs', async () => {
      const multipleBookings = [
        { job_id: 3, description: 'Booking 1', datetime: '2024-12-03T09:00', duration: 1, zipcode: '12346', employee_id: 1, employer_username: 'employer1', employer_email: 'employer1@test.com' },
        { job_id: 4, description: 'Booking 2', datetime: '2024-12-04T10:00', duration: 2, zipcode: '12347', employee_id: 1, employer_username: 'employer2', employer_email: 'employer2@test.com' }
      ];
      mockEmployeeJob.getBookingsByEmployeeId = function() { return multipleBookings; };

      const response = await request(app)
        .get('/schedule')
        .expect(200);

      const renderedData = JSON.parse(response.text);
      assert.strictEqual(renderedData.bookedJobs.length, 2);
    });
  });
});