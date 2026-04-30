const bookJobButton = document.getElementById('book-job-button');

if (bookJobButton) {
    bookJobButton.addEventListener("click", async (event) => {
        const jobId = event.target.dataset.job_id;

        try {
            const response = await fetch(`/booking/${jobId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({})
            });

            const result = await response.json();

            if (result.success) {
                alert(result.message);
            } else {
                alert('Error: ' + result.message);
            }
        } catch (error) {
            alert('Failed to book job. Please try again.');
        }
    });
} else {
    console.error('Button not found');
}
