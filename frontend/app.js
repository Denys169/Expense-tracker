const API_URL = 'http://localhost:3000/expenses';

const form = document.getElementById('expenseForm');
const expensesList = document.getElementById('expensesList');
const totalEl = document.getElementById('total');
const formTitle = document.getElementById('formTitle');
const submitBtn = document.getElementById('submitBtn');
const cancelBtn = document.getElementById('cancelBtn');

async function loadExpenses() {
    try {
        const res = await fetch(API_URL);
        const expenses = await res.json();
        renderExpenses(expenses);
        updateTotal(expenses);
    } catch (err) {
        alert('Błąd podczas ładowania wydatków');
    }
}

function renderExpenses(expenses) {
    expensesList.innerHTML = '';
    if (expenses.length === 0) {
        expensesList.innerHTML = '<tr><td colspan="5" class="text-center text-muted">Brak wydatków</td></tr>';
        return;
    }
    expenses.forEach(exp => {
        const date = new Date(exp.date).toLocaleDateString('pl-PL');
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${exp.id}</td>
            <td>${parseFloat(exp.amount).toFixed(2)} zł</td>
            <td>${exp.category}</td>
            <td>${date}</td>
            <td class="text-end">
                <button class="btn btn-sm btn-warning me-2" onclick="editExpense(${exp.id})">Edytuj</button>
                <button class="btn btn-sm btn-danger" onclick="deleteExpense(${exp.id})">Usuń</button>
            </td>
        `;
        expensesList.appendChild(row);
    });
}

function updateTotal(expenses) {
    const total = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
    totalEl.textContent = `${total.toFixed(2)} zł`;
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('expenseId').value;
    const data = {
        amount: parseFloat(document.getElementById('amount').value),
        category: document.getElementById('category').value,
        date: document.getElementById('date').value
    };

    try {
        if (id) {
            await fetch(`${API_URL}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        } else {
            await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        }
        resetForm();
        loadExpenses();
    } catch (err) {
        alert('Błąd podczas zapisywania');
    }
});

async function editExpense(id) {
    try {
        const res = await fetch(`${API_URL}/${id}`);
        const exp = await res.json();
        document.getElementById('expenseId').value = exp.id;
        document.getElementById('amount').value = exp.amount;
        document.getElementById('category').value = exp.category;
        document.getElementById('date').value = exp.date.split('T')[0];
        formTitle.textContent = 'Edytuj wydatek';
        submitBtn.textContent = 'Zapisz zmiany';
        cancelBtn.classList.remove('d-none');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
        alert('Błąd podczas ładowania wydatku');
    }
}

async function deleteExpense(id) {
    if (!confirm('Czy na pewno chcesz usunąć ten wydatek?')) return;
    try {
        await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        loadExpenses();
    } catch (err) {
        alert('Błąd podczas usuwania');
    }
}

cancelBtn.addEventListener('click', resetForm);

function resetForm() {
    form.reset();
    document.getElementById('expenseId').value = '';
    formTitle.textContent = 'Dodaj nowy wydatek';
    submitBtn.textContent = 'Dodaj';
    cancelBtn.classList.add('d-none');
}

loadExpenses();