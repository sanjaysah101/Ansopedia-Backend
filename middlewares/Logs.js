const { format } = require("date-fns");
const fs = require("fs");
const path = require("path");
const fsPromises = require("fs/promises");
const ApiModel = require("../models/ApiModel");
const Enum = require("../utils/Enum");

class Logs {
    static errorHandler = async (err, req, res, next) => {
        const message = `${err.name}: at  ${req.url} ==> ${err.message}`;
        await logEvents(message, 'errLog.txt');
        // res.status(500).json([{ "status": "failed", "message": "something went wrong" }]);
        res.end(ApiModel.getApiModel(Enum.status.FAILED, "something went wrong"))
    }
}

const logEvents = async (message, logName) => {
    const dateTime = `${format(new Date(), 'yyyyMMdd\tHH:mm:ss')}`;
    const logItem = `${dateTime}\t${message}\n`;
    try {
        if (!fs.existsSync(path.join(__dirname, "..", "logs"))) {
            await fsPromises.mkdir(path.join(__dirname, "..", "logs"));
        }
        await fsPromises.appendFile(path.join(__dirname, "..", "logs", logName), logItem);
    } catch (err) {
        console.log(err);
    }
}



module.exports = { Logs }