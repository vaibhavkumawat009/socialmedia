const express = require("express");
const app = express();
require('dotenv').config()
const connectDB = require("./config/db");
const Router = require("./routes/index.js")


const passport = require('passport')

const { initializePassport } = require('./config/passport.js')

const cookieParser = require('cookie-parser');



const bodyParser = require('body-parser');
    

//initializing the passport js 
initializePassport(passport)

//middlewares
app.use(express.json());
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }))
app.use(passport.initialize())



app.use(Router)

const PORT = process.env.PORT

//connection to db 
connectDB()
    .then(() => {
        //server
        app.listen(process.env.PORT, (err) => {
            if (err) {
                return console.error("Error starting server:", err);
            }
            console.log(`Server is listening on port ${process.env.PORT}`);
        });
    })
    .catch((error) => {
        console.error("Error connecting to the database:", error);
    });
