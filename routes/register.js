//express is the framework we're going to use to handle requests
const express = require('express')

//Access the connection to Heroku Database
const pool = require('../utilities').pool

const validation = require('../utilities').validation
let isStringProvided = validation.isStringProvided

const generateHash = require('../utilities').generateHash
const generateSalt = require('../utilities').generateSalt

const sendEmail = require('../utilities').sendEmail

const router = express.Router()

//Pull in the JWT module along with out a secret key
const jwt = require('jsonwebtoken')
const config = {
    secret: process.env.JSON_WEB_TOKEN
}
const path = require('path');

/**
 * @api {post} /auth Request to register a user
 * @apiName PostAuth
 * @apiGroup Auth
 * 
 * @apiParam {String} first a users first name
 * @apiParam {String} last a users last name
 * @apiParam {String} email a users email *unique
 * @apiParam {String} password a users password
 * @apiParam {String} [username] a username *unique, if none provided, email will be used
 * 
 * @apiParamExample {json} Request-Body-Example:
 *  {
 *      "first":"Charles",
 *      "last":"Bryan",
 *      "email":"cfb3@fake.email",
 *      "password":"test12345"
 *  }
 * 
 * @apiSuccess (Success 201) {boolean} success true when the name is inserted
 * @apiSuccess (Success 201) {String} email the email of the user inserted 
 * 
 * @apiError (400: Missing Parameters) {String} message "Missing required information"
 * 
 * @apiError (400: Username exists) {String} message "Username exists"
 * 
 * @apiError (400: Email exists) {String} message "Email exists"
 *  
 * @apiError (400: Other Error) {String} message "other error, see detail"
 * @apiError (400: Other Error) {String} detail Information about th error
 * 
 */ 
router.post('/', (request, response) => {

    //Retrieve data from query params
    const first = request.body.first
    const last = request.body.last
    const username = isStringProvided(request.body.username) ?  request.body.username : request.body.email
    const email = request.body.email
    const password = request.body.password
    //Verify that the caller supplied all the parameters
    //In js, empty strings or null values evaluate to false
    if(isStringProvided(first) 
        && isStringProvided(last) 
        && isStringProvided(username) 
        && isStringProvided(email) 
        && isStringProvided(password)) {
        //We're storing salted hashes to make our application more secure
        //If you're interested as to what that is, and why we should use it
        //watch this youtube video: https://www.youtube.com/watch?v=8ZtInClXe1Q
        let salt = generateSalt(32)
        let salted_hash = generateHash(password, salt)
        
        //We're using placeholders ($1, $2, $3) in the SQL query string to avoid SQL Injection
        //If you want to read more: https://stackoverflow.com/a/8265319
        let theQuery = "INSERT INTO MEMBERS(FirstName, LastName, Username, Email, Password, Salt) VALUES ($1, $2, $3, $4, $5, $6) RETURNING Email"
        let values = [first, last, username, email, salted_hash, salt]
        pool.query(theQuery, values)
            .then(result => {
                //We successfully added the user!
            console.log("result: ", result)
            console.log("result.rows[0]: ", result.rows[0])
            console.log("result.rows[0].memberid: ", result.rows[0].memberid)

            let token = jwt.sign(
                {
                    "email": email
                },
                config.secret,
                { 
                    expiresIn: '14 days' // expires in 14 days
                }
            )
            let verifyUrl = "https://mobile-application-project-450.herokuapp.com/auth/verify/%s"
            verifyUrl = verifyUrl.replace('%s', token);
            sendEmail(email, "Welcome to our App!", verifyUrl)
            })
            .catch((error) => {
                //log the error
                // console.log(error)
                if (error.constraint == "members_username_key") {
                    response.status(400).send({
                        message: "Username exists"
                    })
                } else if (error.constraint == "members_email_key") {
                    response.status(400).send({
                        message: "Email exists"
                    })
                } else {
                    response.status(400).send({
                        message: "other error, see detail",
                        detail: error.detail
                    })
                }
            })
        response.status(201).send({
            success: true,
            email: email
        })
    } else {
        response.status(400).send({
            message: "Missing required information"
        })
    }
})

router.get('/verify/:token?', (request, response) => {
    let token = request.params.token
    let email;
    //get member_id from token
    jwt.verify(token, config.secret, (err, decoded) => {
        if (err) {
            return response.status(403).json({
                success: false,
                message: 'Token is not valid'
            });
        } else {
            console.log("decoded: ", decoded)
            email = decoded.email;
        }
      });
    // update user verification on db.
    let theQuery = "UPDATE MEMBERS SET Verification = 1 WHERE email = $1;"
    let values = [email]
    console.log("email: ", email)
    pool.query(theQuery, values)
        .then(result => {
            console.log("Updated DB!")
        })
        .catch((error) => {
            //log the error
            console.log("error: ", error)
            response.status(400).send({
                message: "Error at updating information",
                detail: error.detail
            })
        })
    response.sendFile(path.join(__dirname, '../html/verifiedPage.html'));
})


module.exports = router