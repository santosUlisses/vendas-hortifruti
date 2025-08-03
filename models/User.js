const { DataTypes } = require('sequelize');

const conn = require('../db/db');


const User = conn.define("User", {
    nome: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email:{
        type:DataTypes.STRING,
    },
    senha: {
        type: DataTypes.STRING,
        allowNull: false,
    },
});


module.exports = User;