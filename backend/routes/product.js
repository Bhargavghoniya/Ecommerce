const express = require('express');
//const { Product } = require('../model/Product');
//const { addproduct, singleProduct } = require('../controllers/product.controller');
const { product, addproduct, singleProduct, updateProduct, deleteProduct } = require('../controllers/product.controller');
const router = express.Router();


//task one see all the product

//Product
router.get('/products', product);

//task 2 add product
router.post('/add-product', addproduct);

//task 3 show single product
router.get('/product/:id', singleProduct);

//task 4 update product
router.put('/edit/:id',updateProduct);

//task 5 delete product
router.delete('/delete/:id',deleteProduct);

module.exports = router;