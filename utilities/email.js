// Nodemailer will be used to send an email to the user.
const nodemailer = require('nodemailer')
const handlebars = require('handlebars');
const fs = require('fs');
// Mail: verify.TCSS450.Project@gmail.com
// password: Mobile-Application-Project

let getHtml = function(url){
    var htmlToSend= fs.readFileSync(__dirname + '/../html/mail.html', {encoding: 'utf-8'});
    var template = handlebars.compile(htmlToSend);
    var replacements = {
        confirmUrl: url
    };
    htmlGlobal  = template(replacements);
    return htmlGlobal;
}
// Send email to the user from the app email account.
let sendEmail = (receiver, mesSubject, verifyUrl) => {

    // Set up transporter with email.
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        auth: {
            user: 'verify.TCSS450.Project@gmail.com',
            pass: 'Mobile-Application-Project'
        }
    });

    // Have email set up to send from app account to the new user, with information
    // about registration.
    let mailOptions = {
        from: 'verify.TCSS450.Project@gmail.com',
        to: receiver,
        subject: mesSubject,
        html : getHtml(verifyUrl)
    };

    // Send the email.
    transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
            console.log(error)
        } else {
            console.log('Email sent: ' + info.response )
        }
    });
}
// Export this module for use in register.js endpoint of the server.
module.exports = { 
    sendEmail
}