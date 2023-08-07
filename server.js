const express = require("express");
const app = express();
layouts = require('ejs-mate')
const bodyParser = require("body-parser");
const path = require('path');
const override = require('method-override');

// This is your test secret API key.
//const stripe = require("stripe")('sk_test_51MdvPOHAKJ9ybQgY4HuSCseuPD5Mypy0LFzH80hONlTdCi7d1ighGvWWaCWhLnl16WApoj2sheRtHXOlI8RB4csY003nJVGSLA');


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.engine('ejs', layouts);
app.use(express.urlencoded({ extended: true }));
app.use(override('_method'))
app.use(express.static(path.join(__dirname, 'public')));
//app.use(bodyParser.json());

const calculateOrderAmount = (items) => {
  // Replace this constant with a calculation of the order's amount
  // Calculate the order total on the server to prevent
  // people from directly manipulating the amount on the client
  return 1400;
};

app.get('/', (req,res)=>{
    res.render('orders/testStripeByStripe')
})

app.get('/done', (req, res) => {
  res.send('<h1>Done. Does it works?</h1>')
})
const stripe = require('stripe')('sk_test_51MdvPOHAKJ9ybQgY4HuSCseuPD5Mypy0LFzH80hONlTdCi7d1ighGvWWaCWhLnl16WApoj2sheRtHXOlI8RB4csY003nJVGSLA', {
  apiVersion: '2020-08-27',
  appInfo: { // For sample support and debugging, not required for production:
    name: "stripe-samples/accept-a-payment/payment-element",
    version: "0.0.2",
    url: "https://github.com/stripe-samples"
  }
});

app.use(
  express.json({
    // We need the raw body to verify webhook signatures.
    // Let's compute it only when hitting the Stripe webhook endpoint.
    verify: function (req, res, buf) {
      if (req.originalUrl.startsWith('/webhook')) {
        req.rawBody = buf.toString();
      }
    },
  })
);

app.get('/yoo', (req, res) => {
  console.log(`${process.env.STRIPE_PK}`)
  res.render('orders/testStripeByStripe');
});

app.get('/config', (req, res) => {
  res.send({
    publishableKey: 'pk_test_51MdvPOHAKJ9ybQgYh7CDLxx8Dr0NM4py99cTYnldtQZkI5AfU4bN6xqmRCXPVzoKEjojnpwAZuPBc8idylHdFvWs00MsuVid5z',
  });
});

app.get('/create-payment-intent', async (req, res) => {
  // Create a PaymentIntent with the amount, currency, and a payment method type.
  //
  // See the documentation [0] for the full list of supported parameters.
  //
  // [0] https://stripe.com/docs/api/payment_intents/create
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      currency: 'EUR',
      amount: 1999,
      automatic_payment_methods: { enabled: true }
    });

    // Send publishable key and PaymentIntent details to client
    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (e) {
    return res.status(400).send({
      error: {
        message: e.message,
      },
    });
  }
});

// Expose a endpoint as a webhook handler for asynchronous events.
// Configure your webhook in the stripe developer dashboard
// https://dashboard.stripe.com/test/webhooks
/*
app.post('/webhook', async (req, res) => {
  let data, eventType;

  // Check if webhook signing is configured.
  if (process.env.STRIPE_WEBHOOK_SECRET) {
    // Retrieve the event by verifying the signature using the raw body and secret.
    let event;
    let signature = req.headers['stripe-signature'];
    try {
      event = stripe.webhooks.constructEvent(
        req.rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.log(`⚠️  Webhook signature verification failed.`);
      return res.sendStatus(400);
    }
    data = event.data;
    eventType = event.type;
  } else {
    // Webhook signing is recommended, but if the secret is not configured in `config.js`,
    // we can retrieve the event data directly from the request body.
    data = req.body.data;
    eventType = req.body.type;
  }

  if (eventType === 'payment_intent.succeeded') {
    // Funds have been captured
    // Fulfill any orders, e-mail receipts, etc
    // To cancel the payment after capture you will need to issue a Refund (https://stripe.com/docs/api/refunds)
    console.log('💰 Payment captured!');
  } else if (eventType === 'payment_intent.payment_failed') {
    console.log('❌ Payment failed.');
  }
  res.sendStatus(200);
});
*/
app.listen(4242, () =>
  console.log(`Node server listening at http://localhost:4242`)
);