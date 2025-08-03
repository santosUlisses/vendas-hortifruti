const express = require('express');
const exphbs = require('express-handlebars');
const session = require('express-session');
require('dotenv').config();


const app = express();
const conn = require('./db/db');
const User = require('./models/User');
const Produtos = require('./models/Produtos');
const Compras = require('./models/Compras');
const relacionamento = require('./models/relacionamento');

app.engine('handlebars', exphbs.engine());
app.set('view engine', 'handlebars');
app.use(express.static('public'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
const rotas = require('./rotas/rotas');

app.use(session({
    secret: process.env.secret,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 36000000 }

}));
app.use((req, res, next) => {
    res.locals.nome = req.session.nome;
    res.locals.admin = !!req.session.admin;
    res.locals.sessaoAtiva = !!req.session.userId;
    next()
});
app.use('/', rotas);



conn.sync({ force: false }).then(() => { app.listen(3000) }).catch(error => console.log(error));



