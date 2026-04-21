// Handles star ratings and form submission.
 
// Stores the current rating for each of the 3 categories.
// 0 means "not yet rated".
var ratings = {
  punctuality: 0,
  quality: 0,
  friendliness: 0
};
 
// Selects every radio input inside a .stars container.
document.querySelectorAll('.stars input[type="radio"]').forEach(function (input) {
  input.addEventListener('change', function () {
    // this.name is "punctuality", "quality", or "friendliness"
    // this.value is the star number 1–5 (comes in as a string, so parse it)
    ratings[this.name] = parseInt(this.value);
  });
});
 
// Form submission
document.getElementById('review-form').addEventListener('submit', function (e) {
  e.preventDefault(); // stop the browser from doing a full page reload
 
  // Validate: all three categories must be rated before submitting
  if (ratings.punctuality === 0 || ratings.quality === 0 || ratings.friendliness === 0) {
    document.getElementById('error-msg').style.display = 'block';
    return;
  }
  document.getElementById('error-msg').style.display = 'none';
 
  // Read job_id from the hidden input rather than hardcoding it
  var jobId = parseInt(document.getElementById('job_id').value);
 
  // Build the payload to send to the backend
  var reviewData = {
    job_id: jobId,
    punctuality: ratings.punctuality,
    quality: ratings.quality,
    friendliness: ratings.friendliness,
    comments: document.getElementById('comments').value,
    verified: false   // stays false until the job-verification step
  };
 
  // Send to the Express backend as JSON
  fetch('/api/reviews', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reviewData)
  })
    .then(function (response) {
      if (!response.ok) { throw new Error('Server error: ' + response.status); }
      return response.json();
    })
    .then(function (data) {
      console.log('Review saved with ID:', data.review_id);
      // Hide the form and show the success message
      document.getElementById('review-form').style.display = 'none';
      document.getElementById('success').style.display = 'block';
    })
    .catch(function (err) {
      alert('Something went wrong. Please try again.');
      console.error(err);
    });
});