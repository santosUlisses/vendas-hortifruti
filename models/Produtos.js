const { DataTypes } = require('sequelize');

const conn = require('../db/db');


const Produtos = conn.define("Produtos", {
    nome: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    estoque: {
        type: DataTypes.INTEGER,
    },
    preco: {
        type: DataTypes.DECIMAL(10, 2),
    }
});

module.exports = Produtos;