const { DataTypes } = require('sequelize');
const conn = require('../db/db');



const CarrinhoProduto = conn.define('CarrinhoProduto', {
    quantidade: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    preco_unitario: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    }
});

module.exports = CarrinhoProduto;