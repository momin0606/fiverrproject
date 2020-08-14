const express = require("express");
const router = express.Router();
const Admins = require("../Models/AdminModel");
const { registerValidation, loginValidation } = require("../Validation");
const bcrypt = require("bcryptjs");
const JWT = require("jsonwebtoken");
const verify = require("../Middlewares/verifyToken");

router.get("/details", verify, async (req, res) => {
  if (!(req.user.role === "admin")) {
    return res.json("Endpoint for admin only");
  }

  //Get Admin Data
  try {
    await Admins.find().then((data) => {
      return res.json(data);
    });
  } catch (err) {
    return res.json(err);
  }
});

//Create Admin
router.post("/register", async (req, res) => {
  //Validate Data
  const { error } = registerValidation(req.body);
  if (error) {
    return res.json(error);
  }
  //Check Email in use
  const emailExists = await Admins.findOne({ email: req.body.email });
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
  const Admin = new Admins({
    name: req.body.name,
    email: req.body.email,
    password: hashPassword,
    role: "admin"
  });

  try {
    const newAdmin = await Admin.save();
    res.json({ user: newAdmin._id });
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
  const Admin = await Admins.findOne({
    email: req.body.email
  });
  if (!Admin) {
    return res.json({
      message: "email does not Exists"
    });
  }
  //Compare Passwords
  const validPass = await bcrypt.compare(req.body.password, Admin.password);
  if (!validPass) {
    res.json({
      message: "password is incorrect"
    });
  }

  //create token
  try {
    const token = JWT.sign(
      {
        _id: Admin._id,
        role: Admin.role,
        isAuthenticated: true
      },
      "momin123",
      { expiresIn: "2h" }
    );

    res.status(200).json({
      _id: Admin._id,
      role: Admin.role,
      token: token,
      isAuthenticated: true
    });
  } catch (err) {
    res.json(err);
  }
});

module.exports = router;
