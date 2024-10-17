$(document).ready(function () {
    // Fetch deposit requests
    function fetchDeposits() {
        $.get('/api/admin/deposits', function (data) {
            const deposits = data.deposits;
            deposits.forEach(deposit => {
                $('#depositRequests').append(`
                    <tr>
                        <td>${deposit.user}</td>
                        <td>${deposit.amount}</td>
                        <td>${deposit.plan}</td>
                        <td>${deposit.status}</td>
                        <td><button class="btn btn-success approve" data-id="${deposit._id}">Approve</button></td>
                    </tr>
                `);
            });
        });
    }

    // Fetch withdrawal requests
    function fetchWithdrawals() {
        $.get('/api/admin/withdrawals', function (data) {
            const withdrawals = data.withdrawals;
            withdrawals.forEach(withdrawal => {
                $('#withdrawRequests').append(`
                    <tr>
                        <td>${withdrawal.user}</td>
                        <td>${withdrawal.amount}</td>
                        <td>${withdrawal.walletAddress}</td>
                        <td>${withdrawal.status}</td>
                        <td><button class="btn btn-success approve" data-id="${withdrawal._id}">Approve</button></td>
                    </tr>
                `);
            });
        });
    }

    // Event listener for approve buttons
    $(document).on('click', '.approve', function () {
        const id = $(this).data('id');
        $.post(`/api/admin/approve/${id}`, function (data) {
            alert(data.message);
            if (data.success) {
                location.reload(); // Refresh the page to see changes
            }
        });
    });

    // Fetch data on page load
    fetchDeposits();
    fetchWithdrawals();
});
