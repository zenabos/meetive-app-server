const { Schema, model } = require("mongoose");

const meetingSchema = new Schema(
  {
    title: {
      type: String,
      required: true
    },
    goal: {
      type: String,
      required: true
    },
    start: {
      type: Date,
      default: Date.now,
      required: true
    },
    end: {
      type: Date,
      default: Date.now,
      required: true
    },
    invites: {
      type: [String],
    },
    owner: { type: Schema.Types.ObjectId, ref: "User" },
    topics: [{ type: Schema.Types.ObjectId, ref: "Topic" }],
  },
  {
    timestamps: true,
  }
);

const Meeting = model("Meeting", meetingSchema);

module.exports = Meeting;
