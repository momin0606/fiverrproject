const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");

//Express JSON
app.use(express.json());
app.use(cookieParser());
//Mongo DB Connection
mongoose.connect(
  "mongodb+srv://momin:Lolipop123@cluster0-qcibv.mongodb.net/Cluster0?retryWrites=true&w=majority",
  { useNewUrlParser: true, useUnifiedTopology: true },
  () => {
    console.log("connected to mongo DB");
  }
);

//Admin Routes
const adminRoutes = require("./Routes/adminRoute");
app.use("/api/admin", adminRoutes);
//Consumer Routes
const consumerRoutes = require("./Routes/consumerRoute");
app.use("/api/con", consumerRoutes);
//Provider Routes
const providerRoutes = require("./Routes/providerRoute");
app.use("/api/pro", providerRoutes);

// 404 Error
app.all("*", (req, res) => {
  res.status(404).json({ message: "Page Not Found" });
});

//Server
app.listen(5000, () => {
  console.log("server is running");
});
