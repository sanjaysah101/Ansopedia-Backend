const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;
const DB_Name = process.env.DATABASE_NAME;
const whitelist = ["http://localhost:3000", "http://127.0.0.1:3000", "https://www.google.com", "https://www.bing.com"];

mongoose.set('strictQuery', true);
class Config {
    static connectDb = async () => {
        try {
            const DB_OPTIONS = {
                dbName: DB_Name
            }
            await mongoose.connect(DATABASE_URL, DB_OPTIONS)
            console.log("Connected Successfully...");
        } catch (error) {
            if (error)
                throw new Error("Unable to connect to DB");
        }
    }

    static nodemailerTransport = (FROM) => nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: FROM,
            pass: process.env.EMAIL_PASS
        }
    });

    static corsOptions = {
        origin: function (origin, callback) { 
            // db.loadOrigins is an example call to load
            // a list of origins from a backing database
            if (whitelist.indexOf(origin) !== -1 || !origin) {
                //   if(whitelist.indexOf(origin) !== -1){
                callback(null, true)
            } else {
                callback(new Error("Not allowed by cors"))
            }
    
        }
    }
}

module.exports = { Config };