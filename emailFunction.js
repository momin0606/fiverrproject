const nodemailer = require("nodemailer");
var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "mominfreelancer123@gmail.com",
    pass: "Lolipop123"
  }
});
const sendEmail = (mailOptions) => {
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else console.log(`email sent ${info.response}`);
  });
};

module.exports = { sendEmail };
