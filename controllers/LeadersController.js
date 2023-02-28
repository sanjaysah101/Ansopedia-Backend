const { Logs } = require("../middlewares/Logs");
const { UserModel } = require("../models/User");
const IMAGE_URI = "https://api.ansopedia.com/images/";
class LeadersController {
    static getLeaders = async (req, res) => {
        try {
            const users = await UserModel.find().select(["_id", "name", "avatar", "coins"]);
            const leaders = users.sort((a, b) => b.coins.totalCoins - a.coins.totalCoins);
            const leadersList = [];
            for (let i of leaders){
                let lead = {...i._doc, "coins" : i._doc.coins.totalCoins, "avatar": IMAGE_URI+i._doc.avatar};
                leadersList.push(lead);
            }
            res.status(200).json(leadersList);

        } catch (err) {
            if (err) Logs.errorHandler(err, req, res);
        }
    }
}

module.exports = { LeadersController };