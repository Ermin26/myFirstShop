const conn = require('../siteJS/connection')


conn.connect()

conn.query(`CREATE TABLE "products" ("id" serial PRIMARY KEY, "p_name" VARCHAR(20), "p_qty" INTEGER, "p_price" NUMERIC(5), "p_cat" VARCHAR(15), "p_subCat" VARCHAR(15), "p_description" VARCHAR(100)`, (err, res) => {
    if (err) {
        console.error(err.message, "some error occurred");
        conn.end();
    } else {
        console.log('Table is successfully created');
        conn.end();
    }
});

console.log("heeeeyyyyyyyy")