const mongoose = require("mongoose");

const ConsumerSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, required: true },
  appointments: [
    {
      _id: false,
      appointmentId: { type: String, required: true },
      date: { type: String, required: true },
      startTime: { type: String, required: true },
      endTime: { type: String, required: true },
      providerId: { type: String, required: true },
      serviceId: { type: String, required: true }
    }
  ]
});

module.exports = mongoose.model("Consumers", ConsumerSchema);
