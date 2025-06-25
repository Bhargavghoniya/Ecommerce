const mongoose = require('mongoose');

function connectedDB(){
    mongoose.connect('mongodb://127.0.0.1:27017/MCA')
    .then(()=>{
        console.log("DB is Connected")
    }).catch(()=>{
        console.log("DB is Not Connected")
    })
}


module.exports = connectedDB;