require("dotenv").config();
const hbs = require('nodemailer-express-handlebars');
const path = require("path");
const express = require("express")
const app = express();

const { Config } = require("../config/Config");
app.use(express.static(path.join(__dirname, "public")));
const FROM_NOREPLY = process.env.EMAIL_FROM_NOREPLY;
const FROM_CONTACT = process.env.EMAIL_FROM_CONTACT;

class Mail {
    static sendAccountVerificationEmail = async (email, name, otp, link) => {
        // let message = "Account Verification Email Sent... Please Check Your Email";
        const template = "accountVerification";
        let subject = "Ansopedia - Account Verification";
        const context = { otp, name, link }
        await sendMail(FROM_NOREPLY, email, subject, template, context);
    }

    static sendForgetPasswordEmail = async (email, name, otp) => {
        // let message = "Forget Password Email Sent... Please Check Your Email";
        const template = "forgetPassword";
        let subject = "Ansopedia - Password Reset Link";
        const context = { otp, name}
        await sendMail(FROM_NOREPLY, email, subject, template, context);
    }
    static sendAccountVerificationConfirmationEmail = async (email, content) => {
        // let message = "Account is Verified";
        const template = "accountVerificationConfirmation";
        let subject = "Ansopedia - Congratulation on Account Verification";
        const context = {...content}
        await sendMail(FROM_NOREPLY, email, subject, template, context);
    }
    static sendContactResponseEmail = async (email, name, message) => {
        const template = "contactResponse";
        let subject = "Ansopedia - Message Recieved";
        const context = { name, message}
        await sendMail(FROM_CONTACT, email, subject, template, context);
    }
}

const sendMail = async (from, to, subject, template, context) => {
    try {
        const transporter = await Config.nodemailerTransport(from);
        // point to the template folder
        const handlebarOptions = {
            viewEngine: {
                partialsDir: path.join(__dirname, "..", "views", "email"),
                defaultLayout: false,
            },
            viewPath: path.join(__dirname, "..", "views", "email"),
        };
        // use a template file with nodemailer
        transporter.use('compile', hbs(handlebarOptions));

        // console.log(handlebarOptions)
        const mailOptions = {
            from: from,
            to: to,
            subject: subject,
            template: template, // the name of the template file i.e email.handlebars
            context: context
        }
        await transporter.sendMail(mailOptions);
    } catch (err) {
        if (err) throw new Error(`${err} at Mail.sendMail`);
    }
}

module.exports = { Mail }