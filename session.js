const session = require('express-session');

const sessionMiddleware = session({
    secret:'kimpossible',
    saveUninitialized: false, 
    resave: false,
    cookie: { secure: false} //set to true in production
});

module.exports = sessionMiddleware;