const router = require("express").Router();
const mongoose = require("mongoose");
const Topic = require("../models/Topic.model");
const { isAuthenticated } = require("../middleware/jwt.middleware");
const Meeting = require("../models/Meeting.model");
const isOwnerTopic = require("../middleware/isOwnerTopic");


router.post("/", isAuthenticated, (req, res) => {
  const { meeting } = req.body;

  const topicDetails = {
    title: req.body.title,
    description: req.body.description,
    introductionTime: req.body.introductionTime,
    discussionTime: req.body.discussionTime,
    conclusionTime: req.body.conclusionTime,
    totalTime: req.body.totalTime,
    owner: req.payload._id,
    meeting: req.body.meeting,
  };

  Topic.create(topicDetails)
    .then((newTopic) => {
      res.json(newTopic);
      return Meeting.findByIdAndUpdate(meeting, {
        $push: { topics: newTopic._id },
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json("error creating new topic", err);
    });
});

router.get("/", isAuthenticated, (req, res) => {
  Topic.find()
    .then((result) => res.json(result))
    .catch((err) => {
      console.log(err);
      res.status(500).json("error finding meetings", err);
    });
});

router.get("/:topicId", isAuthenticated, (req, res, next) => {
  const { topicId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(topicId)) {
    res.status(400).json({ message: "Specified id is not valid" });
    return;
  }

  Topic.findById(topicId)
    .populate("owner")
    .then((topic) => res.status(200).json(topic))
    .catch((error) => res.json(error));
});

router.delete("/:topicId", isAuthenticated, (req, res, next) => {
  const { topicId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(topicId)) {
    res.status(400).json({ message: "Specified id is not valid" });
    return;
  }

  Topic.findByIdAndRemove(topicId)
    .then((deletedTopic) => {
      return Meeting.findByIdAndUpdate(deletedTopic.meeting, {
        $pull: { topics: topicId },
      });
    })
    .then(() =>
      res.json({
        message: `Topic with ${topicId} is removed successfully.`,
      })
    )
    .catch((error) => res.status(500).json(error));
});

module.exports = router;
