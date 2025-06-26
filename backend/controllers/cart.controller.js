const jwt = require('jsonwebtoken');
const {Cart} = require('../model/Cart');
const {User} = require('../model/User');
const {Product} = require('../model/Product');
const { model } = require('mongoose');


// const cart = async(req,res)=>{
//     try{
//         const {token} = req.headers;
//         const decodedToken = jwt.verify(token,"supersecret");
//         const user = await User.findOne({email:decodedToken.email}).populate({
//             path:'cart',
//             populate:{
//                 path:'products',
//                 model:'Product'
//             }
//         })
//         if(!user){
//             res.status(400).json({
//                 message:"User not found"
//             })
//         }
//         res.status(200).json({
//             message:"cart fetch successfully",
//             cart:user.cart
//         })
            
//     }catch(error){
//        console.log(error);
//        res.status(400).json({
//            message:"Internal server error"
//        })
//     }
// }



const cart = async (req, res) => {
    try {
        const { token } = req.headers;
        const decodedToken = jwt.verify(token, "supersecret");

        const user = await User.findOne({ email: decodedToken.email });
        if (!user) {
            return res.status(400).json({
                message: "User not found"
            });
        }

        const userCart = await Cart.findById(user.cart).populate('products.product');

        res.status(200).json({
            message: "cart fetch successfully",
            cart: userCart
        });

    } catch (error) {
        console.log(error);
        res.status(400).json({
            message: "Internal server error"
        });
    }
};





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






module.exports = {cart,addCart,removeCart};