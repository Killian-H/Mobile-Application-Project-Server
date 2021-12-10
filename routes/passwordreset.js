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


router.post('/email/:email',(request,response,next)=>{

    if(!isStringProvided(request.body.resetcode)
        &&!isStringProvided(request.params.email)
        &&!isStringProvided(request.body.newpw)
    
    ){

        response.status(400).send({

            message:"Missing required information"



        })


    }else{

        next()

    }




},(request,response,next)=>{


    let code = request.body.resetcode
    let email = request.params.email

    console.log("Code: "+code)
    console.log("email: "+email)

    let values = [email]
    let theQuery = 'SELECT Resetcode FROM Members WHERE Email = $1 '
    pool.query(theQuery,values)
    .then(result=>{

        if(result.rowCount == 0){

            response.status(404).send({

                message:"User is not found",

            })

        }else{
            if(result.rows[0].resetcode==='None'){

                response.status(400).send({

                    message:"Reset code not found"




                })

            }else if(result.rows[0].resetcode!==code){



                response.status(400).send({

                    success:false,
                    message:"Reset code not matched"


                })     


            }else{

                next()


            }
            
        

        }




    }).catch(error=>{

        response.status(400).send({

            message:"SQL Error",
            error:error

        }
        
        )
    })




},(request,response)=>{

    const newpw = request.body.newpw
    const email = request.params.email
    const resetcode = request.body.resetcode

    let salt = generateSalt(32)
    let salted_hash = generateHash(newpw,salt)

    console.log(salt)
    console.log(salted_hash)


    let values = [salted_hash,salt,email]
    let theQuery = `UPDATE Members SET Password = $1,
                    Salt = $2,
                    Resetcode = 'None'
                    WHERE Email = $3`

    pool.query(theQuery,values)
    .then(result=>{

            response.status(200).send({

                success:true

                

            })




    }).catch(error =>{

        response.status(400).send({

            message:"SQL error",
            error:error


        })


    })








})





module.exports = router



