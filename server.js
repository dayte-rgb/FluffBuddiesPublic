// Import the Express module, which is a framework for building web applications in Node.js.
const express = require('express');
const path = require('path');
const Log = require('./tools/log.js');
const { start } = require('repl');
const logger = new Log('requests.log', true);
const jobContentModel = require('./models/jobContentModel');
const jobContent = new jobContentModel();
const jobReviewModel = require('./models/jobReviewModel.js');
const jobReview = new jobReviewModel();
const reviewContentModel = require('./models/reviewContentModel.js');
const reviewContent = new reviewContentModel();
const employeeJobModel = require('./models/employeeJobModel');
const employeeJob = new employeeJobModel();
const JobSearchModel = require('./models/jobSearchModel');
const jobSearch = new JobSearchModel();
const jobCategoryModel = require('./models/jobCategoryModel');
const jobCategory = new jobCategoryModel();
const skillCategoryModel = require('./models/skillCategoryModel');
const skillCategory = new skillCategoryModel();

// Create an instance of an Express application. This app object will be used to define routes and middleware.
const app = express();

// Define a constant for the port number on which the server will listen.
const PORT = 3000;

// Middleware for parsing HTTP responses
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Middleware for logging
app.use(function (req, res, next) {
  const startTime = Date.now();
  logger.write(`[INFO] Route: ${req.url} Method: ${req.method}`);
  next();
});

// Middleware for handling static files
app.use(express.static('public'));

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


app.get('/', (req, res) => {
  res.render('welcome');
});

// Define a route handler for GET requests to the URL ('/default')
app.get('/default', (req, res) => {
  // Render the 'default' template and pass an object with dynamic data.
  res.render('default', {
    name: 'Student', // A variable named 'name' with the value 'Student'.
    items: ['Apples', 'Bananas', 'Cherries'] // An array named 'items' containing a list of fruits.
  });
});

// Displays job search query page
app.get('/job-search', (req, res) => {
  const jobCategories = jobCategory.getAll();
  const skillCategories = skillCategory.getAll();

  res.render('job-search', { jobCategories, skillCategories, results: null, searchParams: null });
});

// Handles execution of search query
app.post('/job-search', (req, res) => {
  const { zipcode, keyword, job_category, skill_category } = req.body;

  const results = jobSearch.getAllMatchedJobs(zipcode || null, keyword || null, skill_category || null, job_category || null);

  const { connectToDatabase } = require('./database.js');
  const db = connectToDatabase();

  // fetch username for each job
  const resultsWithUsers = results.map(job => {
    const user = db.prepare('SELECT username FROM User WHERE user_id = ?').get(job.employee_num);
    return { ...job, username: user ? user.username : 'Unknown' };
  });

  const jobCategories = jobCategory.retrieveAll();
  const skillCategories = skillCategory.retrieveAll();

  res.render('job-search', { jobCategories, skillCategories, results: resultsWithUsers, searchParams: { zipcode, keyword, job_category, skill_category } });
});

// Display a page with details of a selected job listing
app.get('/booking/:job_id', (req, res) => {
  let jobData = jobContent.retrieve(req.params.job_id);
  if (!jobData) {
    return res.status(404).send('Job not found');
  }
  let reviews = jobReview.retrieveByJobID(req.params.job_id);
  let reviewData = [];
  for (let i = 0; i < reviews.length; i++) {
    reviewData.push(reviewContent.retrieve(reviews[i].review_id));
  }
  const { connectToDatabase } = require('./database.js');
  const db = connectToDatabase();
  const userData = db.prepare('SELECT * FROM User WHERE user_id = ?').get(jobData.employee_num);

  res.render('booking-detail', { jobData, reviewData, userData });
});


// Handle booking a job
app.post('/booking/:job_id', (req, res) => {
  const employee_id = req.body.employee_id;

  try {
    employeeJob.create(req.params.job_id, employee_id);
    res.json({ success: true, message: 'Job booked successfully!' });
  } catch (error) {
    console.error('Error booking job:', error);
    res.status(500).json({ success: false, message: 'Failed to book job.' });
  }
});

function write_res_log(res) {
  logger.write(`[INFO] Returned Status Code: ${res.statusCode}`);
  return;
}
// Start the server and make it listen on the specified port.
// Once the server starts, it logs a message to the console indicating where it is running.
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

