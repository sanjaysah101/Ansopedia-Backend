const { NotificationModel } = require("../models/Notification");
const { Logs } = require("../middlewares/Logs");

class NotificationController {
    static createNotification = async (req, res) => {
        try {
            const { title, message, time } = req.body;
            const scope = "global";
            if (title && message) {
                const notification = new NotificationModel({ title, message, time, scope });
                const result = await notification.save();
                res.send(result)
            } else {
                res.status(401).json([{ "status": "failed", "message": "All fields are required" }]);
            }
        } catch (err) {
            Logs.errorHandler(err, req, res);
        }
    }

    static getNotification = async (req, res) => {
        try {
            const notifications = await NotificationModel.find().select(["_id", "title", "message", "time", "scope"]);
            let GlobalNotifications = notifications.filter(f => f.scope === "global")
            const userNotification = await UserModel.findById(req.user._id).select("notifications").populate({
                path: "notifications",
                select: ["_id", "title", "message", "time"]
            });
            const notify = [...userNotification.notifications, ...GlobalNotifications]
            if (notify.length > 0) {
                res.status(200).json(notify);
            } else {
                res.status(404).json([{ "status": "failed", "message": "There is nothing to show" }]);
            }
        } catch (err) {
            Logs.errorHandler(err, req, res);
        }
    }
}

module.exports = { NotificationController };