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
const functions = require('./siteJS/functions');
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
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(override('_method'))


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


function calculateTotal(cart, req) {
    total = 0;
    for (let i = 0; i < cart.length; i++) {
        total = total + (cart[i].price * cart[i].qty)
    }
    req.session.total = total;
    return total;
}

app.get('/', async (req, res) => {
    const cart = req.session.cart;
    await functions.deleteZeroQtyVariations();
    try{
        const products = await functions.getAllProducts();
        const varijacije = await functions.getVarijace();
        if(!products.length){
            req.flash('error', "Nothing to display.")
            res.render('pages/home',{products, varijacije, cart});
        }else{
            res.render('pages/home', {products, varijacije, cart});
        }
    }catch(err){
        console.log("Error: ",err.message)
    }
})

app.get('/company', async (req, res) => {
    const cart = req.session.cart;
    res.render('company/companyInfo', {cart})
})

app.get('/privacy', async (req, res) => {
    const cart = req.session.cart;
    res.render('company/privacy', {cart})
})
app.get('/questions', async (req, res) => {
    const cart = req.session.cart;
    res.render('company/questions', {cart})
})
app.get('/delivery', async (req, res) => {
    const cart = req.session.cart;
    res.render('company/delivery', {cart})
})

app.get('/contract', async (req, res) => {
    const cart = req.session.cart;
    res.render('company/contract', {cart})
})
app.get('/verification', async (req, res) => {
    res.render('verification')
})

app.get('/searched', async (req, res) => {
    const cart = req.session.cart;
    res.render('pages/searched', {cart})
})

app.post('/search', async (req, res) => {
    let data = req.body.searched;
    const cart = req.session.cart;
    try{
        const shirts = await conn.query(`SELECT * FROM inventory WHERE category ~* $1 OR name ~* $2 OR subcategory ~* $3 OR info ~* $4 OR description ~* $5`, [data,data,data,data,data])
        let products = shirts.rows;
        if(products.length){
            res.render('pages/searched', { products,cart });
        }else{
            req.flash('error', "Ni najdenih izdelkov.");
            res.redirect('/');
        }
    }catch(err){
        console.error("error: ", err.message);
        req.flash('error', "Ni najdenih izdelkov.");
        res.redirect('/');
    }

})

app.get('/product/:category/:subcategory/:name/:id', async (req, res) => {
    let { id } = req.params;
    const cart = req.session.cart;
    let randomProducts;
    let products = [];
    let sizes = [];
    let varijacijeSku;
    try{
        const shirts = await functions.getProductDetails(id);
        const colors = await functions.getDistinctColors(id);
        let invt_sku = shirts.inventory_sku
        const subCat = shirts.subcategory;
        if(colors.length > 0) {
            for (let i = 0; i < colors.length; i++) {
                const colorName = colors[i].color;
                const size = await functions.getSizes(id, colorName, shirts);
                products.push({color: colorName, size})
            }
        }
        else{
            await conn.query(`SELECT * FROM varijacije WHERE PRODUCT_id= '${id}'`,async (e, var_sku) => {
                let result = var_sku.rows;
                varijacijeSku = result;
            })
        }
        let metaColors = [];
        for(let i = 0; i < colors.length; i++) {
            metaColors.push(colors[i].color);
        }
        const metaData = {
            name: shirts.name,
            info: shirts.info,
            img: shirts.bgimage,
            desc: shirts.description,
            color: metaColors,
            image1: shirts.description1,
            image2: shirts.description2
        }
        const randomProducts = await functions.getRandomProducts(id);
        res.render('pages/productShow', { shirts, products, colors,dataMeta: JSON.stringify(metaData), productsJSON: JSON.stringify(products), randomProducts,invt_SKU:JSON.stringify(invt_sku), subCat:JSON.stringify(subCat), checkCat:JSON.stringify(shirts.category), cart });
    }catch(err){
        console.error("error: ", err.message);
        req.flash('error', err.message);
        res.redirect('/');
    }
})

app.post('/add-to-cart', async (req, res) => {
    let { product_id, product_name, product_color, product_size, product_price, product_sku, invt_sku } = req.body;
    let user_id = randomUUID();
    if (req.session.cart) {
        const existing = req.session.cart.some(item => item.sku === product_sku);
        if (existing) {
            req.flash('error', "Izdelek je že dodan v košarico.")
            res.redirect(`/product/:category/:subcategory/:name/${product_id}`)
        } else {
            let product = { product_id: product_id, sku: product_sku, invt_sku: invt_sku, name: product_name, color: product_color, size: product_size, qty: 1, price: product_price };
            let cart = req.session.cart;
            cart.push(product)
            req.flash('success', 'Uspešno dodano v košarico')
            res.redirect(`/product/:category/:subcategory/:name/${product_id}`)
            }
    } else {
        let product = { user_id: user_id , product_id: product_id, sku: product_sku, invt_sku: invt_sku,name: product_name, color: product_color, size: product_size, qty: 1, price: product_price};
        req.session.cart = [product]
        req.session.userID = user_id;
        let cart = req.session.cart;
        req.flash('success', 'Uspešno dodano v košarico')
        res.redirect(`/product/:category/:subcategory/:name/${product_id}`)
    }
});

app.get('/cart', async (req, res) => {
    const cart = req.session.cart;

    if (!cart || !cart.length) {
        req.flash('error', "Košarica je prazna.")
        return res.redirect('/');
    }

    try {
        const items = await functions.getCartItemDetails(cart);
        const ordered = items.flat();

        calculateTotal(cart, req);

        res.render('orders/cart', { items, cart, ordered, s_pk });
    } catch (error) {
        console.error("Error:", error.message);
        req.flash('error', error.message);
        res.redirect('/');
    }
})

app.get('/remove/:id', async (req, res) => {
    const { id } = req.params;
    let cart = req.session.cart;
    await functions.getRemoveItemFromCart(id, cart)
    calculateTotal(cart, req)
    res.redirect('/cart')

})

app.post('/edit_qty', async (req, res) => {
    try {
        let id = req.body.id;
        let qty = req.body.qty;
        let plus_btn = req.body.plus;
        let minus_btn = req.body.minus;
        let cart = req.session.cart;
        await functions.editItemQty(req,id,cart,plus_btn,minus_btn);
        calculateTotal(cart, req)
        res.redirect('/cart');
    }catch (error) {
        console.error(error);
        res.redirect('/cart');
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
        user_id: `${user_id}`,
        },

        });
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
        try{
            await functions.getOrderData(cart, total, cart,items,count, s_pk, s_sk, publishableKey, totalPrice,res,req, totalPrice)
        }catch(e){
            console.error(e.message);
            res.redirect('/')
        }
    }
})

app.post('/placeOrder', async (req, res) => {
    let total = req.session.total.toFixed(2);
    try {
        const { payment_Method, billing_details } = req.body;
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
    if (ifPayed) {
        if (ifPayed.status == 'succeeded') {
            const shippingInfo = ifPayed.shipping;
            const paymenthMethod = await stripe.paymentMethods.retrieve(ifPayed.payment_method);let orderDate = todayDate.toLocaleString();
            let product_sku = [];
            let product_qtys = [];
            let cart = req.session.cart;
            let user_id = cart[0].user_id;
            for (let i = 0; i < cart.length; i++) {
                product_sku.push(cart[i].sku)
                product_qtys.push(cart[i].qty)
            }
            //? Create a new invoice
            let invoice = await functions.getOrdersAndInvoiceInfo(invoicePrefix)

            //! Update payment object, added invoice number

            await functions.updateUserPaymentIntent(ifPayed, stripe, invoice);

            //! Start of code for saving data to dbs

            try {
                await functions.updateOrdersTable(ifPayed,invoice, shippingInfo, paymenthMethod, orderDate, product_sku, product_qtys,cart, user_id, req)
                await functions.sendEmailOrder(yoo,nodemailer, shippingInfo, orderDate);
                await functions.updateVarijacijeTable(product_sku,product_qtys);
                await functions.deleteZeroQtyVariations();

                req.flash('success', "Hvala za zaupanje. Vaše naročilo je v obdelavi.")
                res.redirect('/redirect')
            } catch (e) {
                req.flash('error', "This is route Error: ", e.message)
                res.redirect('/order');
            }
        } else {
            req.flash('error', "Izberite način plačila.")
            res.redirect('/order');
        }
    } else {
        res.redirect('/');
    }
})

app.get('/redirect', async (req, res) => {
    const cart = req.session.cart;
    //await functions.showUserOrderInfo(stripe,cart, req,res)

    if (req.session.payment) {
        await functions.showUserOrderInfo(stripe,cart, req,res)
    } else {
        res.redirect('/')
    }

    /*
    res.render('orders/redirect', {cart})
    */
})

app.get('/add', async (req, res) => {
    const cart = req.session.cart;
    res.render('addProducts/add', {cart})
});

app.post('/addProduct', upload.fields([{ name: 'image1' }, { name: 'image2' }, { name: 'image3' }, { name: 'image4' }, { name: 'image5' },{ name: 'image6' }, { name: 'image7' }, { name: 'image8' }, { name: 'image9' }, { name: 'image10' }, {name: 'bgImage'}]), async (req, res) => {
    try{
        const product = await req.body;
        let bgImage = req.files['bgImage'][0].path;
        let brutoPrice = Math.ceil(product.p_price * 0.18)
        let netoPrice = parseFloat(brutoPrice) + parseFloat(product.p_price) + 0.99;
        let total = parseFloat(netoPrice);
        let imgsUrl = [];
        //let imgNum = 1;
        let month = todayDate.getMonth() + 1;
        let day = todayDate.getDate();
        let firstCheck = Object.keys(req.files).length - 1;
        let imgTest = Object.keys(req.files);
        images = [];
        let sizeCount = 1;
        await functions.checkImages(req, firstCheck, imgTest, images,imgsUrl);
        const resultt = await functions.setInvtAndVarPid(day,month,year)
        inventoryPid = resultt.inventoryPid;
        varijacijePid = resultt.varijacijePid;
        invt_sku = resultt.invt_sku;
        console.log("Before inserting into inventory")
        const result = await conn.query(`INSERT INTO inventory(name,neto_price, info, description,category, subcategory, bgImage, links, created, inventory_sku, inventory_pid, description1, description2) VALUES('${product.p_name}', '${total.toFixed(2)}', '${product.p_desc}', '${product.p_fulldescription}','${product.p_cat}', '${product.p_subcat}', '${bgImage}', array_to_json('{${imgsUrl}}'::text[]), '${date}', '${invt_sku}', '${inventoryPid}', '${product.description1}', '${product.description2}') RETURNING id`)
        if(product.p_subcat !== 'Toys' && product.p_subcat !== 'Other' && product.p_cat !== 'Jewerly'){
            console.log("Before add product function")
            await functions.addProductWithSizes(req, year, imgsUrl, sizeCount, varijacijePid,result, product)
        }
        else{
                if(Array.isArray(product.color) && product.color.length > 1){
                    await functions.addProductWithoutSizes(req,year, imgsUrl, varijacijePid,result, product);
                }
                else{
                    await functions.addSingleProduct(year,varijacijePid,result, imgsUrl, product)
                }
        }
        req.flash('success',"Uspešno dodan produkt")
        }catch(e){
            console.error("Error: " + e.message);
            req.flash('error',"Error: ", e.message);
        }

        res.redirect('/add')
})

app.get('/allOrders', async(req,res)=>{
    const cart = req.session.cart;
    let ordersData = {
        orders:[]
    };
    await conn.query(`SELECT * FROM orders`, async(e, result)=>{
        if(!e){
            const orders = result.rows;
            for(let i = 0; i < orders.length; i++){
                const orderInfo = {...orders[i], products: []};
                for(let j = 0; j < orders[i].products_ids.length; j++){
                    //! await conn.query(`SELECT * FROM varijacije WHERE sku = ${orders[i].product_ids[j]}`, async(err, result) =>{
                    //! if(!err){
                    //!     const product = result.rows[0];
                    //!     orderInfo.products.push(product);
                    //! }
                    //!});
                    orderInfo.products.push("no name");
                    //console.log(orders[1]);
                }
                ordersData.orders.push(orderInfo)
            }
            console.log("This is orderData: ", ordersData.orders[0].products)
            res.render('orders/showOrders', {cart,orders})
        }
    })
})

// ARTICL PAGES

//! MENS
app.get('/category/mens', async (req, res) => {
    const cart = req.session.cart;
    await conn.query(`SELECT * FROM inventory WHERE category = 'Mens'`, async (err, result) => {
        let products = result.rows
        if (!products.length) {
            req.flash('error', ' Nothing to display.')
            res.redirect('/')
        } else {
            if (!err) {
                res.render('artikli/mens/mens', { products, cart })
            }
        }
    })
})

app.get('/category/mens/subcategory/shirts', async (req, res) => {
    const cart = req.session.cart;
    await conn.query(`SELECT * FROM inventory WHERE category = 'Mens' AND subcategory = 'Shirts'`, async (err, result) => {
        //console.log(result.rows.length)
        let products = result.rows
        if (!products.length) {
            req.flash('error', ' Nothing to display.')
            res.redirect('/')
        } else {
            if (!err) {
                res.render('artikli/mens/shirts', { products, cart })
            }
        }
    })

})

app.get('/category/mens/subcategory/jackets', async (req, res) => {
    const cart = req.session.cart;
    await conn.query(`SELECT * FROM inventory WHERE category = 'Mens' AND subcategory = 'Jackets'`, async (err, result) => {
        let products = result.rows
        if (!products.length) {
            req.flash('error', ' Nothing to display.')
            res.redirect('/')
        } else {
            if (!err) {
                res.render('artikli/mens/jackets', { products, cart })
            }
        }
    })

})

app.get('/category/mens/subcategory/pants', async (req, res) => {
    const cart = req.session.cart;
    await conn.query(`SELECT * FROM inventory WHERE category = 'Mens' AND subcategory = 'Pants'`, async (err, result) => {

        let products = result.rows
        if (!products.length) {
            req.flash('error', ' Nothing to display.')
            res.redirect('/')
        } else {
            if (!err) {

                res.render('artikli/mens/pants', { products, cart })

            }
        }
    })
})

app.get('/category/mens/subcategory/underwear', async (req, res) => {
    const cart = req.session.cart;
    await conn.query(`SELECT * FROM inventory WHERE category = 'Mens' AND subcategory = 'Underwear'`, async (err, result) => {

        let products = result.rows
        if (!products.length) {
            req.flash('error', ' Nothing to display.')
            res.redirect('/')
        } else {
            if (!err) {

                res.render('artikli/mens/underwear', { products, cart })

            }
        }
    })
})

app.get('/category/mens/subcategory/shoes', async (req, res) => {
    const cart = req.session.cart;
    await conn.query(`SELECT * FROM inventory WHERE category = 'Mens' AND subcategory = 'Shoes'`, async (err, result) => {

        let products = result.rows
        if (!products.length) {
            req.flash('error', ' Nothing to display.')
            res.redirect('/')
        } else {
            if (!err) {

                res.render('artikli/mens/shoes', { products, cart })
            }
        }
    })
})

app.get('/category/mens/subcategory/pajamas', async (req, res) => {
    const cart = req.session.cart;
    await conn.query(`SELECT * FROM inventory WHERE category = 'Mens' AND subcategory = 'Pajamas'`, async (err, result) => {

        let products = result.rows
        if (!products.length) {
            req.flash('error', ' Nothing to display.')
            res.redirect('/')
        } else {
            if (!err) {

                res.render('artikli/kids/pajamas', { products, cart })
            }
        }
    })
})
//! WOMENS

app.get('/category/womens', async (req, res) => {
    const cart = req.session.cart;
    await conn.query(`SELECT * FROM inventory WHERE category = 'Womens'`, async (err, result) => {
        let products = result.rows
        if (!products.length) {
            req.flash('error', ' Nothing to display.')
            res.redirect('/')
        } else {
            if (!err) {

                res.render('artikli/womens/womens', { products, cart })

            }
        }
    })
})

app.get('/category/womens/subcategory/shirts', async (req, res) => {
    const cart = req.session.cart;
    await conn.query(`SELECT * FROM inventory WHERE category = 'Womens' AND subcategory = 'Shirts'`, async (err, result) => {
        let products = result.rows
        if (!products.length) {
            req.flash('error', ' Nothing to display.')
            res.redirect('/')
        } else {
            if (!err) {
                res.render('artikli/womens/shirts', { products,cart })
            }
        }
    })

})

app.get('/category/womens/subcategory/jackets', async (req, res) => {
    const cart = req.session.cart;
    await conn.query(`SELECT * FROM inventory WHERE category = 'Womens' AND subcategory = 'Jackets'`, async (err, result) => {

        let products = result.rows
        if (!products.length) {
            req.flash('error', ' Nothing to display.')
            res.redirect('/')
        } else {
            if (!err) {

                res.render('artikli/womens/jackets', { products, cart })

            }
        }
    })
})

app.get('/category/womens/subcategory/pants', async (req, res) => {
    const cart = req.session.cart;
    await conn.query(`SELECT * FROM inventory WHERE category = 'Womens' AND subcategory = 'Pants'`, async (err, result) => {
        let products = result.rows
        if (!products.length) {
            req.flash('error', ' Nothing to display.')
            res.redirect('/')
        } else {
            if (!err) {

                res.render('artikli/womens/pants', { products, cart })

            }
        }
    })
})

app.get('/category/womens/subcategory/underwear', async (req, res) => {
    const cart = req.session.cart;
    await conn.query(`SELECT * FROM inventory WHERE category = 'Womens' AND subcategory = 'Underwear'`, async (err, result) => {

        let products = result.rows
        if (!products.length) {
            req.flash('error', ' Nothing to display.')
            res.redirect('/')
        } else {
            if (!err) {
                res.render('artikli/womens/underwear', { products, cart })
            }
        }
    })
})

app.get('/category/womens/subcategory/pajamas', async (req, res) => {
    const cart = req.session.cart;
    await conn.query(`SELECT * FROM inventory WHERE category = 'Womens' AND subcategory = 'Pajamas'`, async (err, result) => {

        let products = result.rows
        if (!products.length) {
            req.flash('error', ' Nothing to display.')
            res.redirect('/')
        } else {
            if (!err) {

                res.render('artikli/kids/pajamas', { products, cart })
            }
        }
    })
})

app.get('/category/womens/subcategory/shoes', async (req, res) => {
    const cart = req.session.cart;
    await conn.query(`SELECT * FROM inventory WHERE category = 'Womens' AND subcategory = 'Shoes'`, async (err, result) => {

        let products = result.rows
        if (!products.length) {
            req.flash('error', ' Nothing to display.')
            res.redirect('/')
        } else {
            if (!err) {

                res.render('artikli/womens/shoes', { products, cart })
            }
        }
    })
})
//! KIDS

app.get('/category/baby', async (req, res) => {
    const cart = req.session.cart;
    await conn.query(`SELECT * FROM inventory WHERE category = 'Baby'`, async (err, result) => {
        let products = result.rows
        if (!products.length) {
            req.flash('error', ' Nothing to display.')
            res.redirect('/')
        } else {
            if (!err) {
                res.render('artikli/kids/baby', { products, cart })
            }
        }
    })
})
app.get('/category/kids', async (req, res) => {
    let allProducts = [];
    const cart = req.session.cart;
    await conn.query(`SELECT * FROM inventory WHERE category = 'Kids'`, async (err, result) => {
        if (!err) {
            let products = result.rows;
            //console.log(shirts[0].id)
            if (!products.length) {
                req.flash('error', ' Nothing to display.')
                res.redirect('/');
            } else {
                res.render('artikli/kids/kids', { products, cart })
            }
        } else {
            req.flash('error', err.message);
            res.redirect('/');

        }
    })

})

app.get('/category/kids/subcategory/shirts', async (req, res) => {
    const cart = req.session.cart;
    await conn.query(`SELECT * FROM inventory WHERE category = 'Kids' AND subcategory = 'Shirts'`, async (err, result) => {

        let products = result.rows
        if (!products.length) {
            req.flash('error', ' Nothing to display.')
            res.redirect('/')
        } else {
            if (!err) {

                res.render('artikli/kids/shirts', { products, cart })

            }
        }
    })

})

app.get('/category/kids/subcategory/jackets', async (req, res) => {
    const cart = req.session.cart;
    await conn.query(`SELECT * FROM inventory WHERE category = 'Kids' AND subcategory = 'Jackets'`, async (err, result) => {

        let products = result.rows
        if (!products.length) {
            req.flash('error', ' Nothing to display.')
            res.redirect('/')
        } else {
            if (!err) {

                res.render('artikli/kids/jackets', { products, cart })
            }
        }
    })
})

app.get('/category/kids/subcategory/pants', async (req, res) => {
    const cart = req.session.cart;
    await conn.query(`SELECT * FROM inventory WHERE category = 'Kids' AND subcategory = 'Pants'`, async (err, result) => {

        let products = result.rows
        if (!products.length) {
            req.flash('error', ' Nothing to display.')
            res.redirect('/')
        } else {
            if (!err) {

                res.render('artikli/kids/kidsPants', { products, cart })

            }
        }
    })
})

app.get('/category/kids/subcategory/underwear', async (req, res) => {
    const cart = req.session.cart;
    await conn.query(`SELECT * FROM inventory WHERE category = 'Kids' AND subcategory = 'Underwear'`, async (err, result) => {

        let products = result.rows
        if (!products.length) {
            req.flash('error', ' Nothing to display.')
            res.redirect('/')
        } else {
            if (!err) {

                res.render('artikli/kids/kidsUnderwear', { products, cart })
            }
        }
    })
})

app.get('/category/kids/subcategory/pajamas', async (req, res) => {
    const cart = req.session.cart;
    await conn.query(`SELECT * FROM inventory WHERE category = 'Kids' AND subcategory = 'Pajamas'`, async (err, result) => {

        let products = result.rows
        if (!products.length) {
            req.flash('error', ' Nothing to display.')
            res.redirect('/')
        } else {
            if (!err) {

                res.render('artikli/kids/pajamas', { products, cart })
            }
        }
    })
})

app.get('/category/kids/subcategory/shoes', async (req, res) => {
    const cart = req.session.cart;
    await conn.query(`SELECT * FROM inventory WHERE category = 'Kids' AND subcategory = 'Shoes'`, async (err, result) => {

        let products = result.rows
        if (!products.length) {
            req.flash('error', ' Nothing to display.')
            res.redirect('/')
        } else {
            if (!err) {

                res.render('artikli/kids/shoes', { products, cart })
            }
        }
    })
})
app.get('/category/kids/subcategory/toys', async (req, res) => {
    const cart = req.session.cart;
    await conn.query(`SELECT * FROM inventory WHERE category = 'Kids' AND subcategory = 'Toys'`, async (err, result) => {

        let products = result.rows
        if (!products.length) {
            req.flash('error', ' Nothing to display.')
            res.redirect('/')
        } else {
            if (!err) {

                res.render('artikli/kids/toys', { products, cart })
            }
        }

    })
})

//! Jewerly
app.get('/category/jewerly', async (req,res)=>{
    const cart = req.session.cart;
    await conn.query(`SELECT * FROM inventory WHERE category = 'Jewerly'`, async(err, result)=>{
        let products = result.rows
        if (!products.length) {
            req.flash('error', ' Nothing to display.')
            res.redirect('/')
        } else {
            if (!err) {
                res.render('artikli/jewerly/jewerly', { products, cart })
            }
        }
    })
})

app.get('/category/jewerly/subcategory/chain', async (req,res)=>{
    const cart = req.session.cart;
    await conn.query(`SELECT * FROM inventory WHERE category = 'Jewerly' AND subcategory = 'chain'`, async(err, result)=>{
        let products = result.rows
        if (!products.length) {
            req.flash('error', ' Nothing to display.')
            res.redirect('/')
        } else {
            if (!err) {
                res.render('artikli/jewerly/chain', { products, cart })
            }
        }
    })
})

app.get('/category/jewerly/subcategory/bracelet', async (req,res)=>{
    const cart = req.session.cart;
    await conn.query(`SELECT * FROM inventory WHERE category = 'Jewerly' AND subcategory = 'bracelet'`, async(err, result)=>{
        let products = result.rows
        if (!products.length) {
            req.flash('error', ' Nothing to display.')
            res.redirect('/')
        } else {
            if (!err) {
                res.render('artikli/jewerly/bracelet', { products, cart })
            }
        }
    })
})

app.get('/category/jewerly/subcategory/clock', async (req,res)=>{
    const cart = req.session.cart;
    await conn.query(`SELECT * FROM inventory WHERE category = 'Jewerly' AND subcategory = 'clock'`, async(err, result)=>{
        let products = result.rows
        if (!products.length) {
            req.flash('error', ' Nothing to display.')
            res.redirect('/')
        } else {
            if (!err) {
                res.render('artikli/jewerly/clock', { products, cart })
            }
        }
    })
})

app.get('/category/other', async (req, res) => {
    const cart = req.session.cart;
    await conn.query(`SELECT * FROM inventory WHERE category = 'Other'`, async(e, result)=>{
        let products = result.rows
        if (!products.length) {
            req.flash('error', ' Nothing to display.')
            res.redirect('/')
        } else {
            if (!err) {
                res.render('artikli/other/other',{products, cart})
            }
        }
    })
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
