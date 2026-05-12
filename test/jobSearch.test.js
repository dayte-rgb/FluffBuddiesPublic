const request = require('supertest');
const express = require('express');
const session = require('express-session');
const assert = require('assert');

const jobSearchModel = require('../models/jobSearchModel');
const jobCategoryModel = require('../models/jobCategoryModel');
const skillCategoryModel = require('../models/skillCategoryModel');

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
  describe('GET /job-search', () => {
    it('should render job search page with categories', async () => {
      const response = await request(app)
        .get('/job-search')
        .expect(200);

      const renderedData = JSON.parse(response.text);
      assert.ok(renderedData.jobCategories !== undefined);
      assert.ok(renderedData.skillCategories !== undefined);
      assert.strictEqual(renderedData.results, null);
      assert.strictEqual(renderedData.searchParams, null);
    });

    it('should require authentication', async () => {
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
    it('should handle search with all parameters', async () => {
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
      assert.deepStrictEqual(renderedData.results, []);
      assert.deepStrictEqual(renderedData.searchParams, searchData);
    });

    it('should handle search with minimal parameters', async () => {
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
      assert.deepStrictEqual(renderedData.results, []);
      assert.deepStrictEqual(renderedData.searchParams, searchData);
    });

    it('should handle search with only zipcode', async () => {
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
      assert.strictEqual(renderedData.searchParams.zipcode, '12345');
    });

    it('should handle search with keyword', async () => {
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
      assert.strictEqual(renderedData.searchParams.keyword, 'pet sitting');
    });

    it('should handle search with job categories', async () => {
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
      assert.deepStrictEqual(renderedData.searchParams.job_categories, ['1', '3']);
    });

    it('should handle search with skill categories', async () => {
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
      assert.deepStrictEqual(renderedData.searchParams.skill_categories, ['2', '4']);
    });
  });
});