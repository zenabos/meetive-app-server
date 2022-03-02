const { Schema, model } = require("mongoose");

const topicSchema = new Schema(
  {
    title: {
        type: String,
        // required: true
    },
    description: {
        type: String,
        // required: true
    },
    introductionTime: {
      type: Number,
      // required: true
    },
    discussionTime:{
        type: Number,
        // required: true
    },
    conclusionTime: {
        type: Number,
        // required: true
    },
    totalTime: {
      type: Number,
    },
    owner: {
      type: String,
    }
  },
  {
    timestamps: true,
  }
);

const Topic = model("Topic", topicSchema);

module.exports = Topic;
