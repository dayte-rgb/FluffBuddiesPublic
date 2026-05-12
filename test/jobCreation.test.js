const request = require('supertest');
const express = require('express');
const session = require('express-session');

// Mock the database and models
jest.mock('../database', () => ({
  connectToDatabase: jest.fn(() => ({
    prepare: jest.fn(() => ({
      all: jest.fn(() => []),
      get: jest.fn(() => ({ user_id: 1, username: 'testuser' })),
      run: jest.fn(() => ({ lastInsertRowid: 1 }))
    }))
  }))
}));

const jobContentModel = require('../models/jobContentModel');
const employerJobModel = require('../models/employerJobModel');
const jobCategoryModel = require('../models/jobCategoryModel');
const skillCategoryModel = require('../models/skillCategoryModel');
const userModel = require('../models/userModel');
const jobCategoriesByJobModel = require('../models/jobCategoriesByJobModel');
const skillCategoriesByJobModel = require('../models/skillCategoriesByJobModel');

jest.mock('../models/jobContentModel');
jest.mock('../models/employerJobModel');
jest.mock('../models/jobCategoryModel');
jest.mock('../models/skillCategoryModel');
jest.mock('../models/userModel');
jest.mock('../models/jobCategoriesByJobModel');
jest.mock('../models/skillCategoriesByJobModel');

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
  create: jest.fn(() => ({ id: 1, description: 'Test job', datetime: '2024-01-01', duration: 2, zipcode: '12345', employee_num: 1, job_filled: 0, job_completed: 0 }))
};

const mockEmployerJob = {
  create: jest.fn(() => ({ job_id: 1, employer_id: 1 }))
};

const mockUser = {
  getByUsername: jest.fn(() => ({ user_id: 1, username: 'testuser' }))
};

const mockJobCategoriesByJob = {
  create: jest.fn()
};

const mockSkillCategoriesByJob = {
  create: jest.fn()
};

const mockJobCategory = {
  getAll: jest.fn(() => [{ id: 1, name: 'Pet Care' }])
};

const mockSkillCategory = {
  getAll: jest.fn(() => [{ id: 1, name: 'Animal Handling' }])
};

// Replace the mocked modules
jobContentModel.mockImplementation(() => mockJobContent);
employerJobModel.mockImplementation(() => mockEmployerJob);
userModel.mockImplementation(() => mockUser);
jobCategoriesByJobModel.mockImplementation(() => mockJobCategoriesByJob);
skillCategoriesByJobModel.mockImplementation(() => mockSkillCategoriesByJob);
jobCategoryModel.mockImplementation(() => mockJobCategory);
skillCategoryModel.mockImplementation(() => mockSkillCategory);

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
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /create-job', () => {
    test('should render create job page with categories', async () => {
      const response = await request(app)
        .get('/create-job')
        .expect(200);

      const renderedData = JSON.parse(response.text);
      expect(renderedData.error).toBeNull();
      expect(renderedData.success).toBeNull();
      expect(renderedData.jobCategories).toEqual([{ id: 1, name: 'Pet Care' }]);
      expect(renderedData.skillCategories).toEqual([{ id: 1, name: 'Animal Handling' }]);
    });
  });

  describe('POST /create-job', () => {
    test('should create job successfully with valid data', async () => {
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
      expect(renderedData.error).toBeNull();
      expect(renderedData.success).toContain('Job created successfully');
      expect(mockJobContent.create).toHaveBeenCalledWith(
        'Dog walking in the park',
        '2024-12-01T10:00',
        2,
        '12345',
        1,
        0,
        0
      );
      expect(mockEmployerJob.create).toHaveBeenCalledWith(1, 1);
      expect(mockJobCategoriesByJob.create).toHaveBeenCalledWith(1, 1);
      expect(mockSkillCategoriesByJob.create).toHaveBeenCalledWith(1, 1);
    });

    test('should fail with missing required fields', async () => {
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
      expect(renderedData.error).toBe('All required fields must be filled out.');
      expect(renderedData.success).toBeNull();
      expect(mockJobContent.create).not.toHaveBeenCalled();
    });

    test('should fail with invalid duration', async () => {
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
      expect(renderedData.error).toBe('Duration must be a positive number.');
      expect(mockJobContent.create).not.toHaveBeenCalled();
    });

    test('should fail with invalid employee number', async () => {
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
      expect(renderedData.error).toBe('Number of Employees must be a positive number.');
      expect(mockJobContent.create).not.toHaveBeenCalled();
    });

    test('should handle job_filled checkbox', async () => {
      const jobData = {
        description: 'Dog walking',
        datetime: '2024-12-01T10:00',
        duration: '2',
        zipcode: '12345',
        employee_num: '1',
        job_filled: 'on',
        username: 'testuser'
      };

      await request(app)
        .post('/create-job')
        .send(jobData)
        .expect(200);

      expect(mockJobContent.create).toHaveBeenCalledWith(
        'Dog walking',
        '2024-12-01T10:00',
        2,
        '12345',
        1,
        1, // job_filled should be 1
        0
      );
    });

    test('should handle multiple job categories', async () => {
      const jobData = {
        description: 'Pet care',
        datetime: '2024-12-01T10:00',
        duration: '2',
        zipcode: '12345',
        employee_num: '1',
        username: 'testuser',
        job_categories: ['1', '2', '3']
      };

      await request(app)
        .post('/create-job')
        .send(jobData)
        .expect(200);

      expect(mockJobCategoriesByJob.create).toHaveBeenCalledTimes(3);
      expect(mockJobCategoriesByJob.create).toHaveBeenCalledWith(1, 1);
      expect(mockJobCategoriesByJob.create).toHaveBeenCalledWith(1, 2);
      expect(mockJobCategoriesByJob.create).toHaveBeenCalledWith(1, 3);
    });

    test('should handle multiple skill categories', async () => {
      const jobData = {
        description: 'Pet care',
        datetime: '2024-12-01T10:00',
        duration: '2',
        zipcode: '12345',
        employee_num: '1',
        username: 'testuser',
        skill_categories: ['1', '4']
      };

      await request(app)
        .post('/create-job')
        .send(jobData)
        .expect(200);

      expect(mockSkillCategoriesByJob.create).toHaveBeenCalledTimes(2);
      expect(mockSkillCategoriesByJob.create).toHaveBeenCalledWith(1, 1);
      expect(mockSkillCategoriesByJob.create).toHaveBeenCalledWith(1, 4);
    });

    test('should handle single category selections', async () => {
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

      await request(app)
        .post('/create-job')
        .send(jobData)
        .expect(200);

      expect(mockJobCategoriesByJob.create).toHaveBeenCalledWith(1, 1);
      expect(mockSkillCategoriesByJob.create).toHaveBeenCalledWith(1, 2);
    });
  });
});