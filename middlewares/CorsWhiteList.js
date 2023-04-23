const ApiModel = require("../models/ApiModel");
const Enum = require("../utils/Enum");

const whitelist =(req, res, next) => {
    try{
        res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
        res.header('Access-Control-Allow-Credentials', 'true');
        next();
    }catch(err){
        console.log(err)
        res.status(500).json(ApiModel.getApiModel(Enum.status.FAILED, err.message))
    }
}

module.exports = {whitelist};