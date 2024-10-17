// transactions.js

async function fetchUserData() {
    const token = localStorage.getItem('token');

    const response = await fetch('/api/users/me', {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (response.ok) {
        const user = await response.json();
        document.getElementById('userName').textContent = user.name;
        document.getElementById('balance').textContent = user.balance.toFixed(2);
        loadTransactions();
    } else {
        alert('Failed to fetch user data');
    }
}

async function loadTransactions() {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/transactions', {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (response.ok) {
        const transactions = await response.json();
        const transactionList = document.getElementById('transactionList');
        transactionList.innerHTML = '';

        transactions.forEach(transaction => {
            const li = document.createElement('li');
            li.className = 'list-group-item';
            li.textContent = `${transaction.type}: $${transaction.amount.toFixed(2)}`;
            transactionList.appendChild(li);
        });
    } else {
        alert('Failed to load transactions');
    }
}

document.getElementById('depositForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const amount = document.getElementById('amount').value;

    const response = await fetch('/api/transactions/deposit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ amount }),
    });

    if (response.ok) {
        alert('Deposit successful');
        loadTransactions();
    } else {
        alert('Deposit failed');
    }
});

document.getElementById('withdrawForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const amount = document.getElementById('withdrawAmount').value;

    const response = await fetch('/api/transactions/withdraw', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ amount }),
    });

    if (response.ok) {
        alert('Withdrawal successful');
        loadTransactions();
    } else {
        alert('Withdrawal failed');
    }
});

window.onload = fetchUserData;
