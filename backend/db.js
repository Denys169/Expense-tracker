const sql = require('mssql');

const config = {
    server: 'localhost',
    database: 'expense_tracker',
    user: 'sa',
    password: 'Admin123',
    options: {
        encrypt: false,
        trustServerCertificate: true,
        enableArithAbort: true
    },
    port: 1433
};

const poolPromise = new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
        console.log('Połączono z SQL Server');
        return pool;
    })
    .catch(err => {
        console.error('Błąd połączenia z bazą:', err);
        throw err;
    });

module.exports = { sql, poolPromise };