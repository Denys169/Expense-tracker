const express = require('express');
const cors = require('cors');
const { pool } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/expenses', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM expenses ORDER BY date DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/expenses/:id', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM expenses WHERE id = $1', [req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Nie znaleziono wydatku' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/expenses', async (req, res) => {
    try {
        const { amount, category, date } = req.body;
        const result = await pool.query(
            'INSERT INTO expenses (amount, category, date) VALUES ($1, $2, $3) RETURNING *',
            [amount, category, date]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/expenses/:id', async (req, res) => {
    try {
        const { amount, category, date } = req.body;
        const result = await pool.query(
            'UPDATE expenses SET amount = $1, category = $2, date = $3 WHERE id = $4 RETURNING *',
            [amount, category, date, req.params.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Nie znaleziono wydatku' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/expenses/:id', async (req, res) => {
    try {
        const result = await pool.query('DELETE FROM expenses WHERE id = $1 RETURNING *', [req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Nie znaleziono wydatku' });
        res.json({ message: 'Usunięto pomyślnie' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Serwer działa na http://localhost:${PORT}`);
});