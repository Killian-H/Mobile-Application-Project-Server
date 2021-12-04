const Pushy = require('pushy');

// Plug in your Secret API Key 
console.log(process.env.PUSHY_API_KEY)

const pushyAPI = new Pushy(process.env.PUSHY_API_KEY);

//use to send message to a specific client by the token
function sendMessageToIndividual(token, message) {

    //build the message for Pushy to send
    var data = {
        "type": "msg",
        "message": message,
        "chatid": message.chatid
    }


    // Send push notification via the Send Notifications API 
    // https://pushy.me/docs/api/send-notifications 
    pushyAPI.sendPushNotification(data, token, {}, function (err, id) {
        // Log errors to console 
        if (err) {
            return console.log('Fatal Error', err);
        }

        // Log success 
        console.log('Push sent successfully! (ID: ' + id + ')')
    })
}

function sendContactToIndividual(token,username) {

    //build the message for Pushy to send
    var data = {
        "type": "contactRequest",
         "username" :username,
         "message" :username+" send you a contact request"
    }


    // Send push notification via the Send Notifications API 
    // https://pushy.me/docs/api/send-notifications 
    pushyAPI.sendPushNotification(data, token, {}, function (err, id) {
        // Log errors to console 
        if (err) {
            return console.log('Fatal Error', err);
        }

        // Log success 
        console.log('Contact Push sent successfully! (ID: ' + id + ')')
        console.log(data.message)
    })
}


//add other "sendTypeToIndividual" functions here. Don't forget to export them

module.exports = {
    sendMessageToIndividual,sendContactToIndividual
}