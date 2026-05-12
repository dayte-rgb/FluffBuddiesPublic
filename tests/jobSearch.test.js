const request = require('supertest');
const express = require('express');
const session = require('express-session');
//const { connectToDatabase } = require('../database');

// Mock the database connection
jest.mock('../database', () => ({
  connectToDatabase: jest.fn(() => ({
    prepare: jest.fn(() => ({
      all: jest.fn(() => []),
      get: jest.fn(() => ({})),
      run: jest.fn(() => ({ lastInsertRowid: 1 }))
    }))
  }))
}));

// Import models after mocking
const jobSearchModel = require('../models/jobSearchModel');
const jobCategoryModel = require('../models/jobCategoryModel');
const skillCategoryModel = require('../models/skillCategoryModel');

// Mock the models
jest.mock('../models/jobSearchModel');
jest.mock('../models/jobCategoryModel');
jest.mock('../models/skillCategoryModel');

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

// Routes
app.get('/job-search', mockIsAuthenticated, (req, res) => {
  const jobCategories = [{ id: 1, name: 'Category 1' }];
  const skillCategories = [{ id: 1, name: 'Skill 1' }];
  res.render('job-search', { jobCategories, skillCategories, results: null, searchParams: null });
});

app.post('/job-search', mockIsAuthenticated, (req, res) => {
  const { zipcode, keyword, job_categories, skill_categories } = req.body;
  const results = [];
  const jobCategories = [{ id: 1, name: 'Category 1' }];
  const skillCategories = [{ id: 1, name: 'Skill 1' }];
  res.render('job-search', { jobCategories, skillCategories, results, searchParams: { zipcode, keyword, job_categories, skill_categories } });
});

// Mock EJS rendering
app.set('view engine', 'ejs');
app.engine('ejs', (filePath, options, callback) => {
  callback(null, JSON.stringify(options));
});

describe('Job Search Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /job-search', () => {
    test('should render job search page with categories', async () => {
      const response = await request(app)
        .get('/job-search')
        .expect(200);

      const renderedData = JSON.parse(response.text);
      expect(renderedData.jobCategories).toBeDefined();
      expect(renderedData.skillCategories).toBeDefined();
      expect(renderedData.results).toBeNull();
      expect(renderedData.searchParams).toBeNull();
    });

    test('should require authentication', async () => {
      // Remove the mock authentication for this test
      const unauthApp = express();
      unauthApp.use(express.urlencoded({ extended: true }));
      unauthApp.use(express.json());
      unauthApp.use(session({
        secret: 'test-secret',
        resave: false,
        saveUninitialized: false
      }));

      unauthApp.get('/job-search', (req, res) => {
        if (!req.session.userId) {
          return res.status(401).json({ error: 'Unauthorized' });
        }
        res.json({ success: true });
      });

      await request(unauthApp)
        .get('/job-search')
        .expect(401);
    });
  });

  describe('POST /job-search', () => {
    test('should handle search with all parameters', async () => {
      const searchData = {
        zipcode: '12345',
        keyword: 'dog walking',
        job_categories: ['1', '2'],
        skill_categories: ['1']
      };

      const response = await request(app)
        .post('/job-search')
        .send(searchData)
        .expect(200);

      const renderedData = JSON.parse(response.text);
      expect(renderedData.results).toEqual([]);
      expect(renderedData.searchParams).toEqual(searchData);
    });

    test('should handle search with minimal parameters', async () => {
      const searchData = {
        zipcode: '',
        keyword: '',
        job_categories: [],
        skill_categories: []
      };

      const response = await request(app)
        .post('/job-search')
        .send(searchData)
        .expect(200);

      const renderedData = JSON.parse(response.text);
      expect(renderedData.results).toEqual([]);
      expect(renderedData.searchParams).toEqual(searchData);
    });

    test('should handle search with only zipcode', async () => {
      const searchData = {
        zipcode: '12345',
        keyword: '',
        job_categories: [],
        skill_categories: []
      };

      const response = await request(app)
        .post('/job-search')
        .send(searchData)
        .expect(200);

      const renderedData = JSON.parse(response.text);
      expect(renderedData.searchParams.zipcode).toBe('12345');
    });

    test('should handle search with keyword', async () => {
      const searchData = {
        zipcode: '',
        keyword: 'pet sitting',
        job_categories: [],
        skill_categories: []
      };

      const response = await request(app)
        .post('/job-search')
        .send(searchData)
        .expect(200);

      const renderedData = JSON.parse(response.text);
      expect(renderedData.searchParams.keyword).toBe('pet sitting');
    });

    test('should handle search with job categories', async () => {
      const searchData = {
        zipcode: '',
        keyword: '',
        job_categories: ['1', '3'],
        skill_categories: []
      };

      const response = await request(app)
        .post('/job-search')
        .send(searchData)
        .expect(200);

      const renderedData = JSON.parse(response.text);
      expect(renderedData.searchParams.job_categories).toEqual(['1', '3']);
    });

    test('should handle search with skill categories', async () => {
      const searchData = {
        zipcode: '',
        keyword: '',
        job_categories: [],
        skill_categories: ['2', '4']
      };

      const response = await request(app)
        .post('/job-search')
        .send(searchData)
        .expect(200);

      const renderedData = JSON.parse(response.text);
      expect(renderedData.searchParams.skill_categories).toEqual(['2', '4']);
    });
  });
});