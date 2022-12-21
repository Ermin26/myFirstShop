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
const override = require('method-override');
const PostgreSQLStore = require('connect-pg-simple')(session)
const bcrypt = require('bcrypt')
const { Client } = require('pg')
const { isLoged } = require('./utils/isLoged')
const { cloudinary } = require('./cloudinary/cloudConfig');
const multer = require('multer');
const { storage } = require('./cloudinary/cloudConfig');
const upload = multer({ storage })
//const upload = multer({ dest: 'uploads/' })


const client = new Client({
    user: process.env.DB_USERN,
    host: process.env.DB_HOST,
    database: process.env.DB_DB,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT,
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
//app.use(express.urlencoded({ extended: true }));
app.use(override('_method'))
app.use(express.static(path.join(__dirname, 'public')));
//app.use(bodyParser.json());


const forSession = process.env.DB_PASS
const nothingSpecial = process.env.IGNORE_ME




app.use(session({
    store: new PostgreSQLStore({
        pool: client,                // Connection pool
        //tableName: 'session'   // Use another table-name than the default "session" one
        // Insert connect-pg-simple options here
    }),
    name: 'session',
    secret: process.env.IGNORE_ME,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        maxAge: 1 * 24 * 60 * 60 * 1000
    }, // 1 day
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




app.get('/all_products', async (req, res) => {
    await conn.query(`SELECT * FROM products`, async (err, result) => {
        //console.log(result.rows)
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
    req.flash('success', 'Successfully loged', req.user.fname)
    delete req.session.returnTo;
    res.redirect(redirect)
})

//? WORKING!! Automatically LOGIN YESSSSSS WORKING!

app.post('/register', async (req, res, next) => {
    const users = req.body;
    await conn.query(`SELECT * FROM users WHERE users.email='${users.email}'`, async (notExists, exists) => {
        if (exists.rows.length) {
            console.log("User with that email already exists, please enter other email or log in!")
            res.redirect('/register')
        } else {
            const userPassword = await bcrypt.hash(users.password, 10)

            await conn.query(`INSERT INTO users (fName ,lName ,email ,country ,city ,zip, address, password ) VALUES('${users.fname}' ,'${users.lname}', '${users.email}', '${users.country}', '${users.city}', '${users.zip}','${users.address}','${userPassword}')`, async (err, user) => {
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
            req.flash('success', 'Logged out. Now you cannot make any changes.');
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

app.get('/add', (req, res) => {
    res.render('addProducts/add')
})

app.post('/addProduct', upload.array('image'), async (req, res) => {
    const product = req.body;
    let imgsUrl = []
    for (let i = 0; i < req.files.length; i++) {
        imgsUrl.push(req.files[i].path.split("["))
    }
    //await conn.query(`INSERT INTO products(p_name, p_cat, p_subcat, p_desc, p_fulldesc, p_price, p_qty, p_imgdestination) VALUES('${product.p_name}', '${product.p_cat}', '${product.p_subcat}','${product.p_desc}','${product.p_fulldescription}','${product.p_price}','${product.p_qty}',ARRAY['${imgsUrl}'])`)
    await conn.query(`INSERT INTO products(p_name, p_cat, p_subcat, p_desc, p_fulldesc, p_price, p_qty, p_imgdestination) VALUES('${product.p_name}', '${product.p_cat}', '${product.p_subcat}','${product.p_desc}','${product.p_fulldescription}','${product.p_price}','${product.p_qty}',array_to_json('{${imgsUrl}}'::text[]))`)

    res.redirect('add')
})

// ARTICL PAGES

//! MENS
app.get('/mens', async (req, res) => {
    await conn.query(`SELECT * FROM products WHERE products.p_cat = 'Mens'`, async (err, result) => {
        //console.log(result.rows.length)
        let shirts = result.rows
        if (!shirts.length) {
            req.flash('error', ' Nothing to display.')
            res.redirect('/all_products')
        }

        if (!err) {
            for (imgs of shirts) {
                let img = imgs.p_imgdestination.toString()
                let allImg = img.split(',')
                res.render('artikli/mens/mensAll', { shirts, allImg })
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
            res.redirect('/all_products')
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
            res.redirect('/all_products')
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
            res.redirect('/all_products')
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
            res.redirect('/all_products')
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
            res.redirect('/all_products')
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
            res.redirect('/all_products')
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
            res.redirect('/all_products')
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
            res.redirect('/all_products')
        } else {
            if (!err) {
                res.render('artikli/womens/womenUnderwear', { shirts })
            }
        }
    })
})

//! KIDS

app.get('/baby', async (req, res) => {
    res.render('artikli/kids/kidsBaby')
})
app.get('/kids', async (req, res) => {
    await conn.query(`SELECT * FROM products WHERE products.p_cat = 'Kids'`, async (err, result) => {

        let shirts = result.rows
        if (!shirts.length) {
            req.flash('error', ' Nothing to display.')
            res.redirect('/all_products')
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
            res.redirect('/all_products')
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
            res.redirect('/all_products')
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
            res.redirect('/all_products')
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
            res.redirect('/all_products')
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



app.listen(3000, () => {
    console.log("Sever is now listening at port 3000");
})