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
const uuid = require('uuid');
const PostgreSQLStore = require('connect-pg-simple')(session)
const { Client } = require('pg');
const { Console } = require('console');


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


const create = async (req, res) => {

    try {

        //await conn.query("ALTER TABLE inventory ADD COLUMN inventory_sku VARCHAR (50)")

        //await conn.query("DROP TABLE IF EXISTS products");
        //await conn.query("DROP TABLE IF EXISTS adult_clothes");
        //await conn.query("DROP TABLE IF EXISTS adult_shoes");
        //await conn.query("DROP TABLE IF EXISTS kids_clothes");
        //await conn.query("DROP TABLE IF EXISTS kids_shoes");
        //await conn.query("DROP TABLE IF EXISTS sended");
        //await conn.query("DROP TABLE IF EXISTS bills");
        //await conn.query("DROP TABLE IF EXISTS deleted");
        //await conn.query("DROP TABLE IF EXISTS inventory");
        //await conn.query("DROP TABLE IF EXISTS orders");
        //await conn.query("DROP TABLE IF EXISTS users");
        //await conn.query("DROP TABLE IF EXISTS varijacije");
        //await conn.query("DROP TABLE IF EXISTS admins");
        //await conn.query("DROP TABLE IF EXISTS user_session");
//
        //await conn.query("CREATE TABLE admins (id serial, name VARCHAR (50), lastname VARCHAR (50),username VARCHAR (50), email VARCHAR (100),password VARCHAR (100), role VARCHAR (50),token VARCHAR (100), PRIMARY KEY(ID))")
        //await conn.query("CREATE TABLE bills (id BIGSERIAL,bill_number SERIAL, order_number_id VARCHAR(50),orders_product_ids TEXT,price VARCHAR(50),billDate TIMESTAMP, PRIMARY KEY(ID))");
        //await conn.query("CREATE TABLE deleted (id VARCHAR, sku VARCHAR, name VARCHAR, neto_price VARCHAR, info VARCHAR, description VARCHAR,category VARCHAR, subcategory VARCHAR, links TEXT)");
        //await conn.query("CREATE TABLE inventory (id BIGSERIAL, name VARCHAR, neto_price FLOAT, info VARCHAR, description TEXT,category VARCHAR, subcategory VARCHAR,bgImage VARCHAR, links json, created TEXT, inventory_sku VARCHAR, inventory_pid VARCHAR,decription1 TEXT, description2 TEXT, PRIMARY KEY (id))");
        //await conn.query("CREATE TABLE orders (id BIGSERIAL ,trackingNum VARCHAR(50), invoice VARCHAR(50), name VARCHAR(50),email VARCHAR(50),country VARCHAR(50),city VARCHAR(50),zip VARCHAR(20),street VARCHAR(50),phone VARCHAR(50),products_ids json,costs VARCHAR(50),sended VARCHAR(20),date TEXT, product_qtys json, user_id TEXT,PRIMARY KEY (ID))");
        //await conn.query("CREATE TABLE users (id BIGSERIAL,fname VARCHAR(30),lname VARCHAR(30),email VARCHAR(100),country VARCHAR(50),city VARCHAR(30),zip VARCHAR(15),address VARCHAR(50),password VARCHAR(80), PRIMARY KEY (ID))");
        //await conn.query("CREATE TABLE varijacije (id BIGSERIAL, product_id NUMERIC, size VARCHAR,sku VARCHAR, img_link json,  qty INTEGER, color VARCHAR, var_pid VARCHAR, PRIMARY KEY(id), UNIQUE (sku))");
        //await conn.query("CREATE TABLE products (id BIGSERIAL ,p_name VARCHAR,p_qty NUMERIC,p_price FLOAT,p_cat VARCHAR(15),p_subcat VARCHAR(15),p_size VARCHAR(20),p_color TEXT[],p_desc VARCHAR(150),p_fulldesc VARCHAR(300),p_imgdestination json, PRIMARY KEY (ID))");
        //await conn.query("CREATE TABLE sended (id BIGSERIAL, sended_number SERIAL, order_id VARCHAR(50), bill_id VARCHAR(50), send_date TIMESTAMP, courier VARCHAR(50), PRIMARY KEY (id))")
        //await conn.query("CREATE TABLE session(sid CHARACTER(100),expire TIMESTAMP, sess json)");
/*
        await conn.query(`SELECT inventory_pid FROM inventory ORDER BY inventory_pid DESC LIMIT 1`, async(err, result) => {
            const data = result.rows[0];
            console.log("This is typeof",typeof(data.inventory_pid));
            if(data.inventory_pid != 'undefined'){
                console.log("Yoooo");
                console.log("inventory_pid is undefined");
            }else{
                console.log("inventory_pid is not undefined");
            }
            //console.log(typeof(data.invent_pid));
            let invent_pid = 1;
            for (let i = 0; i < data.length; i++) {
                await conn.query(`UPDATE inventory SET inventory_pid = '${invent_pid}' WHERE id = '${data[i].id}'`)
                invent_pid ++;
                console.log(invent_pid);
            }

        })
      console.log('Successfully created dbs')
      */

     //CREATE TABLE "session" (
     //"sid" varchar NOT NULL COLLATE "default",
     //"sess" json NOT NULL,
     //"expire" timestamp(6) NOT NULL
     //) WITH (OIDS=FALSE);

    //! SESSION ADDITIONAL
    /*
    ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;
    CREATE INDEX "IDX_session_expire" ON "session" ("expire");
*/
    } catch (e) {
        console.log(e.message)
    }
}
create();
