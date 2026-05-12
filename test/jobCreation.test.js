const request = require('supertest');
const express = require('express');
const session = require('express-session');
const assert = require('assert');

const jobContentModel = require('../models/jobContentModel');
const employerJobModel = require('../models/employerJobModel');
const jobCategoryModel = require('../models/jobCategoryModel');
const skillCategoryModel = require('../models/skillCategoryModel');
const userModel = require('../models/userModel');
const jobCategoriesByJobModel = require('../models/jobCategoriesByJobModel');
const skillCategoriesByJobModel = require('../models/skillCategoriesByJobModel');

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
  create: function() { return { id: 1, description: 'Test job', datetime: '2024-01-01', duration: 2, zipcode: '12345', employee_num: 1, job_filled: 0, job_completed: 0 }; }
};

const mockEmployerJob = {
  create: function() { return { job_id: 1, employer_id: 1 }; }
};

const mockUser = {
  getByUsername: function() { return { user_id: 1, username: 'testuser' }; }
};

const mockJobCategoriesByJob = {
  create: function() {}
};

const mockSkillCategoriesByJob = {
  create: function() {}
};

const mockJobCategory = {
  getAll: function() { return [{ id: 1, name: 'Pet Care' }]; }
};

const mockSkillCategory = {
  getAll: function() { return [{ id: 1, name: 'Animal Handling' }]; }
};

// Routes
app.get('/create-job', mockIsAuthenticated, (req, res) => {
  const jobCategories = mockJobCategory.getAll();
  const skillCategories = mockSkillCategory.getAll();

  res.render('create-job', {
    error: null,
    success: null,
    jobCategories,
    skillCategories,
    job_categories: [],
    skill_categories: []
  });
});

app.post('/create-job', mockIsAuthenticated, (req, res) => {
  const { description, datetime, duration, zipcode, employee_num, job_filled, username, job_categories, skill_categories } = req.body;

  const jobCategories = mockJobCategory.getAll();
  const skillCategories = mockSkillCategory.getAll();

  // Validate required fields
  if (!description || !datetime || !duration || !zipcode || !employee_num || !username) {
    return res.render('create-job', {
      error: 'All required fields must be filled out.',
      success: null,
      jobCategories,
      skillCategories,
      job_categories,
      skill_categories
    });
  }

  try {
    const job_filled_value = job_filled ? 1 : 0;
    const job_completed = 0;

    const durationNum = parseInt(duration);
    const employeeNum = parseInt(employee_num);
    const user_id = mockUser.getByUsername(username).user_id;

    if (isNaN(durationNum) || durationNum <= 0) {
      return res.render('create-job', {
        error: 'Duration must be a positive number.',
        success: null,
        jobCategories,
        skillCategories,
        job_categories,
        skill_categories
      });
    }

    if (isNaN(employeeNum) || employeeNum <= 0) {
      return res.render('create-job', {
        error: 'Number of Employees must be a positive number.',
        success: null,
        jobCategories,
        skillCategories,
        job_categories,
        skill_categories
      });
    }

    // Create the new job
    const newJob = mockJobContent.create(
      description,
      datetime,
      durationNum,
      zipcode,
      employeeNum,
      job_filled_value,
      job_completed
    );

    const job_id = newJob.id;
    mockEmployerJob.create(job_id, user_id);

    const selectedJobCategories = job_categories
      ? Array.isArray(job_categories)
        ? job_categories
        : [job_categories]
      : [];
    const selectedSkillCategories = skill_categories
      ? Array.isArray(skill_categories)
        ? skill_categories
        : [skill_categories]
      : [];

    selectedJobCategories.forEach(categoryId => {
      const parsedCategoryId = parseInt(categoryId, 10);
      if (!Number.isNaN(parsedCategoryId)) {
        mockJobCategoriesByJob.create(job_id, parsedCategoryId);
      }
    });

    selectedSkillCategories.forEach(skillId => {
      const parsedSkillId = parseInt(skillId, 10);
      if (!Number.isNaN(parsedSkillId)) {
        mockSkillCategoriesByJob.create(job_id, parsedSkillId);
      }
    });

    res.render('create-job', {
      error: null,
      success: `Job created successfully with ID: ${newJob.id}! Redirecting to job search...`,
      jobCategories,
      skillCategories,
      job_categories,
      skill_categories
    });

  } catch (error) {
    console.error('Error creating job:', error);
    res.render('create-job', {
      error: 'An error occurred while creating the job. Please try again.',
      success: null,
      jobCategories,
      skillCategories,
      job_categories,
      skill_categories
    });
  }
});

// Mock EJS rendering
app.set('view engine', 'ejs');
app.engine('ejs', (filePath, options, callback) => {
  callback(null, JSON.stringify(options));
});

describe('Job Creation Tests', () => {
  describe('GET /create-job', () => {
    it('should render create job page with categories', async () => {
      const response = await request(app)
        .get('/create-job')
        .expect(200);

      const renderedData = JSON.parse(response.text);
      assert.strictEqual(renderedData.error, null);
      assert.strictEqual(renderedData.success, null);
      assert.deepStrictEqual(renderedData.jobCategories, [{ id: 1, name: 'Pet Care' }]);
      assert.deepStrictEqual(renderedData.skillCategories, [{ id: 1, name: 'Animal Handling' }]);
    });
  });

  describe('POST /create-job', () => {
    it('should create job successfully with valid data', async () => {
      const jobData = {
        description: 'Dog walking in the park',
        datetime: '2024-12-01T10:00',
        duration: '2',
        zipcode: '12345',
        employee_num: '1',
        username: 'testuser',
        job_categories: ['1'],
        skill_categories: ['1']
      };

      const response = await request(app)
        .post('/create-job')
        .send(jobData)
        .expect(200);

      const renderedData = JSON.parse(response.text);
      assert.strictEqual(renderedData.error, null);
      assert.ok(renderedData.success.includes('Job created successfully'));
    });

    it('should fail with missing required fields', async () => {
      const incompleteJobData = {
        description: '',
        datetime: '2024-12-01T10:00',
        duration: '2',
        zipcode: '12345',
        employee_num: '1',
        username: 'testuser'
      };

      const response = await request(app)
        .post('/create-job')
        .send(incompleteJobData)
        .expect(200);

      const renderedData = JSON.parse(response.text);
      assert.strictEqual(renderedData.error, 'All required fields must be filled out.');
      assert.strictEqual(renderedData.success, null);
    });

    it('should fail with invalid duration', async () => {
      const invalidJobData = {
        description: 'Dog walking',
        datetime: '2024-12-01T10:00',
        duration: '-1',
        zipcode: '12345',
        employee_num: '1',
        username: 'testuser'
      };

      const response = await request(app)
        .post('/create-job')
        .send(invalidJobData)
        .expect(200);

      const renderedData = JSON.parse(response.text);
      assert.strictEqual(renderedData.error, 'Duration must be a positive number.');
    });

    it('should fail with invalid employee number', async () => {
      const invalidJobData = {
        description: 'Dog walking',
        datetime: '2024-12-01T10:00',
        duration: '2',
        zipcode: '12345',
        employee_num: '0',
        username: 'testuser'
      };

      const response = await request(app)
        .post('/create-job')
        .send(invalidJobData)
        .expect(200);

      const renderedData = JSON.parse(response.text);
      assert.strictEqual(renderedData.error, 'Number of Employees must be a positive number.');
    });

    it('should handle job_filled checkbox', async () => {
      const jobData = {
        description: 'Dog walking',
        datetime: '2024-12-01T10:00',
        duration: '2',
        zipcode: '12345',
        employee_num: '1',
        job_filled: 'on',
        username: 'testuser'
      };

      const response = await request(app)
        .post('/create-job')
        .send(jobData)
        .expect(200);

      const renderedData = JSON.parse(response.text);
      assert.strictEqual(renderedData.error, null);
    });

    it('should handle multiple job categories', async () => {
      const jobData = {
        description: 'Pet care',
        datetime: '2024-12-01T10:00',
        duration: '2',
        zipcode: '12345',
        employee_num: '1',
        username: 'testuser',
        job_categories: ['1', '2', '3']
      };

      const response = await request(app)
        .post('/create-job')
        .send(jobData)
        .expect(200);

      const renderedData = JSON.parse(response.text);
      assert.ok(renderedData.success || !renderedData.error);
    });

    it('should handle multiple skill categories', async () => {
      const jobData = {
        description: 'Pet care',
        datetime: '2024-12-01T10:00',
        duration: '2',
        zipcode: '12345',
        employee_num: '1',
        username: 'testuser',
        skill_categories: ['1', '4']
      };

      const response = await request(app)
        .post('/create-job')
        .send(jobData)
        .expect(200);

      const renderedData = JSON.parse(response.text);
      assert.ok(renderedData.success || !renderedData.error);
    });

    it('should handle single category selections', async () => {
      const jobData = {
        description: 'Pet care',
        datetime: '2024-12-01T10:00',
        duration: '2',
        zipcode: '12345',
        employee_num: '1',
        username: 'testuser',
        job_categories: '1',
        skill_categories: '2'
      };

      const response = await request(app)
        .post('/create-job')
        .send(jobData)
        .expect(200);

      const renderedData = JSON.parse(response.text);
      assert.ok(renderedData.success || !renderedData.error);
    });
  });
});