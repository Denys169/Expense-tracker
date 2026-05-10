const express = require('express');
const cors = require('cors');
const { sql, poolPromise } = require('./db');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.get('/expenses', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM expenses ORDER BY date DESC');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/expenses/:id', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query('SELECT * FROM expenses WHERE id = @id');
        if (result.recordset.length === 0) return res.status(404).json({ error: 'Nie znaleziono wydatku' });
        res.json(result.recordset[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/expenses', async (req, res) => {
    try {
        const { amount, category, date } = req.body;
        const pool = await poolPromise;
        const result = await pool.request()
            .input('amount', sql.Decimal(10, 2), amount)
            .input('category', sql.NVarChar(100), category)
            .input('date', sql.Date, date)
            .query('INSERT INTO expenses (amount, category, date) OUTPUT INSERTED.* VALUES (@amount, @category, @date)');
        res.status(201).json(result.recordset[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/expenses/:id', async (req, res) => {
    try {
        const { amount, category, date } = req.body;
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .input('amount', sql.Decimal(10, 2), amount)
            .input('category', sql.NVarChar(100), category)
            .input('date', sql.Date, date)
            .query('UPDATE expenses SET amount = @amount, category = @category, date = @date WHERE id = @id');
        if (result.rowsAffected[0] === 0) return res.status(404).json({ error: 'Nie znaleziono wydatku' });
        res.json({ id: req.params.id, amount, category, date });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/expenses/:id', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query('DELETE FROM expenses WHERE id = @id');
        if (result.rowsAffected[0] === 0) return res.status(404).json({ error: 'Nie znaleziono wydatku' });
        res.json({ message: 'Usunięto pomyślnie' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Serwer działa na http://localhost:${PORT}`);
});