if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}
const conn = require('../siteJS/connection')

conn.query("CREATE TABLE IF NOT EXISTS users (id serial PRIMARY KEY,fName VARCHAR(10),lName VARCHAR(10),email VARCHAR(30),country VARCHAR(20),city VARCHAR(15),zip VARCHAR(10),address VARCHAR(30), password VARCHAT(50))", (err, res) => {
    if (err) {
        console.error(err.message, "some error occurred");
        conn.end();
    } else {
        console.log('Table is successfully created');
        conn.end();
    }
});
