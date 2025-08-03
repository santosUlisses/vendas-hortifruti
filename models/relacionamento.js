const Carrinho = require("./Carrinho");
const CarrinhoProduto = require("./CarrinhoProduto");
const Compras = require("./Compras");
const Produtos = require("./Produtos");
const User = require("./User");


Carrinho.belongsToMany(Produtos, { through: 'CarrinhoProduto' });
Produtos.belongsToMany(Carrinho, { through: 'CarrinhoProduto' });



User.hasMany(Carrinho);
Carrinho.belongsTo(User);


Carrinho.hasOne(Compras);
Compras.belongsTo(Carrinho);


Carrinho.hasMany(CarrinhoProduto);
CarrinhoProduto.belongsTo(Carrinho);

CarrinhoProduto.belongsTo(Produtos);
Produtos.hasMany(CarrinhoProduto);



module.exports = {
    Compras,
    Produtos,
    User,
    Carrinho,
    CarrinhoProduto
};
