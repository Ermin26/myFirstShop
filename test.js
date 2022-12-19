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
})

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



conn.query("CREATE TABLE IF NOT EXISTS demo(id serial PRIMARY KEY,fName VARCHAR(10),lName VARCHAR(10))", (err, res) => {
    if (err) {
        console.error(err.message, "some error occurred");
        conn.end();
    } else {
        console.log('Table is successfully created');
        conn.end();
    }
});
/*
CREATE TABLE users (
    id UUID PRIMARY KEY NOT NULL,
    fname VARCHAR(15),
    lname VARCHAR(15),
    email VARCHAR(50),
    country VARCHAR(25),
    city VARCHAR(15),
    zip VARCHAR(10),
    address VARCHAR(20),
    password VARCHAR(60));
  
    
    CREATE TABLE users (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
        p_name VARCHAR(25),
        p_qty NUMERIC,
        p_price FLOAT,
        p_cat VARCHAR(15),
        p_subcat VARCHAR(15),
        p_desc VARCHAR(50),
        p_fulldesc VARCHAR(300),
        p_imgdestination VARCHAR(60));


        CREATE TABLE orders (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
  		orderNumber SERIAL NOT NULL,      
  		orderDate VARCHAR(25),
        user_id VARCHAR,
        product_id VARCHAR[],
		orderCountry VARCHAR);

        CREATE TABLE bills (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
  		billNumber SERIAL NOT NULL,      
        user_id VARCHAR,
        product_id VARCHAR[],
		totalPrice FLOAT,
		billDate VARCHAR(25));

        

        */