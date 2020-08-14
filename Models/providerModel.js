const mongoose = require("mongoose");
const { number, string } = require("@hapi/joi");

const ProviderSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, required: true },
  services: [
    {
      name: { type: String, required: true },
      hours: { type: Number, required: true }
    }
  ],
  appointments: [
    {
      _id: false,
      appointmentId: { type: String, required: true },
      date: { type: String, required: true },
      startTime: { type: String, required: true },
      endTime: { type: String, required: true },
      consumerId: { type: String, required: true },
      serviceId: { type: String, required: true }
    }
  ],
  availablity: [
    {
      day: { type: Number, required: true, enum: [0, 1, 2, 3, 4, 5, 6] },
      startTime: {
        type: Number,
        required: true,
        enum: [
          0,
          1,
          2,
          3,
          4,
          5,
          6,
          7,
          8,
          9,
          10,
          11,
          12,
          13,
          14,
          15,
          16,
          17,
          18,
          19,
          20,
          21,
          22,
          23
        ]
      },
      endTime: {
        type: Number,
        required: true,
        enum: [
          0,
          1,
          2,
          3,
          4,
          5,
          6,
          7,
          8,
          9,
          10,
          11,
          12,
          13,
          14,
          15,
          16,
          17,
          18,
          19,
          20,
          21,
          22,
          23
        ]
      }
    }
  ]
});

module.exports = mongoose.model("Providers", ProviderSchema);
