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
const JobSearchModel = require('./models/jobSearchModel.js');
const jobSearch = new JobSearchModel();
const jobCategoryModel = require('./models/jobCategoryModel');
const jobCategory = new jobCategoryModel();
const skillCategoryModel = require('./models/skillCategoryModel');
const skillCategory = new skillCategoryModel();
const userModel = require('./models/userModel.js');
const user = new userModel();

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
  res.status(200);
  write_res_log(res);
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
  let { zipcode, keyword, job_categories, skill_categories } = req.body;
  
  let results = jobSearch.getAllMatchedJobs(zipcode || null, keyword || null, skill_categories || null, job_categories || null);
  
  const jobCategories = jobCategory.getAll();
  const skillCategories = skillCategory.getAll();
  
  res.render('job-search', { jobCategories, skillCategories, results, searchParams: { zipcode, keyword, job_categories, skill_categories } });
});

// Display a page with details of a selected job listing
app.get('/booking/:job_id', async (req, res) => {
  const jobData = await jobContent.getById(req.params.job_id);
  const review = await jobReview.getByJobId(req.params.job_id);

  if(review){
    const reviewId = await review.review_id;
    const reviewData = await reviewContent.getById(reviewId);
    const userData = await user.getById(jobData.employee_num);

    res.render('booking-detail', { jobData, reviewData, userData });
  }else{
    const reviewData = null;
    const userData = await user.getById(jobData.employee_num);

    res.render('booking-detail', { jobData, reviewData, userData });
  }
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

// Handle login render
app.get('/login', (req, res) => {
  res.render('login');
});

// Handle login submission
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Authenticate user using UserModel
  const authenticatedUser = user.authenticate(username, password);

  if (authenticatedUser) {
    // TEMPORARY UNTIL LANDING PAGE IS CREATED
    logger.write(`[INFO] User ${authenticatedUser.username} logged in successfully`);
    const jobCategories = jobCategory.getAll();
    const skillCategories = skillCategory.getAll();
    res.render('job-search', { jobCategories, skillCategories, results: null, searchParams: null });
  } else {
    // Login failed - redirect back to login with error
    logger.write(`[INFO] Failed login attempt for identifier: ${username}`);
    res.render('login', { error: 'Invalid username/email or password' });
  }
});

// Handle forgot password render
app.get('/forgot-password', (req, res) => {
  res.render('forgot-password');
});

// Handle forgot password submission
app.post('/forgot-password', (req, res) => {
  const { email } = req.body;

  // TODO: Implement actual password reset logic
  // As of now it just shows a successful message.
  logger.write(`[INFO] Password reset requested for email: ${email}`);

  res.json({
    success: true,
    message: 'If an account with that email exists, a password reset link has been sent.'
  });
});

// Handle signup render
app.get('/signup', (req, res) => {
  res.render('signup');
});

// Handle signup submission
app.post('/signup', (req, res) => {
  const { username, email, password, phone_number, zipcode, account_type } = req.body;

  // Validate required fields
  if (!username || !email || !password || !phone_number || !zipcode || !account_type) {
    logger.write(`[INFO] Signup attempt with missing fields`);
    return res.render('signup', { error: 'All fields are required.' });
  }

  // Validate account_type
  const validAccountTypes = ['pet', 'owner', 'organization', 'user'];
  if (!validAccountTypes.includes(account_type)) {
    logger.write(`[INFO] Signup attempt with invalid account type: ${account_type}`);
    return res.render('signup', { error: 'Invalid account type selected.' });
  }

  try {
    // Check if username already exists
    const existingUser = user.getByUsername(username);
    if (existingUser) {
      logger.write(`[INFO] Signup attempt with existing username: ${username}`);
      return res.render('signup', { error: 'Username already exists. Please choose a different one.' });
    }

    // Check if email already exists
    const existingEmail = user.getByEmail(email);
    if (existingEmail) {
      logger.write(`[INFO] Signup attempt with existing email: ${email}`);
      return res.render('signup', { error: 'Email already exists. Please use a different one.' });
    }

    // Create new user
    const newUser = user.create(username, password, phone_number, email, zipcode, '', account_type, null);
    logger.write(`[INFO] New user created: ${newUser.username}`);

    // Signup successful - render login page with success message
    res.render('login', { success: 'Account created successfully! Please log in.' });
  } catch (error) {
    console.error('Error creating user:', error);
    logger.write(`[ERROR] Signup error: ${error.message}`);
    res.render('signup', { error: 'An error occurred during signup. Please try again.' });
  }
});

app.get('/leaderboard-test', (req, res) => {
  res.render('leaderboard', {
    leaderboard: { start_time: '2025-04-01', end_time: '2025-04-30' },
    entries: [
      { worker_name: 'Rex', avg_rating: 4.5, jobs_completed: 10 },
      { worker_name: 'Bella', avg_rating: 3.8, jobs_completed: 15 },
      { worker_name: 'Max', avg_rating: null, jobs_completed: 5 }
    ]
  });
});

app.get('/review-test', (req, res) => {
  res.render('review', {
    worker_name: 'Rex',
    job_title: 'Dog Walking',
    job_date: '2025-04-01',
    job_id: 99  // changed from 1 to 99
  });
});

// Handle signup render
app.get('/signup', (req, res) => {
  res.render('signup');
});

// Handle signup submission
app.post('/signup', (req, res) => {
  const { username, email, password, phone_number, zipcode, account_type } = req.body;

  // Validate required fields
  if (!username || !email || !password || !phone_number || !zipcode || !account_type) {
    logger.write(`[INFO] Signup attempt with missing fields`);
    return res.render('signup', { error: 'All fields are required.' });
  }

  // Validate account_type
  const validAccountTypes = ['pet', 'owner', 'organization', 'user'];
  if (!validAccountTypes.includes(account_type)) {
    logger.write(`[INFO] Signup attempt with invalid account type: ${account_type}`);
    return res.render('signup', { error: 'Invalid account type selected.' });
  }

  try {
    // Check if username already exists
    const existingUser = user.getByUsername(username);
    if (existingUser) {
      logger.write(`[INFO] Signup attempt with existing username: ${username}`);
      return res.render('signup', { error: 'Username already exists. Please choose a different one.' });
    }

    // Check if email already exists
    const existingEmail = user.getByEmail(email);
    if (existingEmail) {
      logger.write(`[INFO] Signup attempt with existing email: ${email}`);
      return res.render('signup', { error: 'Email already exists. Please use a different one.' });
    }

    // Create new user
    const newUser = user.create(username, password, phone_number, email, zipcode, '', account_type, null);
    logger.write(`[INFO] New user created: ${newUser.username}`);

    // Signup successful - render login page with success message
    res.render('login', { success: 'Account created successfully! Please log in.' });
  } catch (error) {
    console.error('Error creating user:', error);
    logger.write(`[ERROR] Signup error: ${error.message}`);
    res.render('signup', { error: 'An error occurred during signup. Please try again.' });
  }
});

function write_res_log(res){
  logger.write(`[INFO] Returned Status Code: ${res.statusCode}`);
  return;
}

app.post('/api/reviews', (req, res) => {
  const { job_id, punctuality, quality, friendliness, comments } = req.body;

  try {
    const newReview = reviewContent.create(punctuality, quality, friendliness, comments, new Date().toISOString(), 0);
    res.json({ review_id: newReview.id });
  } catch (error) {
    console.error('Error saving review:', error);
    res.status(500).json({ error: error.message });
  }
});

// Display the create job form
app.get('/create-job', (req, res) => {
  res.render('create-job', { error: null, success: null });
});

// Handle job creation
app.post('/create-job', (req, res) => {
  const { description, datetime, duration, zipcode, employee_num, job_filled } = req.body;

  // Validate required fields
  if (!description || !datetime || !duration || !zipcode || !employee_num) {
    logger.write(`[INFO] Create job attempt with missing fields`);
    return res.render('create-job', { 
      error: 'All required fields must be filled out.',
      success: null 
    });
  }

  try {
    // Convert checkbox value (unchecked = undefined, so default to 0)
    const job_filled_value = job_filled ? 1 : 0;
    const job_completed = 0;

    // Validate numeric fields
    const durationNum = parseInt(duration);
    const employeeNum = parseInt(employee_num);

    if (isNaN(durationNum) || durationNum <= 0) {
      logger.write(`[INFO] Create job attempt with invalid duration: ${duration}`);
      return res.render('create-job', {
        error: 'Duration must be a positive number.',
        success: null
      });
    }

    if (isNaN(employeeNum) || employeeNum <= 0) {
      logger.write(`[INFO] Create job attempt with invalid employee ID: ${employee_num}`);
      return res.render('create-job', {
        error: 'Employee ID must be a positive number.',
        success: null
      });
    }

    // Create the new job
    const newJob = jobContent.create(
      description,
      datetime,
      durationNum,
      zipcode,
      employeeNum,
      job_filled_value,
      job_completed
    );

    logger.write(`[INFO] New job created with ID: ${newJob.id}`);

    // Render success page
    res.render('create-job', {
      error: null,
      success: `Job created successfully with ID: ${newJob.id}! Redirecting to job search...`
    });

  } catch (error) {
    console.error('Error creating job:', error);
    logger.write(`[ERROR] Create job error: ${error.message}`);
    res.render('create-job', {
      error: 'An error occurred while creating the job. Please try again.',
      success: null
    });
  }
});

// Start the server and make it listen on the specified port.
// Once the server starts, it logs a message to the console indicating where it is running.
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});