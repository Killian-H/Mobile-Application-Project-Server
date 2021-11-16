//express is the framework we're going to use to handle requests
const express = require('express')

//Access the connection to Heroku Database
const pool = require('../utilities').pool

const validation = require('../utilities').validation
let isStringProvided = validation.isStringProvided


const router = express.Router()



/**
 * @api {get} /contacts Request to get list of contacts 
 * @apiName GetContacts
 * @apiGroup Contacts
 * 
 * @apiDescription Request to get list of contacts
 * 
 * @apiSuccess {Object[]} contacts List of contacts
 * 
 * @apiError (400: Missing required information) {String} message the missing token information
 * 
 * @apiError (400: SQL Error) {String} message the reported SQL error details
 *  
 * @apiUse JSONError
 */

router.get('/' , (request, response,next) => {

    if(!request.decoded.memberid){
        response.status(400).send({

           message: "Missing reuqired information"
        })
        
    } else {
        next()
    }
    
}, (request,response)=>{

    let memberid = [request.decoded.memberid]
    let theQuery = "SELECT Memberid_b,Firstname,Lastname,Username,Email,verified FROM Contacts JOIN Members ON Memberid_b = Memberid WHERE Memberid_a = $1 ORDER BY verified DESC"
    pool.query(theQuery,memberid)
    .then(result => {

        response.send({

            memberid:memberid,
            rowCounts:result.rowCount,
            rows:result.rows
        })
       
    })
    .catch((err) => {
        //log the error
       
        response.status(400).send({
            message: "SQL Error",
            error:err
        })
    })

})



router.post('/',(request,response,next)=>{

    










})




module.exports = router