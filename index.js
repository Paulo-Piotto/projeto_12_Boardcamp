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

app.get('/categories', (req, res) => {
    connection.query("SELECT * FROM categories")
        .then((result) => {
            res.send(result.rows);
        })
})

app.post('/categories', (req, res) => {
    const body = req.body;
    const categorySchema = joi.object({
        name: joi.string().min(1).required()
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


app.get('/games', (req, res) => {
    const queryString = req.query;
    if(!queryString.name){
        connection.query('SELECT games.*, categories.name AS "categoryName" FROM games JOIN categories ON games."categoryId"=categories.id')
            .then((result) => {
                res.send(result.rows);
            })
    }else{
        connection.query('SELECT games.*, categories.name AS "categoryName" FROM games JOIN categories ON games."categoryId"=categories.id WHERE games.name iLIKE $1', [queryString.name+'%'])
            .then((result) => {
                res.send(result.rows);
            })
    }
    
})

app.post('/games', (req, res) => {
    const body = req.body;
    const gameSchema = joi.object({
        name: joi.string().min(1).required(),
        stockTotal: joi.number().positive().required(),
        pricePerDay: joi.number().positive().required(),
        image: joi.string().pattern(/^http:/).required(),
        categoryId: joi.number().positive().required()
    })

    connection.query('SELECT * FROM categories WHERE id = $1', [body.categoryId])
        .then((result) => {
            if(result.rows.length > 0){
                connection.query('SELECT * FROM games WHERE name = $1', [body.name])
                    .then((r) => {
                        if(r.rows[0]){
                            res.sendStatus(409);
                        }else if(!gameSchema.validate(body).error){
                            connection.query('INSERT INTO games (name,image,"stockTotal","categoryId","pricePerDay") VALUES ($1,$2,$3,$4,$5)', [body.name, body.image, body.stockTotal, body.categoryId, body.pricePerDay])
                                .then((result) => {
                                    res.sendStatus(201);
                                })
                        }else{
                            res.sendStatus(400)
                        }
                    })
            }else{
                res.sendStatus(400);
            }
        })

    
})

app.get('/customers', (req, res) => {
    const queryString = req.query;

    if(!queryString.cpf){
        connection.query('SELECT * FROM customers')
            .then((result) => {
                res.send(result.rows);
            })
    }else{
        connection.query('SELECT * FROM customers WHERE customers.cpf LIKE $1', [queryString.cpf+'%'])
            .then((result) => {
                res.send(result.rows);
            })
    }
})


app.get('/customers/:id', (req, res) => {
    const params = req.params;

    connection.query('SELECT * FROM customers WHERE customers.id = $1', [params.id])
        .then((result) => {
            if(result.rows[0]){
                res.send(result.rows[0]);
            }else{
                res.sendStatus(404);
            }
            
        })
   
})



app.post('/customers', (req, res) => {
    const body = req.body;
    const customerSchema = joi.object({
        name: joi.string().min(1).required(),
        cpf:  joi.string().pattern(/(\d{3})(\d{3})(\d{3})(\d{2})/),
        phone: joi.string().pattern(/^[0-9]{10,11}$/).required(),
        birthday: joi.date().greater('1-1-1900').less('now')
    })

    connection.query('SELECT * FROM customers WHERE customers.cpf = $1', [body.cpf])
        .then((result) => {
            if(!result.rows[0]){
                if(!customerSchema.validate(body).error){
                    connection.query('INSERT INTO customers (name,phone,cpf,birthday) VALUES ($1,$2,$3,$4)', [body.name, body.phone, body.cpf, body.birthday])
                        .then((result) => {
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