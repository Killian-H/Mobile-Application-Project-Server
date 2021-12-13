// Nodemailer will be used to send an email to the user.
const nodemailer = require('nodemailer')
const handlebars = require('handlebars');
const fs = require('fs');
// Mail: verify.TCSS450.Project@gmail.com
// password: Mobile-Application-Project

/**Get the html file from the path for email verification
 * 
 * @param {String} url the url that use to verify the user
 * @returns the verify email html template
 */
let getHtml = function(url){
    var htmlToSend= fs.readFileSync(__dirname + '/../html/mail.html', {encoding: 'utf-8'});
    var template = handlebars.compile(htmlToSend);
    var replacements = {
        confirmUrl: url
    };
    htmlGlobal  = template(replacements);
    return htmlGlobal;
}

/**Get the html file from the path for password reset
 * 
 * @param {String} code tha reset code 
 * 
 * @returns the reset code email html template
 * 
 */

let getResetHtml = function(code){
    var htmlToSend= fs.readFileSync(__dirname + '/../html/reset.html', {encoding: 'utf-8'});
    var template = handlebars.compile(htmlToSend);
    var replacements = {
        resetCode:code
    };
    htmlGlobal  = template(replacements);
    return htmlGlobal;
}

/**Send the verify email to the user
 * 
 * @param {String} receiver the email receiver
 * @param {String} mesSubject the email subject
 * @param {String} url the url that use to verify user in the resigter stage
 */
let sendEmail = (receiver, mesSubject, verifyUrl) => {

    // Set up transporter with email.
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        auth: {
            user: 'verify.TCSS450.Project@gmail.com',
            pass: 'Mobile-Application-Project2021!'
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

/**Send the reset code email to the user
 * 
 * @param {String} receiver the email receiver
 * @param {String} mesSubject the email subject
 * @param {String} resetcode the resetcode use for password reset
 */


let sendResetEmail = (receiver, mesSubject,resetCode) => {

    // Set up transporter with email.
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        auth: {
            user: 'verify.TCSS450.Project@gmail.com',
            pass: 'Mobile-Application-Project2021!'
        }
    });

    // Have email set up to send from app account to the new user, with information
    // about registration.
    let mailOptions = {
        from: 'verify.TCSS450.Project@gmail.com',
        to: receiver,
        subject: mesSubject,
        html:getResetHtml(resetCode)
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
    sendEmail,sendResetEmail
}
