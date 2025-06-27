const express = require("express");
require("dotenv").config();
const app = express();
const PORT = 8080
const connectedDB = require('./DB/connectDB');
const cors = require('cors');
const morgan = require('morgan');
const routes = require('./routes/index');
const cartRoutes = require("./routes/cart");

//db
connectedDB();

//middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use("/", cartRoutes);

//routes
app.use(routes);

// const PORT = process.env.PORT || 8080;

app.listen(PORT, ()=>{
    console.log(`Server Is Connected to port ${PORT}`)
})