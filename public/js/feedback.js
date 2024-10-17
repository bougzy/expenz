$(document).ready(function () {
    $('#feedbackForm').submit(function (e) {
        e.preventDefault();
        const email = $('#userEmail').val();
        const feedback = $('#feedback').val();

        $.post('/api/feedback', { email, feedback }, function (data) {
            alert(data.message);
            if (data.success) {
                $('#feedbackForm')[0].reset(); // Reset the form after submission
            }
        });
    });
});
