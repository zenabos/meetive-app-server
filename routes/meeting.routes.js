const router = require("express").Router();
const mongoose = require("mongoose");
const Meeting = require("../models/Meeting.model");
const Topic = require("../models/Topic.model");
const { isAuthenticated } = require("../middleware/jwt.middleware");

router.post("/", isAuthenticated, (req, res) => {
  const meetingDetails = {
    title: req.body.title,
    goal: req.body.goal,
    description: req.body.description,
    start: req.body.start,
    invites: req.body.invites,
    owner: req.payload._id,
    topics: [],
  };

  Meeting.create(meetingDetails)
    .then((newMeeting) => {
      res.json(newMeeting);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json("error creating new meeting", err);
    });
});

router.get("/", isAuthenticated, (req, res) => {
  Meeting.find({ owner: req.payload._id })
    .populate("topics")
    .then((allMeetings) => res.json(allMeetings))
    .catch((err) => {
      console.log(err);
      res.status(500).json("error finding meetings", err);
    });
});

router.get("/:meetingId", (req, res, next) => {
  const { meetingId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(meetingId)) {
    res.status(400).json({ message: "Specified id is not valid" });
    return;
  }

  Meeting.findById(meetingId)
    .populate("topics")
    .then((meeting) => res.status(200).json(meeting))
    .catch((error) => res.json(error));
});

router.put("/:meetingId", (req, res, next) => {
  const { meetingId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(meetingId)) {
    res.status(400).json({ message: "Specified id is not valid" });
    return;
  }

  Meeting.findByIdAndUpdate(meetingId, req.body, { new: true })
    .then((updatedMeeting) => res.json(updatedMeeting))
    .catch((error) => res.json(error));
});

router.delete("/:meetingId", isAuthenticated, (req, res, next) => {
  const { meetingId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(meetingId)) {
    res.status(400).json({ message: "Specified id is not valid" });
    return;
  }

  Meeting.findByIdAndRemove(meetingId)
    .then((deletedMeeting) => {
      return Topic.deleteMany({ _id: { $in: deletedMeeting.topics } });
    })
    .then(() =>
      res.json({
        message: `Meeting with ${meetingId} is removed successfully.`,
      })
    )
    .catch((error) => res.status(500).json(error));
});

router.get("/:meetingId/topics", isAuthenticated, (req, res) => {
  Topic.find({ meeting: req.params.meetingId })
    .populate("owner")
    .then((result) => {
      console.log(result);
      res.json(result);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json("error finding meetings", err);
    });
});

module.exports = router;
