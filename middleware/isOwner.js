const Meeting = require("../models/Meeting.model");

module.exports = (req, res, next) => {
  Meeting.findById(req.params.meetingId)
    .populate("owner")
    .then((meeting) => {
      if (meeting.owner._id.toString() !== req.payload.user._id.toString()) {
        res.status(500).json("You are not the owner", err)
        return;
      }
      next();
    })
    .catch((err) => {
        console.log(err);
        res.status(500).json("Error editing meeting", err);
      })
};