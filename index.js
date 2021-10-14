import pg from 'pg';
import express from 'express';
import cors from 'cors';
import joi from 'joi';

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

app.post('/categorias', (req, res) => {
    const body = req.body;
    const categorySchema = joi.object({
        name: joi.string().required()
    })

    connection.query("SELECT * FROM categories WHERE name = $1", [req.body.name])
        .then((result) => {
            if(result.rows.length === 0){
                if(!categorySchema.validate(body).error){
                    connection.query("INSERT INTO categories (name) VALUES ($1)", [req.body.name])
                        .then(() => {
                            res.sendStatus(201);
                        })
                }else{
                    res.sendStatus(400);
                }  
            }else{
                res.sendStatus(409);
            }
        })
})


app.listen(4000);