const { ContactModel } = require("../models/Contact");
const { Mail } = require("../utils/Mail");
const { Logs } = require("../middlewares/Logs")

class ContactController {
    static contact = async (req, res) => {
        try {
            const { name, email, message } = req.body;
            if (name && email && message) {
                const newContact = new ContactModel({ name, email, message });
                newContact.save(async (err, result) => {
                    if (err) {
                        res.status(500).json([{ "status": "failed", "message": "something went wrong" }])
                    }
                    else {
                        await Mail.sendContactResponseEmail(email, name, message);
                        res.status(200).json([{ "status": "success", "message": "Thanks for contacting us. We have received your message." }])
                    }
                })
            } else {
                res.status(400).json([{ "status": "failed", "message": "name, email & message fields are required" }]);
            }
        } catch (err) {
            if (err) Logs.errorHandler(err, req, res);
        }
    }
}

module.exports = { ContactController };
