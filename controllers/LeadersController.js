const { Logs } = require("../middlewares/Logs");
const ApiModel = require("../models/ApiModel").default;
const { UserModel } = require("../models/User");
const Enum = require("../utils/Enum");
const IMAGE_URI = "https://api.ansopedia.com/images/";
class LeadersController {
  static getLeaders = async (req, res) => {
    try {
      const users = await UserModel.find().select([
        "_id",
        "name",
        "avatar",
        "coins",
      ]);
      const leaders = users.sort(
        (a, b) => b.coins.totalCoins - a.coins.totalCoins
      );
      const leadersList = [];
      for (let i of leaders) {
        let userProfile = "";
        if (i._doc.avatar?.isCreatedwithGoogle) {
          userProfile = i._doc.avatar?.picture;
        } else {
          userProfile = IMAGE_URI + i._doc.avatar?.picture;
        }
        let lead = {
          ...i._doc,
          coins: i._doc.coins.totalCoins,
          avatar: userProfile,
        };
        leadersList.push(lead);
      }
      res
        .status(200)
        .json(
          ApiModel.getApiModel(
            Enum.status.SUCCESS,
            "There is our leaders",
            leadersList
          )
        );
    } catch (err) {
      if (err) Logs.errorHandler(err, req, res);
    }
  };
}

module.exports = { LeadersController };
