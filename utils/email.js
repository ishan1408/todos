const sgMail = require('@sendgrid/mail');
const pug = require('pug');
const path = require('path');
const nodemailer = require("nodemailer");
const pug = require("pug");
const htmlToText = require("html-to-text");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

module.exports = async options => {
  const html = pug.renderFile(
    path.join(__dirname, '..', 'views', 'emails', `${options.template}.pug`),
    { name: options.name, url: options.url }
  );

  const msg = {
    to: options.email,
    from: process.env.EMAIL_FROM,
    subject: options.subject,
    html,
  };

  await sgMail.send(msg);
};


module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(" ")[0];
    this.url = url;
    this.from = process.env.EMAIL_FROM;
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      return sgMail;
    }

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async send(template, subject) {
    const html = pug.renderFile(`${__dirname}/../views/emails/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject,
    });

    const mailOptions = {
      to: this.to,
      from: this.from,
      subject,
      html,
      text: htmlToText.convert(html),
    };

    if (process.env.NODE_ENV === 'production') {
      return await this.newTransport().send(mailOptions); // SendGrid
    }

    await this.newTransport().sendMail(mailOptions); // Dev (nodemailer)
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Tour App!');
  }

  async sendPasswordReset(token) {
    await this.send('passwordReset', 'Reset your password (valid for 10 minutes)');
  }
};