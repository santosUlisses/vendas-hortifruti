const express = require('express');
const Autenticar = require('../middleware/Autenticar')

const rota = express.Router();
const controller = require('../controller/controller')


rota.get('/', controller.home);
rota.get('/painel/usuario', Autenticar.authUser, controller.painelUsuario);
rota.get('/paineladm', Autenticar.authAdm, controller.pagAdm);
rota.get('/cadastrar', Autenticar.protegerRota, controller.cadastro);
rota.post('/cadastrar', controller.cadastrar);
rota.post('/login', controller.login);
rota.get('/logout', controller.logout);
rota.get('/user/edit/:id', Autenticar.authUser, controller.encontrarUsuario);
rota.post('/user/edit', controller.editarUsuario);
rota.get('/cadastrar/produtos', Autenticar.authAdm, controller.pagCadastrarProdutos);
rota.post('/cadastrar/produto', controller.cadastrarProdutos);
rota.get('/lista/produtos', Autenticar.authAdm, controller.listarProdutos);
rota.get('/editar/produtos/:id', Autenticar.authAdm, controller.findProdutoId);
rota.post('/editar/produto', controller.editProduto);
rota.post('/deletar/produto/:id', controller.deletarProduto);
rota.get('/produtos/venda', Autenticar.authUser, controller.produtosParaVenda);
rota.get('/add/carrinho/:id', controller.pagAddCarrinho);
rota.post('/add/carrinho', controller.addCarrinho);
rota.get('/carrinho/user', Autenticar.authUser, controller.CarrinhoDoUsuario);
rota.post('/remover/item/:id', controller.removerItem);
rota.post('/realizar/compra', Autenticar.authUser, controller.realizarCompra);
rota.get('/lista/compras', Autenticar.authUser, controller.listaCompras);
rota.get('/vendas', Autenticar.authAdm, controller.vendas);

// rota.get('/qrcode', controller.gerarPix);


module.exports = rota;