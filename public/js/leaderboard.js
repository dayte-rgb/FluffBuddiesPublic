// Handles sort button clicks and re-orders the leaderboard table client-side.
// Row data comes from data-rating and data-jobs attributes set by the EJS.

var btnRating = document.getElementById('btn-rating');
var btnJobs   = document.getElementById('btn-jobs');
var tbody     = document.getElementById('leaderboard-body');

function sortTable(metric) {
  var rows = Array.from(tbody.querySelectorAll('tr[data-worker]'));

  rows.sort(function (a, b) {
    var aVal = parseFloat(a.dataset[metric]) || 0;
    var bVal = parseFloat(b.dataset[metric]) || 0;
    return bVal - aVal;
  });

  var medals = ['🥇', '🥈', '🥉'];
  rows.forEach(function (row, index) {
    row.querySelector('.rank').textContent = index < 3 ? medals[index] : index + 1;
    tbody.appendChild(row);
  });

  btnRating.classList.toggle('active', metric === 'rating');
  btnJobs.classList.toggle('active', metric === 'jobs');
}

btnRating.addEventListener('click', function () { sortTable('rating'); });
btnJobs.addEventListener('click',   function () { sortTable('jobs');   });

sortTable('rating');