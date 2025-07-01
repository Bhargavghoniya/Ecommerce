const jwt = require('jsonwebtoken');
const {Cart} = require('../model/Cart');
const {User} = require('../model/User');
const {Product} = require('../model/Product');
const { model } = require('mongoose');
require("dotenv").config();
const sendEmail = require('../utils/userEmail');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);




const cart = async (req, res) => {
  try {
    const { token } = req.headers;
    const decodedToken = jwt.verify(token, "supersecret");

    const user = await User.findOne({ email: decodedToken.email }).populate({
      path: 'cart',
      populate: {
        path: 'products.product',
        model: 'Product'
      }
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.cart || user.cart.products.length === 0) {
      return res.status(204).json({ message: "No Cart Items" });
    }

    return res.status(200).json({
      message: `Cart Items retrieved successfully! - ${user.cart.products.length}`,
      cart: user.cart
    });

  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      message: "Internal Server Error"
    });
  }
};




// const cart = async (req, res) => {
//     try {
//         const { token } = req.headers;
//         const decodedToken = jwt.verify(token, "supersecret");

//         const user = await User.findOne({ email: decodedToken.email });
//         if (!user) {
//             return res.status(400).json({
//                 message: "User not found"
//             });
//         }

//         const userCart = await Cart.findById(user.cart).populate('products.product');

//         res.status(200).json({
//             message: "cart fetch successfully",
//             cart: userCart
//         });

//     } catch (error) {
//         console.log(error);
//         res.status(400).json({
//             message: "Internal server error"
//         });
//     }
// };





const addCart = async (req, res) => {
    try {
        let { productID, quantity } = req.body;
        let { token } = req.headers;

        let decodedToken = jwt.verify(token, "supersecret");
        let user = await User.findOne({ email: decodedToken.email });

        if (!productID || !quantity) {
            return res.status(400).json({
                message: "Some fields are missing"
            });
        }

        if (user) {
            let product = await Product.findById(productID);
            const cart = await Cart.findOne({ _id: user.cart });

            if (cart) {
                const exists = cart.products.some(p => p.product.toString() === productID.toString());

                if (exists) {
                    return res.status(409).json({  
                        message: "Go to cart"
                    });
                }

                cart.products.push({ product: productID, quantity });
                cart.total += product.price * quantity;

                await cart.save();
            } else {
                const newCart = await Cart.create({
                    products: [
                        {
                            product: productID,
                            quantity: quantity
                        }
                    ],
                    total: product.price * quantity
                });

                user.cart = newCart._id;
                await user.save();
            }

            return res.status(200).json({
                message: "product added to cart"
            });
        }
    } catch (error) {
        console.log(error);
        res.status(400).json({
            message: "Internal server error cart"
        });
    }
};





const updateCart = async (req, res) => {
  try {
    const { productId, action } = req.body; // 'increase', 'decrease', 'remove'
    const { token } = req.headers;

    const decoded = jwt.verify(token, "supersecret");

    const user = await User.findOne({ email: decoded.email }).populate({
      path: "cart",
      populate: {
        path: "products.product",
        model: "Product"
      }
    });

    if (!user || !user.cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const cart = user.cart;
    const item = cart.products.find(p => p.product._id.toString() === productId);

    if (!item) {
      return res.status(404).json({ message: "Product not found in cart" });
    }

    const price = Number(item.product.price);

    if (action === "increase") {
      item.quantity += 1;
      cart.total += price;
    } else if (action === "decrease") {
      if (item.quantity > 1) {
        item.quantity -= 1;
        cart.total -= price;
      } else {
        cart.total -= price;
        cart.products = cart.products.filter(
          p => p.product._id.toString() !== productId
        );
      }
    } else if (action === "remove") {
      cart.total -= price * item.quantity;
      cart.products = cart.products.filter(
        p => p.product._id.toString() !== productId
      );
    } else {
      return res.status(400).json({ message: "Invalid action" });
    }

    await cart.save();

    res.status(200).json({ message: "Cart updated", cart });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong", error });
  }
};





// app.post("/cart/payment", async (req, res) => {
//   const { token } = req.headers;

//   try {
//     const decodedToken = jwt.verify(token, "supersecret");

//     const user = await User.findOne({ email: decodedToken.email }).populate({
//       path: "cart",
//       populate: {
//         path: "products.product",
//         model: "Product",
//       },
//     });

//     if (!user || !user.cart || user.cart.products.length === 0) {
//       return res.status(404).json({ message: "User or Cart Not Found" });
//     }

//     const lineItems = user.cart.products.map((item) => ({
//       price_data: {
//         currency: "inr",
//         product_data: {
//           name: item.product.name,
//         },
//         unit_amount: item.product.price * 100, // Stripe takes amount in paisa
//       },
//       quantity: item.quantity,
//     }));

//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ["card"],
//       line_items: lineItems,
//       mode: "payment",
//       success_url: `${process.env.CLIENT_URL}/success`,
//       cancel_url: `${process.env.CLIENT_URL}/cancel`,
//     });

//     // Empty the cart
//     user.cart.products = [];
//     user.cart.total = 0;
//     await user.cart.save();
//     await user.save();

//     res.status(200).json({ url: session.url });

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Payment Failed", error });
//   }
// });







const removeCart = async (req, res) => {
    try {
        let { id } = req.params;
        let { token } = req.headers;

        let decodedToken = jwt.verify(token, "supersecret");
        let user = await User.findOne({ email: decodedToken.email });

        if (user) {
            const removecart = await Cart.findByIdAndDelete(id); 
            return res.status(200).json({
                message: "Cart item deleted successfully",
                cart: removecart 
            });
        } else {
            return res.status(404).json({
                message: "User not found"
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ 
            message: "Internal server error cart"
        });
    }
};





// payment
const payment = async (req, res) => {
  try {
    const { token } = req.headers;
    const decodedToken = jwt.verify(token, "supersecret");

    const user = await User.findOne({ email: decodedToken.email }).populate({
      path: 'cart',
      populate: {
        path: 'products.product',
        model: 'Product'
      }
    });

    if (!user || !user.cart || user.cart.products.length === 0) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Prepare line items
    const lineItems = user.cart.products.map((item) => {
      return {
        price_data: {
          currency: 'inr',
          product_data: {
            name: item.product.name,
            images: [item.product.image],
          },
          unit_amount: parseInt(item.product.price) * 100, // Convert to paisa
        },
        quantity: item.quantity,
      };
    });

    const currentUrl = process.env.CLIENT_URL || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${currentUrl}/success`,
      cancel_url: `${currentUrl}/cancel`
    });


    //send email to user
    await sendEmail(user.email, user.cart.products.map((item) => ({
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity
    })))
    

    // Empty cart
    user.cart.products = [];
    user.cart.total = 0;
    await user.cart.save();
    await user.save();

    res.status(200).json({
      message: "Payment successful",
      url: session.url,
    });

  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: "Internal server error"
    });
  }
};




module.exports = {cart,addCart,updateCart,removeCart,payment};