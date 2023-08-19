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

const verifyEmailMessage = (verificationToken, name) => {
  return `
  <!DOCTYPE html>
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            color: #333;
            letter-spacing: 0.02rem;
            line-height: 1.2;
          }
          .container {
            padding: 20px;
            background-color: #f9f9f9;
          }
          .link{
            font-weight: 900
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Welcome on Board</h2>
          <p>Hi ${name},</p>
          <p>We are super excited to have you here. Trust me, we waited a long time to have you on board, and here you are.
          It's impressive that you've taken such a bold step to become a better version of yourself, we are glad to help you walk through this journey.
          <br/>
          <span class="link">Kindly click this <a href=${process.env.BASE_URL}/api/v1/verify-email?token=${verificationToken}>link</a> to verify your account</span>
          <br/>
          Stay tuned for insightful newsletter and other pertinent updates.
          <br/>
          Cheers to Growth!
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
