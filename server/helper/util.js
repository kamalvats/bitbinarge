import config from "config";
import jwt from 'jsonwebtoken';
import mailTemplet from "../helper/mailtemplet"
import credentials from "./credentials"
import nodemailer from 'nodemailer';
const crypto = require('crypto');
import cloudinary from 'cloudinary';
cloudinary.config({
  cloud_name: config.get('cloudinary.cloud_name'),
  api_key: config.get('cloudinary.api_key'),
  api_secret: config.get('cloudinary.api_secret')
});
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(config.get("sendGridKey"));
const ENCRYPTION_KEY = "dgdgdfgdfgfgfgfg";  // Use a secure key in production, possibly from environment variables
const IV_LENGTH = 16;
module.exports = {


  getOTP() {
    var otp = Math.floor(1000 + Math.random() * 9000);
    return otp;
  },
  generateRefferalCode() {
    var firstPart = (Math.random() * 46656) | 0;
    var secondPart = (Math.random() * 46656) | 0;
    firstPart = ("000" + firstPart.toString(36)).slice(-4);
    secondPart = ("000" + secondPart.toString(36)).slice(-4);
    return firstPart + secondPart;
  },

  getToken: async (payload) => {
    var token = await jwt.sign(payload, config.get('jwtsecret'), { expiresIn: "24h" })
    return token;
  },

  getImageUrl: async (files) => {
    var result = await cloudinary.v2.uploader.upload(files[0].path, { resource_type: "auto" });
    return result.secure_url;
  },

  genBase64: async (data) => {
    return await qrcode.toDataURL(data);
  },

  getSecureUrl: async (base64) => {
    var result = await cloudinary.v2.uploader.upload(base64);
    return result.secure_url;
  },

  signloignOtp: async (to, firstName, otp) => {
    try {
       var transporter = nodemailer.createTransport({
            service: config.get("nodemailer.service"),
            auth: {
                user: config.get("nodemailer.email"),
                pass: config.get("nodemailer.password"),
            },
        });
        var mailOptions = {
            from: "<do_not_reply@gmail.com>",
            to: to,
            subject: "One Time Password (OTP) for AstroQunt Account Login",
            html: mailTemplet.signloginOtp(firstName, otp),
        };
        return await transporter.sendMail(mailOptions);
    } catch (error) {
      console.log("error ==>>>", error);
      throw error;
    }

  },
  signForgotOtp: async (to, firstName, otp) => {
    try {

       var transporter = nodemailer.createTransport({
            service: config.get("nodemailer.service"),
            auth: {
                user: config.get("nodemailer.email"),
                pass: config.get("nodemailer.password"),
            },
        });
        var mailOptions = {
            from: "<do_not_reply@gmail.com>",
            to: to,
            subject: "One Time Password (OTP) for AstroQunt Account Reset Password",
            html:  mailTemplet.forgotPassword(firstName, otp)
        };
        return await transporter.sendMail(mailOptions);
    } catch (error) {
      console.log("error ==>>>", error);
      throw error;
    }

  },
  signResendOtp: async (to, firstName, otp) => {
    try {

       var transporter = nodemailer.createTransport({
            service: config.get("nodemailer.service"),
            auth: {
                user: config.get("nodemailer.email"),
                pass: config.get("nodemailer.password"),
            },
        });
        var mailOptions = {
            from: "<do_not_reply@gmail.com>",
            to: to,
            subject: "One Time Password (OTP) for AstroQunt Account Verification",
            html: mailTemplet.resendOtp(firstName, otp)
        };
        return await transporter.sendMail(mailOptions);
    } catch (error) {
      console.log("error ==>>>", error);
      throw error;
    }

  },

  contactUsendEmail: async (to, email, mobile, name, message) => {
    try {

       var transporter = nodemailer.createTransport({
            service: config.get("nodemailer.service"),
            auth: {
                user: config.get("nodemailer.email"),
                pass: config.get("nodemailer.password"),
            },
        });
        var mailOptions = {
            from: "<do_not_reply@gmail.com>",
            to: to,
            subject: "Contact Us",
            html: mailTemplet.contactUS(email, mobile, name, message),
        };
        return await transporter.sendMail(mailOptions);
    } catch (error) {
      console.log("error ==>>>", error);
      throw error;
    }

  },


  uploadImage(image) {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload(image, function (error, result) {
        if (error) {
          reject(error);
        }
        else {
          resolve(result.url)
        }
      });
    })
  },

  generateCode() {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < 10; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  },

  generateOrder() {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < 10; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return "ORD-" + result;
  },


  paginationFunction: (result, page, limit) => {
    let endIndex = page * limit;
    let startIndex = (page - 1) * limit;
    var resultArray = {}

    resultArray.page = page
    resultArray.limit = limit
    resultArray.remainingItems = result.length - endIndex

    if (result.length - endIndex < 0) {
      resultArray.remainingItems = 0

    }
    resultArray.count = result.length
    resultArray.results = result.slice(startIndex, endIndex)
    return resultArray
  },

  generatePassword: async () => {
    const alpha = 'abcdefghijklmnopqrstuvwxyz';
    const calpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const num = '1234567890';
    const specials = '!@#$%&*';
    const options = [alpha, alpha, alpha, calpha, calpha, num, num, specials];
    let opt, choose;
    let pass = "";
    for (let i = 0; i < 8; i++) {
      opt = Math.floor(Math.random() * options.length);
      choose = Math.floor(Math.random() * (options[opt].length));
      pass = pass + options[opt][choose];
      options.splice(opt, 1);
    }
    return pass
  },


  sendUserActiveEmail: async (userResult, adminResult) => {
     var transporter = nodemailer.createTransport({
            service: config.get("nodemailer.service"),
            auth: {
                user: config.get("nodemailer.email"),
                pass: config.get("nodemailer.password"),
            },
        });
        var mailOptions = {
            from: "<do_not_reply@gmail.com>",
            to: to,
            subject: "AstroQunt Account Activated",
            html: mailTemplet.activeAccount(userResult.email)
        };
        return await transporter.sendMail(mailOptions);
  },

  sendUserblockEmail: async (userResult, adminResult, reason) => {

     var transporter = nodemailer.createTransport({
            service: config.get("nodemailer.service"),
            auth: {
                user: config.get("nodemailer.email"),
                pass: config.get("nodemailer.password"),
            },
        });
        var mailOptions = {
            from: "<do_not_reply@gmail.com>",
            to: to,
            subject: "AstroQunt Account Suspended",
            html:  mailTemplet.inActiveAccount(userResult.email, reason, adminResult.email)
        };
        return await transporter.sendMail(mailOptions);
  },

  generateOrderId(count) {
    var str = "" + count
    var pad = "00000"
    var ans = pad.substring(0, pad.length - str.length) + str
    return "SUB-" + ans;
  },


  remainderNotificationMail: async (to, name, plan_name, amount, due_date, pay_address, pay_coin, renewal_date, plan_duration) => {
    try {

       var transporter = nodemailer.createTransport({
            service: config.get("nodemailer.service"),
            auth: {
                user: config.get("nodemailer.email"),
                pass: config.get("nodemailer.password"),
            },
        });
        var mailOptions = {
            from: "<do_not_reply@gmail.com>",
            to: to,
            subject: "Payment Reminder",
            html:mailTemplet.paymentRequired(name, plan_name, amount, due_date, pay_address, pay_coin, renewal_date, plan_duration)
        };
        return await transporter.sendMail(mailOptions);
    } catch (error) {
      console.log("error ==>>>", error);
      throw error;
    }

  },
  sendEmailInsufficientBalance: async (userResult) => {

     var transporter = nodemailer.createTransport({
            service: config.get("nodemailer.service"),
            auth: {
                user: config.get("nodemailer.email"),
                pass: config.get("nodemailer.password"),
            },
        });
        var mailOptions = {
            from: "<do_not_reply@gmail.com>",
            to: userResult.email,
            subject: "Insufficient Balance",
            html: mailTemplet.insufficientBalance('User')
        };
        return await transporter.sendMail(mailOptions);
  },

  sendEmailCloseTrade: async (email, name, arbitrage_Name, symbol, capital, profit) => {

     var transporter = nodemailer.createTransport({
            service: config.get("nodemailer.service"),
            auth: {
                user: config.get("nodemailer.email"),
                pass: config.get("nodemailer.password"),
            },
        });
        var mailOptions = {
            from: "<do_not_reply@gmail.com>",
            to: to,
            subject: "Trade completed successfully.",
            html:  mailTemplet.tradeClose(name, arbitrage_Name, symbol, capital, profit)
        };
        return await transporter.sendMail(mailOptions);
  },

  sendEmailCreadential: async (email, password, websiteURL) => {
     var transporter = nodemailer.createTransport({
            service: config.get("nodemailer.service"),
            auth: {
                user: config.get("nodemailer.email"),
                pass: config.get("nodemailer.password"),
            },
        });
        var mailOptions = {
            from: "<do_not_reply@gmail.com>",
            to: to,
            subject: "Invitation to Use astroqunt.",
            html: mailTemplet.inviteUser(email, password, websiteURL)
        };
        return await transporter.sendMail(mailOptions);
  },

  generateTrustPaymentAuthToken: async (userName, password) => {
    const credentials = `${userName}:${password}`;
    const base64Credentials = Buffer.from(credentials).toString('base64');
    return base64Credentials
  },

  mailForExpCardPayment: async (to, name, plan_name, renewal_date, plan_duration) => {
    try {
       var transporter = nodemailer.createTransport({
            service: config.get("nodemailer.service"),
            auth: {
                user: config.get("nodemailer.email"),
                pass: config.get("nodemailer.password"),
            },
        });
        var mailOptions = {
            from: "<do_not_reply@gmail.com>",
            to: to,
            subject: "Issue with Your Recent Payment",
            html: mailTemplet.paymentRequiredTrustPayment(name, plan_name, renewal_date, plan_duration)
        };
        return await transporter.sendMail(mailOptions);
    } catch (error) {
      console.log("error ==>>>", error);
      throw error;
    }

  },

  mailForExpCashPayment: async (to,) => {
    try {

       var transporter = nodemailer.createTransport({
            service: config.get("nodemailer.service"),
            auth: {
                user: config.get("nodemailer.email"),
                pass: config.get("nodemailer.password"),
            },
        });
        var mailOptions = {
            from: "<do_not_reply@gmail.com>",
            to: to,
            subject: "Your Subscription is Expiring Soon – Renew Now!",
            html: mailTemplet.paymentRequestCash()
        };
        return await transporter.sendMail(mailOptions);
    } catch (error) {
      console.log("error ==>>>", error);
      throw error;
    }

  },
  exclusiveUsersendemail: async (to, planName, couponCode, amount) => {
    try {
       var transporter = nodemailer.createTransport({
            service: config.get("nodemailer.service"),
            auth: {
                user: config.get("nodemailer.email"),
                pass: config.get("nodemailer.password"),
            },
        });
        var mailOptions = {
            from: "<do_not_reply@gmail.com>",
            to: to,
            subject: "Exclusive Coupon Offer Just for You!",
            html:  mailTemplet.exclusiveUserEmail(couponCode, planName, amount)
        };
        return await transporter.sendMail(mailOptions);
    } catch (error) {
      console.log("error ==>>>", error);
      throw error;
    }

  },
  async encrypt(text) {
    const iv = crypto.randomBytes(IV_LENGTH);

    const key = crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();

    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return iv.toString('hex') + ':' + encrypted;
  },

  async decrypt(encryptedText) {
    if (typeof encryptedText === 'string' && encryptedText.includes(':')) {
      const [ivHex, encryptedData] = encryptedText.split(':');

      const iv = Buffer.from(ivHex, 'hex');

      const key = crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();

      const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);

      try {
        let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
      } catch (error) {
        console.error('Decryption error:', error);
        throw new Error('Decryption failed. Possibly due to key/IV mismatch or corrupted data.');
      }
    }
    return encryptedText
  },
  sendNewLetterForUser: async (email) => {
     var transporter = nodemailer.createTransport({
            service: config.get("nodemailer.service"),
            auth: {
                user: config.get("nodemailer.email"),
                pass: config.get("nodemailer.password"),
            },
        });
        var mailOptions = {
            from: "<do_not_reply@gmail.com>",
            to: to,
            subject: "Thank you for subscribing to AstroQunt's newsletter!",
            html: mailTemplet.newLetter()
        };
        return await transporter.sendMail(mailOptions);
  },

  sendNewLetterForAdmin: async (email) => {
     var transporter = nodemailer.createTransport({
            service: config.get("nodemailer.service"),
            auth: {
                user: config.get("nodemailer.email"),
                pass: config.get("nodemailer.password"),
            },
        });
        var mailOptions = {
            from: "<do_not_reply@gmail.com>",
            to: to,
            subject: "Great news! You’ve got a new subscriber to the AstroQunt newsletter.",
            html: mailTemplet.newLetterForAdmin(email)
        };
        return await transporter.sendMail(mailOptions);
  },
}

