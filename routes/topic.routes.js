const router = require("express").Router();
const Topic = require("../models/Topic.model");
const { isAuthenticated } = require("../middleware/jwt.middleware");
const Meeting = require("../models/Meeting.model");

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
module.exports = router;
