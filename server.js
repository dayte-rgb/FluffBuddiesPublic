// Import the Express module, which is a framework for building web applications in Node.js.
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const Log = require('./tools/log.js');
const { start } = require('repl');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
let logger;
const dateObj = new Date();
const connections = require('./socket_connections.js');

// Session and authentication imports
const { sessionMiddleware } = require('./config/sessionConfig.js');
const { isAuthenticated, isNotAuthenticated } = require('./middleware/authMiddleware.js');

// Database imports
const { connectToDatabase } = require('./database.js');

const http = require('http');
const WebSocket = require('ws');

// Import all models required
const jobContentModel = require('./models/jobContentModel');
let jobContent;
const jobReviewModel = require('./models/jobReviewModel.js');
let jobReview;
const reviewContentModel = require('./models/reviewContentModel.js');
let reviewContent;
const employeeJobModel = require('./models/employeeJobModel');
let employeeJob;
const employerJobModel = require('./models/employerJobModel');
let employerJob;
const JobSearchModel = require('./models/jobSearchModel.js');
let jobSearch;
const jobCategoryModel = require('./models/jobCategoryModel');
let jobCategory;
const skillCategoryModel = require('./models/skillCategoryModel');
let skillCategory;
const userModel = require('./models/userModel.js');
let user;
const passwordResetModel = require('./models/passwordResetModel.js');
let passwordReset;
const securityQuestionModel = require('./models/securityQuestionModel.js');
let securityQuestion;
const userSecurityAnswerModel = require('./models/userSecurityAnswerModel.js');
let userSecurityAnswer;
const skillCategoriesByJobModel = require('./models/skillCategoriesByJobModel.js');
let skillCategoriesByJob;
const jobCategoriesByJobModel = require('./models/jobCategoriesByJobModel.js');
let jobCategoriesByJob;
const MessageModel = require('./models/messageContentModel.js');
let messageModel;
const MessagingModel = require('./models/messagingModel.js');
let messagingModel;
const UserMessageModel = require('./models/userMessageModel.js');
let userMessageModel;
const leaderboardContentModel = require('./models/leaderboardContentModel.js');
let leaderboardContent;
const leaderboardModel = require('./models/leaderboardModel.js');
let leaderboardM;
const UserBadgeModel = require('./models/userBadgeModel.js');
let userBadgeModel;
const BadgeContentModel = require('./models/badgeContentModel.js');
let badgeContent;
const CertificationContentModel = require('./models/certificationContentModel.js');
let certificationContent;
const UserCertificationModel = require('./models/userCertificationModel.js');
let userCertification;
const AchievementModel = require('./models/achievementModel.js');
let achievementModel;
const AchievementContentModel = require('./models/achievementContentModel.js');
let achievementContentModel;
const MeetupVerificationModel = require('./models/meetupVerificationModel.js');
let meetupVerification;
const ReviewModel = require('./models/reviewModel.js');
let reviewModel;

// Create an instance of an Express application. This app object will be used to define routes and middleware.
const app = express();

// create websockets server
const server = http.createServer(app);
const wss = new WebSocket.Server({ server }); // attach to same server

// Define a constant for the port number on which the server will listen.
const PORT = process.env.PORT || 3000;

// Middleware for parsing HTTP responses
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
app.use(express.json({ limit: '5mb' }));

// Session middleware
app.use(sessionMiddleware);

// Pass session data to all views
app.use((req, res, next) => {
  res.locals.user = req.session ? req.session : null;
  next();
});

// Middleware for logging
app.use(function (req, res, next) {
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


// GET /profile
app.get('/profile', isAuthenticated, (req, res) => {
  const userId = req.session.userId;
  const userData = user.getById(userId);
  if (!userData) return res.redirect('/login');

  const jobsCompleted = achievementModel.getJobsCompleted().find(r => r.user_id === userId);
  const numJobs = jobsCompleted ? jobsCompleted.num_jobs : 0;

  const reviewsReceived = achievementModel.getReviewsReceived().find(r => r.user_id === userId);
  const numReviews = reviewsReceived ? reviewsReceived.num_reviews_received : 0;

  const allUserBadges = userBadgeModel.getAll().filter(r => r.user_id === userId);
  const earnedBadges = allUserBadges.map(ub => badgeContent.getById(ub.badge_id)).filter(Boolean);

  const allAchievements = achievementContentModel.getAll();

  const allUserCerts = userCertification.getAll().filter(r => r.user_id === userId);
  const certs = allUserCerts.map(uc => certificationContent.getById(uc.certification_id)).filter(Boolean);

  // Pull flash messages set by the POST, then clear them
  const successMessage = req.session.successMessage || null;
  const errorMessage = req.session.errorMessage || null;
  delete req.session.successMessage;
  delete req.session.errorMessage;

  res.render('profile', {
    userData,
    numJobs,
    numReviews,
    earnedBadges,
    allAchievements,
    certs,
    successMessage,
    errorMessage
  });
});

app.post('/profile/update', isAuthenticated, (req, res) => {
  const userId = req.session.userId;

  try {
    const { email, phone_number, zipcode, profile_description, profile_picture_base64 } = req.body;

    const existing = user.getById(userId);  // use 'user' not 'userModel'

    const updatedPicture = profile_picture_base64
      ? profile_picture_base64
      : existing.profile_picture_link;

    user.update(
      userId,
      existing.password,
      phone_number.trim(),
      email.trim(),
      zipcode.trim(),
      (profile_description || '').trim(),
      existing.account_type,
      updatedPicture
    );

    req.session.successMessage = 'Profile updated successfully!';
  } catch (err) {
    console.error('Profile update error:', err);
    req.session.errorMessage = 'Something went wrong. Please try again.';
  }

  res.redirect('/profile');
});

// Displays job search query page
app.get('/job-search', isAuthenticated, (req, res) => {
  const jobCategories = jobCategory.getAll();
  const skillCategories = skillCategory.getAll();

  res.render('job-search', { jobCategories, skillCategories, results: null, searchParams: null });
});

// Handles execution of search query
app.post('/job-search', isAuthenticated, (req, res) => {
  console.log("Search was activated.");
  let { zipcode, keyword, job_categories, skill_categories } = req.body;
  console.log("Search params:", { zipcode, keyword, job_categories, skill_categories });

  // Treat empty strings as null
  zipcode = zipcode && zipcode.trim() !== '' ? zipcode.trim() : null;
  keyword = keyword && keyword.trim() !== '' ? `%${keyword.trim()}%` : null;

  let results = jobSearch.getAllMatchedJobs(zipcode, keyword, skill_categories || null, job_categories || null);
  console.log("Search results count:", results ? results.length : 'null');
  console.log("First few results:", results ? results.slice(0, 3) : 'no results');

  const jobCategories = jobCategory.getAll();
  const skillCategories = skillCategory.getAll();

  res.render('job-search', { jobCategories, skillCategories, results, searchParams: { zipcode, keyword: keyword ? keyword.replace(/%/g, '') : null, job_categories, skill_categories } });
});

// Display a page with details of a selected job listing
app.get('/booking/:job_id', isAuthenticated, async (req, res) => {
  const jobData = await jobContent.getById(req.params.job_id);
  if (!jobData) return res.status(404).send('Job not found');

  let reviews = [];
  reviews = reviewModel.getReviewsByJobId(req.params.job_id);

  if (reviews) {
    const userData = await user.getById(employerJob.getById(req.params.job_id).employer_id);

    res.render('booking-detail', { jobData, reviews, userData });
  } else {
    const userData = await user.getById(employerJob.getById(req.params.job_id).employer_id);

    res.render('booking-detail', { jobData, reviews, userData });
  }
});

// Handle booking a job
app.post('/booking/:job_id', isAuthenticated, (req, res) => {
  const employee_id = req.session.userId;
  const job_id = req.params.job_id;

  try {
    const jobData = jobContent.getById(job_id);

    if (!jobData) {
      return res.status(404).json({ success: false, message: 'Job not found.' });
    }

    const employerLink = employerJob.getById(job_id);
    if (employerLink && employerLink.employer_id === employee_id) {
      return res.status(400).json({ success: false, message: 'You cannot book your own job.' });
    }

    const existingBooking = employeeJob.getByIds(job_id, employee_id);
    if (existingBooking) {
      return res.status(400).json({ success: false, message: 'You have already booked this job.' });
    }

    //link employee
    employeeJob.create(job_id, employee_id);

    //update job to filled status
    jobContent.update(jobData.id, jobData.description, jobData.datetime, jobData.duration, jobData.zipcode, jobData.employeeNum, 1, 0);
    res.json({ success: true, message: 'Job booked successfully!' });
  } catch (error) {
    console.error('Error booking job:', error);
    res.status(500).json({ success: false, message: 'Failed to book job.' });
  }
});

// Handle login render
app.get('/login', isNotAuthenticated, (req, res) => {
  res.render('login');
});

// Handle login submission
app.post('/login', isNotAuthenticated, async (req, res) => {
  const { username, password } = req.body;

  // Authenticate user using UserModel
  const authenticatedUser = await user.authenticate(username, password);

  if (authenticatedUser) {
    // Create session for user
    req.session.userId = authenticatedUser.user_id;
    req.session.username = authenticatedUser.username;
    req.session.email = authenticatedUser.email;
    req.session.accountType = authenticatedUser.account_type;

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
async function createEmailTransporter() {
  console.log(process.env.SMTP_HOST);
  console.log(process.env.SMTP_USER);
  console.log(process.env.SMTP_PASS);
  console.log(process.env);
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    console.log("HELLO");
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // const testAccount = await nodemailer.createTestAccount();
  // return nodemailer.createTransport({
  //   host: testAccount.smtp.host,
  //   port: testAccount.smtp.port,
  //   secure: testAccount.smtp.secure,
  //   auth: {
  //     user: testAccount.user,
  //     pass: testAccount.pass,
  //   },
  // });
}

async function sendPasswordResetEmail(email, code) {
  try {
    const transporter = await createEmailTransporter();
    const mailOptions = {
      from: process.env.RESET_EMAIL_FROM || 'Paw Patrol <no-reply@pawpatrol.com>',
      to: email,
      subject: 'Paw Patrol Password Reset Code',
      text: `Your password reset code is ${code}. Use this code at http://localhost:${PORT}/reset-password to update your password. The code expires in 15 minutes.`,
      html: `
        <p>Hello,</p>
        <p>We received a request to reset your Paw Patrol password.</p>
        <p><strong>Your reset code is: ${code}</strong></p>
        <p>Enter this code <a href="http://localhost:${PORT}/reset-password">here</a>.</p>
        <p>The code expires in 15 minutes.</p>
        <p>If you did not request this, you can ignore this email.</p>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    if (!process.env.SMTP_HOST) {
      logger.write(`[INFO] Sent test password reset email for ${email}. Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    } else {
      logger.write(`[INFO] Sent password reset email for ${email}`);
    }
    return true;
  } catch (error) {
    logger.write(`[ERROR] Failed to send password reset email to ${email}: ${error.message}`);
    return false;
  }
}

app.get('/forgot-password', isNotAuthenticated, (req, res) => {
  res.render('forgot-password');
});

// Handle forgot password submission
app.post('/forgot-password', isNotAuthenticated, async (req, res) => {
  const { email } = req.body;
  const normalizedEmail = email ? email.trim().toLowerCase() : '';
  const existingUser = normalizedEmail ? user.getByEmail(normalizedEmail) : null;

  if (existingUser) {
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    passwordReset.create(normalizedEmail, code, expiresAt);
    await sendPasswordResetEmail(normalizedEmail, code);
  } else {
    logger.write(`[INFO] Password reset requested for non-existent email: ${normalizedEmail}`);
  }

  res.json({
    success: true,
    message: 'If an account with that email exists, a password reset code has been sent. Check your email.'
  });
});

app.get('/reset-password', isNotAuthenticated, (req, res) => {
  const email = req.query.email ? req.query.email.trim().toLowerCase() : '';
  res.render('reset-password', { email, message: null, error: null });
});

app.post('/reset-password', isNotAuthenticated, async (req, res) => {
  const { email, code, password, confirmPassword } = req.body;
  const normalizedEmail = email ? email.trim().toLowerCase() : '';

  if (!normalizedEmail || !code || !password || !confirmPassword) {
    return res.render('reset-password', { email: normalizedEmail, message: null, error: 'All fields are required.' });
  }

  if (password !== confirmPassword) {
    return res.render('reset-password', { email: normalizedEmail, message: null, error: 'Passwords do not match.' });
  }

  const resetEntry = passwordReset.getByEmail(normalizedEmail);
  if (!resetEntry || resetEntry.code !== code || new Date(resetEntry.expires_at) < new Date()) {
    return res.render('reset-password', { email: normalizedEmail, message: null, error: 'Invalid or expired reset code.' });
  }

  const existingUser = user.getByEmail(normalizedEmail);
  if (!existingUser) {
    return res.render('reset-password', { email: normalizedEmail, message: null, error: 'Unable to find an account for that email.' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  user.update(existingUser.user_id, hashedPassword, existingUser.phone_number, existingUser.email, existingUser.zipcode, existingUser.profile_description, existingUser.account_type, existingUser.profile_picture_link);
  passwordReset.deleteByEmail(normalizedEmail);

  res.render('login', { success: 'Your password has been reset. Please login with your new password.' });
});

// Handle logout
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      logger.write(`[ERROR] Error destroying session: ${err.message}`);
      return res.status(500).send('Error logging out.');
    }
    logger.write(`[INFO] User logged out successfully`);
    res.redirect('/');
  });
});

// Handle signup render
app.get('/signup', isNotAuthenticated, (req, res) => {
  const securityQuestions = securityQuestion.getAll();
  res.render('signup', { securityQuestions });
});

// Handle signup submission
app.post('/signup', isNotAuthenticated, async (req, res) => {
  const { username, email, password, phone_number, zipcode, account_type, security_question_id, security_answer } = req.body;

  // Validate required fields
  //deleted: || !security_question_id || !security_answer
  if (!username || !email || !password || !phone_number || !zipcode || !account_type) {
    logger.write(`[INFO] Signup attempt with missing fields`);
    const securityQuestions = securityQuestion.getAll();
    return res.render('signup', { error: 'All fields are required.', securityQuestions });
  }

  // Validate account_type
  const validAccountTypes = ['pet', 'owner', 'organization', 'user'];
  if (!validAccountTypes.includes(account_type)) {
    logger.write(`[INFO] Signup attempt with invalid account type: ${account_type}`);
    const securityQuestions = securityQuestion.getAll();
    return res.render('signup', { error: 'Invalid account type selected.', securityQuestions });
  }

  try {
    // Check if username already exists
    const existingUser = user.getByUsername(username);
    if (existingUser) {
      logger.write(`[INFO] Signup attempt with existing username: ${username}`);
      const securityQuestions = securityQuestion.getAll();
      return res.render('signup', { error: 'Username already exists. Please choose a different one.', securityQuestions });
    }

    // Check if email already exists
    const existingEmail = user.getByEmail(email);
    if (existingEmail) {
      logger.write(`[INFO] Signup attempt with existing email: ${email}`);
      const securityQuestions = securityQuestion.getAll();
      return res.render('signup', { error: 'Email already exists. Please use a different one.', securityQuestions });
    }

    // Create new user
    const newUser = await user.create(username, password, phone_number, email, zipcode, '', account_type, null);
    logger.write(`[INFO] New user created: ${newUser.username}`);

    // Hash the security answer
    // const hashedAnswer = await bcrypt.hash(security_answer, 10);

    // Create security answer
    // userSecurityAnswer.create(newUser.id, security_question_id, hashedAnswer);

    // Create session for new user
    req.session.userId = newUser.id;
    req.session.username = newUser.username;
    req.session.email = newUser.email;
    req.session.accountType = newUser.account_type;

    // Automatically log in after signup
    const jobCategories = jobCategory.getAll();
    const skillCategories = skillCategory.getAll();
    res.render('job-search', { jobCategories, skillCategories, results: null, searchParams: null });
  } catch (error) {
    console.error('Error creating user:', error);
    logger.write(`[ERROR] Signup error: ${error.message}`);
    const securityQuestions = securityQuestion.getAll();
    res.render('signup', { error: 'An error occurred during signup. Please try again.', securityQuestions });
  }
});

app.get('/inbox', isAuthenticated, (req, res) => {
  res.status(200);
  res.render('messaging', { userId: req.session.userId });
});

app.get('/leaderboard', (req, res) => {
  let leaderboard = leaderboardM.getCurrentLeaderboard();

  if (!leaderboard) {
    const lb_info = leaderboardContent.create(new Date().toISOString().replace('T', ' ').slice(0, 19), null, 1, 1);
    leaderboard = leaderboardContent.getById(lb_info.id);
  }

  let entries = leaderboardM.getLeaderboardStats('1970-01-01 00:00:00', '9999-12-31 23:59:59');

  res.render('leaderboard', { leaderboard, entries });
});

app.get('/review/:job_id', isAuthenticated, (req, res) => {
  const job_id = req.params.job_id;
  const jobData = jobContent.getById(job_id);
  if (!jobData) return res.status(404).send('Job not found');

  const employerLink = employerJob.getById(job_id);
  const workerData = employerLink ? user.getById(employerLink.employer_id) : null;

  res.render('review', {
    worker_name: workerData ? workerData.username : 'Unknown',
    job_title: jobData.description,
    job_date: jobData.datetime,
    job_id: job_id
  });
});

function write_res_log(res) {
  logger.write(`[INFO] Returned Status Code: ${res.statusCode}`);
  return;
}

app.post('/api/reviews', isAuthenticated, (req, res) => {
  const { job_id, punctuality, quality, friendliness, comments } = req.body;

  try {
    const newReview = reviewContent.create(punctuality, quality, friendliness, comments, new Date().toISOString(), 0);
    jobReview.create(newReview.id, job_id);
    runBadgeJobs();
    res.json({ review_id: newReview.id });
  } catch (error) {
    console.error('Error saving review:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/badges', (req, res) => {
  runBadgeJobs();
  const all_achievements = achievementModel.getAchivementsAndBadges();
  const completed_achievement_ids = achievementModel.getAchievementsCompleted(req.session.userId);
  const completed_ids = new Set();

  for (let i = 0; i < completed_achievement_ids.length; i++) {
    completed_ids.add(completed_achievement_ids[i].achievement_id);
  }

  let earned_badges = []
  let not_earned_badges = []
  for (let i = 0; i < all_achievements.length; i++) {
    const temp_achiev = all_achievements[i];
    if (completed_ids.has(temp_achiev.achievement_id)) {
      earned_badges.push({
        id: temp_achiev.achievement_id,
        name: temp_achiev.achievement_name,
        description: temp_achiev.achievement_name,
        img_link: temp_achiev.badge_image_link
      });
    } else {
      not_earned_badges.push({
        id: temp_achiev.achievement_id,
        name: temp_achiev.achievement_name,
        description: temp_achiev.achievement_name,
        img_link: temp_achiev.badge_image_link
      });
    }
  }

  res.render('badges', { earned_badges, not_earned_badges });
});

// Display the create job form
app.get('/create-job', isAuthenticated, (req, res) => {
  const jobCategories = jobCategory.getAll();
  const skillCategories = skillCategory.getAll();

  res.render('create-job', {
    error: null,
    success: null,
    jobCategories,
    skillCategories,
    job_categories: [],
    skill_categories: []
  });
});

// Handle job creation
app.post('/create-job', isAuthenticated, (req, res) => {
  const { description, datetime, duration, zipcode, employee_num, job_filled, username, job_categories, skill_categories } = req.body;

  const jobCategories = jobCategory.getAll();
  const skillCategories = skillCategory.getAll();

  // Validate required fields
  if (!description || !datetime || !duration || !zipcode || !employee_num || !username) {
    logger.write(`[INFO] Create job attempt with missing fields`);
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
    // Convert checkbox value (unchecked = undefined, so default to 0)
    const job_filled_value = job_filled ? 1 : 0;
    const job_completed = 0;

    // Validate numeric fields
    const durationNum = parseInt(duration);
    const employeeNum = parseInt(employee_num);
    const user_id = user.getByUsername(username).user_id;

    if (isNaN(durationNum) || durationNum <= 0) {
      logger.write(`[INFO] Create job attempt with invalid duration: ${duration}`);
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
      logger.write(`[INFO] Create job attempt with invalid number of employees: ${employee_num}`);
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
    const newJob = jobContent.create(
      description,
      datetime,
      durationNum,
      zipcode,
      employeeNum,
      job_filled_value,
      job_completed
    );

    const job_id = newJob.id;
    const newEmployerJob = employerJob.create(
      job_id,
      user_id
    );

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
        jobCategoriesByJob.create(job_id, parsedCategoryId);
      }
    });

    selectedSkillCategories.forEach(skillId => {
      const parsedSkillId = parseInt(skillId, 10);
      if (!Number.isNaN(parsedSkillId)) {
        skillCategoriesByJob.create(job_id, parsedSkillId);
      }
    });

    logger.write(`[INFO] New job created with ID: ${newJob.id}`);
    // Render success page
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
    logger.write(`[ERROR] Create job error: ${error.message}`);
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

// Display the current user's schedule and bookings
app.get('/schedule', isAuthenticated, (req, res) => {
  const userId = req.session.userId;
  const scheduledJobs = employerJob.getJobsByEmployerId(userId);
  const bookedJobs = employeeJob.getBookingsByEmployeeId(userId);

  res.render('schedule', {
    scheduledJobs,
    bookedJobs
  });
});

//-------------------------------------------------------
//notification system
app.get('/notifications', isAuthenticated, (req, res) => {
  const userId = req.session.userId;
  const bookingNotifications = [];
  const reviewNotifications = [];

  const myBookings = employeeJob.getBookingsByEmployeeId(userId);

  myBookings.forEach(booking => {
    const jobData = jobContent.getById(booking.job_id);
    if (!jobData) return;

    const reviewIds = jobReview.getAllByJobId(booking.job_id);
    if (reviewIds) {
      reviewIds.forEach(r => {
        const review = reviewContent.getById(r.review_id);
        if (review) {
          const employerLink = employerJob.getById(booking.job_id);
          const employer = employerLink ? user.getById(employerLink.employer_id) : null;
          const employerName = employer ? employer.username : 'Someone';
          reviewNotifications.push({
            type: 'review',
            message: employerName + ' left a review on your job: ' + jobData.description,
            punctuality: review.punctuality,
            quality: review.quality,
            friendliness: review.friendliness,
            comments: review.comments,
            datetime: review.datetime
          });
        }
      });
    }
  });

  const myJobs = employerJob.getJobsByEmployerId(userId);
  myJobs.forEach(job => {
    const jobData = jobContent.getById(job.job_id);
    if (!jobData) return;

    const allBookings = employeeJob.getAll().filter(b => b.job_id === job.job_id);
    allBookings.forEach(b => {
      const booker = user.getById(b.employee_id);
      if (booker) {
        bookingNotifications.push({
          type: 'booking',
          message: booker.username + ' booked your job: ' + jobData.description,
          datetime: jobData.datetime
        });
      }
    });
  });

  const notifications = bookingNotifications.concat(reviewNotifications);
  res.render('notifications', { notifications });
});

// -------------------------------------------------------------------------------------------------------------------
// WebSockets logic for messaging

wss.on('connection', (ws) => {

  ws.on('close', () => {
    connections.removeUser(ws.userId);
    console.log('Client disconnected');
  });

  console.log('New client connected');

  ws.on('message', (message) => {
    const { type, ...payload } = JSON.parse(message.toString()); //otherwise, you will get just the raw bytes

    switch (type) {
      case 'JOIN': {
        const { userId } = payload;
        connections.registerUser(userId, ws);
        ws.userId = userId; //storing this for close

        break;
      }
      case 'SEND_MESSAGE': {
        const { userId, toUserId, content } = payload;

        const toUserSocket = connections.getSocket(toUserId);

        //insert the message into the database
        const messageInfo = messageModel.create(content);
        userMessageModel.create(messageInfo.message_id, userId, toUserId);

        if (toUserSocket) {
          toUserSocket.send(JSON.stringify({ type: "NEW_MESSAGE", content: content, datetime: messageInfo.datetime }));
          console.log("Sent message successfully");
        } else {
          console.log("Message not sent, user is offline");
        }

        break;
      }
      case 'HISTORY': {
        const { userId, toUserId } = payload;
        //load entire history between these 2 and send back to the DOM
        const history = messagingModel.getHistory(userId, toUserId);
        ws.send(JSON.stringify({ type: 'HISTORY_RET', history: history, userId: userId }));
        break;
      }
      case 'DISCONNECT': {
        const { userId } = payload;

        connections.removeUser(userId);
        ws.send("User removed from mapping");
      }
      case 'GET_CONV_IDS': {
        const { userId } = payload;

        const ids = messagingModel.getConversationIds(userId);
        ws.send(JSON.stringify({ type: "RET_CONV_IDS", userId: userId, ids: ids }));
        break;
      }
      case 'GET_USER_ID': {
        const { username } = payload;

        //if we cannot find the user, then return undefined for the userId
        if (!user.getByUsername(username)) {
          ws.send(JSON.stringify({ type: 'RET_USER_ID', userId: undefined }));
        } else {
          ws.send(JSON.stringify({ type: 'RET_USER_ID', userId: user.getByUsername(username).user_id }));
        }

        break;
      }
      default: {
        console.log("oh no");
      }
    }
  });
});

//-----------------------------------------------------------------------------------------------------------------------------------
// setInterval function that checks for end of leaderboard
const INTERVAL = 1000 * 60 * 60; // an hour
badgeInterval = setInterval(runBadgeJobs, INTERVAL);

function runBadgeJobs() {
  //get most recent leaderboard
  const currLeaderboard = leaderboardM.getCurrentLeaderboard();

  if (currLeaderboard) {
    const currDatetime = dateObj.toISOString().replace('T', ' ').slice(0, 19);
    const endDatetime = currLeaderboard.end_time;

    if (currDatetime >= endDatetime) {
      distributeLeaderboardBadges(currLeaderboard)
    }
  };

  // if a user has completed an achievement, add the badge to their profile
  const num_jobs_by_user = achievementModel.getJobsCompleted();
  const num_reviews_written_by_user = achievementModel.getReviewsWritten();
  const num_reviews_received_by_user = achievementModel.getReviewsReceived();

  const achievements = achievementContentModel.getAll();

  //create a map of metrics and what the specific attribute to look at is
  const metricMap = {
    1: { data: num_jobs_by_user, key: 'num_jobs' },
    2: { data: num_reviews_written_by_user, key: 'num_reviews_written' },
    3: { data: num_reviews_received_by_user, key: 'num_reviews_received' },
  };

  achievements.forEach(({ metric_id, required_quantity, badge_id }) => {
    const metric = metricMap[metric_id];
    if (!metric) return;
    metric.data.forEach((user) => {
      //if the user has above the quantity required and doesn't already have the badge, add it
      if (user[metric.key] >= required_quantity && !userBadgeModel.getByIds(user.user_id, badge_id)) {
        userBadgeModel.create(user.user_id, badge_id);
      }
    });
  });
}

function distributeLeaderboardBadges(leaderboard) {
  const badge_id = leaderboard.badge_id;
  const top_5_rating = leaderboardM.getTopKRating(leaderboard.start_time, leaderboard.end_time, 5);
  const top_5_jobs = leaderboardM.getTopKJobs(leaderboard.start_time, leaderboard.end_time, 5);

  top_5_rating.forEach((row) => {
    try {
      userBadgeModel.create(row.user_id, badge_id);
    } catch (e) {
      logger.write(`[WARN] User with user_id ${row.user_id} already has badge with id ${badge_id}, unable to add again`);
      logger.write(e);
    }
  });

  top_5_jobs.forEach((row) => {
    try {
      userBadgeModel.create(row.user_id, badge_id);
    } catch (e) {
      logger.write(`[WARN] User with user_id ${row.user_id} already has badge with id ${badge_id}, unable to add again`);
      logger.write(e);
    }
  });
}

// ----------------------------------------------------------------------------------------------------------------------------------------

async function sendMeetupVerificationEmail(email, code, job_id) {
  try {
    const transporter = await createEmailTransporter();
    const mailOptions = {
      from: process.env.RESET_EMAIL_FROM || 'Paw Patrol <no-reply@pawpatrol.com>',
      to: email,
      subject: 'Paw Patrol Meetup Verification Code',
      text: `Your meetup verification code for job #${job_id} is: ${code}. This code expires in 24 hours.`,
    };
    console.log(JSON.stringify(mailOptions));
    const info = await transporter.sendMail(mailOptions);
    logger.write(`[INFO] Meetup verification email preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    return true;
  } catch (error) {
    logger.write(`[ERROR] Failed to send meetup verification email: ${error.message}`);
    return false;
  }
}
app.post('/booking/:job_id/send-verification', isAuthenticated, async (req, res) => {
  const job_id = req.params.job_id;
  const email = req.session.email;
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  meetupVerification.create(job_id, code, expiresAt);
  await sendMeetupVerificationEmail(email, code, job_id);

  res.json({ success: true, message: 'Verification code sent to your email.' });
});

app.get('/submit_key', isAuthenticated, (req, res) => {
  const job_id = req.query.job_id || '';
  res.render('submit_key', { job_id, error: null, success: null });
});

app.post('/submit_key', isAuthenticated, (req, res) => {
  const { job_id, code } = req.body;
  const entry = meetupVerification.getByJobId(job_id);

  if (!entry) {
    return res.render('submit_key', { job_id, error: 'No verification code found for this job.', success: null });
  }
  if (new Date(entry.expires_at) < new Date()) {
    return res.render('submit_key', { job_id, error: 'Code has expired.', success: null });
  }
  if (entry.code !== code) {
    return res.render('submit_key', { job_id, error: 'Incorrect code. Please try again.', success: null });
  }
  
  //mark as verified
  meetupVerification.markVerified(job_id);

  const jobData = jobContent.getById(job_id);

  //update job to completed status
  jobContent.update(jobData.id, jobData.description, jobData.datetime, jobData.duration, jobData.zipcode, jobData.employeeNum, 1, 1);

  res.render('submit_key', { job_id, error: null, success: 'Meetup verified!' });
});

// --------------------------------------------------------------------------------------------------------------------------------------------------
// handle testing with in-memory database


function initModels(db, log_path = 'requests.log', verbose=true){
  jobContent = new jobContentModel(db);
  jobReview = new jobReviewModel(db);
  reviewContent = new reviewContentModel(db);
  employeeJob = new employeeJobModel(db);
  employerJob = new employerJobModel(db);
  jobSearch = new JobSearchModel(db);
  jobCategory = new jobCategoryModel(db);
  skillCategory = new skillCategoryModel(db);
  user = new userModel(db);
  passwordReset = new passwordResetModel(db);
  securityQuestion = new securityQuestionModel(db);
  userSecurityAnswer = new userSecurityAnswerModel(db);
  skillCategoriesByJob = new skillCategoriesByJobModel(db);
  jobCategoriesByJob = new jobCategoriesByJobModel(db);
  messageModel = new MessageModel(db);
  messagingModel = new MessagingModel(db);
  userMessageModel = new UserMessageModel(db);
  leaderboardContent = new leaderboardContentModel(db);
  leaderboardM = new leaderboardModel(db);
  userBadgeModel = new UserBadgeModel(db);
  badgeContent = new BadgeContentModel(db);
  certificationContent = new CertificationContentModel(db);
  userCertification = new UserCertificationModel(db);
  achievementModel = new AchievementModel(db);
  achievementContentModel = new AchievementContentModel(db);
  meetupVerification = new MeetupVerificationModel(db);
  reviewModel = new ReviewModel(db);


  logger = new Log(log_path, true, verbose);
}


module.exports = app;
module.exports.initModels = initModels;

//if require.main is the current module, then it was from the command line, so run the server from the command line
if (require.main === module) {
  const PORT = 3000;
  const db = connectToDatabase();
  initModels(db);

  // Start the server and make it listen on the specified port.
  // Once the server starts, it logs a message to the console indicating where it is running.
  server.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
    console.log(`Websocket server running on ws://localhost:${PORT}`);
  });

  runBadgeJobs();
}