const jwt = require('jsonwebtoken');
const {Cart} = require('../model/Cart');
const {User} = require('../model/User');
const {Product} = require('../model/Product');
const { model } = require('mongoose');


const cart = async(req,res)=>{
    try{
        const {token} = req.headers;
        const decodedToken = jwt.verify(token,"supersecret");
        const user = await User.findOne({email:decodedToken.email}).populate({
            path:'cart',
            populate:{
                path:'products',
                model:'Product'
            }
        })
        if(!user){
            res.status(400).json({
                message:"User not found"
            })
        }
        res.status(200).json({
            message:"cart created successfully",
            cart:user.cart
        })
            
    }catch(error){
       console.log(error);
       res.status(400).json({
           message:"Internal server error"
       })
    }
}