const router = require("express").Router();
const authRoutes = require("./auth.routes");
const meetingRoutes = require("./meeting.routes");
const topicRoutes = require("./topic.routes");

/* GET home page */
router.get("/", (req, res, next) => {
  res.json("All good in here");
});

router.use("/auth", authRoutes);
router.use("/meetings", meetingRoutes);
router.use("/topics", topicRoutes);

module.exports = router;
