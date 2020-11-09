const express = require('express')
const bodyParser = require('body-parser');
const mysql = require('mysql')
const cors = require('cors')
const app = express()
const port = 1022

class User {
    static has(db, login) {
        db.query(`SELECT * FROM users WHERE login = '${login}'`, function (err, result) {
            if (err) throw err;

            if (!result) return false
            else return true
        })
    }
}

db = mysql.createConnection({
    host: "93.170.76.100",
    user: "root",
    password: "Ui5CA8MHr0lF",
    database: "market"
});

app.use(cors())
app.use(bodyParser.json()); 

app.post('/api.user.login', (req, res) => {
    const user = req.body

    if (!user.login || !user.password) {
        res.json({
            inform:"Data of user does not exists",
            type: "400"
        })
    }
    else {
        db.query(`SELECT * FROM users WHERE login = '${user.login}'`, function (err, result) {
            console.log(user.password);
            console.log(result);
            if(result[0] && user.password === result[0]["password"]) {
                db.query(`UPDATE users SET hash = '${user.hash}' WHERE login = '${user.login}'`, function (err, result) {
                    res.json({
                        inform:"Добро пожаловать",
                        logged: 1
                    })
                })
            }
            else {
                res.json({
                    inform:"Пользователь не найден",
                    logged: 0
                })
            }
        })
    }
})

function hashUser(hash) {
    return new Promise(resolve => {
        db.query(`SELECT * FROM users WHERE hash = '${hash}'`, function (err, result) {
            console.log('Доступ разрешен для ', result[0].login);
            if(result[0] && hash === result[0]["hash"]) {
                resolve({...result[0], logged: 1})
            }
            else {
                resolve({
                    inform:"Hash was thrown",
                    logged: 0
                })
            }
        })
    })
}

app.post('/api.user.get', async (req, res) => {
    const user = req.body
    if (!user.hash) {
        res.json({inform:"Hash does not exists",logged: 0})
    }
    else {
        hashUser(user.hash).then(data => {
            res.json(data)
        })
    }
})

app.post('/api.item.edit', (req, res) => {
    req = req.body
    if (!req.hash) {
        res.json({inform:"Hash does not exists",logged: 0})  
    }
    else {
        const params = [];
        params.push(`name = '${req.name}',`)
        params.push(`price = ${req.price},`)
        params.push(`category_id = ${req.category_id},`)
        params.push(`image = '${req.img}',`)
        params.push(`count = ${req.count},`)
        params.push(`description = '${req.description}'`)
        const query = `UPDATE items SET ${params.join(' ')} WHERE id = ${req.id}`
        console.log(query);

        db.query(query, async function (err, result) {
            if (err) throw err
            console.log(result);
            const valid = await hashUser(req.hash)
            if (valid.logged) {
                res.json({logged: 1, ...result})
            }
            else {
                res.json({
                    inform:"Hash is wrong",
                    logged: 0
                })
            }
        })
    }
})

app.post('/api.item.get', (req, res) => {
    req = req.body
    if (!req.hash) {
        res.json({inform:"Hash does not exists",logged: 0})  
    }
    else {
        db.query(`SELECT * FROM items WHERE id = ${req.id}`, async function (err, result) {
            if (err) throw err
            const valid = await hashUser(req.hash)
            if (result.length !== 0 && valid.logged) {
                res.json({logged: 1, ...result[0]})
            }
            else if (!valid.logged) {
                res.json({
                    inform:"Hash is wrong",
                    logged: 0
                })
            }
            else {
                res.json({
                    inform:"Post is not defined",
                    logged: 1
                })
            }
        })
    }
})

app.post('/api.item.remove', (req, res) => {
    req = req.body
    if (!req.hash) {
        res.json({inform:"Hash does not exists",logged: 0})  
    }
    else {
        db.query(`DELETE FROM items WHERE id = ${req.id}`, async function (err, result) {
            if (err) throw err
            const valid = await hashUser(req.hash)
            if (result.length !== 0 && valid.logged) {
                res.json({logged: 1, ...result[0]})
            }
            else if (!valid.logged) {
                res.json({
                    inform:"Hash is wrong",
                    logged: 0
                })
            }
            else {
                res.json({
                    inform:"Post is not defined",
                    logged: 1
                })
            }
        })
    }
})

app.post('/api.items.get', (req, res) => {
    req = req.body
    if (!req.hash) {
        res.json({inform:"Hash does not exists",logged: 0})  
    }

    else {
        db.query(`SELECT * FROM items`, async function (err, result) {
            const valid = await hashUser(req.hash)
            if (valid.logged) {
                res.json({logged: 1, ...result})
            }
            else {
                res.json({
                    inform:"Hash is wrong",
                    logged: 0
                })
            }
        })
    }
})

app.post('/api.item.add', async (req, res) => {
    req = req.body
    if (!req.hash) {
        res.json({inform:"Hash does not exists",logged: 0})  
    }
    else {
        console.log('ITEM ADD ',req);
        const valid = await hashUser(req.hash)
        if (valid.logged) {
            db.query(`INSERT INTO items (name, price, category_id, image, count, description) VALUES ('${req.name}',${req.price},${req.category_id},'${req.img}', ${req.count}, '${req.description}')`, function (err, result) {
                if (err) {
                    console.log(err);
                    res.json({logged: 1, inform: 'Ошибка SQL запроса'})
                }
                else {
                    res.json({logged: 1, inform:"Item successfully has been added"})
                }
            })
        }
        else {
            res.json({
                inform:"Hash is wrong",
                logged: 0
            })
        }
    }
})

app.post('/api.categories.get', (req, res) => {
    req = req.body
    if (!req.hash) {
        res.json({inform:"Hash does not exists",logged: 0})  
    }

    else {
        db.query(`SELECT * FROM categories`, async function (err, result) {
            const valid = await hashUser(req.hash)
            if (valid.logged) {
                res.json({logged: 1, ...result})
            }
            else {
                res.json({
                    inform:"Hash is wrong",
                    logged: 0
                })
            }
        })
    }
})

app.post('/api.category.add', async (req, res) => {
    req = req.body
    if (!req.hash) {
        res.json({inform:"Hash does not exists",logged: 0})  
    }
    else {
        console.log('CATEGORY ADD ',req);
        const valid = await hashUser(req.hash)
        if (valid.logged) {
            db.query(`INSERT INTO categories (name, parent_id, description) VALUES ('${req.name}',${req.parent_id},'${req.description}')`, function (err, result) {
                if (err) {
                    console.log(err);
                    res.json({logged: 1, inform: 'Ошибка SQL запроса'})
                }
                else {
                    res.json({logged: 1, inform:"Category successfully has been added"})
                }
            })
        }
        else {
            res.json({
                inform:"Hash is wrong",
                logged: 0
            })
        }
    }
})

app.post('/api.category.get', (req, res) => {
    req = req.body
    if (!req.hash) {
        res.json({inform:"Hash does not exists",logged: 0})  
    }
    else {
        db.query(`SELECT * FROM categories WHERE category_id = ${req.id}`, async function (err, result) {
            if (err) throw err
            const valid = await hashUser(req.hash)
            if (result.length !== 0 && valid.logged) {
                res.json({logged: 1, ...result[0]})
            }
            else if (!valid.logged) {
                res.json({
                    inform:"Hash is wrong",
                    logged: 0
                })
            }
            else {
                res.json({
                    inform:"Post is not defined",
                    logged: 1
                })
            }
        })
    }
})

app.post('/api.category.edit', async (req, res) => {
    req = req.body
    if (!req.hash) {
        res.json({inform:"Hash does not exists",logged: 0})  
    }
    else {
        console.log('CATEGORY ADD ',req);
        const valid = await hashUser(req.hash)
        if (valid.logged) {
            const params = []
            params.push(`parent_id = ${req.parent_id},`)
            params.push(`name = '${req.name}',`)
            params.push(`description = '${req.description}'`)
            const query = `UPDATE categories SET ${params.join(' ')} WHERE category_id = ${req.id}`

            db.query(query, function (err, result) {
                if (err) {
                    console.log(err);
                    res.json({logged: 1, inform: 'Ошибка SQL запроса'})
                }
                else {
                    res.json({logged: 1, inform:"Category successfully has been changed"})
                }
            })
        }
        else {
            res.json({
                inform:"Hash is wrong",
                logged: 0
            })
        }
    }
})

app.listen(port)