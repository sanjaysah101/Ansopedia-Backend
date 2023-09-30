const sendResponse = (res, statusCode, status, message, data) => {
    res.status(statusCode).json({ status, message, data });
};

module.exports = { sendResponse };
