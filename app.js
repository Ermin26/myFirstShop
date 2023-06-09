if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}


//const conn = require('./siteJS/connection.js');
//const connectDB = require('./siteJS/connection.js');
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
const { isLoged } = require('./utils/isLoged')
const { cloudinary } = require('./cloudinary/cloudConfig');
const multer = require('multer');
const { storage } = require('./cloudinary/cloudConfig');
const { randomUUID } = require('crypto');
const { parse } = require('path');
const upload = multer({ storage })
const stripe = require('stripe')(process.env.STRIPE_SK);

//const upload = multer({ dest: 'uploads/' })


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
//app.use(bodyParser.json());
app.use(express.json());


const forSession = process.env.DB_PASS
const nothingSpecial = process.env.IGNORE_ME

const s_sk = process.env.STRIPE_SK;
const s_pk = process.env.STRIPE_PK;


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
    next();
})

let todayDate = new Date();
let date = todayDate.toLocaleDateString()
let year = todayDate.getFullYear();

let subtotal = [];


app.get('/', async (req, res) => {
    let date = new Date();
    let day = date.getDay()

    await conn.query(`SELECT * FROM inventory`, async (err, result) => {
        let products = result.rows
        if (!products.length) {
            req.flash('error', ' Nothing to display.')
            res.redirect('add')
        } else {
            if (!err) {
                //console.log(products)
                res.render('pages/home', { products })
            }
        }
    })
})

app.get('/searched', async (req, res) => {
    res.render('pages/searched')
})


app.post('/search', async (req, res) => {
    let data = req.body.searched;
    console.log(data);
    await conn.query(`SELECT * FROM inventory WHERE category ~* '${data}' OR name ~* '${data}' OR subcategory ~*'${data}' OR info ~* '${data}' OR description ~* '${data}'`, async (err, shirts) => {
        if (!err) {
            let products = shirts.rows;
            console.log(products);
            res.render('pages/searched', { products })
        } else {
            req.flash('error', 'Nothing to show')
            res.redirect('/')
        }
    })
})

app.get('/product/:id', async (req, res) => {
    let { id } = req.params
    await conn.query(`SELECT * FROM inventory WHERE id = '${id}'`, async (err, result) => {
        if (!err) {
            let shirts = result.rows
            await conn.query(`SELECT * FROM varijacije WHERE product_id = '${id}' ORDER BY size DESC`, async (e, data) => {
                let products = data.rows;
                //console.log(products);
                if (!e) {
                    await conn.query(`SELECT DISTINCT color FROM varijacije WHERE product_id='${id}'`, async (er, color) => {
                        let colors = color.rows;
                        res.render('pages/productShow', { shirts, products, colors });
                    });

                }
                //console.log(products)


            })
        } else {
            req.flash('error', err.message)
            res.redirect('/')

        }
    })
})

app.get('/register', async (req, res) => {
    res.render('users/register')
})

app.get("/login", (req, res) => {
    res.render('users/login')
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
    const users = req.body;

    await conn.query(`SELECT * FROM users WHERE users.email='${users.email}'`, async (notExists, exists) => {
        if (exists.rows.length) {
            req.flash('error', "User with that email already exists, please enter other email or log in!")
            res.redirect('/register')
        } else {
            const userPassword = await bcrypt.hash(users.password, 10)
            await conn.query(`INSERT INTO users (fName ,lName ,email ,country ,city ,zip, address, password) VALUES('${users.fname}' ,'${users.lname}', '${users.email}', '${users.country}', '${users.city}', '${users.zip}','${users.address}','${userPassword}')`, async (err, user) => {
                if (!err) {
                    passport.authenticate('local')(req, res, () => {
                        req.flash('success', `Successfully register ${users.fname}`);
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

})

app.get('/logout', (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        } else {
            req.flash('success', 'Logged out.');
            res.redirect('/');
        }
    });
});


app.get("/users", async (req, res) => {
    await conn.query(`SELECT * FROM users`, (err, result) => {
        if (!err) return res.send(result.rows)
        else return res.send(err.message)
    })
})

function isProductInCart(cart, id) {
    console.log("Yooooo")
    if (cart) {
        for (let i = 0; i < cart.length; i++) {
            console.log(cart[i].sku)
            if (cart[i].sku == id) {
                console.log("erorrrrrr")
                req.slash('error', 'Product je že v košarici')
                res.redirect(`product/${cart[i].id}`)
            } else {
                let user_id = randomUUID();
                //console.log( product_id, product_name, product_color, size, product_price, sku_num)
                if (req.session.cart) {
                    let product = { product_id: product_id, sku: sku_num, name: product_name, color: product_color, size: size, qty: 1, price: product_price, cat: product_cat, subcat: product_subcat, };
                    let cart = req.session.cart;
                    cart.push(product)
                    req.flash('success', 'Successfully added to cart')
                    res.redirect(`/product/${product_id}`)
                } else {
                    let product = { product_id: product_id, sku: sku_num, name: product_name, color: product_color, size: size, qty: 1, price: product_price, cat: product_cat, subcat: product_subcat, user_id: user_id };
                    req.session.cart = [product]
                    let cart = req.session.cart;
                    req.flash('success', 'Successfully added to cart')
                    res.redirect(`/product/${product_id}`)
                }
            }
        }
    }

}

function calculateTotal(cart, req) {
    total = 0;
    for (let i = 0; i < cart.length; i++) {
        total = total + (cart[i].price * cart[i].qty)
    }
    req.session.total = total;
    return total;
}


app.get("/cart", async (req, res) => {
    let items = [];
    let cartItems = []
    let sizes = [];
    let allProducts = [];
    let count = 0
    let countSizes = 0;
    let cart = req.session.cart;
    let total = req.session.total;

    if (cart) {
        if (!cart.length) {
            await conn.query(`SELECT * FROM inventory`, async (err, result) => {
                allProducts.push(result.rows)
                res.render('orders/cart', { items, allProducts, s_pk })
            })
        } else {
            for (let i = 0; i < cart.length; i++) {
                await conn.query(`SELECT * FROM inventory, varijacije WHERE inventory.id='${cart[i].product_id}' AND varijacije.sku='${cart[i].sku}' `, async (e, results) => {
                    if (!e) {
                        //console.log(results.rows[i].sku_num)
                        //console.log('------------------')
                        //sizes.push(results.rows[i].sku_num,results.rows[i].img_link);
                        let ordered = results.rows;
                        items.push(results.rows)
                        countSizes += 1;
                        if (cart.length === countSizes) {


                            res.render('orders/cart', { items, cart, allProducts, ordered, s_pk })

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
        await conn.query(`SELECT * FROM inventory`, async (err, result) => {
            allProducts.push(result.rows)
            res.render('orders/cart', { items, allProducts, s_pk })
        })
    }

})

app.post('/add-to-cart', async (req, res) => {
    let { product_id, product_name, product_color, product_size, product_price, sku } = req.body;

    let user_id = randomUUID();
    console.log(req.body)
    //console.log(req.session.cart.length);
    //console.log( product_id, product_name, product_color, size, product_price, sku_num)

    if (req.session.cart) {

        let product = { product_id: product_id, sku: sku, name: product_name, color: product_color, size: product_size, qty: 1, price: product_price };
        let cart = req.session.cart;
        cart.push(product)
        req.flash('success', 'Successfully added to cart')
        res.redirect(`/product/${product_id}`)

    } else {
        let product = { product_id: product_id, sku: sku, name: product_name, color: product_color, size: product_size, qty: 1, price: product_price, user_id: user_id };
        req.session.cart = [product]
        let cart = req.session.cart;
        req.flash('success', 'Successfully added to cart')
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
    console.log(req.body);
    if (plus_btn) {
        for (let i = 0; i < cart.length; i++) {
            if (cart[i].sku == id) {
                if (cart[i].qty > 0) {
                    cart[i].qty = parseInt(cart[i].qty) + 1;
                    res.redirect('/cart');
                }
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
                    req.flash('error', "Quantity can't be smaller than 1")
                    res.redirect('/cart');
                }
            }
        }
    }

    calculateTotal(cart, req)

})

app.get('/checkout', async (req, res) => {
    let total = req.session.total.toFixed(2)
    let cart = req.session.cart;
    console.log(cart)
    let items = [];
    let cartItems = []
    let count = 0
    for (let i = 0; i < cart.length; i++) {
        await conn.query(`SELECT * FROM inventory, varijacije WHERE inventory.id='${cart[i].product_id}' AND varijacije.sku='${cart[i].sku}'`, async (err, product) => {
            if (!err) {
                count += 1;
                items.push(product.rows);
                if (cart.length === count) {
                    await conn.query(`SELECT * FROM  orders WHERE user_id = '${cart[0].user_id}'`, async (er, user) => {
                        let userData = user.rows[0]
                        res.render('orders/checkout', { total, cart, userData, s_pk, s_sk });
                    })
                }
            } else {
                req.flash('error', `Error ${err.message}`);
                res.redirect('/')
            }
        })
    }
})

app.post('/checkoutToPay', async (req, res) => {
    let cart = req.session.cart;
    let costs = req.session.total.toFixed(2)
    const { name,lastName, email, country, city, zip, phone } = req.body;
    try {
        const stripeProducts = [];

        for(let product of cart){ 
            const stripeProduct = await stripeProducts.products.create({
                name: product.name,
                description: product.sku
            })
        }

        const price = await stripe.prices.create({
            unit_amount: product.price * 100,
            currency: 'eur',
            product: stripeProduct.id
        });

        stripeProducts.push({product: stripeProduct, price});

    const paymentIntent = await stripe.paymentIntents.create({
      amount: costs * 100, // Amount in cents
      currency: 'eur',
      description: 'Nakup',
      payment_method_types: ['card'],
      metadata: {
        name,
        lastName,
        email,
        country,
        city,
        zip,
        phone,
      },
    });
    req.flash('success',"Successfully placed order")
    res.redirect('/cart')
    } catch (error) {
        req.flash('error',error.message)
      res.redirect('/checkout')
    
  }

    //! stripe end
    /*
    let { name, lastName, email, country, city, zip, street, phone } = req.body
    let costs = req.session.total.toFixed(2)
    let orderDate = todayDate.toLocaleString();
    let product_ids = "";
    let product_qtys = "";
    let cart = req.session.cart;
    let user_id = cart[0].user_id;
    for (let i = 0; i < cart.length; i++) {
        product_ids = cart[i].sku + ',' + product_ids
        product_qtys = cart[i].qty + ',' + product_qtys;
    }

    try {
        await conn.query(`INSERT INTO orders(name, lastname, email, country, city, zip, street, phone, status,date, costs, products_ids, product_qtys, user_id) VALUES('${req.body.name}', '${req.body.lastName}', '${req.body.email}', '${req.body.country}', '${req.body.city}', '${req.body.zip}', '${req.body.street}', '${req.body.phone}','false','${orderDate}', '${costs}', '${product_ids}', '${product_qtys}', '${user_id}')`)
        req.flash('success', "Your order sucessfully placed. Choose payment method")
        res.redirect('/payment')
    } catch (e) {
        console.log("error", e)
        res.redirect('/checkout')
    }
*/
})


app.get('/payment', async (req, res) => {
    let total = req.session.total.toFixed(2)
    let cart = req.session.cart;
    let items = [];
    let cartItems = []
    let count = 0

    for (let i = 0; i < cart.length; i++) {
        await conn.query(`SELECT * FROM inventory, varijacije WHERE inventory.id='${cart[i].product_id}' AND varijacije.sku='${cart[i].sku}'`, async (err, product) => {
            if (!err) {
                count += 1;
                items.push(product.rows);
                if (cart.length === count) {
                    await conn.query(`SELECT * FROM  orders WHERE user_id = '${cart[0].user_id}'`, async (er, user) => {
                        let userData = user.rows[0]
                        console.log(userData)
                        res.render('orders/pay', { total, cart, userData, s_pk });
                    })
                }
            } else {
                req.flash('error', `Error ${err.message}`);
            }
        })
    }

})
app.get('/add', (req, res) => {
    res.render('addProducts/add')
})


app.post('/addProduct', upload.fields([{ name: 'image1' }, { name: 'image2' }, { name: 'image3' }, { name: 'image4' }, { name: 'image5' }]), async (req, res) => {
    const product = req.body;
    let brutoPrice = Math.ceil(product.p_price * 0.22)
    let netoPrice = parseFloat(brutoPrice) + parseFloat(product.p_price) + 0.99;
    let total = parseFloat(netoPrice);

    let imgsUrl = [];
    let imgNum = 1;
    let sizeCount = 1;
    let productQty = 0;
    /*
    for (let q = 0; q < product.p_qty.length; q++) { 
        productQty = parseInt(productQty) + parseInt(product.p_qty[q]);
    }
*/
    let firstCheck = Object.keys(req.files).length;
    let secondCheck = req.files[`image${imgNum}`].length;

    for (let i = 0; i < firstCheck; i++) {
        images = [];
        for (let j = 0; j < secondCheck; j++) {
            let getImg = req.files[`image${imgNum}`];
            for (let allImg of getImg) {
                images.push(allImg.path)
            }
            imgNum += 1;
        }
        imgsUrl.push(images);
    }
    //console.log(req.files[`image${imgNum}`][0].path,' yoooooooooooo')

    // console.log(Object.keys(req.files).length)
    //----------------------------------------------------------
    //? Dela
    await conn.query(`INSERT INTO inventory(name,neto_price, info, description,category, subcategory, links) VALUES('${product.p_name}', '${total.toFixed(2)}', '${product.p_desc}', '${product.p_fulldescription}','${product.p_cat}', '${product.p_subcat}', array_to_json('{${imgsUrl}}'::text[])) RETURNING id`, async (err, result) => {
        if (!err) {
            for (let i = 0; i < product.color.length; i++) {
                for (let j = 0; j < req.body[`size${sizeCount}`].length; j++) {
                    let sku = parseInt(Math.random(12 * 35637) * 10000) + "-" + year
                    await conn.query(`INSERT INTO varijacije(product_id, size, sku, img_link, qty,color) VALUES('${result.rows[0].id}', '${req.body[`size${sizeCount}`][j]}', '${sku}',array_to_json('{${imgsUrl[i]}}'::text[]), '${req.body[`qty${sizeCount}`][j]}', '${product.color[i]}')`)

                }
                sizeCount += 1;
            }
            req.flash('success', "Successfully added new product")
            res.redirect('add')
        }
        else {
            req.flash('error', `Something went wrong. ${err.message}`);
            res.redirect('add');
        }
    })

    /*
    res.redirect('/add')
    */

})


// ARTICL PAGES

//! MENS
app.get('/mens', async (req, res) => {
    await conn.query(`SELECT * FROM inventory WHERE category = 'Mens'`, async (err, result) => {
        let shirts = result.rows
        if (!shirts.length) {
            req.flash('error', ' Nothing to display.')
            res.redirect('/')
        } else {
            if (!err) {
                res.render('artikli/womens/womenAll', { shirts })
            }
        }
    })
})

app.get('/men_Shirts', async (req, res) => {
    await conn.query(`SELECT * FROM inventory WHERE category = 'Mens' AND subcategory = 'Shirts'`, async (err, result) => {
        //console.log(result.rows.length)
        let shirts = result.rows
        if (!shirts.length) {
            req.flash('error', ' Nothing to display.')
            res.redirect('/mens')
        } else {
            if (!err) {
                res.render('artikli/mens/mensShirts', { shirts })
            }
        }
    })

})

app.get('/men_Jackets', async (req, res) => {
    await conn.query(`SELECT * FROM inventory WHERE category = 'Mens' AND subcategory = 'Jackets'`, async (err, result) => {
        let shirts = result.rows
        if (!shirts.length) {
            req.flash('error', ' Nothing to display.')
            res.redirect('/')
        } else {
            if (!err) {
                res.render('artikli/mens/mensJackets', { shirts })
            }
        }
    })

})

app.get('/men_Pants', async (req, res) => {
    await conn.query(`SELECT * FROM inventory WHERE category = 'Mens' AND subcategory = 'Pants'`, async (err, result) => {

        let shirts = result.rows
        if (!shirts.length) {
            req.flash('error', ' Nothing to display.')
            res.redirect('/')
        } else {
            if (!err) {

                res.render('artikli/mens/mensPants', { shirts })

            }
        }
    })
})

app.get('/men_Underwear', async (req, res) => {
    await conn.query(`SELECT * FROM inventory WHERE category = 'Mens' AND subcategory = 'Underwear'`, async (err, result) => {

        let shirts = result.rows
        if (!shirts.length) {
            req.flash('error', ' Nothing to display.')
            res.redirect('/')
        } else {
            if (!err) {

                res.render('artikli/mens/mensUnderwear', { shirts })

            }
        }
    })
})

//! WOMENS

app.get('/womens', async (req, res) => {
    await conn.query(`SELECT * FROM inventory WHERE category = 'Womens'`, async (err, result) => {

        let shirts = result.rows
        if (!shirts.length) {
            req.flash('error', ' Nothing to display.')
            res.redirect('/')
        } else {
            if (!err) {

                res.render('artikli/womens/womenAll', { shirts })

            }
        }
    })
})

app.get('/women_Shirts', async (req, res) => {
    await conn.query(`SELECT * FROM inventory WHERE category = 'Womens' AND subcategory = 'Shirts'`, async (err, result) => {
        let shirts = result.rows
        if (!shirts.length) {
            req.flash('error', ' Nothing to display.')
            res.redirect('/')
        } else {
            if (!err) {
                res.render('artikli/womens/womenShirts', { shirts })
            }
        }
    })

})

app.get('/women_Jackets', async (req, res) => {
    await conn.query(`SELECT * FROM inventory WHERE category = 'Womens' AND subcategory = 'Jackets'`, async (err, result) => {

        let shirts = result.rows
        if (!shirts.length) {
            req.flash('error', ' Nothing to display.')
            res.redirect('/')
        } else {
            if (!err) {

                res.render('artikli/womens/womenJackets', { shirts })

            }
        }
    })
})

app.get('/women_Pants', async (req, res) => {
    await conn.query(`SELECT * FROM inventory WHERE category = 'Womens' AND subcategory = 'Pants'`, async (err, result) => {

        let shirts = result.rows
        if (!shirts.length) {
            req.flash('error', ' Nothing to display.')
            res.redirect('/')
        } else {
            if (!err) {

                res.render('artikli/womens/womenPants', { shirts })

            }
        }
    })
})

app.get('/women_Underwear', async (req, res) => {
    await conn.query(`SELECT * FROM inventory WHERE category = 'Womens' AND subcategory = 'Underwear'`, async (err, result) => {

        let shirts = result.rows
        if (!shirts.length) {
            req.flash('error', ' Nothing to display.')
            res.redirect('/')
        } else {
            if (!err) {
                res.render('artikli/womens/womenUnderwear', { shirts })
            }
        }
    })
})

//! KIDS

app.get('/baby', async (req, res) => {
    await conn.query(`SELECT * FROM inventory WHERE category = 'Baby'`, async (err, result) => {

        let shirts = result.rows
        if (!shirts.length) {
            req.flash('error', ' Nothing to display.')
            res.redirect('/')
        } else {
            if (!err) {
                res.render('artikli/kids/kidsBaby', { shirts })
            }
        }
    })
})
app.get('/kids', async (req, res) => {
    let allProducts = [];
    await conn.query(`SELECT * FROM inventory WHERE category = 'Kids'`, async (err, result) => {
        if (!err) {
            let shirts = result.rows;
            //console.log(shirts[0].id)
            if (!shirts.length) {
                req.flash('error', ' Nothing to display.')
                res.redirect('/');
            } else {
                res.render('artikli/kids/kidsAll', { shirts })
            }
        } else {
            req.flash('error', err.message);
            res.redirect('/');

        }
    })

})

app.get('/kids_Shirts', async (req, res) => {
    await conn.query(`SELECT * FROM inventory WHERE category = 'Kids' AND subcategory = 'Shirts'`, async (err, result) => {

        let shirts = result.rows
        if (!shirts.length) {
            req.flash('error', ' Nothing to display.')
            res.redirect('/')
        } else {
            if (!err) {

                res.render('artikli/kids/kidsShirts', { shirts })

            }
        }
    })

})

app.get('/kids_Jackets', async (req, res) => {
    await conn.query(`SELECT * FROM inventory WHERE category = 'Kids' AND subcategory = 'Jackets'`, async (err, result) => {

        let shirts = result.rows
        if (!shirts.length) {
            req.flash('error', ' Nothing to display.')
            res.redirect('/')
        } else {
            if (!err) {

                res.render('artikli/kids/kidsJackets', { shirts })
            }
        }
    })
})

app.get('/kids_Pants', async (req, res) => {
    await conn.query(`SELECT * FROM inventory WHERE category = 'Kids' AND subcategory = 'Pants'`, async (err, result) => {

        let shirts = result.rows
        if (!shirts.length) {
            req.flash('error', ' Nothing to display.')
            res.redirect('/')
        } else {
            if (!err) {

                res.render('artikli/kids/kidsPants', { shirts })

            }
        }
    })
})

app.get('/kids_Underwear', async (req, res) => {
    await conn.query(`SELECT * FROM inventory WHERE category = 'Kids' AND subcategory = 'Underwear'`, async (err, result) => {

        let shirts = result.rows
        if (!shirts.length) {
            req.flash('error', ' Nothing to display.')
            res.redirect('/')
        } else {
            if (!err) {

                res.render('artikli/kids/kidsUnderwear', { shirts })
            }
        }

    })
})

app.get('/other', async (req, res) => {
    res.render('artikli/other/other')
})


//?---------------------------------------------



const port = process.env.PORT || 5000
app.listen(port,
    console.log(`listening on ${port}`))
