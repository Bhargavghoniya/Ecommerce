const express = require('express');
const { cart, addCart, removeCart, updateCart } = require('../controllers/cart.controller');
const { createPaymentOrder } = require('../controllers/payment.controller');
const router = express.Router();




//route to get cart
router.get('/userCart',cart);
router.post('/addCart',addCart);
router.put('/updateCart',updateCart);
router.delete('/deleteCart/:id',removeCart);


//payment
router.post("/cart/payment", createPaymentOrder);

module.exports = router;