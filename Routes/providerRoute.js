const express = require("express");
const router = express.Router();
const Providers = require("../Models/providerModel");
const {
  registerValidationB,
  loginValidation,
  addAvailablityValidation,
  deleteAvailablityValidation,
  editAvailablityValidation,
  addServiceValidation,
  deleteServiceValidation,
  editServiceValidation
} = require("../Validation");
const bcrypt = require("bcryptjs");
const JWT = require("jsonwebtoken");
const verify = require("../Middlewares/verifyToken");

router.get("/details", verify, async (req, res) => {
  if (req.user.role === "consumer") {
    return res.json("Endpoint for providers & admins only");
  }
  //Get Provider Data
  try {
    await Providers.findOne()
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
  const emailExists = await Providers.findOne({ email: req.body.email });
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
  const Provider = new Providers({
    name: req.body.name,
    email: req.body.email,
    password: hashPassword,
    role: "provider"
  });

  try {
    const newProvider = await Provider.save();
    res.json({ user: newProvider._id });
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
  const Provider = await Providers.findOne({
    email: req.body.email
  });
  if (!Provider) {
    return res.json({
      message: "email does not Exists"
    });
  }
  //Compare Passwords
  const validPass = await bcrypt.compare(req.body.password, Provider.password);
  if (!validPass) {
    res.json({
      message: "password is incorrect"
    });
  }

  //create token
  try {
    const token = JWT.sign(
      {
        _id: Provider._id,
        role: Provider.role,
        isAuthenticated: true
      },
      "momin123",
      { expiresIn: "1d" }
    );

    res.status(200).json({
      _id: Provider._id,
      role: Provider.role,
      token: token,
      isAuthenticated: true
    });
  } catch (err) {
    res.json(err);
  }
});

router.put("/addAvailability", verify, async (req, res) => {
  if (req.user.role === "consumer") {
    return res.json("Endpoint for providers & admins only");
  }
  //Validate Data
  const { error } = addAvailablityValidation(req.body);
  if (error) {
    return res.json(error);
  }
  //Get Provider Data
  const Provider = await Providers.findOne({ _id: req.user._id });
  const availablities = Provider.availablity;
  for (var i = 0; i < availablities.length; i++) {
    if (availablities && availablities[i].day === req.body.day) {
      return res.json({
        message: "availability for this day has been set already"
      });
    }
  }
  // Check Time input
  if (req.body.startTime >= req.body.endTime) {
    return res.json({
      message: "Availability start time should be before end time"
    });
  }

  //Add Availablity
  Provider.availablity.push(req.body);
  Provider.save().then((data) => {
    return res.json(data);
  });
});

router.delete("/deleteAvailability", verify, async (req, res) => {
  if (req.user.role === "consumer") {
    return res.json("Endpoint for providers & admins only");
  }

  //Validate Data
  const { error } = deleteAvailablityValidation(req.body);
  if (error) {
    return res.json(error);
  }
  //find Provider
  const Provider = await Providers.findOne({ _id: req.user._id });
  const availablities = Provider.availablity;
  var existAvail = false;
  var index = -1;

  //check if availablity exist
  for (var i = 0; i < availablities.length; i++) {
    if (availablities[i]._id == req.body.slot_id) {
      existAvail = true;
      index = i;
      break;
    }
  }
  //if not exist
  if (!existAvail) {
    return res.json({ message: "availablity does not exist" });
  }
  //delete availabality
  Provider.availablity.splice(index, 1);
  Provider.save().then((data) => {
    return res.json(data);
  });
});

router.put("/editAvailability", verify, async (req, res) => {
  if (req.user.role === "consumer") {
    return res.json("Endpoint for providers & admins only");
  }

  //Validate Data
  const { error } = editAvailablityValidation(req.body);
  if (error) {
    return res.json(error);
  }

  // Check Time input
  if (req.body.startTime >= req.body.endTime) {
    return res.json({
      message: "Availability start time should be before end time"
    });
  }

  //find provider
  const Provider = await Providers.findOne({
    _id: req.user._id
  });
  const availablities = Provider.availablity;
  var existAvail = false;
  var index = -1;

  //check if availablity exist
  for (var i = 0; i < availablities.length; i++) {
    if (availablities[i]._id == req.body.slot_id) {
      existAvail = true;
      index = i;
      break;
    }
  }
  //if not exist
  if (!existAvail) {
    return res.json({
      message: "availablity does not exist"
    });
  }
  //edit availabality
  Provider.availablity[index].startTime = req.body.startTime;
  Provider.availablity[index].endTime = req.body.endTime;
  Provider.save().then((data) => {
    return res.json(data);
  });
});

router.put("/addService", verify, async (req, res) => {
  if (req.user.role === "consumer") {
    return res.json("Endpoint for providers & admins only");
  }
  //Validate Data
  const { error } = addServiceValidation(req.body);
  if (error) {
    return res.json(error);
  }
  //Get Provider Data
  const Provider = await Providers.findOne({ _id: req.user._id });
  const services = Provider.services;
  for (var i = 0; i < services.length; i++) {
    if (services && services[i].name === req.body.name) {
      return res.json({
        message: "service already exists with this name"
      });
    }
  }

  //Add Service
  Provider.services.push(req.body);
  Provider.save().then((data) => {
    return res.json(data);
  });
});

router.delete("/deleteService", verify, async (req, res) => {
  if (req.user.role === "consumer") {
    return res.json("Endpoint for providers & admins only");
  }

  //Validate Data
  const { error } = deleteServiceValidation(req.body);
  if (error) {
    return res.json(error);
  }

  //find Provider
  const Provider = await Providers.findOne({ _id: req.user._id });
  const services = Provider.services;
  var existService = false;
  var index = -1;

  //check if service exist
  for (var i = 0; i < services.length; i++) {
    if (services[i]._id == req.body.service_id) {
      existService = true;
      index = i;
      break;
    }
  }
  //if not exist
  if (!existService) {
    return res.json({ message: "service does not exist" });
  }
  //delete service
  Provider.services.splice(index, 1);
  Provider.save().then((data) => {
    return res.json(data);
  });
});

router.put("/editService", verify, async (req, res) => {
  if (req.user.role === "consumer") {
    return res.json("Endpoint for providers & admins only");
  }

  //Validate Data
  const { error } = editServiceValidation(req.body);
  if (error) {
    return res.json(error);
  }

  //find provider
  const Provider = await Providers.findOne({
    _id: req.user._id
  });
  const services = Provider.services;
  var existService = false;
  var index = -1;

  //check if service exist
  for (var i = 0; i < services.length; i++) {
    if (services[i]._id == req.body.service_id) {
      existService = true;
      index = i;
      break;
    }
  }
  //if not exist
  if (!existService) {
    return res.json({
      message: "service does not exist"
    });
  }
  //edit availabality
  Provider.services[index].hours = req.body.hours;
  Provider.save().then((data) => {
    return res.json(data);
  });
});

module.exports = router;
