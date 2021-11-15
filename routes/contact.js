const express = require('express')


const express = require('express')

//Access the connection to Heroku Database
const pool = require('../utilities/exports').pool

const router = express.Router()

const validation = require('../utilities').validation
let isStringProvided = validation.isStringProvided


router.get("/", (request, response) => {
    response.send({
        message: "Hello, you sent a GET request"
    })
})

/**
 * @api {post} /hello Request a Hello World message
 * @apiName PostHello
 * @apiGroup Hello
 * 
 * @apiSuccess {String} message Hello World message
 */ 
router.post("/", (request, response) => {
    response.send({
        message: "Hello, you sent a POST request"
    })
})
// "return" the router
module.exports = router