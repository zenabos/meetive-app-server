const { Schema, model } = require("mongoose");

const meetingSchema = new Schema(
  {
    title:{
        type: String,
        required: true
    },
    goal: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now,
        required: true
    },
    startTime:{
        type: String,
        required: true
    },
    endTime:{
        type: String,
    },
    invites: {
        type: [String],
        required: true
    },
    owner: { type: Schema.Types.ObjectId, ref: 'User' },
    topics: [{ type: Schema.Types.ObjectId, ref: 'Task' }]
  },
  {
    timestamps: true,
  }
);

const Meeting = model("Meeting", meetingSchema);

module.exports = Meeting;