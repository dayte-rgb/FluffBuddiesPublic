# Test Suite for Fluff Buddies Job Platform

This test suite covers the core functionality of the Fluff Buddies pet care job platform, including job searching, job creation, job booking, and schedule management.

## Test Coverage

### Job Search Tests (`tests/jobSearch.test.js`)
- **GET /job-search**: Renders job search page with categories
- **Authentication**: Ensures routes require authentication
- **POST /job-search**: Handles various search parameters:
  - Full search with zipcode, keyword, job categories, and skill categories
  - Minimal search parameters
  - Search by zipcode only
  - Search by keyword only
  - Search by job categories only
  - Search by skill categories only

### Job Creation Tests (`tests/jobCreation.test.js`)
- **GET /create-job**: Renders job creation page with categories
- **POST /create-job**: Validates and creates jobs:
  - Successful job creation with valid data
  - Validation of required fields
  - Validation of numeric fields (duration, employee count)
  - Handling of job_filled checkbox
  - Support for multiple job categories
  - Support for multiple skill categories
  - Support for single category selections

### Job Booking Tests (`tests/jobBooking.test.js`)
- **GET /booking/:job_id**: Displays job details and reviews
- **POST /booking/:job_id**: Handles job bookings:
  - Successful job booking
  - Prevention of booking non-existent jobs
  - Prevention of booking own jobs
  - Prevention of double booking
  - Error handling for database issues

### Schedule Tests (`tests/schedule.test.js`)
- **GET /schedule**: Displays user schedule with jobs and bookings:
  - Shows scheduled jobs (jobs created by user)
  - Shows booked jobs (jobs user has applied for)
  - Handles users with no scheduled jobs
  - Handles users with no booked jobs
  - Handles users with no jobs or bookings
  - Displays correct job and employer information

## Running the Tests

### Prerequisites
- Node.js installed
- Dependencies installed: `npm install`

### Run All Tests
```bash
npm test
```

### Run Specific Test Files
```bash
npx jest tests/jobSearch.test.js
npx jest tests/jobCreation.test.js
npx jest tests/jobBooking.test.js
npx jest tests/schedule.test.js
```

### Run Tests with Detailed Output
```bash
npx jest --verbose
```

## Test Structure

Each test file follows a consistent structure:
- **Mocking**: Database connections and model classes are mocked to isolate unit tests
- **Route Testing**: Express routes are tested using Supertest
- **Authentication**: Mock authentication middleware simulates logged-in users
- **Validation**: Tests cover both successful operations and error conditions
- **Edge Cases**: Tests handle various input combinations and boundary conditions

## Test Results

All 34 tests pass, covering:
- 8 job search scenarios
- 8 job creation scenarios
- 7 job booking scenarios
- 9 schedule scenarios
- 1 existing user model test

The test suite provides comprehensive coverage of the job platform's core functionality, ensuring reliability and preventing regressions.