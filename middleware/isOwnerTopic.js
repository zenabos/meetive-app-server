const Topic = require("../models/Meeting.model");

module.exports = (req, res, next) => {
  Topic.findById(req.params.topicId)
    .populate("owner")
    .then((topic) => {
      if (topic.owner._id.toString() !== req.payload.user._id.toString()) {
        res.status(500).json("You are not the owner", err)
        return;
      }
      next();
    })
    .catch((err) => {
        console.log(err);
        res.status(500).json("Error editing topic", err);
      })
};