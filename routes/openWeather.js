const API_KEY = process.env.WEATHER_KEY
//express is the framework we're going to use to handle requests
const express = require('express')

//request module is needed to make a request to a web service
const request = require('request')

var router = express.Router()

/**
 * @api {get} /Weather Request weather info with a passed long lat for user's account
 * @apiName OpenWeatherOneCallAPI
 * @apiGroup OpenWeahter
 * 
 * @apiHeader {String} authorization JWT provided from Auth get
 * 
 * @apiDescription This end point is a pass through to the OpenWeather API
 */
router.post("/", (req, res) => {
    //grab location parameters  
    
    const LATITUDE = req.body.lat
    const LONGITUDE = req.body.lon

    // for info on use of tilde (`) making a String literal, see below. 
    //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String
    // url for openweather api call. Must provide lat and long 
    let url = `https://api.openweathermap.org/data/2.5/onecall?lat=${LATITUDE}&lon=${LONGITUDE}&exclude=minutely&units=imperial&appid=${API_KEY}`

    

    //When this web service gets a request, make a request to the OpenWeather Web service
    request(url, function (error, response, body) {
        if (error) {
            res.send(error)
        } else {
            // pass on everything (try out each of these in Postman to see the difference)
            // res.send(response);

            // or just pass on the body

            var n = body.indexOf("{")
            var nakidBody = body.substring(n - 1)

            res.send(nakidBody)
        }
    })

})

module.exports = router