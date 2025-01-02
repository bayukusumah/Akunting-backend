require('dotenv').config();
const createError = require('http-errors');
const cors = require("cors");
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const indexRoutes = require('./routes/indexRoutes');
const accountRoutes = require('./routes/accountRoutes');
const transactionRoutes = require('./routes/transactionRoutes');




const app = express();
app.use(bodyParser.json());
// app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser());
app.use(cors());
app.use('/', indexRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/transactions', transactionRoutes);

app.use(function(req, res, next) {
    next(createError(404));
});

const PORT = 7000;
app.listen(PORT,() => console.log('server running'));

