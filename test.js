if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}
const express = require('express');
const app = express();
const session = require('express-session')
const flash = require('connect-flash')
const layouts = require('ejs-mate')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const path = require('path');
const fs = require('fs');
const bodyParser = require("body-parser");
const override = require('method-override');
const PostgreSQLStore = require('connect-pg-simple')(session)
const { Client } = require('pg')


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.engine('ejs', layouts);
app.use(express.urlencoded({ extended: true }));
app.use(override('_method'))
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());

const client = new Client({
    user: process.env.DB_USERN,
    host: process.env.DB_HOST,
    database: process.env.DB_DB,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT,
    ssl: {
        rejectUnauthorized: true,
        ca: fs.readFileSync('./root.crt').toString()
    },
});

const conn = client;
module.exports = conn;

const connection = async (req, res) => {

    try {
        await conn.connect()
        console.log('Connected to the', conn.database)
    }
    catch (e) {
        console.log(e.message)
    }
}

connection();


/*
conn.query("CREATE TABLE IF NOT EXISTS demo(id serial PRIMARY KEY,fName VARCHAR(10),lName VARCHAR(10))", (err, res) => {
    if (err) {
        console.error(err.message, "some error occurred");
        conn.end();
    } else {
        console.log('Table is successfully created');
        conn.end();
    }
});
*/
const create = async (req, res) => {

    try {

        //await conn.query("CREATE TABLE users IF DON'T EXISTS (id UUID PRIMARY KEY NOT NULL,fname VARCHAR(15),lname VARCHAR(15),email VARCHAR(50),country VARCHAR(25),city VARCHAR(15),zip VARCHAR(10),address VARCHAR(20),password VARCHAR(60))");

        //await conn.query("CREATE TABLE products (id UUID PRIMARY KEY NOT NULL,p_name VARCHAR(25),p_qty NUMERIC,p_price FLOAT,p_cat VARCHAR(15),p_subcat VARCHAR(15),p_size VARCHAR(20),p_color VARCHAR(20),p_desc VARCHAR(50),p_fulldesc VARCHAR(300),p_imgdestination VARCHAR(100))");

        //await conn.query("CREATE TABLE orders (id SERIAL NOT NULL,ordernumber UUID PRIMARY KEY NOT NULL, name VARCHAR(50),lastname VARCHAR(50),email VARCHAR(50),country VARCHAR(50),city VARCHAR(50),zip BIGINT,street VARCHAR(50),phone VARCHAR(50),products_ids TEXT,costs VARCHAR(50),status VARCHAR(50),date VARCHAR(50))");

        //await conn.query("CREATE TABLE bills (id UUID PRIMARY KEY NOT NULL,bill_number SERIAL NOT NULL, order_number_id VARCHAR(50),orders_product_ids TEXT,price VARCHAR(50),billDate VARCHAR(25))");

        //await conn.query("CREATE TABLE session(sid CHARACTER(100),expire TIMESTAMP WITH TIME ZONE, sess json)");
        //await conn.query("ALTER TABLE session ADD COLUMN expire TIMESTAMP WITH TIME ZONE");

        //await conn.query("CREATE TABLE sended (id UUID PRIMARY KEY NOT NULL, sended_number SERIAL NOT NULL, order_id VARCHAR(50), bill_id VARCHAR(50), send_date VARCHAR(50), courier VARCHAR(50))")

        console.log('Successfully created dbs')
    } catch (e) {
        console.log(e.message)
    }
}

create();
