if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const express = require('express');
const app = express();
const layouts = require('ejs-mate')
const session = require('express-session')
const flash = require('connect-flash')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const helmet = require('helmet')
const bodyParser = require("body-parser");
const path = require('path');
const fs = require('fs');
const override = require('method-override');
const PostgreSQLStore = require('connect-pg-simple')(session)
const bcrypt = require('bcrypt')
const { Client } = require('pg')
const { isLoged, checkCart } = require('./utils/isLoged')
const { cloudinary } = require('./cloudinary/cloudConfig');
const multer = require('multer');
const { storage } = require('./cloudinary/cloudConfig');
const { randomUUID } = require('crypto');
const upload = multer({ storage })
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SK)
const nodemailer = require('nodemailer');
//const upload = multer({ dest: 'uploads/' })


const yoo = process.env.YOO;
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

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.engine('ejs', layouts);
app.use(express.urlencoded({ extended: true }));
app.use(override('_method'))
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());


const s_sk = process.env.STRIPE_SK;
const s_pk = process.env.STRIPE_PK;
const server_url = process.env.SERVER_URL;

app.use(session({
    store: new PostgreSQLStore({
        pool: client,             // Connection pool
        //tableName: 'session'   // Use another table-name than the default "session" one
        // Insert connect-pg-simple options here
    }),
    name: 'session',
    secret: process.env.IGNORE_ME,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        maxAge: 2 * 24 * 60 * 60 * 1000
    },
    // 1 day
    //returnTo: req.originalUrl
    // Insert express-session options here
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use('local', new LocalStrategy(({
    usernameField: 'email',
    passwordField: 'password',
}),
    (email, password, done) => {
        conn.query(`SELECT * FROM users WHERE users.email='${email}'`, (err, results) => {
            if (err) {
                console.log(err.messages, ' first error');
            }
            if (results.rows.length > 0) {
                const user = results.rows[0];
                bcrypt.compare(password, user.password, (err, isMatch) => {
                    if (err) {
                        console.log(err);
                    }
                    if (isMatch) {
                        //console.log("heeeeeeeeeyyy userrrrrrrrrrrrr", user)
                        return done(null, user);
                    } else {
                        //password is incorrect
                        return done(null, false, { message: "Wrong email or password." });
                    }
                });
            } else {
                // No user
                return done(null, false, {
                    message: "No user register with that email address"
                });
            }
        })
    }));
passport.serializeUser((user, done) => {
    done(null, user.id, user.fname, user.email)
});
passport.deserializeUser((id, done) => {
    conn.query(`SELECT id, fname, email FROM users WHERE id = $1`, [id], (err, results) => {
        if (err) {
            return done(err);
        }
        return done(null, results.rows[0]);
    });
});

app.use(flash());

app.use((req, res, next) => {
    //console.log('-----i am session-----', req.user)
    //console.log(req.sessionID)
    res.locals.logedUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next(); // Pass the request to the next middleware/route handler
})

let todayDate = new Date();
let date = todayDate.toLocaleDateString()
let year = todayDate.getFullYear();

//let subtotal = [];

async function deleteZeroQty() {
    await conn.query(`DELETE FROM varijacije WHERE qty = '0' RETURNING *`, async(err, result) => {
        if (!err) {
            const data = result.rows;
            if (data.length) {
                for (let i = 0; i < data.length; i++) {
                    let product = data[i].product_id;
                    await conn.query(`SELECT * FROM varijacije WHERE product_id ='${product}'`, async (e, info) => {
                        if (!info.rows.length) {
                            await conn.query(`DELETE FROM inventory WHERE id='${product}' RETURNING *`, async (err, answer) => {
                                if (!err) {
                                    let result = answer.rows;
                                    await conn.query(`INSERT INTO deleted (id, sku, name, neto_price, info, description,category, subcategory, links) VALUES( '${data[i].product_id}', '${data[i].sku}', '${result[0].name}', '${result[0].neto_price}', '${result[0].info}', '${result[0].description}', '${result[0].category}','${result[0].subcategory}', '${result[0].links}')`)
                                } else {
                                    console.log("Error deleting from inventory: ", err);
                                }
                            })
                        }
                    })
                }
            }
        } else {
            console.log(err.message);
        }
    });
}

function calculateTotal(cart, req) {
    total = 0;
    for (let i = 0; i < cart.length; i++) {
        total = total + (cart[i].price * cart[i].qty)
    }
    req.session.total = total;
    return total;
}

deleteZeroQty();

app.get('/', async (req, res) => {
    let date = new Date();
    let day = date.getDay()
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
                        res.render('pages/home', { products, varijacije })
                    }
                })
            }
        }
    })
})

app.get('/searched', async (req, res) => {
    deleteZeroQty();
    res.render('pages/searched')
})

app.post('/search', async (req, res) => {
    let data = req.body.searched;
    
    await conn.query(`SELECT * FROM inventory WHERE category ~* '${data}' OR name ~* '${data}' OR subcategory ~*'${data}' OR info ~* '${data}' OR description ~* '${data}'`, async (err, shirts) => {
        if (!err) {
            let products = shirts.rows;
            res.render('pages/searched', { products })
        } else {
            req.flash('error', 'Nothing to show')
            res.redirect('/')
        }
    })
})

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
                            const sizesResult = await conn.query(`SELECT size, sku FROM varijacije WHERE product_id='${id}' AND color='${colorName}' ORDER BY size ASC`);
                            const size = sizesResult.rows.map((row) => row);
                            //console.log("Sizes", size)
                            products.push({ color: colorName, size });
                        }
                        if((shirts.category === 'Mens' || shirts.category === 'Womens') && !excludedSubcategories.includes(shirts.subcategory)) {
                            const sizesResult = await conn.query(`SELECT size, sku FROM varijacije WHERE product_id='${id}' AND color='${colorName}' ORDER BY CASE WHEN size = 'XS' THEN 1 WHEN size = 'S' THEN 2 WHEN size = 'M' THEN 3 WHEN size = 'L' THEN 4 WHEN size = 'XL' THEN 5 WHEN size = '2XL' THEN 6 WHEN size = '3XL' THEN 7 WHEN size = '4XL' THEN 8 WHEN size = '5XL' THEN 9 END`);  
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
                res.render('pages/productShow', { shirts, products, colors, productsJSON: JSON.stringify(products), randomProducts,invt_SKU:JSON.stringify(invt_sku), subCat:JSON.stringify(subCat), checkCat:JSON.stringify(shirts.category) });
            });
        } else {
            req.flash('error', err.message);
            res.redirect('/');
        }
    })
})


app.post('/add-to-cart', async (req, res) => {
    let { product_id, product_name, product_color, product_size, product_price, product_sku, invt_sku } = req.body;
    let exist ;
    let user_id = randomUUID();
    console.log("body", req.body)
    if (req.session.cart) {
        for (let i = 0; i < req.session.cart.length; i++) {
            if (req.session.cart[i].sku === product_sku) {
                exist = true;
            }
        }
        if (exist) {
            req.flash('error', "Izdelek je že dodan v košarico.")
                res.redirect(`/product/${product_id}`)
        } else {
            let product = { product_id: product_id, sku: product_sku, invt_sku: invt_sku, name: product_name, color: product_color, size: product_size, qty: 1, price: product_price };
            let cart = req.session.cart;
            cart.push(product)
            req.flash('success', 'Uspečno dodano v košarico')
            res.redirect(`/product/${product_id}`)
            }

    } else {
        let product = { user_id: user_id , product_id: product_id, sku: product_sku, invt_sku: invt_sku,name: product_name, color: product_color, size: product_size, qty: 1, price: product_price};
        req.session.cart = [product]
        req.session.userID = user_id;
        let cart = req.session.cart;
        req.flash('success', 'Uspečno dodano v košarico')
        res.redirect(`/product/${product_id}`)
    }


});

app.get('/remove/:id', async (req, res) => {
    const { id } = req.params;
    let cart = req.session.cart;

    for (let i = 0; i < cart.length; i++) {
        if (cart[i].sku == id) {
            cart.splice(cart.indexOf(cart[i]), 1)
        }
    }
    res.redirect('/cart')

})

app.post('/edit_qty', async (req, res) => {
    let id = req.body.id;
    let qty = req.body.qty;
    let plus_btn = req.body.plus;
    let minus_btn = req.body.minus;
    let cart = req.session.cart;
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

    calculateTotal(cart, req)

})

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

app.get('/config', (req, res) => {
    const user_id = req.session.user_id
    res.send({
      publishableKey: process.env.STRIPE_PK, SERVER_URL: server_url, user_id: user_id
    });
});

app.get("/fetchOrder", async (req, res) => {
    let total = req.session.total.toFixed(2)
    let user_id = req.session.cart[0].user_id;
    let cart = req.session.cart;
    let invoice = Math.floor(1000 + Math.random() * 9000) + "-" + year + "-" + Math.floor(Math.random() * 10);

    let checkTrackNum = req.session.trackingNumber;
    if (!checkTrackNum) {
        req.session.trackingNumber = Math.floor(10000 + Math.random() * 90000) + year + "-" + Math.floor(Math.random() * 7500);
    }
   // console.log(req.session)
    let discount
    if(total > 50){
        discountPrice = total - (total * 0.10).toFixed(2)
        discount = discountPrice.toFixed(2)
    }else{
        discount = total;
    }

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(discount * 100), // Amount in cents
      currency: "eur",
      description: 'Salester, plačilo nakupa.',
      automatic_payment_methods: {
          enabled: true,
        },
        metadata: {
        trackOrder_id: req.session.trackingNumber,
        //invoice: invoice must update after user confirmed payment,
        user_id: `${user_id}`,
        },

        });
       // console.log("Payment intent on fetchOrder",paymentIntent)
        req.session.payment = paymentIntent.id;
        invoice = ""

    res.send({
      clientSecret: paymentIntent.client_secret
    });
});
app.get('/order', async (req, res) => {
    let cart = req.session.cart;
    if(!cart){
        res.redirect('/')
    }else{
    let total = req.session.total.toFixed(2)
    let totalPrice
    if(total > 50){
        discountPrice = total - (total * 0.10).toFixed(2)
        totalPrice = discountPrice.toFixed(2)
    }else{
        totalPrice = total;
    }
    let items = [];
    let cartItems = []
    let count = 0
    const publishableKey = process.env.STRIPE_PK;
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
}
})

app.post('/placeOrder', async (req, res) => {
    let total = req.session.total.toFixed(2);
    console.log("No my turn",total);
    try {
        const { payment_Method, billing_details } = req.body;
        console.log(payment_Method);
        console.log("--///----///-----");
        console.log(billing_details);
        const paymentIntent = await stripe.paymentIntents.create({
            amount: total,
            currency: 'eur',
            description: 'Your Description',
            payment_method: payment_Method,
            receipt_email: billing_details.email,
        });

        const confirmResult = await stripe.paymentIntents.confirm(paymentIntent.id);

    } catch (error) {
        console.error('Error processing payment:', error);
        req.flash('Error processing payment:', error);
        res.redirect('/order');
    }
});

app.get('/payment', async (req, res) => {
    const ifPayed = await stripe.paymentIntents.retrieve(req.session.payment);
    let invoicePrefix = Math.floor(1000 + Math.random() * 9000) + "-" + year;
    let invoice;
    if (ifPayed) {
        if (ifPayed.status == 'succeeded') {
            //? Create a new invoice

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
            let product_ids = [];
            let product_qtys = [];
            //let product_qtys = "";
            let cart = req.session.cart;
            let user_id = cart[0].user_id;
            for (let i = 0; i < cart.length; i++) {
                product_ids.push(cart[i].sku)
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

app.get('/redirect', async (req, res) => {
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
                    deleteZeroQty();
                    res.render('orders/redirect', { myOrder })
                }
            }
        })
    } else {
        res.redirect('/')
    }
})

app.get('/add', async (req, res) => {
    res.render('addProducts/add')
});

app.post('/addProduct', upload.fields([{ name: 'image1' }, { name: 'image2' }, { name: 'image3' }, { name: 'image4' }, { name: 'image5' },{ name: 'image6' }, { name: 'image7' }, { name: 'image8' }, { name: 'image9' }, { name: 'image10' }, {name: 'bgImage'}]), async (req, res) => {
    const product = req.body;
    console.log("-----///--------///-----");
    let bgImage = req.files['bgImage'][0].path;
    let brutoPrice = Math.ceil(product.p_price * 0.18)
    let netoPrice = parseFloat(brutoPrice) + parseFloat(product.p_price) + 0.99;
    let total = parseFloat(netoPrice);
    let imgsUrl = [];
    let imgNum = 1;
    let sizeCount = 1;
    let productQty = 0;

    let firstCheck = Object.keys(req.files).length - 1;
    let imgTest = Object.keys(req.files);
    images = [];
    if (imgTest.length <= 2) {
        const productImgs = req.files[`image${imgNum}`];
        console.log("me to")
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
        let month = todayDate.getMonth() + 1;
        let day = todayDate.getDate();
        let some_sku = parseInt(Math.random(12 * 35637) * 10000) + "-" + year;
        let randomNum = parseInt(Math.random(15 * 12489) * 1000)
        let invt_sku = day + "-" + month + randomNum + '-' + some_sku;

    if(product.p_subcat !== 'Toys' && product.p_subcat !== 'Other'){
        await conn.query(`INSERT INTO inventory(name,neto_price, info, description,category, subcategory, bgImage, links, created, inventory_sku) VALUES('${product.p_name}', '${total.toFixed(2)}', '${product.p_desc}', '${product.p_fulldescription}','${product.p_cat}', '${product.p_subcat}', '${bgImage}', array_to_json('{${imgsUrl}}'::text[]), '${date}', '${invt_sku}') RETURNING id`, async (err, result) => {
        if (!err) {
            for (let i = 0; i < product.color.length; i++) {
                for (let j = 0; j < req.body[`size${sizeCount}`].length; j++) {
                    let sku = parseInt(Math.random(12 * 35637) * 10000) + "-" + year
                    await conn.query(`INSERT INTO varijacije(product_id, size, sku, img_link, qty,color) VALUES('${result.rows[0].id}', '${req.body[`size${sizeCount}`][j]}', '${sku}',array_to_json('{${imgsUrl[i]}}'::text[]), '${req.body[`qty${sizeCount}`][j]}', '${product.color[i]}')`)
                }
                sizeCount += 1;
            }
            req.flash('success', "Successfully added new product")
            await conn.query(`DELETE FROM varijacije WHERE qty = '0'`);
        }
        else {
            console.log("Here is error jebeni: ", err.message)
            req.flash('error', `Something went wrong. ${err.message}`);
            res.redirect('/add');
        }
        })
    }
    else{
        await conn.query(`INSERT INTO inventory(name,neto_price, info, description,category, subcategory,bgImage, links, created, inventory_sku) VALUES('${product.p_name}', '${total.toFixed(2)}', '${product.p_desc}', '${product.p_fulldescription}','${product.p_cat}', '${product.p_subcat}', '${bgImage}', array_to_json('{${imgsUrl}}'::text[]), '${date}', '${invt_sku}') RETURNING id`, async (e, toys) => {
            if(e){
                req.flash('error', "Error inserting product into database", e.message)
                console.log("Error", e.message)
            }
            else{
                if(Array.isArray(product.color)){
                    for (let i = 0; i < product.color.length; i++) {
                        let sku = parseInt(Math.random(12 * 35637) * 10000) + "-" + year
                        await conn.query(`INSERT INTO varijacije(product_id, sku, img_link, qty,color) VALUES('${toys.rows[0].id}', '${sku}',array_to_json('{${imgsUrl[i]}}'::text[]), '${product.qty1[i]}', '${product.color[i]}')`)
                    }
                }
                else{
                    let sku = parseInt(Math.random(12 * 35637) * 10000) + "-" + year
                    await conn.query(`INSERT INTO varijacije(product_id, sku, img_link, qty,color) VALUES('${toys.rows[0].id}', '${sku}',array_to_json('{${imgsUrl}}'::text[]), '${product.qty1}', '${product.color}')`)
                    console.log("Single added product toys")
                }
            }
        })
    }

    res.redirect('/add')
})


// ARTICL PAGES

//! MENS
app.get('/category/mens', async (req, res) => {
    await conn.query(`SELECT * FROM inventory WHERE category = 'Mens'`, async (err, result) => {
        let products = result.rows
        if (!products.length) {
            req.flash('error', ' Nothing to display.')
            res.redirect('/')
        } else {
            if (!err) {
                res.render('artikli/mens/mens', { products })
            }
        }
    })
})

app.get('/category/mens/subcategory/shirts', async (req, res) => {
    await conn.query(`SELECT * FROM inventory WHERE category = 'Mens' AND subcategory = 'Shirts'`, async (err, result) => {
        //console.log(result.rows.length)
        let products = result.rows
        if (!products.length) {
            req.flash('error', ' Nothing to display.')
            res.redirect('/mens')
        } else {
            if (!err) {
                res.render('artikli/mens/shirts', { products })
            }
        }
    })

})

app.get('/category/mens/subcategory/jackets', async (req, res) => {
    await conn.query(`SELECT * FROM inventory WHERE category = 'Mens' AND subcategory = 'Jackets'`, async (err, result) => {
        let products = result.rows
        if (!products.length) {
            req.flash('error', ' Nothing to display.')
            res.redirect('/')
        } else {
            if (!err) {
                res.render('artikli/mens/jackets', { products })
            }
        }
    })

})

app.get('/category/mens/subcategory/pants', async (req, res) => {
    await conn.query(`SELECT * FROM inventory WHERE category = 'Mens' AND subcategory = 'Pants'`, async (err, result) => {

        let products = result.rows
        if (!products.length) {
            req.flash('error', ' Nothing to display.')
            res.redirect('/')
        } else {
            if (!err) {

                res.render('artikli/mens/pants', { products })

            }
        }
    })
})

app.get('/category/mens/subcategory/underwear', async (req, res) => {
    await conn.query(`SELECT * FROM inventory WHERE category = 'Mens' AND subcategory = 'Underwear'`, async (err, result) => {

        let products = result.rows
        if (!products.length) {
            req.flash('error', ' Nothing to display.')
            res.redirect('/')
        } else {
            if (!err) {

                res.render('artikli/mens/underwear', { products })

            }
        }
    })
})

app.get('/category/mens/subcategory/shoes', async (req, res) => {
    await conn.query(`SELECT * FROM inventory WHERE category = 'Mens' AND subcategory = 'Shoes'`, async (err, result) => {

        let products = result.rows
        if (!products.length) {
            req.flash('error', ' Nothing to display.')
            res.redirect('/')
        } else {
            if (!err) {

                res.render('artikli/mens/shoes', { products })
            }
        }
    })
})

app.get('/category/mens/subcategory/pajamas', async (req, res) => {
    await conn.query(`SELECT * FROM inventory WHERE category = 'Mens' AND subcategory = 'Pajamas'`, async (err, result) => {

        let products = result.rows
        if (!products.length) {
            req.flash('error', ' Nothing to display.')
            res.redirect('/')
        } else {
            if (!err) {

                res.render('artikli/kids/pajamas', { products })
            }
        }
    })
})
//! WOMENS

app.get('/category/womens', async (req, res) => {
    await conn.query(`SELECT * FROM inventory WHERE category = 'Womens'`, async (err, result) => {
        let products = result.rows
        if (!products.length) {
            req.flash('error', ' Nothing to display.')
            res.redirect('/')
        } else {
            if (!err) {

                res.render('artikli/womens/womens', { products })

            }
        }
    })
})

app.get('/category/womens/subcategory/shirts', async (req, res) => {
    await conn.query(`SELECT * FROM inventory WHERE category = 'Womens' AND subcategory = 'Shirts'`, async (err, result) => {
        let products = result.rows
        if (!products.length) {
            req.flash('error', ' Nothing to display.')
            res.redirect('/')
        } else {
            if (!err) {
                res.render('artikli/womens/shirts', { products })
            }
        }
    })

})

app.get('/category/womens/subcategory/jackets', async (req, res) => {
    await conn.query(`SELECT * FROM inventory WHERE category = 'Womens' AND subcategory = 'Jackets'`, async (err, result) => {

        let products = result.rows
        if (!products.length) {
            req.flash('error', ' Nothing to display.')
            res.redirect('/')
        } else {
            if (!err) {

                res.render('artikli/womens/jackets', { products })

            }
        }
    })
})

app.get('/category/womens/subcategory/pants', async (req, res) => {
    await conn.query(`SELECT * FROM inventory WHERE category = 'Womens' AND subcategory = 'Pants'`, async (err, result) => {
        let products = result.rows
        if (!products.length) {
            req.flash('error', ' Nothing to display.')
            res.redirect('/')
        } else {
            if (!err) {

                res.render('artikli/womens/pants', { products })

            }
        }
    })
})

app.get('/category/womens/subcategory/underwear', async (req, res) => {
    await conn.query(`SELECT * FROM inventory WHERE category = 'Womens' AND subcategory = 'Underwear'`, async (err, result) => {

        let products = result.rows
        if (!products.length) {
            req.flash('error', ' Nothing to display.')
            res.redirect('/')
        } else {
            if (!err) {
                res.render('artikli/womens/underwear', { products })
            }
        }
    })
})

app.get('/category/womens/subcategory/pajamas', async (req, res) => {
    await conn.query(`SELECT * FROM inventory WHERE category = 'Womens' AND subcategory = 'Pajamas'`, async (err, result) => {

        let products = result.rows
        if (!products.length) {
            req.flash('error', ' Nothing to display.')
            res.redirect('/')
        } else {
            if (!err) {

                res.render('artikli/kids/pajamas', { products })
            }
        }
    })
})

app.get('/category/womens/subcategory/shoes', async (req, res) => {
    await conn.query(`SELECT * FROM inventory WHERE category = 'Womens' AND subcategory = 'Shoes'`, async (err, result) => {

        let products = result.rows
        if (!products.length) {
            req.flash('error', ' Nothing to display.')
            res.redirect('/')
        } else {
            if (!err) {

                res.render('artikli/womens/shoes', { products })
            }
        }
    })
})
//! KIDS

app.get('/category/baby', async (req, res) => {
    await conn.query(`SELECT * FROM inventory WHERE category = 'Baby'`, async (err, result) => {
        let products = result.rows
        if (!products.length) {
            req.flash('error', ' Nothing to display.')
            res.redirect('/')
        } else {
            if (!err) {
                res.render('artikli/kids/baby', { products })
            }
        }
    })
})
app.get('/category/kids', async (req, res) => {
    let allProducts = [];
    await conn.query(`SELECT * FROM inventory WHERE category = 'Kids'`, async (err, result) => {
        if (!err) {
            let products = result.rows;
            //console.log(shirts[0].id)
            if (!products.length) {
                req.flash('error', ' Nothing to display.')
                res.redirect('/');
            } else {
                res.render('artikli/kids/kids', { products })
            }
        } else {
            req.flash('error', err.message);
            res.redirect('/');

        }
    })

})

app.get('/category/kids/subcategory/shirts', async (req, res) => {
    await conn.query(`SELECT * FROM inventory WHERE category = 'Kids' AND subcategory = 'Shirts'`, async (err, result) => {

        let products = result.rows
        if (!products.length) {
            req.flash('error', ' Nothing to display.')
            res.redirect('/')
        } else {
            if (!err) {

                res.render('artikli/kids/shirts', { products })

            }
        }
    })

})

app.get('/category/kids/subcategory/jackets', async (req, res) => {
    await conn.query(`SELECT * FROM inventory WHERE category = 'Kids' AND subcategory = 'Jackets'`, async (err, result) => {

        let products = result.rows
        if (!products.length) {
            req.flash('error', ' Nothing to display.')
            res.redirect('/')
        } else {
            if (!err) {

                res.render('artikli/kids/jackets', { products })
            }
        }
    })
})

app.get('/category/kids/subcategory/pants', async (req, res) => {
    await conn.query(`SELECT * FROM inventory WHERE category = 'Kids' AND subcategory = 'Pants'`, async (err, result) => {

        let products = result.rows
        if (!products.length) {
            req.flash('error', ' Nothing to display.')
            res.redirect('/')
        } else {
            if (!err) {

                res.render('artikli/kids/kidsPants', { products })

            }
        }
    })
})

app.get('/category/kids/subcategory/underwear', async (req, res) => {
    await conn.query(`SELECT * FROM inventory WHERE category = 'Kids' AND subcategory = 'Underwear'`, async (err, result) => {

        let products = result.rows
        if (!products.length) {
            req.flash('error', ' Nothing to display.')
            res.redirect('/')
        } else {
            if (!err) {

                res.render('artikli/kids/kidsUnderwear', { products })
            }
        }
    })
})

app.get('/category/kids/subcategory/pajamas', async (req, res) => {
    await conn.query(`SELECT * FROM inventory WHERE category = 'Kids' AND subcategory = 'Pajamas'`, async (err, result) => {

        let products = result.rows
        if (!products.length) {
            req.flash('error', ' Nothing to display.')
            res.redirect('/')
        } else {
            if (!err) {

                res.render('artikli/kids/pajamas', { products })
            }
        }
    })
})

app.get('/category/kids/subcategory/shoes', async (req, res) => {
    await conn.query(`SELECT * FROM inventory WHERE category = 'Kids' AND subcategory = 'Shoes'`, async (err, result) => {

        let products = result.rows
        if (!products.length) {
            req.flash('error', ' Nothing to display.')
            res.redirect('/')
        } else {
            if (!err) {

                res.render('artikli/kids/shoes', { products })
            }
        }
    })
})
app.get('/category/kids/subcategory/toys', async (req, res) => {
    await conn.query(`SELECT * FROM inventory WHERE category = 'Kids' AND subcategory = 'Toys'`, async (err, result) => {

        let products = result.rows
        if (!products.length) {
            req.flash('error', ' Nothing to display.')
            res.redirect('/')
        } else {
            if (!err) {

                res.render('artikli/kids/toys', { products })
            }
        }

    })
})

//! Jewerly
app.get('/category/jewerly', async (req,res)=>{
    await conn.query(`SELECT * FROM inventory WHERE category = 'Jewerly'`, async(err, result)=>{
        let products = result.rows
        if (!products.length) {
            req.flash('error', ' Nothing to display.')
            res.redirect('/')
        } else {
            if (!err) {
                res.render('artikli/jewerly', { products })
            }
        }
    })
})

app.get('/category/jewerly/subcategory/chain', async (req,res)=>{
    await conn.query(`SELECT * FROM inventory WHERE category = 'Jewerly' AND subcategory = 'chain'`, async(err, result)=>{
        let products = result.rows
        if (!products.length) {
            req.flash('error', ' Nothing to display.')
            res.redirect('/')
        } else {
            if (!err) {
                res.render('artikli/jewerly/chain', { products })
            }
        }
    })
})

app.get('/category/jewerly/subcategory/bracelet', async (req,res)=>{
    await conn.query(`SELECT * FROM inventory WHERE category = 'Jewerly' AND subcategory = 'bracelet'`, async(err, result)=>{
        let products = result.rows
        if (!products.length) {
            req.flash('error', ' Nothing to display.')
            res.redirect('/')
        } else {
            if (!err) {
                res.render('artikli/jewerly/bracelet', { products })
            }
        }
    })
})

app.get('/category/jewerly/subcategory/clock', async (req,res)=>{
    await conn.query(`SELECT * FROM inventory WHERE category = 'Jewerly' AND subcategory = 'clock'`, async(err, result)=>{
        let products = result.rows
        if (!products.length) {
            req.flash('error', ' Nothing to display.')
            res.redirect('/')
        } else {
            if (!err) {
                res.render('artikli/jewerly/clock', { products })
            }
        }
    })
})

app.get('/category/other', async (req, res) => {
    await conn.query(`SELECT * FROM inventory WHERE category = 'Other'`, async(e, result)=>{
        let products = result.rows
        if (!products.length) {
            req.flash('error', ' Nothing to display.')
            res.redirect('/')
        } else {
            if (!err) {
                res.render('artikli/other/other')
            }
        }
    })
})


app.get('/company', async (req, res) => {
    res.render('company/companyInfo')
})

app.get('/privacy', async (req, res) => {
    res.render('company/privacy')
})
app.get('/questions', async (req, res) => {
    res.render('company/questions')
})
app.get('/delivery', async (req, res) => {
    res.render('company/delivery')
})

app.get('/contract', async (req, res) => {
    res.render('company/contract')
})


//?---------------------------------------------

app.get('/register', async (req, res) => {
    /*
    res.render('users/register')
    */
    req.flash("success", "Get req working. Page not ready yet.")
    res.redirect('/')
})

app.get("/login", (req, res) => {
    /*
    res.render('users/login')
    */
    req.flash("success", "Get req working. Page not ready yet.")
    res.redirect('/')
})

//? WORKING ALL!!
app.post("/userLogin", passport.authenticate('local', { failureFlash: true, failureRedirect: 'login', keepSessionInfo: true }), async (req, res) => {
    const redirect = req.session.returnTo || '/';
    req.flash('success', 'Successfully logged', req.user.fname)
    delete req.session.returnTo;
    res.redirect(redirect)
})

//? WORKING!! Automatically LOGIN YESSSSSS WORKING!

app.post('/register', async (req, res, next) => {
    /*
    const users = req.body;

    await conn.query(`SELECT * FROM users WHERE users.email='${users.email}'`, async (notExists, exists) => {
        if (exists.rows.length) {
            req.flash('error', `${users.email} že obstaja. Registrirajte se s drugim računom ali se prijavite.`)
            res.redirect('/register')
        } else {
            const userPassword = await bcrypt.hash(users.password, 10)
            await conn.query(`INSERT INTO users (fName ,lName ,email ,country ,city ,zip, address, password) VALUES('${users.fname}' ,'${users.lname}', '${users.email}', '${users.country}', '${users.city}', '${users.zip}','${users.address}','${userPassword}')`, async (err, user) => {
                if (!err) {
                    passport.authenticate('local')(req, res, () => {
                        req.flash('success', `Uspešna registracija ${users.fname}`);
                        res.redirect('/')
                    })
                }
                else {
                    console.log(err.message)
                    res.redirect('/register')
                }
            })
        }
    })
    */
   req.flash('success',"Post req working but not ready yet.")
   res.redirect('/')
})

app.get('/logout', (req, res, next) => {
    /*
    req.logout(function (err) {
        if (err) {
            return next(err);
        } else {
            req.flash('success', 'Logged out.');
            res.redirect('/');
        }
    });
    */
   req.flash("success", "Get req working. Page not ready yet.")
   res.redirect("/")
});



//?---------------------------------------------



const port = process.env.PORT || 3000
app.listen(port,
    console.log(`listening on ${port}`))
