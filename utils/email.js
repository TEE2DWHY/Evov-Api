const nodemailer = require("nodemailer");

const sendEmail = (option) => {
  return new Promise((resolve, reject) => {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.process.env.GMAIL_USERNAME,
        pass: process.env.GMAIL_PASSWORD,
      },
    });
    let mailOptions = {
      to: option.email,
      subject: option.subject,
      message: option.message,
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
          <h1>Welcome to Team Defi</h1>
          <p>We are focused on ensuring our users are well optimized with the skills needed to thrive in the financial markets
          <br/> Click this link to verify your email <a href=${process.env.BASE_URL}/api/v1/auth/verify-email?token=${verificationToken}>Verify Email</a>. Thank you
          </p>
        </div>
      </body>
    </html>
  `;
};

module.exports = { sendEmail, verifyEmailMessage };
