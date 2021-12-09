const express = require('express')

//Access the connection to Heroku Database
const pool = require('../utilities').pool

const sendResetEmail = require('../utilities').sendResetEmail

const validation = require('../utilities').validation
let isStringProvided = validation.isStringProvided
let generateRamdom = require('../utilities').resetCode

const generateHash = require('../utilities').generateHash
const generateSalt = require('../utilities').generateSalt


const jwt = require('jsonwebtoken')
const config = {
    secret: process.env.JSON_WEB_TOKEN
}

const router = express.Router()

/**
 * @apiDefine JSONError
 * @apiError (400: JSON Error) {String} message "malformed JSON in parameters"
 */ 



/**
 * @api {post}  Request password Change
 * @apiName ResetPassword
 * @apiGroup Password
 * 
 * @apiDescription Request password change and send random code to the email
 * 
 * @apiParam {String} User Email
 * 
 * 
 * @apiParamExample {json} Request-Body-Example:
 *  {
 *      "email":"cfb3@fake.email"
 *  }
 * 
 * @apiSuccess (Success 201) {boolean} success true when the name is inserted
 
 * @apiError (400: Missing Parameters) {String} message "Missing required information:email"
 * @apiError (404:Usser not found) {String} message "User not found"
 * 
 * 
 * @apiError (400: SQL Error) {String} message the reported SQL error details
 * 
 * @apiError (400: Unknown Chat ID) {String} message "invalid chat id"
 * 
 * @apiUse JSONError
 */ 

router.post('/',(request,response,next)=>{

    const email = request.body.email

    if(!isStringProvided(email)){

        response.status(400).send({
            message:"Missing require information: email"

        })
        


    } else {

        next()


    }



},(request,response,next)=>{

    //search user in the database 

    let values = [request.body.email]
    let theQuery = `SELECT * FROM Members WHERE Email = $1`
    pool.query(theQuery,values)
    .then(result=>{

        if(result.rowCount == 0){
            
            response.status(404).send({

                message:"User not found"


            })

        }else{

            next()
        }



    }).catch(error=>{

        response.status(400).send({
            message:"SQL Error",
            error:error

        })

    })



},(request,response)=>{


    let resetCode = generateRamdom.getCode().toString()
    console.log("new reset code: "+resetCode)
    let values = [resetCode,request.body.email]
    let theQuery = " UPDATE Members SET Resetcode = $1 WHERE Email = $2"
    pool.query(theQuery,values)
    .then(result=>{

        if(result.rowCount == 1){

            sendResetEmail(request.body.email,"Password Reset,not reply!",resetCode)

            response.status(200).send({

                success:true

            })

        }


    }).catch(error=>{

        response.status(400).send({
            
            message:"SQL Error",
            error:error

        })

    })




})


module.exports = router



