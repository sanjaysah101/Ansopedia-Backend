const { NotificationModel } = require('../models/Notification');
const { Logs } = require('../middlewares/Logs');
const { UserModel } = require('../models/User');
const ApiModel = require('../models/ApiModel');
const Enum = require('../utils/Enum');

class NotificationController {
  static createNotification = async (req, res) => {
    try {
      const { title, message, time } = req.body;
      const scope = 'global';
      if (title && message) {
        const notification = new NotificationModel({
          title,
          message,
          time,
          scope,
        });
        await notification.save();
        res.send(ApiModel.getApiModel(Enum.status.SUCCESS, `${title} Send`));
      } else {
        res
          .status(401)
          .json(
            ApiModel.getApiModel(Enum.status.FAILED, 'All fields are required')
          );
      }
    } catch (err) {
      if (err) Logs.errorHandler(err, req, res);
    }
  };

  static getNotification = async (req, res) => {
    try {
      const notifications = await NotificationModel.find().select([
        '_id',
        'title',
        'message',
        'time',
        'scope',
      ]);
      let GlobalNotifications = notifications.filter(
        (f) => f.scope === 'global'
      );
      const user = await UserModel.findOne({ uid: req.firebaseUser.uid });
      const userNotification = await UserModel.findById(user._id)
        .select('notifications')
        .populate({
          path: 'notifications',
          select: ['_id', 'title', 'message', 'time'],
        });
      const notify = [
        ...userNotification.notifications,
        ...GlobalNotifications,
      ];
      if (notify.length > 0) {
        res
          .status(200)
          .json(
            ApiModel.getApiModel(
              Enum.status.SUCCESS,
              'Here is notification',
              notify.reverse()
            )
          );
      } else {
        res
          .status(404)
          .json(
            ApiModel.getApiModel(Enum.status.FAILED, 'There is nothing to show')
          );
      }
    } catch (err) {
      if (err) Logs.errorHandler(err, req, res);
    }
  };
}

module.exports = { NotificationController };
