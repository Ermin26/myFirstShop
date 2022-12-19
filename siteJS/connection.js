if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const { express } = require('express');
const { Client } = require('pg')



const client = new Client({
    user: process.env.DB_USERN,
    host: process.env.DB_HOST,
    database: process.env.DB_DB,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT,
})

//const conn = client;
module.exports = {client};



