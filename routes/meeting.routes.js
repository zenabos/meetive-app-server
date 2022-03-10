const router = require("express").Router();
const mongoose = require("mongoose");
const Meeting = require("../models/Meeting.model");
const Topic = require("../models/Topic.model");
const { isAuthenticated } = require("../middleware/jwt.middleware");
const isOwner = require("../middleware/isOwner");

router.post("/", isAuthenticated, (req, res) => {
  const meetingDetails = {
    title: req.body.title,
    goal: req.body.goal,
    start: req.body.start,
    end: req.body.start,
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
  Meeting.find({
    $or: [{ owner: req.payload._id }, { invites: req.payload.email }],
  })
    .populate("topics")
    .then((allMeetings) => res.json(allMeetings))
    .catch((err) => {
      console.log(err);
      res.status(500).json("error finding meetings", err);
    });
});

router.get("/my-meetings", isAuthenticated, (req, res) => {
  Meeting.find({ owner: req.payload._id })
    .populate("topics")
    .then((allMeetings) => res.json(allMeetings))
    .catch((err) => {
      console.log(err);
      res.status(500).json("error finding meetings", err);
    });
});

router.get("/invitations", isAuthenticated, (req, res) => {
  Meeting.find({ invites: req.payload.email })
    .populate("topics")
    .then((allMeetings) => res.json(allMeetings))
    .catch((err) => {
      console.log(err);
      res.status(500).json("error finding invitations", err);
    });
});

router.get("/:meetingId", isAuthenticated, (req, res, next) => {
  const { meetingId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(meetingId)) {
    res.status(400).json({ message: "Specified id is not valid" });
    return;
  }

  Meeting.findById(meetingId)
    .populate("owner")
    .populate("topics")
    .then((meeting) => res.status(200).json(meeting))
    .catch((err) => {
      console.log(err);
      res.status(500).json("error finding meeting", err);
    });
});

router.put("/:meetingId", isAuthenticated, isOwner, (req, res, next) => {
  const { meetingId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(meetingId)) {
    res.status(400).json({ message: "Specified id is not valid" });
    return;
  }

  Meeting.findByIdAndUpdate(meetingId, req.body, { new: true })
    .then((updatedMeeting) => res.json(updatedMeeting))
    .catch((err) => {
      console.log(err);
      res.status(500).json("error updating meeting", err);
    });
});

router.put("/:meetingId/endTime", isAuthenticated, (req, res, next) => {
  const { meetingId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(meetingId)) {
    res.status(400).json({ message: "Specified id is not valid" });
    return;
  }

  Meeting.findByIdAndUpdate(meetingId, { end: req.body.endTime }, { new: true })
    .then((updatedMeeting) => res.json(updatedMeeting))
    .catch((err) => {
      console.log(err);
      res.status(500).json("error updating endtime", err);
    });
  });

router.delete("/:meetingId", isAuthenticated, isOwner, (req, res, next) => {
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
      res.json(result);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json("error finding meetings", err);
    });
});

module.exports = router;
