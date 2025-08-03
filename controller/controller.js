const User = require("../models/User");
const Produtos = require('../models/Produtos');
const Carrinho = require('../models/Carrinho')
const CarrinhoProduto = require('../models/CarrinhoProduto')
const Compras = require('../models/Compras');
require('dotenv').config();
const bcrypt = require('bcrypt');
const { createStaticPix, hasError } = require('pix-utils');
const qrcode = require('qrcode');




class Controller {
    home(req, res) {
        res.render('home');
    }
    pagAdm(req, res) {
        res.render('paineladm')
    }
    painelUsuario(req, res) {
        res.render('painel_usuario');
    }
    cadastro(req, res) {
        res.render('cadastro');
    }
    async cadastrar(req, res) {
        const { nome, email, senha } = req.body;
        const salt = await bcrypt.genSalt(10);
        const senhaHash = await bcrypt.hash(senha, salt);
        try {
            const user = await User.create({ nome, email, senha: senhaHash });
            await Carrinho.create({ status: "ativo", UserId: user.id });
            res.redirect('/');
        } catch (error) {
            console.log(error);
        }
    }
    async login(req, res) {
        const { email, senha } = req.body;

        const user = await User.findOne({ where: { email: email }, raw: true });
        console.log(user)
        if (!user || user === null || !senha || senha === null) {

            res.redirect('/');
            return

        }
        let auth = await bcrypt.compare(senha, user.senha);

        if (auth === true) {
            req.session.userId = user.id;
            req.session.nome = user.nome;
            if (req.session.userId === 1) {
                req.session.admin = 'admin'
            }
            console.log(req.session);

            res.redirect('/paineladm');
        } else {
            res.redirect('/')
        }


    }
    logout(req, res) {
        req.session.destroy((error) => {
            if (error) {
                console.log(error);
            }
            res.clearCookie('connect.sid');
            res.redirect('/');
        });
    }

    async encontrarUsuario(req, res) {
        const id = req.session.userId
        try {
            const user = await User.findOne({ where: { id: id }, raw: true });
            console.log(user)
            res.render('pagEditUser', { user });
        } catch (error) {
            console.log(error);
        }
    }

    async editarUsuario(req, res) {
        const { id, nome, email, senha } = req.body;
        const salt = await bcrypt.genSalt(10);
        const senhaHash = await bcrypt.hash(senha, salt);
        try {
            await User.update({ nome, email, senha: senhaHash }, { where: { id: id } });
            res.redirect('/painel/usuario');
        } catch (error) {
            console.log(error);
        }
    }


    pagCadastrarProdutos(req, res) {
        res.render('cadastrarProdutos');
    }
    async cadastrarProdutos(req, res) {
        const { nome, estoque, preco } = req.body;
        try {
            await Produtos.create({ nome, estoque, preco });
            console.log('success')
            res.redirect('/paineladm');
        } catch (error) {
            console.log(error)
        }
    }
    async listarProdutos(req, res) {
        const produtos = await Produtos.findAll({ raw: true });
        res.render('produtos', { produtos })
    }
    async findProdutoId(req, res) {
        const { id } = req.params;
        const produto = await Produtos.findOne({ where: { id: id }, raw: true });
        console.log(produto)
        res.render('editProduto', { produto })
    }
    async editProduto(req, res) {
        const { id, nome, estoque, preco } = req.body;

        try {
            await Produtos.update({ nome, estoque, preco }, { where: { id: id } });
            console.log('success');
            res.redirect('/lista/produtos');
        } catch (error) {
            console.log(error)
        }
    }
    async deletarProduto(req, res) {
        const { id } = req.params;
        try {
            await Produtos.destroy({ where: { id: id } });
            console.log('success');
            res.redirect('/lista/produtos');
        } catch (error) {
            console.log(error);
        }
    }
    async produtosParaVenda(req, res) {
        const produtos = await Produtos.findAll({ raw: true });
        res.render('produtos_para_venda', { produtos });
    }
    async pagAddCarrinho(req, res) {
        const { id } = req.params
        const produto = await Produtos.findOne({ where: { id: id }, raw: true });
        console.log(produto)


        res.render('pagAddCarrinho', { produto });
    }
    async addCarrinho(req, res) {
        const UserId = req.session.userId
        const carrinhoAtivo = await Carrinho.findOne({ where: { UserId: UserId, status: "ativo" }, raw: true });
        const { quantidade, preco_unitario, produtoId } = req.body;
        try {
            await CarrinhoProduto.create({ quantidade, preco_unitario, CarrinhoId: carrinhoAtivo.id, ProdutoId: produtoId });
            res.redirect('/carrinho/user');
        } catch (error) {
            console.log(error);
        }
    }
    async CarrinhoDoUsuario(req, res) {
        const UserId = req.session.userId;
        const carrinhoAtivo = (await Carrinho.findAll({ where: { UserId: UserId, status: "ativo" }, include: [{ model: CarrinhoProduto, include: [{ model: Produtos }] }] })).map(a => a.get({ plain: true }));
        const produtoDetalhes = [];
        let idCarrinho = 0;

        carrinhoAtivo.forEach((c) => {
            idCarrinho = c.id
            c.CarrinhoProdutos.forEach((cp) => {
                let detalhes = {
                    id: cp.Produto.id,
                    nome: cp.Produto.nome,
                    quantidade: cp.quantidade,
                    preco_unitario: cp.preco_unitario,
                    valor_total: Number(cp.preco_unitario) * Number(cp.quantidade),
                }
                produtoDetalhes.push(detalhes);
            });
        });
        let total_carrinho = (produtoDetalhes.map(c => c.valor_total).reduce((a, i) => a + i, 0)).toFixed(2)
        console.log(produtoDetalhes);


        res.render("carrinhoDoUsuario", { idCarrinho, produtoDetalhes, total_carrinho });
    }

    async removerItem(req, res) {
        const { id } = req.params;
        try {
            await CarrinhoProduto.destroy({ where: { ProdutoId: id } });
            res.redirect('/carrinho/user');
        } catch (error) {
            console.log(error)
        }
    }

    async realizarCompra(req, res) {
        const id = req.session.userId;
        const { CarrinhoId, valor_total } = req.body;
        const data = new Date();
        const data_compra = `"${data.getFullYear()}-${data.getMonth() + 1}-${data.getDate()}"`

        try {
            const itensCarrinho = await CarrinhoProduto.findAll({
                where: { CarrinhoId },
                attributes: ['ProdutoId', 'quantidade']
            });

            await Promise.all(
                itensCarrinho.map(async item => {
                    const produto = await Produtos.findByPk(item.ProdutoId);
                    if (produto) {
                        await produto.update({
                            estoque: produto.estoque - item.quantidade
                        });
                    }
                })
            );

            await Promise.all([
                Compras.create({ data_compra, valor_total, CarrinhoId }),
                Carrinho.update({ status: 'finalizado' }, { where: { id: CarrinhoId } }),
                Carrinho.create({ status: "ativo", UserId: id }),
            ]);

            res.redirect('/lista/produtos');
        } catch (error) {
            console.log(error);
        }
    }


    async listaCompras(req, res) {
        const userId = req.session.userId
        const carrinhosFinalizados = await Carrinho.findAll({
            where: { UserId: userId, status: "finalizado" },
            include: [
                {
                    model: Compras,
                    attributes: ['id', 'data_compra', 'valor_total']
                },
                {
                    model: CarrinhoProduto,
                    include: [
                        {
                            model: Produtos,
                            attributes: ['nome']
                        }
                    ]
                }
            ]
        });
        const produtosCarrinho = [];

        const carrinhosFormatados = carrinhosFinalizados.map(carrinho => carrinho.get({ plain: true }));

        carrinhosFormatados.forEach(c => {
            const detalhes = c.CarrinhoProdutos.map(cp => {
                return {
                    nome: cp.Produto.nome,
                    quantidade: cp.quantidade,
                    preco_unitario: cp.preco_unitario
                };
            });

            produtosCarrinho.push({
                data_compra: c.Compra.data_compra,
                valor_total: c.Compra.valor_total,
                detalhes_compra: detalhes
            });
        });
        console.log(produtosCarrinho)


        res.render('compras_user', { produtosCarrinho });
    }




    async vendas(req, res) {
        let total = (await Compras.sum('valor_total')).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        const vendas = await Compras.findAll({
            attributes: ['data_compra', 'valor_total'],
        });

        const datas = vendas.map(v => new Date(v.data_compra).toISOString().split('T')[0]);
        const valores = vendas.map(v => v.valor_total);

        res.render('pagVendas', { datas: JSON.stringify(datas), valores: JSON.stringify(valores), total });

    }

    // async gerarPix(req, res) {
    //     const pix = createStaticPix({
    //         merchantName: process.env.nome,
    //         merchantCity: 'RIO DE JANEIRO',
    //         pixKey: process.env.chave_pix,
    //         transactionAmount: 0.01,
    //         infoAdicional: 'Pagamento do produto',
    //     });

    //     if (hasError(pix)) {
    //         return res.status(500).send('Erro ao gerar Pix');
    //     }

    //     const brCode = pix.toBRCode();
    //     const qrCodeBase64 = await qrcode.toDataURL(brCode);

    //     res.render('qrcode', { brCode, qrCodeBase64 });


    // }

}

module.exports = new Controller();
