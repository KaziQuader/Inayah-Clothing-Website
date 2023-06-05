const stripe = require("stripe")(
  "sk_test_51NCOBfABxzqZfQXjTmgPZA74kbpmSrZJKP6PkGVTPMfJf1v8siVDCk4xPOZoWxANq6I9YB6xG13tQO97oY2RS6iL00a5caZZrc"
);

exports.processPayment = async (req, res, next) => {
  const myPayment = await stripe.paymentIntents.create({
    amount: req.body.amount,
    currency: "usd",
    metadata: {
      company: "Inayah",
    },
  });

  res.status(200).json({
    success: true,
    client_secret: myPayment.client_secret,
  });
};

exports.sendStripeApiKey = async (req, res, next) => {
  res.status(200).json({
    stripeApiKey: process.env.SRIPE_API_KEY,
  });
};
