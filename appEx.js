/*
app.get('/', async (req, res) => {
    await conn.query(`DELETE FROM varijacije WHERE qty = '0'`);
    let date = new Date();
    let day = date.getDay()
    const cart = req.session.cart
    await conn.query(`SELECT * FROM inventory ORDER BY RANDOM()`, async (err, result) => {
        let products = result.rows
        //console.log(products);
        if (!products.length) {
            req.flash('error', ' Nothing to display.')
            res.redirect('add')
        } else {
            if (!err) {
                await conn.query(`SELECT * FROM varijacije`, async (e, vari) => {
                    if (e) {
                        console.log("Error: ", e.message);

                    } else {
                        const varijacije = vari.rows;
                        res.render('pages/home', { products, varijacije, cart })
                    }
                })
            }
        }
    })
})
*/

/*
app.get('/product/:id', async (req, res) => {
    let { id } = req.params;
    const excludedSubcategories = ['Shoes', 'Toys'];
    const kidsSubcategories = ['Jackets', 'Shirts', 'Pants', 'Underwear', 'Dress', 'Shoes'];
    await conn.query(`SELECT * FROM inventory WHERE ID = '${id}'`, async (err, result) => {
        if (!err) {
            let shirts = result.rows[0];
            //console.log("this is shirts", shirts)
            let invt_sku = shirts.inventory_sku
            await conn.query(`SELECT DISTINCT color FROM varijacije WHERE product_id='${id}'`, async (er, color) => {
                let colors = color.rows;
                // Retrieve sizes for each color
                let randomProducts;
                let products = [];
                let sizes = [];
                let varijacijeSku;
                let subCat = shirts.subcategory;
                if(colors.length > 0) {
                    for (let i = 0; i < colors.length; i++) {
                        const colorName = colors[i].color;
                        if(shirts.category === 'Jewerly' || shirts.subcategory === 'Toys'){
                            const sizesResult = await conn.query(`SELECT sku,img_link FROM varijacije WHERE product_id='${id}' AND color='${colorName}' ORDER BY size ASC`);
                            const size = sizesResult.rows.map((row) => row);
                            products.push({ color: colorName, size});
                        }
                        if (shirts.category === 'Kids' && kidsSubcategories.includes(shirts.subcategory)){
                            const sizesResult = await conn.query(`SELECT size,img_link, sku FROM varijacije WHERE product_id='${id}' AND color='${colorName}' ORDER BY size ASC`);
                            const size = sizesResult.rows.map((row) => row);
                            //console.log("Sizes", size)
                            products.push({ color: colorName, size });
                        }
                        if((shirts.category === 'Mens' || shirts.category === 'Womens') && !excludedSubcategories.includes(shirts.subcategory)) {
                            const sizesResult = await conn.query(`SELECT size,img_link, sku FROM varijacije WHERE product_id='${id}' AND color='${colorName}' ORDER BY CASE WHEN size = 'XS' THEN 1 WHEN size = 'S' THEN 2 WHEN size = 'M' THEN 3 WHEN size = 'L' THEN 4 WHEN size = 'XL' THEN 5 WHEN size = '2XL' THEN 6 WHEN size = '3XL' THEN 7 WHEN size = '4XL' THEN 8 WHEN size = '5XL' THEN 9 END`);  
                            const size = sizesResult.rows.map((row) => row);
                            products.push({ color: colorName, size });
                        }
                    }
                }
                else{
                    await conn.query(`SELECT * FROM varijacije WHERE PRODUCT_id= '${id}'`,async (e, var_sku) => {
                        let result = var_sku.rows;
                        varijacijeSku = result;
                    })
                }
                const productsRandom = await conn.query(`SELECT * FROM inventory WHERE id != '${shirts.id}' ORDER BY RANDOM() LIMIT 10`)
                        randomProducts = productsRandom.rows;
                res.render('pages/productShow', { shirts, products, colors,cart, productsJSON: JSON.stringify(products), randomProducts,invt_SKU:JSON.stringify(invt_sku), subCat:JSON.stringify(subCat), checkCat:JSON.stringify(shirts.category) });
            });
        } else {
            req.flash('error', err.message);
            res.redirect('/');
        }
    })
})
*/

/*
app.get("/cart", async (req, res) => {
    let items = [];
    let cartItems = []
    let sizes = [];
    let randomProducts;;
    let count = 0
    let countSizes = 0;
    let cart = req.session.cart;
    let total = req.session.total;
    //console.log("cart", cart)
    if (cart) {
        if (!cart.length) {
            req.flash('error', "Košarica je prazna.")
            res.redirect('/')
        } else {
            for (let i = 0; i < cart.length; i++) {
                await conn.query(`SELECT * FROM inventory, varijacije WHERE inventory.id='${cart[i].product_id}' AND varijacije.sku='${cart[i].sku}' `, async (e, results) => {
                    if (!e) {
                        let ordered = results.rows;
                        //console.log("ordered",ordered)
                        items.push(results.rows)
                        countSizes += 1;
                        if (cart.length === countSizes) {
                            //console.log(items)
                            res.render('orders/cart', { items, cart, ordered, s_pk })
                        }
                    }
                    else {
                        console.log(e.message);
                        res.redirect('/')
                    }
                })
            }
            calculateTotal(cart, req)
        }
    } else {
        req.flash('error', "Košarica je prazna.")
        res.redirect('/')
    }

})
*/

/*
    if (plus_btn) {
        for (let i = 0; i < cart.length; i++) {
            if (cart[i].sku == id) {
                await conn.query(`SELECT qty FROM varijacije WHERE sku = '${cart[i].sku}'`, (err, result) => { 
                    if (!err) {
                        if (cart[i].qty > 0 && cart[i].qty < result.rows[0].qty) {
                            cart[i].qty = parseInt(cart[i].qty) + 1;
                            res.redirect('/cart');
                        } else {
                            req.flash('error', `Maximalna količina za naročilo je ${result.rows[0].qty}`)
                            res.redirect('/cart')
                        }
                    } else {
                        req.flash('error',err.message);
                        res.redirect('/cart');
                    }
                    })
            }
        }

    }
    if (minus_btn) {
        for (let i = 0; i < cart.length; i++) {
            if (cart[i].sku == id) {
                if (cart[i].qty > 1) {
                    cart[i].qty = parseInt(cart[i].qty) - 1;
                    res.redirect('/cart');
                } else {
                    req.flash('error', "Minimalna količina je 1.")
                    res.redirect('/cart');
                }
            }
        }
    }
    */

/*
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
*/

/* 
app.get('/payment', async (req, res) => {
    const ifPayed = await stripe.paymentIntents.retrieve(req.session.payment);
    let invoicePrefix = Math.floor(1000 + Math.random() * 9000) + "-" + year;
    let invoice;
    if (ifPayed) {
        if (ifPayed.status == 'succeeded') {
            //? Create a new invoice
            await functions.getOrdersAndInvoiceInfo(invoice, infoicePrefix)
            
            await conn.query(`SELECT * FROM orders`, async (e, result) => {
                if (e) {
                    console.log('Error was returned', e.message)
                } else {
                    let data = result.rows;
                    if (!data.length) {
                        invoice = invoicePrefix + "-" + 1
                    } else {
                        invoiceNum = data.length + 1;
                        //console.log("invoiceNum: ",invoiceNum)
                        invoice =invoicePrefix + "-" + invoiceNum;
                    }
                }
            })

            //! Update payment object, added invoice number

            const shippingInfo = ifPayed.shipping;
            const paymenthMethod = await stripe.paymentMethods.retrieve(ifPayed.payment_method);
            await stripe.paymentIntents.update(ifPayed.id, {
                receipt_email: paymenthMethod.billing_details.email,
                metadata: {
                    invoice: `${invoice}`,
                }
            });
            const updated = await stripe.paymentIntents.retrieve(req.session.payment);
            //! Start of code for saving data to dbs

            let orderDate = todayDate.toLocaleString();
            let product_sku = [];
            let product_qtys = [];
            //let product_qtys = "";
            let cart = req.session.cart;
            let user_id = cart[0].user_id;
            for (let i = 0; i < cart.length; i++) {
                product_sku.push(cart[i].sku)
                product_qtys.push(cart[i].qty)
                //product_qtys = cart[i].qty + ',' + product_qtys;
            }

            try {
                await conn.query(`INSERT INTO orders(trackingNum, invoice, name, email, country, city, zip, street, phone, sended,date, costs, products_ids, product_qtys, user_id) VALUES('${ifPayed.metadata.trackOrder_id}', '${invoice}','${shippingInfo.name}', '${paymenthMethod.billing_details.email}', '${shippingInfo.address.country}', '${shippingInfo.address.city}', '${shippingInfo.address.postal_code}', '${shippingInfo.address.line1}', '${shippingInfo.phone}','false','${orderDate}', '${req.session.total}', '${product_ids}', '${product_qtys}', '${user_id}')`, async (err, result) => {
                    if (err) {
                        req.flash('error', "Error: " + err.message);
                        res.redirect('/order')
                    } else {
                        req.session.cart = "";
                        req.session.total = "";
                        req.session.trackingNumber = "";

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
                        for (let j = 0; j < product_ids.length; j++) {
                            await conn.query(`SELECT * FROM varijacije WHERE sku = '${product_ids[j]}'`, async (e, result) => {
                                if(e){
                                    console.log("error update qty products", e.message);
                                }
                                else{
                                    const qty = result.rows[0].qty - parseInt(product_qtys[j]);
                                    await conn.query(`UPDATE varijacije SET QTY = '${qty}' WHERE sku = '${result.rows[0].sku}'`);
                                    console.log("Successfully updated")
                                }
                            })
                        }

                        req.flash('success', "Hvala za zaupanje. Vaše naročilo je v obdelavi.")
                        res.redirect('/redirect')
                    }
                })
            } catch (e) {
                req.flash('error', "Error: ", e.message)
                res.redirect('/order');
            }
        } else {
            req.flash('error', "Prosim, izberite način plačila.")
            res.redirect('/order');
        }
    } else {
        res.redirect('/');
    }
})
*/

/*
app.get('/redirect', async (req, res) => {
    const cart = req.session.cart;
    if (req.session.payment) {
        const data = await stripe.paymentIntents.retrieve(req.session.payment);
        await conn.query(`SELECT * FROM orders WHERE user_id = '${data.metadata.user_id}' AND trackingNum = '${data.metadata.trackOrder_id}'`, async (error, order) => {
            if (error) {
                console.log("this is error", error.message)
                res.redirect('/')
            } else {
                const myOrder = order.rows;
                if (!myOrder.length) {
                    req.flash('error', "Nothin saved to db")
                    req.session.payment = '';
                    res.redirect('/')
                } else {
                    req.session.payment = '';
                    res.render('orders/redirect', { myOrder,cart })
                }
            }
        })
    } else {
        res.redirect('/')
    }
})
*/

/*

app.post('/addProduct', upload.fields([{ name: 'image1' }, { name: 'image2' }, { name: 'image3' }, { name: 'image4' }, { name: 'image5' },{ name: 'image6' }, { name: 'image7' }, { name: 'image8' }, { name: 'image9' }, { name: 'image10' }, {name: 'bgImage'}]), async (req, res) => {
    const product = req.body;
    let bgImage = req.files['bgImage'][0].path;
    let brutoPrice = Math.ceil(product.p_price * 0.18)
    let netoPrice = parseFloat(brutoPrice) + parseFloat(product.p_price) + 0.99;
    let total = parseFloat(netoPrice);
    let imgsUrl = [];
    let imgNum = 1;
    let sizeCount = 1;
    let month = todayDate.getMonth() + 1;
    let day = todayDate.getDate();
    let getInvt_sku;
    let varijacijePid;

    let firstCheck = Object.keys(req.files).length - 1;
    let imgTest = Object.keys(req.files);
    images = [];
    if (imgTest.length <= 2) {
        const productImgs = req.files[`image${imgNum}`];
        for(let productimg of productImgs) {
            images.push(productimg.path);
        }
        imgsUrl.push(images)
    }
    else{
        for (let i = 0; i < firstCheck; i++) {
            //images = [];
            //let secondCheck = req.files[`image${imgNum}`].length;
            let getImg = req.files[`image${imgNum}`];
                for (let img = 0; img < getImg.length; img++) {
                    images.push(getImg[img].path)
                }
            imgNum += 1;
            imgsUrl.push(images);
            images = [];
        }
    }
        

        await conn.query(`SELECT inventory_pid FROM inventory ORDER BY inventory_pid DESC LIMIT 1`,async(e,lastSku)=>{
            const pid = lastSku.rows[0];
            if(pid !== undefined){
                console.log("Check for invt sku")
                getInvt_sku = parseInt(pid.inventory_pid) + 1;
            }else{
                console.log("Set invt sku to 1")
                getInvt_sku = "1";
            }

            await conn.query(`SELECT var_pid FROM varijacije ORDER BY var_pid DESC LIMIT 1`,async(e,varSku)=>{
                const vid = varSku.rows[0]
                if(vid != undefined){
                    varijacijePid = parseInt(vid.var_pid) + 1;
                }else{
                    varijacijePid = "1";
                }
            });

            let invt_sku = day + "-" + month + "-" + year + "-" + getInvt_sku;
            if(product.p_subcat !== 'Toys' && product.p_subcat !== 'Other' && product.p_cat !== 'Jewerly'){
                console.log("getInvt_sku: ", getInvt_sku)
                console.log("Invt_sku: ", invt_sku)
                await conn.query(`INSERT INTO inventory(name,neto_price, info, description,category, subcategory, bgImage, links, created, inventory_sku, inventory_pid) VALUES('${product.p_name}', '${total.toFixed(2)}', '${product.p_desc}', '${product.p_fulldescription}','${product.p_cat}', '${product.p_subcat}', '${bgImage}', array_to_json('{${imgsUrl}}'::text[]), '${date}', '${invt_sku}', '${getInvt_sku}') RETURNING id`, async (err, result) => {
                if (!err) {
                    for (let i = 0; i < product.color.length; i++) {
                        for (let j = 0; j < req.body[`size${sizeCount}`].length; j++) {
                            sku = parseInt(Math.random(12 * 35637) * 10000) + "-" + year + "-" + varijacijePid;
                            console.log("sku", sku)
                            console.log("varijacijepid", varijacijePid)
                            if(req.body[`qty${sizeCount}`][j] > 0) {
                                await conn.query(`INSERT INTO varijacije(product_id, size, sku, img_link, qty,color, var_pid) VALUES('${result.rows[0].id}', '${req.body[`size${sizeCount}`][j]}', '${sku}',array_to_json('{${imgsUrl[i]}}'::text[]), '${req.body[`qty${sizeCount}`][j]}', '${product.color[i]}', '${parseInt(varijacijePid)}')`)
                                varijacijePid = parseInt(varijacijePid) + 1;
                            }
                        }
                        sizeCount += 1;
                    }
                    req.flash('success', "Successfully added new product")
                }
                else {
                    console.log("Here is error jebeni: ", err.message)
                    req.flash('error', `Something went wrong. ${err.message}`);
                    res.redirect('/add');
                }
            })
            }
            else{
                await conn.query(`INSERT INTO inventory(name,neto_price, info, description,category, subcategory,bgImage, links, created, inventory_sku, inventory_pid) VALUES('${product.p_name}', '${total.toFixed(2)}', '${product.p_desc}', '${product.p_fulldescription}','${product.p_cat}', '${product.p_subcat}', '${bgImage}', array_to_json('{${imgsUrl}}'::text[]), '${date}', '${invt_sku}', '${getInvt_sku}') RETURNING id`, async (e, toys) => {
                    if(e){
                        req.flash('error', "Error inserting product into database", e.message)
                        console.log("Error","this is error", e.message)
                    }
                    else{
                if(Array.isArray(product.color)){
                    for (let i = 0; i < product.color.length; i++) {
                        let sku = parseInt(Math.random(12 * 35637) * 10000) + "-" + year + "-" + varijacijePid;
                        await conn.query(`INSERT INTO varijacije(product_id, sku, img_link, qty,color, var_pid) VALUES('${toys.rows[0].id}', '${sku}',array_to_json('{${imgsUrl[i]}}'::text[]), '${product.qty1[i]}', '${product.color[i]}', '${varijacijePid}')`)
                        varijacijePid = parseInt(varijacijePid) + 1;
                    }
                }
                else{
                    let sku = parseInt(Math.random(12 * 35637) * 10000) + "-" + year + "-" + varijacijePid;
                    await conn.query(`INSERT INTO varijacije(product_id, sku, img_link, qty,color, var_pid) VALUES('${toys.rows[0].id}', '${sku}',array_to_json('{${imgsUrl}}'::text[]), '${product.qty1}', '${product.color}', '${varijacijePid}')`)
                    console.log("Single added product toys")
                }
                    }
                })
            }
        });
    await conn.query(`DELETE FROM varijacije WHERE qty = '0'`);
    res.redirect('/add')
})
*/


