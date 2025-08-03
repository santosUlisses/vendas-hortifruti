const { DataTypes, ENUM } = require('sequelize');

const conn = require('../db/db');


const Carrinho = conn.define("Carrinho", {
    status: {
        type: ENUM("ativo", "cancelado", "finalizado"),
        defaultValue: "ativo",
    }
});


module.exports = Carrinho;