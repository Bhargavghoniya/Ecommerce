const express = require('express')
const router = express.Router();
const userRoute = require('./user');
const productRoute = require('./product');
//const showRoute = require('./product');

router.use('/user',userRoute);
router.use('/userProduct',productRoute);
router.use('/products',productRoute);

module.exports = router;
