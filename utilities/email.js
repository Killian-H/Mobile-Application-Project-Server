// Nodemailer will be used to send an email to the user.
const nodemailer = require('nodemailer')

let sendEmail = (sender, receiver, mesSubject, mesMessage) => {

let transporter = nodemailer.createTransport({
    service: 'INSERT SERVICE HERE (GMAIL, HOTMAIL, ETC.)',
    auth: {
        user: sender,
        pass: 'INSERT PASSWORD HERE'
    }
});

let mailOptions = {
    from: sender,
    to: receiver,
    subject: mesSubject,
    text: mesMessage
};

transporter.sendMail(mailOptions, function(error, info) {
    if (error) {
        console.log(error)
    } else {
        console.log('Email sent: ' + info.response )
    }
});
}
module.exports = { 
    sendEmail
}