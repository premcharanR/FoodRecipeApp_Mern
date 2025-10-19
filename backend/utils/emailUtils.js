const nodemailer = require("nodemailer");
require("dotenv").config();

const sendOTPEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your OTP for Delight Food Recipes",
    html: `<p>Your OTP for verification is: <strong>${otp}</strong></p>
           <p>This OTP is valid for 5 minutes.</p>`,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendOTPEmail;