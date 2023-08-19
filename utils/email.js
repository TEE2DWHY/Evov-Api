const nodemailer = require("nodemailer");

const sendEmail = (option) => {
  return new Promise((resolve, reject) => {
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USERNAME,
        pass: process.env.GMAIL_PASSWORD,
      },
    });
    let mailOptions = {
      from: process.env.GMAIL_USERNAME,
      to: option.email,
      subject: option.subject,
      html: option.message,
    };
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        reject(err);
      } else {
        resolve(info);
      }
    });
  });
};

const verifyEmailMessage = (verificationToken) => {
  return `
  <!DOCTYPE html>
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            color: #333;
          }
          .container {
            padding: 20px;
            border: 1px solid #ccc;
            border-radius: 5px;
            background-color: #f9f9f9;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Welcome to  Evov </h1>
          <p>We are focused on ensuring our users are well optimized with the skills needed to thrive in life.
          <br/> Click this link to verify your email <a href=${process.env.BASE_URL}/api/v1/verify-email?token=${verificationToken}>Verify Email</a>. Thank you
          </p>
        </div>
      </body>
    </html>
  `;
};

const resetPasswordMessage = (resetPasswordToken) => {
  return `
  <!DOCTYPE html>
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            color: #333;
          }
          .container {
            padding: 20px;
            border: 1px solid #ccc;
            border-radius: 5px;
            background-color: #f9f9f9;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>RESET YOUR PASSWORD. </h1>
          <p>Do not fret..We've got you covered.
          <br/> Click this link to reset your password <a href=${process.env.BASE_URL}/api/v1/reset-password?token=${resetPasswordToken}>Reset Password</a>. Thank you
          </p>
        </div>
      </body>
    </html>
  `;
};

module.exports = { sendEmail, verifyEmailMessage, resetPasswordMessage };
