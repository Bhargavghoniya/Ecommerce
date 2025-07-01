const Razorpay = require("razorpay");
const jwt = require("jsonwebtoken");
const { User } = require("../model/User");
require("dotenv").config();
const sendEmail = require('../utils/userEmail');

const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
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

    // Create payment link
    const response = await instance.paymentLink.create({
      amount: totalAmount * 10, 
      currency: "INR",
      accept_partial: false,
      description: "Order from Ecommerce App",
      customer: {
        name: user.name || "Customer",
        email: user.email,
      },
      notify: {
        sms: false,
        email: true,
      },
      reminder_enable: true,
      callback_url: "https://your-backend.com/cart/verify",
      callback_method: "get",
    });

    console.log("🔗 Razorpay Payment Link:", response.short_url);

    // Send email with cart product details
    const emailProducts = user.cart.products.map((item) => ({
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
    }));
    await sendEmail(user.email, emailProducts);


    // Empty cart
    user.cart.products = [];
    user.cart.total = 0;
    await user.cart.save();
    await user.save();

    res.status(200).json({
      message: "Payment link generated and email sent successfully",
      link: response.short_url,
    });
  } catch (err) {
    console.error(" Payment or Email Error:", err);
    res.status(500).json({ message: "Payment Failed", error: err });
  }
};

module.exports = { createPaymentOrder };
