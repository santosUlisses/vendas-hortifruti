class Autenticar {
    authAdm(req, res, next) {
        const userAdmin = !!req.session.admin

        if (!userAdmin) {
            res.redirect('/painel/usuario');
        }
        next();
    }

    authUser(req, res, next) {
        const user = !!req.session.userId;
        if (!user) {
            res.redirect('/');
        }
        next();
    }
    protegerRota(req, res, next) {
        const user = !!req.session.userId;
        if (user) {
            res.redirect('/painel/usuario')
        }
        next();
    }
}
module.exports = new Autenticar();