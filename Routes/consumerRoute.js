const express = require("express");
const router = express.Router();
const Consumers = require("../Models/consumerModel");
const Providers = require("../Models/providerModel");
const uuid = require("uuid");
const { sendEmail } = require("../emailFunction");

const {
  registerValidationB,
  loginValidation,
  createAppointmentValidation,
  deleteAppointmentValidation
} = require("../Validation");
const bcrypt = require("bcryptjs");
const JWT = require("jsonwebtoken");
const verify = require("../Middlewares/verifyToken");

router.get("/details", verify, async (req, res) => {
  if (req.user.role === "provider") {
    return res.json("Endpoint for consumers & admins only");
  }
  //Get Consumer Data
  try {
    await Consumers.findOne()
      .where({ _id: req.user._id })
      .then((data) => {
        return res.json(data);
      });
  } catch (err) {
    return res.json(err);
  }
});

//Create Admin
router.post("/register", async (req, res) => {
  //Validate Data
  const { error } = registerValidationB(req.body);
  if (error) {
    return res.json(error);
  }
  //Check Email in use
  const emailExists = await Consumers.findOne({ email: req.body.email });
  if (emailExists) {
    return res.json({ message: "email Exists" });
  }
  if (!(req.body.password === req.body.confirmPassword)) {
    return res.json({ message: "password does not match" });
  }

  //Hash Password
  const salt = await bcrypt.genSalt(11);
  const hashPassword = await bcrypt.hash(req.body.password, salt);

  //Create User In DataBase
  const Consumer = new Consumers({
    name: req.body.name,
    email: req.body.email,
    password: hashPassword,
    role: "consumer"
  });

  try {
    const newConsumer = await Consumer.save();
    res.json({ user: newConsumer._id });
  } catch (err) {
    res.json(err);
  }
});

//Login
router.post("/login", async (req, res) => {
  //Validate Data
  const { error } = loginValidation(req.body);
  if (error) {
    return res.json(error);
  }
  //Check Email in use
  const Consumer = await Consumers.findOne({
    email: req.body.email
  });
  if (!Consumer) {
    return res.json({
      message: "email does not Exists"
    });
  }
  //Compare Passwords
  const validPass = await bcrypt.compare(req.body.password, Consumer.password);
  if (!validPass) {
    res.json({
      message: "password is incorrect"
    });
  }

  //create token
  try {
    const token = JWT.sign(
      {
        _id: Consumer._id,
        role: Consumer.role,
        isAuthenticated: true
      },
      "momin123",
      { expiresIn: "1d" }
    );

    res.status(200).json({
      _id: Consumer._id,
      role: Consumer.role,
      token: token,
      isAuthenticated: true
    });
  } catch (err) {
    res.json(err);
  }
});

//Create Appointments
router.put("/createAppointment", verify, async (req, res) => {
  if (req.user.role === "provider") {
    return res.json("Endpoint for consumers & admins only");
  }
  //data validation
  const { error } = createAppointmentValidation(req.body);
  if (error) {
    return res.json(error);
  }
  const date = new Date(`${req.body.date}T${req.body.startTime}:00:00+05:00`);
  const currentDate = new Date();

  //check if date is not in past
  if (currentDate >= date) {
    return res.json({ date: "cannot book past date" });
  }
  //Get consumer data
  const Consumer = await Consumers.findOne({ _id: req.user._id }).catch(
    (err) => {
      return res.json(err);
    }
  );

  //check if provider exists
  const Provider = await Providers.findOne({ _id: req.body.providerId }).catch(
    (err) => {
      return res.json(err);
    }
  );
  if (!Provider) {
    return res.json({ message: "Provider does not exist" });
  }
  var existService = false;
  var serviceIndex = -1;
  //Provider provides this service
  const services = Provider.services;
  for (var i = 0; i < services.length; i++) {
    if (services[i]._id == req.body.serviceId) {
      existService = true;
      serviceIndex = i;
      break;
    }
  }

  if (!existService) {
    return res.json({ message: "Service is not provided by this Provider" });
  }

  //check availability
  const availabilities = Provider.availablity;
  var existAvail = false;
  var availIndex = -1;
  for (var i = 0; i < availabilities.length; i++) {
    if (availabilities[i].day === date.getDay()) {
      availIndex = i;
      existAvail = true;
      break;
    }
  }
  if (!existAvail) {
    return res.json({ message: "provider not available for the given day" });
  }

  const startTime = Number(req.body.startTime);
  const endTime = startTime + services[serviceIndex].hours;

  if (
    !(
      startTime >= availabilities[availIndex].startTime &&
      startTime < availabilities[availIndex].endTime &&
      endTime > availabilities[availIndex].startTime &&
      endTime <= availabilities[availIndex].endTime
    )
  ) {
    return res.json({ message: "appointment not in available hours" });
  }

  //check for existing appointments on the same time
  const appointments = Provider.appointments;
  var appointmentdate;

  for (var i = 0; i < appointments.length; i++) {
    appointmentdate = new Date(appointments[i].date);

    if (appointmentdate.getFullYear() === date.getFullYear()) {
      //check Year
      if (appointmentdate.getMonth() === date.getMonth()) {
        //check Month
        if (appointmentdate.getDate() === date.getDate()) {
          //check Date
          if (
            startTime >= appointments[i].startTime &&
            startTime < appointments[i].endTime
          ) {
            return res.json("Another appointment");
          }
        }
      }
    }
  }

  //Book appointment
  appointmentId = uuid.v4();
  Consumer.appointments.push({
    appointmentId,
    date: date.toISOString(),
    startTime,
    endTime,
    providerId: req.body.providerId,
    serviceId: req.body.serviceId
  });
  Provider.appointments.push({
    appointmentId,
    date: date.toISOString(),
    startTime,
    endTime,
    consumerId: req.user._id,
    serviceId: req.body.serviceId
  });

  var mailOptions = {
    from: "mominfreelancer123@gmail.com",
    to: Consumer.email,
    subject: "Booking confirmation",
    text: `Your booking ${appointmentId} has been booked with ${
      Provider.name
    } on ${date.getFullYear()}-${date.getMonth()}-${date.getDate()} from 
    ${startTime}:00 to ${endTime}:00`
  };
  sendEmail(mailOptions);
  Provider.save().then((data) => {});
  Consumer.save().then((data) => {
    return res.json(data);
  });
});

//Delete Appointments
router.delete("/deleteAppointment", verify, async (req, res) => {
  if (req.user.role === "provider") {
    return res.json("Endpoint for consumers & admins only");
  }
  //validate data
  const { error } = deleteAppointmentValidation(req.body);
  if (error) {
    return res.json(error);
  }

  //get consumer data
  const Consumer = await Consumers.findOne({ _id: req.user._id });
  const conAppointments = Consumer.appointments;
  var existConAppointment = false;
  var consumerAppointmentIndex;
  var providerId;
  for (var i = 0; i < conAppointments.length; i++) {
    if (conAppointments[i].appointmentId === req.body.appointmentId) {
      existConAppointment = true;
      consumerAppointmentIndex = i;
      providerId = conAppointments[i].providerId;
      break;
    }
  }
  if (!existConAppointment) {
    return res.json({ message: "appointment does not exist" });
  }
  //get provider data
  const Provider = await Providers.findOne({ _id: providerId });
  if (!Provider) {
    return res.json({ message: "provider does not exist" });
  }
  //check appointment exists
  const proAppointments = Provider.appointments;
  var existProAppointment = false;
  var providerAppointmentIndex;
  for (var i = 0; i < proAppointments.length; i++) {
    if (proAppointments[i].appointmentId === req.body.appointmentId) {
      existProAppointment = true;
      providerAppointmentIndex = i;
      break;
    }
  }
  if (!existProAppointment) {
    return res.json({ message: "appointment does not exist" });
  }

  const date = new Date(proAppointments[providerAppointmentIndex].date);
  var startTime = proAppointments[providerAppointmentIndex].startTime;
  var endTime = proAppointments[providerAppointmentIndex].endTime;
  var mailOptions = {
    from: "mominfreelancer123@gmail.com",
    to: Consumer.email,
    subject: "Booking confirmation",
    text: `Your booking ${req.body.appointmentId} has been canceled with ${
      Provider.name
    } on ${date.getFullYear()}-${date.getMonth()}-${date.getDate()} from 
    ${startTime}:00 to ${endTime}:00`
  };
  sendEmail(mailOptions);

  //delete appointment
  Provider.appointments.splice(providerAppointmentIndex, 1);
  Provider.save().then((data) => {});
  Consumer.appointments.splice(consumerAppointmentIndex, 1);
  Consumer.save().then((data) => {
    return res.json(data);
  });
});

module.exports = router;
