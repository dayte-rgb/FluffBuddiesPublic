// Import the Express module, which is a framework for building web applications in Node.js.
require('dotenv').config();
const express = require('express');
const path = require('path');
const Log = require('./tools/log.js');
const { start } = require('repl');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const logger = new Log('requests.log', true);
const dateObj = new Date();

// Session and authentication imports
const { sessionMiddleware } = require('./config/sessionConfig.js');
const { isAuthenticated, isNotAuthenticated } = require('./middleware/authMiddleware.js');

const http = require('http');
const WebSocket = require('ws');

const jobContentModel = require('./models/jobContentModel');
const jobContent = new jobContentModel();
const jobReviewModel = require('./models/jobReviewModel.js');
const jobReview = new jobReviewModel();
const reviewContentModel = require('./models/reviewContentModel.js');
const reviewContent = new reviewContentModel();
const employeeJobModel = require('./models/employeeJobModel');
const employeeJob = new employeeJobModel();
const employerJobModel = require('./models/employerJobModel');
const employerJob = new employerJobModel();
const JobSearchModel = require('./models/jobSearchModel.js');
const jobSearch = new JobSearchModel();
const jobCategoryModel = require('./models/jobCategoryModel');
const jobCategory = new jobCategoryModel();
const skillCategoryModel = require('./models/skillCategoryModel');
const skillCategory = new skillCategoryModel();
const userModel = require('./models/userModel.js');
const user = new userModel();
const passwordResetModel = require('./models/passwordResetModel.js');
const passwordReset = new passwordResetModel();
const securityQuestionModel = require('./models/securityQuestionModel.js');
const securityQuestion = new securityQuestionModel();
const userSecurityAnswerModel = require('./models/userSecurityAnswerModel.js');
const userSecurityAnswer = new userSecurityAnswerModel();
const skillCategoriesByJobModel = require('./models/skillCategoriesByJobModel.js');
const skillCategoriesByJob = new skillCategoriesByJobModel();
const jobCategoriesByJobModel = require('./models/jobCategoriesByJobModel.js');
const jobCategoriesByJob = new jobCategoriesByJobModel();
const MessageModel = require('./models/messageContentModel.js');
const MessagingModel = require('./models/messagingModel.js');
const UserMessageModel = require('./models/userMessageModel.js');
const connections = require('./socket_connections.js');
const messageModel = new MessageModel();
const messagingModel = new MessagingModel();
const userMessageModel = new UserMessageModel();
const leaderboardContentModel = require('./models/leaderboardContentModel.js');
const leaderboardContent = new leaderboardContentModel();
const leaderboardModel = require('./models/leaderboardModel.js');
const leaderboardM = new leaderboardModel();
const UserBadgeModel = require('./models/userBadgeModel.js');
const userBadgeModel = new UserBadgeModel();
const BadgeContentModel = require('./models/badgeContentModel.js');
const badgeContent = new BadgeContentModel();
const CertificationContentModel = require('./models/certificationContentModel.js');
const certificationContent = new CertificationContentModel();
const UserCertificationModel = require('./models/userCertificationModel.js');
const userCertification = new UserCertificationModel();
const AchievementModel = require('./models/achievementModel.js');
const achievementModel = new AchievementModel();
const AchievementContentModel = require('./models/achievementContentModel.js');
const achievementContentModel = new AchievementContentModel();

// Create an instance of an Express application. This app object will be used to define routes and middleware.
const app = express();

// create websockets server
const server = http.createServer(app);
const wss = new WebSocket.Server({ server }); // attach to same server

// Define a constant for the port number on which the server will listen.
const PORT = process.env.PORT || 3000;

// Middleware for parsing HTTP responses
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session middleware
app.use(sessionMiddleware);

// Pass session data to all views
app.use((req, res, next) => {
  res.locals.user = req.session ? req.session : null;
  next();
});

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

app.get('/profile', isAuthenticated, (req, res) => {
  const userId = req.session.userId;
  const userData = user.getById(userId);

  if (!userData) {
    return res.redirect('/login');
  }

  // Get jobs completed count
  const jobsCompleted = achievementModel.getJobsCompleted()
    .find(row => row.user_id === userId);
  const numJobs = jobsCompleted ? jobsCompleted.num_jobs : 0;

  // Get reviews received
  const reviewsReceived = achievementModel.getReviewsReceived()
    .find(row => row.user_id === userId);
  const numReviews = reviewsReceived ? reviewsReceived.num_reviews_received : 0;

  // Get earned badges
  const allUserBadges = userBadgeModel.getAll()
    .filter(row => row.user_id === userId);
  const earnedBadges = allUserBadges.map(ub => badgeContent.getById(ub.badge_id)).filter(Boolean);

  // Get achievements
  const allAchievements = achievementContentModel.getAll();

  // Get certifications
  const allUserCerts = userCertification.getAll()
    .filter(row => row.user_id === userId);
  const certs = allUserCerts.map(uc => certificationContent.getById(uc.certification_id)).filter(Boolean);

  res.render('profile', {
    userData,
    numJobs,
    numReviews,
    earnedBadges,
    allAchievements,
    certs
  });
});

// Displays job search query page
app.get('/job-search', isAuthenticated, (req, res) => {
  const jobCategories = jobCategory.getAll();
  const skillCategories = skillCategory.getAll();

  res.render('job-search', { jobCategories, skillCategories, results: null, searchParams: null });
});

// Handles execution of search query
app.post('/job-search', isAuthenticated, (req, res) => {
  let { zipcode, keyword, job_categories, skill_categories } = req.body;

  let results = jobSearch.getAllMatchedJobs(zipcode || null, keyword || null, skill_categories || null, job_categories || null);

  const jobCategories = jobCategory.getAll();
  const skillCategories = skillCategory.getAll();

  res.render('job-search', { jobCategories, skillCategories, results, searchParams: { zipcode, keyword, job_categories, skill_categories } });
});

// Display a page with details of a selected job listing
app.get('/booking/:job_id', isAuthenticated, async (req, res) => {
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

    employeeJob.create(job_id, employee_id);
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
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
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
  if (!username || !email || !password || !phone_number || !zipcode || !account_type || !security_question_id || !security_answer) {
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
    const hashedAnswer = await bcrypt.hash(security_answer, 10);

    // Create security answer
    userSecurityAnswer.create(newUser.id, security_question_id, hashedAnswer);

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

app.get('/inbox', (req, res) => {
  res.status(200);
  res.render('messaging', {userId: req.session.userId});
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

app.get('/review-test', (req, res) => {
  res.render('review', {
    worker_name: 'Rex',
    job_title: 'Dog Walking',
    job_date: '2025-04-01',
    job_id: 99  // changed from 1 to 99
  });
});

function write_res_log(res){
  logger.write(`[INFO] Returned Status Code: ${res.statusCode}`);
  return;
}

app.post('/api/reviews', isAuthenticated, (req, res) => {
  const { job_id, punctuality, quality, friendliness, comments } = req.body;

  try {
    const newReview = reviewContent.create(punctuality, quality, friendliness, comments, new Date().toISOString(), 0);
    res.json({ review_id: newReview.id });
  } catch (error) {
    console.error('Error saving review:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/badges', (req, res) => {
  const ALL_BADGES = [
    { id: 'first_job', name: 'First Step', description: 'Complete your first job', icon: 'fa-solid fa-paw', color: '#f48b48' },
    { id: 'five_jobs', name: 'Rising Paw', description: 'Complete 5 jobs', icon: 'fa-solid fa-star', color: '#f4c448' },
    { id: 'ten_jobs', name: 'All Star', description: 'Complete 10 jobs', icon: 'fa-solid fa-crown', color: '#a855f7' },
    { id: 'twenty_five_jobs', name: 'Legend', description: 'Complete 25 jobs', icon: 'fa-solid fa-trophy', color: '#e87722' },
    { id: 'five_star', name: 'Star Player', description: 'Receive a 5-star rating', icon: 'fa-solid fa-medal', color: '#3b82f6' },
    { id: 'first_review', name: 'Critic', description: 'Leave your first review', icon: 'fa-solid fa-comment', color: '#10b981' },
    { id: 'streak_5', name: 'On a Roll', description: 'Complete 5 jobs in a row', icon: 'fa-solid fa-fire', color: '#ef4444' },
    { id: 'streak_10', name: 'Unstoppable', description: 'Complete 10 jobs in a row', icon: 'fa-solid fa-bolt', color: '#f97316' },
    { id: 'top_leaderboard', name: 'Top of The Pack', description: 'Reach #1 on the leaderboard', icon: 'fa-solid fa-crown', color: '#f4c030' },
    { id: 'first_booking', name: 'First Booking', description: 'Make your first booking', icon: 'fa-solid fa-handshake', color: '#06b6d4' },
    { id: 'most_jobs_month', name: 'Hustler', description: 'Most jobs completed in a month', icon: 'fa-solid fa-calendar-check', color: '#8b5cf6' },
];

  const userJobCount = 3;
  const userEarnedIds = [];
  if (userJobCount >= 1) userEarnedIds.push('first_job');
  if (userJobCount >= 5) userEarnedIds.push('five_jobs');
  if (userJobCount >= 10) userEarnedIds.push('ten_jobs');
  if (userJobCount >= 25) userEarnedIds.push('twenty_five_jobs');

  const earnedBadges = ALL_BADGES.filter(b => userEarnedIds.includes(b.id));
  const lockedBadges = ALL_BADGES.filter(b => !userEarnedIds.includes(b.id));

  res.render('badges', { earnedBadges, lockedBadges });
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

// -------------------------------------------------------------------------------------------------------------------
// WebSockets logic for messaging

wss.on('connection', (ws) => {

    ws.on('close', () => {
      connections.removeUser(ws.userId);
      console.log('Client disconnected');
    });

    console.log('New client connected');

    ws.on('message', (message) => {
        const {type, ...payload} = JSON.parse(message.toString()); //otherwise, you will get just the raw bytes
        
        switch(type) {
            case 'JOIN': {
                const {userId} = payload;
                connections.registerUser(userId, ws);
                ws.userId = userId; //storing this for close
                console.log("User successfully joined the map");

                break;
            }
            case 'SEND_MESSAGE':{
                const {userId, toUserId, content} = payload;

                const toUserSocket = connections.getSocket(toUserId);

                //insert the message into the database
                const messageInfo = messageModel.create(content);
                userMessageModel.create(messageInfo.message_id, userId, toUserId);

                if(toUserSocket){
                    toUserSocket.send(JSON.stringify({type: "NEW_MESSAGE", content: content, datetime: messageInfo.datetime}));
                    console.log("Sent message successfully");
                } else{
                    console.log("Message not sent, user is offline");
                }

                break;
            }
            case 'HISTORY':{
                const {userId, toUserId} = payload;
                //load entire history between these 2 and send back to the DOM
                const history = messagingModel.getHistory(userId, toUserId);
                ws.send(JSON.stringify({type: 'HISTORY_RET', history: history, userId: userId}));
                break;
            }
            case 'DISCONNECT': {
                const {userId} = payload;

                connections.removeUser(userId);
                ws.send("User removed from mapping");
            }
            case 'GET_CONV_IDS': {
                const {userId} = payload;

                const ids = messagingModel.getConversationIds(userId);
                ws.send(JSON.stringify({type: "RET_CONV_IDS", userId: userId, ids: ids}));
                break;
            }
            case 'GET_USER_ID': {
                const {username} = payload;
                ws.send(JSON.stringify({type: 'RET_USER_ID', userId: user.getByUsername(username).user_id}));
                break;
            }
            default: {
                console.log("oh no");
            }
        }

        ws.send(`Interaction complete`);
    });
});

//-----------------------------------------------------------------------------------------------------------------------------------
// setInterval function that checks for end of leaderboard
const INTERVAL = 1000 * 60 * 60; // an hour
setInterval(runBadgeJobs, INTERVAL);

function runBadgeJobs() {
//get most recent leaderboard
  const currLeaderboard = leaderboardM.getCurrentLeaderboard();

  if(currLeaderboard){
    const currDatetime = dateObj.toISOString().replace('T', ' ').slice(0, 19);
    const endDatetime = currLeaderboard.end_time;

    if(currDatetime >= endDatetime){
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
    1: { data: num_jobs_by_user,            key: 'num_jobs' },
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

function distributeLeaderboardBadges(leaderboard){
  const badge_id = leaderboard.badge_id;
  const top_5_rating = leaderboardM.getTopKRating(leaderboard.start_time, leaderboard.end_time, 5);
  const top_5_jobs = leaderboardM.getTopKJobs(leaderboard.start_time, leaderboard.end_time, 5);

  top_5_rating.forEach((row) => {
    try{
      userBadgeModel.create(row.user_id, badge_id);
    }catch(e){
      logger.write(`[WARN] User with user_id ${row.user_id} already has badge with id ${badge_id}, unable to add again`);
      logger.write(e);
    }
  });

  top_5_jobs.forEach((row) => {
    try{
      userBadgeModel.create(row.user_id, badge_id);
    }catch(e){
      logger.write(`[WARN] User with user_id ${row.user_id} already has badge with id ${badge_id}, unable to add again`);
      logger.write(e);
    }
  });
}

// run the jobs functions on startup
runBadgeJobs();


// Start the server and make it listen on the specified port.
// Once the server starts, it logs a message to the console indicating where it is running.
server.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
  console.log(`Websocket server running on ws://localhost:${PORT}`);
});