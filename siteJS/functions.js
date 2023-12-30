const { Client } = require('pg');
const fs = require('fs');
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
const connectToDB = async (req, res) => {
    try {
        await conn.connect()
        console.log('Yeah! i am Connected to the', conn.database)
    }
    catch (e) {
        console.log(e.message)
    }

}
connectToDB();


async function getAllProducts(){
    try{
        const result = await conn.query(`SELECT * FROM inventory ORDER BY RANDOM()`);
        return result.rows;
    }catch(e){
        console.error("Error: ", e.message)
    }
}

async function getVarijace(){
    try{
    const result = await conn.query(`SELECT * FROM varijacije`);
    return result.rows;
    }catch(e){
        console.error("Error: ", e.message)
    }
}

async function getProductDetails(id){
    const result = await conn.query(`SELECT * FROM inventory WHERE ID = $1`, [id]);
    return shirts = result.rows[0];
}

async function getDistinctColors(id){
    const result = await conn.query(`SELECT DISTINCT color FROM varijacije WHERE product_id=$1`,[id])
    return colors = result.rows;
}

async function getSizes(id, colorName, shirts){
    let query;
    const excludedSubcategories = ['Shoes', 'Toys'];
    const kidsSubcategories = ['Jackets', 'Shirts', 'Pants', 'Underwear', 'Dress', 'Shoes'];

    if(shirts.category === 'Jewerly' || shirts.subcategory === 'Toys'){
        query = `SELECT sku,img_link FROM varijacije WHERE product_id=$1 AND color=$2 ORDER BY size ASC`;
    }
    if (shirts.category === 'Kids' && kidsSubcategories.includes(shirts.subcategory)){
        query = `SELECT size,img_link, sku FROM varijacije WHERE product_id=$1 AND color=$2 ORDER BY size ASC`;
    }
    if((shirts.category === 'Mens' || shirts.category === 'Womens') && !excludedSubcategories.includes(shirts.subcategory)) {
        query = `SELECT size,img_link, sku FROM varijacije WHERE product_id=$1 AND color=$2 ORDER BY CASE WHEN size = 'XS' THEN 1 WHEN size = 'S' THEN 2 WHEN size = 'M' THEN 3 WHEN size = 'L' THEN 4 WHEN size = 'XL' THEN 5 WHEN size = '2XL' THEN 6 WHEN size = '3XL' THEN 7 WHEN size = '4XL' THEN 8 WHEN size = '5XL' THEN 9 END`;
    }
    const sizesResult = await conn.query(query, [id, colorName]);
    return sizesResult.rows.map((row) => row);
}

async function getRandomProducts(id){
    const result = await conn.query(`SELECT * FROM inventory WHERE id != $1 ORDER BY RANDOM() LIMIT 10`, [id]);
    return randomProducts = result.rows;
}

async function getCartItemDetails(cart){
    const items = [];

    for (let i = 0; i < cart.length; i++) {
        const product_id = cart[i].product_id;
        const sku = cart[i].sku;

        const result = await conn.query(`SELECT * FROM inventory, varijacije WHERE inventory.id='${product_id}' AND varijacije.sku='${sku}' `);

        if (!result.rows.length) {
            // Handle the case where the item details are not found in the database
            console.error(`Item details not found for product_id ${product_id} and sku ${sku}`);
        } else {
            items.push(result.rows);
        }
    }

    return items;
}
module.exports ={
    getAllProducts,
    getVarijace,
    getProductDetails,
    getDistinctColors,
    getSizes,
    getRandomProducts,
    getCartItemDetails,
}