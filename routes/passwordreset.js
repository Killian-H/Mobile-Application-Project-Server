//express is the framework we're going to use to handle requests
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
 * @api {post} /passwordreset Request a password reset 
 * @apiName ResetPassword
 * @apiGroup Password
 * 
 * @apiDescription Request password change and send random code to the email
 * 
 * @apiParam {String} Email user Email
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
 * @apiError (400: SQL Error) {String} message the reported SQL error details
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

/**
 * @api {post} passwordresets/email/:email? Change the password to the given email
 * @apiName ChangePassword
 * @apiGroup Password
 * 
 * @apiDescription Receive the rest code and the new password, if the reset code is matched,
 * update new password to the database
 * 
 * @apiParam {String} email (request parameter)user email address 
 * @apiParam {String} resetcode  reset code for the password reset
 * @apiParam {String} newpw new password 
 * 
 * @apiSuccess {Boolean} success true if the password has changed otherwise false
 * 
 * @apiError (400: Miss require parameter) {String} message "Missing required information"
 * @apiError (404: User Not Found) {String} message "User is not found"
 * @apiError (400: Resetcode Not Found) {String} message "Reset code not found" 
   @apiError (400: Resetcode Not Matched) {String} message "Reset code is not matched" 
 * @apiError (400: SQL Error) {String} message the reported SQL error details
 * 
 * @apiUse JSONError
 */


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


/**
 * @api {post} passwordresets/verifyCode Verify reset code 
 * @apiName VerifyResetCode
 * @apiGroup Password
 * 
 * @apiDescription  Verify the reset code, the reset code is the code sent to the email
 * 
 * @apiParam {String} email the email that received the reset code
 * @apiParam {String} resetcode reset code 
 * 
 * @apiSuccess {Boolean} success true if the reset code is matched,otherwise false
 * @apiSuccess {String} message whether the code is matched to the one in the database
 * 
 * @apiError (400: Miss require parameter) {String} message "Missing required information"
 * @apiError (404: User Not Found) {String} message "User is not found"
 * @apiError (400: Resetcode Not Found) {String} message "Reset code not found" 
 * @apiError (400: Resetcode is not matched) {String} message "Code is not matched" 
 * @apiError (400: SQL Error) {String} message the reported SQL error details
 * 
 * @apiUse JSONError
 */

router.post('/verifyCode',(request,response,next)=>{



    if(!isStringProvided(request.body.email)&&!isStringProvided(request.body.code)){

        response.status(400).send({

            message:"Missing required information"


        })
    }else{

        next()

    }






},(request,response)=>{

    let values =[request.body.email]
    let theQuery = `SELECT Resetcode FROM Members WHERE Email = $1`
    pool.query(theQuery,values)
    .then(result=>{
        console.log(result.rows[0].resetcode)


        if(result.rowCount == 0){

            response.status(400).send({

                success:false,
                message:"user is not found"


            })

        }else{

            if(result.rows[0].resetcode === 'None'){

                response.status(400).send({

                    success:false,
                    message:"No reset code found"
    
    
                })



            }

            
            if(result.rows[0].resetcode === request.body.code){


            response.status(200).send({

                success:true,
                message:"Code is matched"


            })
            
        } else{

            response.status(400).send({

                success:false,
                message:"Code is not matched"


            })



        }



        }


    }).catch(error=>{

        response.status(400).send({

            message:"SQL Error",
            error:error


        })

    })








})




module.exports = router



