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
/*
const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'YaseminShop',
    password: 'ermin',
    port: 5432,

});
*/
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


const forSession = process.env.DB_PASS
const nothingSpecial = process.env.IGNORE_ME





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
console.log(date)

let subtotal = [];


app.get('/', async (req, res) => {
    let date = new Date();
    let day = date.getDay()

    //await conn.query(`DELETE FROM cart WHERE expiring = '${day}'`)
    await conn.query(`SELECT * FROM products`, async (err, result) => {
        let shirts = result.rows
        if (!shirts.length) {
            req.flash('error', ' Nothing to display.')
            res.redirect('add')
        } else {
            if (!err) {
                res.render('pages/home', { shirts })
            }
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
    for (let i = 0; i < cart.length; i++) {
        if (cart[i].id == id) { return true; }
    } return false;
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
    let count = 0
    let cart = req.session.cart;
    let total = req.session.total;


    if (cart) {
        if (!cart.length) {
            res.render('orders/cart', { items })
        } else {
            for (let i = 0; i < cart.length; i++) {
                await conn.query(`SELECT * FROM products WHERE id = '${cart[i].product_id}'`, async (err, product) => {
                    if (!err) {
                        count += 1;
                        items.push(product.rows);
                        if (cart.length === count) {
                            res.render('orders/cart', { items, cart })
                        }
                    }
                })
            }
            calculateTotal(cart, req)
        }
    } else {
        res.render('orders/cart', { items })
    }


})

app.post('/add-to-cart', async (req, res) => {
    let id = req.body.product_id;
    let price = req.body.product_price;
    let name = req.body.product_name;
    let user_id = randomUUID();
    if (req.session.cart) {
        let product = { product_id: id, name: name, qty: 1, price: price };
        let cart = req.session.cart;
        cart.push(product)
        req.flash('success', 'Successfully added to cart')
        res.redirect(`/product/${id}`)
    } else {
        let product = { product_id: id, name: name, qty: 1, price: price, user_id: user_id };
        req.session.cart = [product]
        let cart = req.session.cart;
        req.flash('success', 'Successfully added to cart')
        res.redirect(`/product/${id}`)
    }


});

app.get('/remove/:id', async (req, res) => {
    const { id } = req.params;
    let cart = req.session.cart;

    for (let i = 0; i < cart.length; i++) {
        if (cart[i].product_id == id) {
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
            if (cart[i].product_id === id) {
                if (cart[i].qty > 0) {
                    cart[i].qty = parseInt(cart[i].qty) + 1;
                    res.redirect('/cart');
                }
            }
        }
    }
    if (minus_btn) {
        for (let i = 0; i < cart.length; i++) {
            if (cart[i].product_id === id) {
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
    let total = req.session.total.toFixed(2);
    res.render('orders/checkout', { total })
})

app.post('/checkoutToPay', async (req, res) => {
    let { name, lastName, email, country, city, zip, street, phone } = req.body
    let costs = req.session.total.toFixed(2)
    let orderDate = todayDate.toLocaleString();
    let product_ids = "";
    let product_qtys = "";
    let cart = req.session.cart;
    let user_id = cart[0].user_id;
    console.log(user_id)
    for (let i = 0; i < cart.length; i++) {
        product_ids =  cart[i].product_id + ',' + product_ids
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

})

app.get('/payment', async (req, res) => {
    let total = req.session.total.toFixed(2)
    let cart = req.session.cart;
    let items = [];
    let cartItems = []
    let count = 0
   
    for (let i = 0; i < cart.length; i++) {
        await conn.query(`SELECT * FROM products WHERE id = '${cart[i].product_id}'`, async (err, product) => {
            if (!err) {
                count += 1;
                items.push(product.rows);
                if (cart.length === count) {
                    await conn.query(`SELECT * FROM  orders WHERE user_id = '${cart[0].user_id}'`, async (er, user) => {  
                        let userData = user.rows[0]
                        console.log(userData)
                        res.render('orders/pay', { total, cart, userData });
                    })
                }
            } else {
                req.flash('error',`Error ${err.message}`);
            }
        })
    } 

})

app.get('/add', (req, res) => {
    res.render('addProducts/add')
})
app.post('/addProduct', upload.array('image'), async (req, res) => {
    const product = req.body;
    let brutoPrice = Math.round(product.p_price * 0.22 + 1.99)
    let netoPrice = parseFloat(brutoPrice) + parseFloat(product.p_price) + 0.99;
    let total = parseFloat(netoPrice);
    let sku_year = year + "-";
    let sku_num = parseInt(Math.random(12 * 15637) * 10000)
    let sku = sku_year + sku_num;
    let imgsUrl = []
  /*
    for (let i = 0; i < req.files.length; i++) {
        imgsUrl.push(req.files[i].path.split("["))
    }

    if (product.p_cat == 'Mens' && product.p_subcat == 'Jackets' || product.p_cat == 'Womens' && product.p_subcat == 'Jackets') {

    }
    if (product.p_cat == 'Mens' && product.p_subcat == 'Shirts' || product.p_cat == 'Mens' && product.p_subcat == 'Shirts') {

    }
    if (product.p_cat == 'Mens' && product.p_subcat == 'Shoes' || product.p_cat == 'Mens' && product.p_subcat == 'Shoes') {

    }
    if (product.p_cat == 'Kids' && product.p_subcat == 'Jackets' || product.p_cat == 'Kids' && product.p_subcat == 'Shirts') {
        await conn.query(`INSERT INTO products(p_name, p_cat, p_subcat, p_desc, p_fulldesc, p_price, p_qty, p_imgdestination, p_sku) VALUES('${product.p_name}', '${product.p_cat}', '${product.p_subcat}','${product.p_desc}','${product.p_fulldescription}','${total.toFixed(2)}','${product.p_qty}',array_to_json('{${imgsUrl}}'::text[]), '${sku}') RETURNING id,p_name, p_sku`, async (err, doNext) => {
            console.log("first")
            if (!err) {
                await conn.query(`INSERT INTO kids_clothes(id,name,size_56,size_62,size_68,size_74,size_86,size_92,size_104,size_110,size_116,size_128,size_134,size_140,size_146,size_152,size_158,size_164,size_170,size_176,sku_num,color) VALUES('${doNext.rows[0].id}','${doNext.rows[0].p_name}','${req.body.size_56}','${req.body.size_62}','${req.body.size_68}','${req.body.size_74}','${req.body.size_86}','${req.body.size_92}','${req.body.size_104}','${req.body.size_110}','${req.body.size_116}','${req.body.size_128}','${req.body.size_134}','${req.body.size_140}','${req.body.size_146}','${req.body.size_152}','${req.body.size_158}','${req.body.size_164}','${req.body.size_170}','${req.body.size_176}','${doNext.rows[0].p_sku}', 'white')`)
                req.flash('success', 'Successfully added new product')
                console.log("No error")
                res.redirect('add')
            } else {
                req.flash('error', `Error ${err.message}`)
                console.log("error")
                res.redirect('add')
            }
        })
    }
    if (product.p_cat == 'Kids' && product.p_subcat == 'Shoes') {

    }
    */
    res.send(req.body)
})

app.get('/product/:id', async (req, res) => {
    let { id } = req.params
    await conn.query(`SELECT * FROM products WHERE id = '${id}'`, async (err, result) => {
        if (!err) {
            let shirts = result.rows
            if (shirts[0].p_cat == 'Kids' && shirts[0].p_subcat != 'Shoes') {
                await conn.query(`SELECT * FROM kids_clothes WHERE id = '${id}'`, async (e, sizes) => {
                    let size = sizes.rows[0];
                    res.render('pages/productShow', { shirts, size })
                 })
                
            }
        } else {
            req.flash('error', err.message)
            res.redirect('/')
        }
    })
})
// ARTICL PAGES

//! MENS
app.get('/mens', async (req, res) => {
    await conn.query(`SELECT * FROM products WHERE products.p_cat = 'Mens'`, async (err, result) => {
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
    await conn.query(`SELECT * FROM products WHERE products.p_cat = 'Mens' AND products.p_subcat = 'Shirts'`, async (err, result) => {
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
    await conn.query(`SELECT * FROM products WHERE products.p_cat = 'Mens' AND products.p_subcat = 'Jackets'`, async (err, result) => {
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
    await conn.query(`SELECT * FROM products WHERE products.p_cat = 'Mens' AND products.p_subcat = 'Pants'`, async (err, result) => {

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
    await conn.query(`SELECT * FROM products WHERE products.p_cat = 'Mens' AND products.p_subcat = 'Underwear'`, async (err, result) => {

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
    await conn.query(`SELECT * FROM products WHERE products.p_cat = 'Womens'`, async (err, result) => {

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
    await conn.query(`SELECT * FROM products WHERE products.p_cat = 'Womens' AND products.p_subcat = 'Shirts'`, async (err, result) => {
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
    await conn.query(`SELECT * FROM products WHERE products.p_cat = 'Womens' AND products.p_subcat = 'Jackets'`, async (err, result) => {

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
    await conn.query(`SELECT * FROM products WHERE products.p_cat = 'Womens' AND products.p_subcat = 'Pants'`, async (err, result) => {

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
    await conn.query(`SELECT * FROM products WHERE products.p_cat = 'Womens' AND products.p_subcat = 'Underwear'`, async (err, result) => {

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
    await conn.query(`SELECT * FROM products WHERE products.p_cat = 'Baby'`, async (err, result) => {

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
    await conn.query(`SELECT * FROM products WHERE products.p_cat = 'Kids'`, async (err, result) => {

        let shirts = result.rows
        if (!shirts.length) {
            req.flash('error', ' Nothing to display.')
            res.redirect('/')
        } else {
            if (!err) {
                res.render('artikli/kids/kidsAll', { shirts })
            }
        }
    })
})

app.get('/kids_Shirts', async (req, res) => {
    await conn.query(`SELECT * FROM products WHERE products.p_cat = 'Kids' AND products.p_subcat = 'Shirts'`, async (err, result) => {

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
    await conn.query(`SELECT * FROM products WHERE products.p_cat = 'Kids' AND products.p_subcat = 'Jackets'`, async (err, result) => {

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
    await conn.query(`SELECT * FROM products WHERE products.p_cat = 'Kids' AND products.p_subcat = 'Pants'`, async (err, result) => {

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
    await conn.query(`SELECT * FROM products WHERE products.p_cat = 'Kids' AND products.p_subcat = 'Underwear'`, async (err, result) => {

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
