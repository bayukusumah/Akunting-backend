var mysql = require('mysql2');
const con = mysql.createPool({
    connectionLimit : 20,
    host : process.env.DB_HOST,
    user : process.env.DB_USER,
    password : process.env.DB_PWD,
    database : process.env.DB_NAME,
});
module.exports = con.promise();