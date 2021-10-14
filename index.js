import pg from 'pg';
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const { Pool } = pg;

const connection = new Pool({
    user: 'bootcamp_role',
    password: 'senha_super_hiper_ultra_secreta_do_role_do_bootcamp',
    host: 'localhost',
    port: 5432,
    database: 'boardcamp'
});

app.get('/categorias', (req, res) => {
    connection.query("SELECT * FROM categories")
        .then((result) => {
            res.send(result.rows);
        })
})


app.listen(4000);