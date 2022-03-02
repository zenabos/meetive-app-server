const router = require("express").Router();
const mongoose = require("mongoose");
const Meeting = require("../models/Meeting.model");
const Topic = require("../models/Topic.model");

router.post("/", (req, res) => {
  const meetingDetails = {
    title: req.body.title,
    goal: req.body.goal,
    description: req.body.description,
    date: req.body.date,
    startTime: req.body.startTime,
    invites: req.body.invites,
    owner: req.body.owner,
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

router.get("/", (req, res) => {
  Meeting.find()
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

router.delete("/:meetingId", (req, res, next) => {
  const { meetingId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(meetingId)) {
    res.status(400).json({ message: "Specified id is not valid" });
    return;
  }

  Meeting.findByIdAndRemove(meetingId)
    .then((deletedMeeting) => {
      return Topic.deleteMany( { _id: { $in: deletedMeeting.topics} })
    })
    .then(() =>
      res.json({
        message: `Meeting with ${meetingId} is removed successfully.`,
      })
    )
    .catch((error) => res.status(500).json(error));
});

module.exports = router;
