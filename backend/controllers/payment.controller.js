const Razorpay = require("razorpay");
const jwt = require("jsonwebtoken");
const { User } = require("../model/User");

require("dotenv").config();

const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

const createPaymentOrder = async (req, res) => {
  try {
    const { token } = req.headers;
    const decoded = jwt.verify(token, "supersecret");

    const user = await User.findOne({ email: decoded.email }).populate({
      path: "cart",
      populate: {
        path: "products.product",
        model: "Product",
      },
    });

    if (!user || !user.cart || user.cart.products.length === 0) {
      return res.status(404).json({ message: "User or Cart Not Found" });
    }

    let totalAmount = 0;
    user.cart.products.forEach((item) => {
      totalAmount += Number(item.product.price) * item.quantity;
    });

    const options = {
      amount: totalAmount * 100,
      currency: "INR",
      receipt: `order_rcptid_${Math.floor(Math.random() * 10000)}`
    };

    const order = await instance.orders.create(options);
    res.status(200).json({ order, key: process.env.RAZORPAY_KEY_ID });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Payment Failed", error: err });
  }
};

module.exports = { createPaymentOrder };
