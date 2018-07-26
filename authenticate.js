const       express  = require('express');
const           app  = express();
const ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;

const requiresAdmin = () => {
    return [
        ensureLoggedIn('/login'),
        (req, res, next) => {
            if(req.user === true)
            next();
            else 
            res.render('login');
        } 
    ]
};

app.all('/adminIndex/*', requiresAdmin());
app.all('/adminIndex', requiresAdmin());