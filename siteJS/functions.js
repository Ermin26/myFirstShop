const { Client } = require('pg');
const fs = require('fs');
const nodemailer = require('nodemailer');
const multer = require('multer');
const { storage } = require('../cloudinary/cloudConfig');
const upload = multer({ storage })

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
    console.log("Trying get colors", id);
    const result = await conn.query(`SELECT DISTINCT color FROM varijacije WHERE product_id=$1`,[id])
    console.log("Result rows: ", result.rows)
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

async function getRemoveItemFromCart(id, cart){
    try{
        for (let i = 0; i < cart.length; i++) {
            if (cart[i].sku == id) {
                cart.splice(cart.indexOf(cart[i]), 1)
            }
        }
    }catch(err){
        console.log(err);
        req.flash('error', err.message);
    }
}

async function editItemQty(req,id,cart,plus_btn, minus_btn){
    try{
        if(plus_btn){
            for (let i = 0; i < cart.length; i++) {
                if (cart[i].sku == id) {
                    let query = await conn.query(`SELECT qty FROM varijacije WHERE sku = '${cart[i].sku}'`);
                    let result = query.rows[0];
                    console.log("Result", result)
                    if (cart[i].qty > 0 && cart[i].qty < result.qty) {
                        cart[i].qty = parseInt(cart[i].qty) + 1;
                    }else{
                        req.flash('error',`Maximalna količina za naročilo je ${result.qty}`)
                    }
                }
            }
        }
        if(minus_btn){
            for (let i = 0; i < cart.length; i++) {
                if (cart[i].sku == id) {
                    if (cart[i].qty > 1) {
                        cart[i].qty = parseInt(cart[i].qty) - 1;
                    }else{
                        req.flash('error',`Minimalna količina za naročilo je 1`)
                    }
                }
            }
        }
    }catch(err){
        console.error(err);
    }
}

async function getOrderData(cart, total, cart,items,count, s_pk, s_sk, publishableKey, totalPrice,res,req, totalPrice){
    try{
        for (let i = 0; i < cart.length; i++) {
            await conn.query(`SELECT * FROM varijacije WHERE varijacije.sku='${cart[i].sku}'`, async (err, product) => {
                if (!err) {
                    count += 1;
                    items.push(product.rows);
                    if (cart.length === count) {
                        await conn.query(`SELECT * FROM  orders WHERE user_id = '${cart[0].user_id}'`, async (er, user) => {
                            let userData = user.rows[0]
                            //! only testing, change it for order
                            res.render('orders/makeOrder', { total, cart,items, userData, s_pk, s_sk, publishableKey, totalPrice });
                        })
                    }
                } else {
                    req.flash('error', `Error ${err.message}`);
                    res.redirect('/')
                }
            })
        }
    }catch(err){
        console.error("This is getOrderData error: ",err);
        res.redirect('/')
    }
}

async function getOrdersAndInvoiceInfo(invoicePrefix){
    try{
        const orders = await conn.query(`SELECT * FROM orders`);
        let data = orders.rows;
        console.log(data.length);
        if (!data.length) {
            invoice = invoicePrefix + "-" + 1
        } else {
            invoiceNum = data.length + 1;
            invoice = invoicePrefix + "-" + invoiceNum;
        }
    }catch(err){
        console.error("Error get data from orders",err.message);
    }
    console.log("This is invoice inside function: " ,invoice)
    return invoice;
}

async function updateUserPaymentIntent(ifPayed, stripe,invoice){
    try{
        const paymenthMethod = await stripe.paymentMethods.retrieve(ifPayed.payment_method);
        await stripe.paymentIntents.update(ifPayed.id, {
            receipt_email: paymenthMethod.billing_details.email,
            metadata: {
                invoice: `${invoice}`,
            }
        });
    }catch(e){
        console.log("Error updating payment intent")
        console.error("Error updating payment intent",e.message)
    }

}

async function updateOrdersTable(ifPayed,invoice, shippingInfo, paymenthMethod, orderDate, product_sku, product_qtys,cart, user_id, req){
    try{
        await conn.query(`INSERT INTO orders(trackingNum, invoice, name, email, country, city, zip, street, phone, sended,date, costs, products_ids, product_qtys, user_id) VALUES('${ifPayed.metadata.trackOrder_id}', '${invoice}','${shippingInfo.name}', '${paymenthMethod.billing_details.email}', '${shippingInfo.address.country}', '${shippingInfo.address.city}', '${shippingInfo.address.postal_code}', '${shippingInfo.address.line1}', '${shippingInfo.phone}','false','${orderDate}', '${req.session.total}',array_to_json('{${product_sku}}'::text[]), array_to_json('{${product_qtys}}'::text[]), '${user_id}')`);
        req.session.cart = "";
        req.session.total = "";
        req.session.trackingNumber = "";
    }catch(err){
        console.error("Error insert into orders",err.message);
    }
}

async function sendEmailOrder(nodemailer,yoo, shippingInfo, orderDate){
    try {
        let transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "jolda.ermin@gmail.com",
                pass: `${yoo}`,
            },
            tls: {
                rejectUnauthorized: false,
            }
        });
        let mailOptions = {
            from: "jolda.ermin@gmail.com",
            to: "ermin.alma1011@gmail.com",
            subject: "NAROČILO",
            html: `
            <html>
              <head>
                <style>
                  body {
                    font-family: Arial, sans-serif;
                    background-color: white;
                  }
                  p {
                    color: cyan;
                  }
                  .container{
                    height: 20vh;
                    width: 15vh
                    margin: 2px;
                    padding: 4px;
                    border: 2px solid black;
                  }

                </style>
              </head>
              <body>
                <div class="container">
                    <p>Korisnik <stron>${shippingInfo.name}</stron> je z dnem ${orderDate} oddal naročilo!</p>
                    <!-- Add the rest of your HTML content here -->
                </div>
                </body>
            </html>
          `,
        };
        transporter.sendMail(mailOptions, function (err, success) {
            if (err) {
                console.log(err.message);
            } else {
                console.log("Email sended");
            }
        })
    }catch(err){
        console.error("Error sending mail",err.message);
    }
}

async function updateVarijacijeTable(product_sku,product_qtys){
    console.log("Updating varijacije table")
    try{
        for (let j = 0; j < product_sku.length; j++) {
            await conn.query(`SELECT * FROM varijacije WHERE sku = '${product_sku[j]}'`, async (e, result) => {
                if(e){
                    console.log("error update qty products", e.message);
                }
                else{
                    const qty = result.rows[0].qty - parseInt(product_qtys[j]);
                    await conn.query(`UPDATE varijacije SET QTY = '${qty}' WHERE sku = '${result.rows[0].sku}'`);
                }
            })
        }
    }catch(err){
        console.error("Error updating varijacije",err.message);
    }
}

async function deleteZeroQtyVariations(){
    try {
        await conn.query(`DELETE FROM varijacije where qty = '0'`);
        const data = await conn.query(`SELECT id FROM inventory`);
        const products = data.rows;
        for(let i = 0; i < products.length; i++){
            const forDelete = await conn.query(`SELECT * FROM varijacije WHERE product_id = '${products[i].id}'`);
            if(!forDelete.rows.length){
                    await conn.query(`DELETE FROM inventory where id = '${products[i].id}'`)
            }
        }

    }catch(err){
        console.error("Error deleteing: ", err.message);
    }
}

async function showUserOrderInfo(stripe, cart, req,res){
    try{
        const data = await stripe.paymentIntents.retrieve(req.session.payment);
        await conn.query(`SELECT * FROM orders WHERE user_id ='${data.metadata.user_id}' AND trackingNum = '${data.metadata.trackOrder_id}'`, async (error, order) => {
            if (error) {
                console.log("this is error", error.message)
                res.redirect('/')
            } else {
                let myOrder = order.rows[0]
                if (myOrder == undefined || !myOrder) {
                    req.flash('error', "Nothing saved to db")
                    req.session.payment = '';
                    res.redirect('/')
                } else {
                    let items = [];
                    for(let i = 0; i < myOrder.products_ids.length; i++) {
                        const buyedVarijacije = await conn.query(`SELECT * FROM varijacije WHERE sku = '${myOrder.products_ids[i]}'`)

                        const buyed = await conn.query(`SELECT name, neto_price FROM inventory WHERE id = '${buyedVarijacije.rows[0].product_id}'`)
                        if(myOrder.products_ids[i] == buyedVarijacije.rows[0].sku ){
                        let item ={
                            name: buyed.rows[0].name,
                            img: buyedVarijacije.rows[0].img_link[0],
                            qty: myOrder.product_qtys[i],
                            size: buyedVarijacije.rows[0].size,
                            price: buyed.rows[0].neto_price
                        }
                        items.push(item)
                        }
                    }
                    res.render('orders/redirect', { myOrder,cart, items })
                }
            }
        })
    }catch(err){
        console.log("Error on showUserOrderInfo")
        console.error("Error redirecting: ", err.message);
    }
}

async function checkImages(req,firstCheck, imgTest, images, imgsUrl){
    let imgNum = 1
    if (imgTest.length <= 2) {
        const productImgs = req.files[`image${imgNum}`];
        for(let productimg of productImgs) {
            images.push(productimg.path);
        }
        imgsUrl.push(images)
    }
    else{
        for (let i = 0; i < firstCheck; i++) {
            let getImg = req.files[`image${imgNum}`];
                for (let img = 0; img < getImg.length; img++) {
                    images.push(getImg[img].path)
                }
            imgNum += 1;
            imgsUrl.push(images);
            images = [];
        }
    }
}

async function setInvtAndVarPid(day,month,year){
        console.log("Starting working on pid");
        let inventoryPid;
        let varijacijePid;
        let invt_sku;
        const lastSku = await conn.query(`SELECT inventory_pid FROM inventory ORDER BY inventory_pid DESC LIMIT 1`);
        const pid = lastSku.rows[0];
        if (pid !== undefined) {
            console.log("Check for invt sku");
            inventoryPid = parseInt(pid.inventory_pid) + 1;
        } else {
            console.log("Set invt sku to 1");
            inventoryPid = "1";
        }

        const varSku = await conn.query(`SELECT var_pid FROM varijacije ORDER BY var_pid DESC LIMIT 1`);
        const vid = varSku.rows[0];
        if (vid !== undefined) {
            varijacijePid = parseInt(vid.var_pid) + 1;
        } else {
            varijacijePid = "1";
        }

        invt_sku = `${day}-${month}-${year}-${inventoryPid}`;
        console.log("end working on pid",);
        const resultt = {
            inventoryPid: inventoryPid,
            varijacijePid: varijacijePid,
            invt_sku: invt_sku,
        }
        return resultt;
}

async function addProductWithSizes(req, year, imgsUrl, sizeCount, varijacijePid,result, product){
    console.log("Starting working on with sizes")
    try{
       for (let i = 0; i < product.color.length; i++) {
            for (let j = 0; j < product[`size${sizeCount}`].length; j++) {
                sku = parseInt(Math.random(12 * 35637) * 10000) + "-" + year + "-" + varijacijePid;
                if(product[`qty${sizeCount}`][j] > 0) {
                    await conn.query(`INSERT INTO varijacije(product_id, size, sku, img_link, qty,color, var_pid) VALUES('${result.rows[0].id}', '${product[`size${sizeCount}`][j]}', '${sku}',array_to_json('{${imgsUrl[i]}}'::text[]), '${product[`qty${sizeCount}`][j]}', '${product.color[i]}', '${parseInt(varijacijePid)}')`)
                    varijacijePid = parseInt(varijacijePid) + 1;
                    console.log("Varijacije pid",varijacijePid)
                }
            }
            sizeCount += 1;
        }
    }catch(e){
        console.error("Error adding product with sizes", e.message);
    }
    console.log("end working on with sizes")
}

async function addProductWithoutSizes(req,year, imgsUrl, varijacijePid,result, product){
    console.log("Starting working on without sizes")
    try {
        for (let i = 0; i < product.color.length; i++) {
            let sku = parseInt(Math.random(12 * 35637) * 10000) + "-" + year + "-" + varijacijePid;
            await conn.query(`INSERT INTO varijacije(product_id, sku, img_link, qty,color, var_pid) VALUES('${result.rows[0].id}', '${sku}',array_to_json('{${imgsUrl[i]}}'::text[]), '${product.qty1[i]}', '${product.color[i]}', '${varijacijePid}')`)
            varijacijePid = parseInt(varijacijePid) + 1;
            console.log("Varijacije pid",varijacijePid)
        }
    }catch(e){
        console.error("Error adding product without sizes:", e.message);
    }
    console.log("end working on without sizes")
}

async function addSingleProduct(year,varijacijePid,result, imgsUrl, product){
    console.log("Starting working on with single")
    try{
        let sku = parseInt(Math.random(12 * 35637) * 10000) + "-" + year + "-" + varijacijePid;
        await conn.query(`INSERT INTO varijacije(product_id, sku, img_link, qty,color, var_pid) VALUES('${result.rows[0].id}', '${sku}',array_to_json('{${imgsUrl}}'::text[]), '${product.qty1}', '${product.color}', '${varijacijePid}')`)
        console.log("Single added product toys")
    }catch(e){
        console.error('Error single adding product: ', e.message);
    }
    console.log("end working on with single")
}

async function getCategoryItems(category, subcategory, subcategory2){
    let product = [];
    try {
        if(category && subcategory2){
            const data = await conn.query(`SELECT * FROM inventory WHERE category ILIKE '${category}' AND subcategory ILIKE '${subcategory2}'`)
            product.push(data.rows[0]);
        }else if(category && !subcategory2){
            const data = await conn.query(`SELECT * FROM inventory WHERE category ILIKE '${category}'`)
            product.push(data.rows[0]);
        }
    }catch(e){
        console.error("Error: ", e.message)
    }
    return product
}

module.exports ={
    getAllProducts,
    getVarijace,
    getProductDetails,
    getDistinctColors,
    getSizes,
    getRandomProducts,
    getCartItemDetails,
    getRemoveItemFromCart,
    editItemQty,
    getOrderData,
    getOrdersAndInvoiceInfo,
    updateUserPaymentIntent,
    updateOrdersTable,
    sendEmailOrder,
    updateVarijacijeTable,
    deleteZeroQtyVariations,
    showUserOrderInfo,
    checkImages,
    setInvtAndVarPid,
    addProductWithSizes,
    addProductWithoutSizes,
    addSingleProduct,
    getCategoryItems
}