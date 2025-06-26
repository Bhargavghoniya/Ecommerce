const express = require('express');
const { cart, addCart, removeCart } = require('../controllers/cart.controller');
const router = express.Router();




//route to get cart
router.get('/userCart',cart);
router.post('/addCart',addCart);
router.delete('/deleteCart/:id',removeCart);

module.exports = router;