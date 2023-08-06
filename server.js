const express = require("express");
const app = express();
layouts = require('ejs-mate')
const bodyParser = require("body-parser");
const path = require('path');
const override = require('method-override');

// This is your test secret API key.
const stripe = require("stripe")('sk_test_51MdvPOHAKJ9ybQgY4HuSCseuPD5Mypy0LFzH80hONlTdCi7d1ighGvWWaCWhLnl16WApoj2sheRtHXOlI8RB4csY003nJVGSLA');


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.engine('ejs', layouts);
app.use(express.urlencoded({ extended: true }));
app.use(override('_method'))
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());

const calculateOrderAmount = (items) => {
  // Replace this constant with a calculation of the order's amount
  // Calculate the order total on the server to prevent
  // people from directly manipulating the amount on the client
  return 1400;
};

app.get('/', (req,res)=>{
    res.render('orders/testStripeByStripe')
})

app.post("/create-payment-intent", async (req, res) => {
  const { items } = req.body;

  // Create a PaymentIntent with the order amount and currency
  const paymentIntent = await stripe.paymentIntents.create({
    amount: calculateOrderAmount(items),
    currency: "eur",
    automatic_payment_methods: {
      enabled: true,
    },
  });

  res.send({
    clientSecret: paymentIntent.client_secret,
  });
});

app.listen(4242, () => console.log("Node server listening on port 4242!"));